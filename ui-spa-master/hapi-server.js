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

console.log(knex.select().from('user'));

// Objections
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

        if (type === 'name') {

          const rides = await Ride.query().withGraphFetched('toLocation').modifyGraph('toLocation', builder => {
            builder.where( 'name', 'like', '%'+searchKey+'%');
          });
          rides.forEach(ride => {
            if (ride.toLocation) {
              returnRides.push(ride);
            }
          });
          if (!returnRides.length) {
            return {
              ok: false
            }
          } else {
            return {
              ok: true,
              msge: returnRides
            }
          };

        } else if (type === 'address') {

          const rides = await Ride.query().withGraphFetched('toLocation').modifyGraph('toLocation', builder => {
            builder.where('address', 'like', '%'+searchKey+'%');
          });
          rides.forEach(ride => {
            if (ride.toLocation) {
              returnRides.push(ride);
            }
          });
          return returnRides;

        } else if (type === 'city') {

          const rides = await Ride.query().withGraphFetched('toLocation').modifyGraph('toLocation', builder => {
            builder.where('city', 'like', '%'+searchKey+'%');
          });
          rides.forEach(ride => {
            if (ride.toLocation) {
              returnRides.push(ride);
            }
          });
          return returnRides;

        } else if (type === 'state') {

          const rides = await Ride.query().withGraphFetched('toLocation').modifyGraph('toLocation', builder => {
            builder.where('state', 'like', '%'+searchKey+'%');
          });
          rides.forEach(ride => {
            if (ride.toLocation) {
              returnRides.push(ride);
            }
          });
          return returnRides;

        } else if (type === 'zip') {

          const rides = await Ride.query().withGraphFetched('toLocation').modifyGraph('toLocation', builder => {
            builder.where('zip', 'like', '%'+searchKey+'%');
          });
          rides.forEach(ride => {
            if (ride.toLocation) {
              returnRides.push(ride);
            }
          });
          return returnRides;

        } 

      }
    }
  ]);

  //Start the server
  await server.start();
}

// Go!
init();