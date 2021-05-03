// Knex
const knex = require("knex")({
  client: "pg",
  connection: {
    host: "faraday.cse.taylor.edu",
    user: "jackson_miller",
    password: "xopijuti",
    database: "jackson_miller"
  },
});

// Objection
const { Model } = require("objection");
Model.knex(knex);

// Models
const User = require("../api/models/User");
const Driver = require("../api/models/Driver");
const Location = require("../api/models/Location");
const Ride = require("../api/models/Ride");
const State = require("../api/models/State");
const Vehicle = require("../api/models/Vehicle");
const VehicleType = require("../api/models/VehicleType");

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
      path: '/',
      handler: async (request, h) => {
        return await User.query().select();
      }
    },

    {
      method: "GET",
      path: '/rides/{userID}',
      handler: async (request, h) => {
        return await Ride.withGraphFetched('user');
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
            searchKey: Joi.string().required()
          })
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
      path: '/joinRide',
      config: {
        description: 'User can join a ride',
        validate: {
          payload: Joi.object({
            user: Joi.number().integer().min(1),
            ride: Joi.number().integer().min(1)
          })
        }
      },
      handler: async (request, h) => {
        const userID = request.payload.user;
        const rideID = request.payload.ride;
        const user = await User.query().withGraphFetched('ride').where('id', userID);
        const ride = await Ride.query().withGraphFetched('vehicle').where('id', rideID);

        // cant join ride twice, increment passengerCount on join
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
        } else if (user[0].ride.length >= 1) {
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
          let passCount = await Ride.query().select('passengerCount').where('id', rideID);
          passCount[0]++;
          await Ride.query().patch({ passengerCount: passCount});
          return {
            ok: true,
            msge: `User ${userID} has successfuly joined ride ${rideID}`
          }
        }
      },      
    },

    
  ]);

  //Start the server
  await server.start();
}

// Go!
init();