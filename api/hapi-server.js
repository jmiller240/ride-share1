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
        let returnRides = [];
        
        knex('ride').select().innerJoin('user', 'ride.id', 'user.id')

        const rides = await Ride.query().withGraphFetched('user').modifyGraph('user', builder => {
          builder.where('id', 'userID');
        });
        rides.forEach(ride => {
          if (ride.user) {
            returnRides.push(ride);
          }
        });
        if (!returnRides.length) {
          return {
            ok: false,
            msge: `Nothing for ${request.params.userID}`
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
      path: '/joinRide/{userID}/{rideID}',
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
        } else if ( ride[0].passengerCount >= ride[0].vehicle.capacity ) {
          return {
            ok: false,
            msge: `Ride with id ${rideID} is full`
          }
        } else {
          await Ride.relatedQuery('user').for(rideID).relate(userID);
          let passCountArr = await Ride.query().select().where('id', rideID);
          let passCount = passCountArr[0].passengerCount;
          ++passCount;
          await Ride.query().patch({ passengerCount: passCount}).where('id', rideID);
          return {
            ok: true,
            msge: `User ${userID} has successfuly joined ride ${rideID}`
          }
        }
      },      
    },
    {
      methods: 'DELETE',
      path: '/drivers/{driverID}/{rideID}',
      config: {
        description: 'Cancel plan to drive a ride',
        validate: {
          params: Joi.object({
            driverID: Joi.number().integer().min(1),
            rideID: Joi.number().integer().min(1),
          }),
        },
      },
      handler: async (request, h) => {
        const driverID = request.params.driverID;
        const rideID = request.params.rideID;
        const driver = await Driver.query().withGraphFetched('ride').where('id', driverID);
        const ride = await Ride.query().withGraphFetched('driver').where('id', rideID);
        const driverRide = await knex.select().from('drivers').where('driverId', driverID).andWhere('rideId', rideID);

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
        } else {
          await Ride.relatedQuery('driver').for(rideID).delete().where('driverId', driverID);
          return {
            ok: true,
            msge: `Driver ${driverID} removed from ride ${rideID}`,
          };
        }

      },
    }

    
  ]);

  //Start the server
  await server.start();
}

// Go!
init();
