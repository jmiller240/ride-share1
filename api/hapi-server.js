// Knex
const knex = require("knex")({
  client: "pg",
  connection: {
    host: "faraday.cse.taylor.edu",
    user: "jackson_miller",
    password: "xopijuti",
    database: "jackson_miller",
  },
});

// Objection
const { Model } = require("objection");
Model.knex(knex);

// Models
const User = require("./models/User");
const Driver = require("./models/Driver");
const Location = require("./models/Location");
const Ride = require("./models/Ride");
const State = require("./models/State");
const Vehicle = require("./models/Vehicle");
const VehicleType = require("./models/VehicleType");

// Hapi
const Joi = require("@hapi/joi"); // Input validation
const Hapi = require("@hapi/hapi"); // Server
const { query } = require("../api/models/Ride");

const server = Hapi.server({
  host: "localhost",
  port: 3000,
  routes: {
    cors: true,
  },
});

async function init() {
  // Show routes at startup.
  await server.register(require("blipp"));

  // Output logging information.
  await server.register({
    plugin: require("hapi-pino"),
    options: {
      prettyPrint: true,
    },
  });

  //Configure routes
  server.route([
    {
      method: "GET",
      path: "/",
      handler: async (request, h) => {
        return await User.query().select();
      },
    },

    {
      method: 'GET',
      path: '/rides/{searchKey}/{type}',
      config: {
        description: "Search for rides",
        validate: {
          params: Joi.object({
            type: Joi.string().required(),
            searchKey: Joi.string().required(),
          }),
        },
      },
      handler: async (request, h) => {
        const type = request.params.type;
        const searchKey = request.params.searchKey;
        let returnRides = [];

        const rides = await Ride.query().withGraphFetched('toLocation').modifyGraph('toLocation', builder => {
          builder.where(type, 'like', '%' + searchKey + '%');
        });
        rides.forEach(ride => {
          if (ride.toLocation) {
            returnRides.push(ride);
          }
        });
        if (!returnRides.length) {
          return {
            ok: false,
            msge: `Nothing for ${type} and ${searchKey}`
          }
        } else {
          return {
            ok: true,
            msge: returnRides
          }
        };
      }
    },

    {
      method: 'PUT',
      path: '/passengers/{userID}/{rideID}',
      config: {
        description: 'User can join a ride',
        validate: {
          params: Joi.object({
            userID: Joi.number().integer().min(1),
            rideID: Joi.number().integer().min(1)
          })
        }
      },
      handler: async (request, h) => {
        const userID = request.params.userID;
        const rideID = request.params.rideID;
        const user = await User.query().withGraphFetched('ride').where('id', userID);
        const ride = await Ride.query().withGraphFetched('vehicle').where('id', rideID);
        const userRide = await knex.select().from('passenger').where('userID', userID).andWhere('rideID', rideID);

        // cant join ride twice
        if (user.length !== 1) {
          return {
            ok: false,
            msge: `User with id ${userID} does not exist`
          }
        } else if (ride.length !== 1) {
          return {
            ok: false,
            msge: `Ride with id ${rideID} does not exist`
          }
        } else if (userRide.length >= 1) {
          return {
            ok: false,
            msge: `User with id ${userID} is already signed up for ride ${rideID}`
          }
        } else if (ride[0].passengerCount >= ride[0].vehicle.capacity) {
          return {
            ok: false,
            msge: `Ride with id ${rideID} is full`
          }
        } else {
          await Ride.relatedQuery('user').for(rideID).relate(userID);
          let passCountArr = await Ride.query().select().where('id', rideID);
          let passCount = passCountArr[0].passengerCount;
          ++passCount;
          await Ride.query().patch({ passengerCount: passCount }).where('id', rideID);
          return {
            ok: true,
            msge: `User ${userID} has successfuly joined ride ${rideID}`
          }
        }
      },
    },

    {
      method: "GET",
      path: '/rides/{userID}',
      config: {
        description: 'Display user rides',
        validate: {
          params: Joi.object({
            userID: Joi.number().integer().min(1),
          })
        }
      },
      handler: async (request, h) => {
        const userID = request.params.userID;
        let rideIDs = [];
        let returnRides = [];

        const rides = await Ride.query().withGraphFetched('user').modifyGraph('user', builder => {
          builder.where('id', userID);
        });

        rides.forEach(ride => {
          if (ride.user.length === 1) {
            rideIDs.push(ride.id);
          }
        });

        for (let i = 0; i < rideIDs.length; i++) {
          const location = await Ride.query().where('id', rideIDs[i]).withGraphFetched('toLocation');
          returnRides.push(location[0]);
        }

        if (returnRides.length == 0) {
          return {
            ok: false,
            msge: `Nothing for ${userID}`
          }
        } else {
          return {
            ok: true,
            msge: returnRides
          }
        };
      }
    },

    {
      method: "DELETE",
      path: '/rides/{rideID}/{userID}',
      config: {
        description: 'Leave a ride',
        validate: {
          params: Joi.object({
            rideID: Joi.number().integer().min(1),
            userID: Joi.number().integer().min(1),
          })
        }
      },
      handler: async (request, h) => {
        const rideID = request.params.rideID;
        const ride = await Ride.relatedQuery('user').for(rideID).unrelate().where('id', request.params.userID).returning('*');
        // Decrement passengerCount

        if (ride == 1) {
          return {
            ok: true,
            msge: `Successfully left ride ${rideID}`
          }
        } else {
          return {
            ok: false,
            msge: `Couldn't leave ride ${rideID}`
          }
        }
      }
    },

    {
      method: "GET",
      path: '/drives/{userID}',
      config: {
        description: 'Display rides user will drive on',
        validate: {
          params: Joi.object({
            userID: Joi.number().integer().min(1),
          })
        }
      },
      handler: async (request, h) => {
        const userID = request.params.userID;
        let driverID = await Driver.query().select('id').where('userID', userID);
        if (driverID == "") {
          return {
            ok: false,
            msge: `You are not signed up to drive`
          }
        }
        driverID = driverID[0].id;
        let rideIDs = [];
        let returnRides = [];

        const rides = await Ride.query().withGraphFetched('driver').modifyGraph('driver', builder => {
          builder.where('id', driverID);
        });

        rides.forEach(ride => {
          if (ride.driver.length === 1) {
            rideIDs.push(ride.id);
          }
        });

        for (let i = 0; i < rideIDs.length; i++) {
          const location = await Ride.query().where('id', rideIDs[i]).withGraphFetched('toLocation');
          returnRides.push(location[0]);
        }

        if (returnRides.length == 0) {
          return {
            ok: false,
            msge: `Nothing for user ${userID}`
          }
        } else {
          return {
            ok: true,
            msge: returnRides
          }
        };
      }
    },

    {
      method: "DELETE",
      path: '/drives/{rideID}/{userID}',
      config: {
        description: 'Leave a ride you signed up to drive on',
        validate: {
          params: Joi.object({
            rideID: Joi.number().integer().min(1),
            userID: Joi.number().integer().min(1)
          })
        }
      },
      handler: async (request, h) => {
        let driverID = await Driver.query().select('id').where('userID', request.params.userID);
        driverID = driverID[0].id;
        const rideID = request.params.rideID;

        const ride = await Ride.relatedQuery('driver').for(rideID).unrelate().where('id', driverID).returning('*');
        if (ride == 1) {
          return {
            ok: true,
            msge: `Successfully left ride ${rideID}`
          }
        } else {
          return {
            ok: false,
            msge: `Couldn't leave ride ${rideID}`
          }
        }
      }
    },





    /*{ 
      methods: 'PUT',
      path: '/drivers/{userID}/{rideID}',
      config: {
        description: 'Sign up to drive for a ride',
        validate: {
          params: Joi.object({
            driverID: Joi.number().integer().min(1),
            rideID: Joi.number().integer().min(1),
          }),
        },
      },
      handler: async (request, h) => {
        const userID = request.params.driverID;
        const rideID = request.params.rideID;
        const vehicleID = await Ride.query().select('vehicleId').where('id', rideID);

        // User has to be driver
        const userDriver = await Driver.query().select().where('userID', userID);
        if (userDriver.length != 1) {
          return {
            ok: false,
            msge: `User ${userID} is not signed up to drive`
          }
        }

        // Check to see if driver can drive the given vehicle

        // Driver doesn't have vehicle ID    // const driverAuthorized = await Driver.query().withGraphFetched('vehicle').where('id', driverID).andWhere('vehicle.id', vehicleID);

        if( driver.length !== 1 ) {
          return {
            ok: false,
            msge: `Driver with id ${driverID} does not exist`,
          };
        } else if ( ride.length !== 1 ) {
          return {
            ok: false,
            msge: `Ride with id ${rideID} does not exist`,
          };
        } else if ( driverRide.length != 1 ) {
          return {
            ok: false,
            msge: `Ride ${rideID} does not have driver ${driverID}`,
          };
        } else if( driverAuthorized.length !== 1 ) { 
          return {
            ok: false,
            msge: `Driver ${driverID} is not authorized to drive vehicle`
          }
        } else {
          await Ride.relatedQuery('driver').for(rideID).delete().where('driverId', driverID);
          return {
            ok: true,
            msge: `Driver ${driverID} removed from ride ${rideID}`,
          };
        }

      },
    }*/


  ]);

  //Start the server
  await server.start();
}

// Go!
init();
