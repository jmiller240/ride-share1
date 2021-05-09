const { knex } = require("./init");

//const { default: knex } = require("knex");
const Ride = require("../models/Ride.js");

async function create() {
  const newRide = await Ride.query().insert(
    {
      date: '',
      time: '',
      distance: 80.0,
      fuelPrice: 2.90,
      fee: 25,
      vehicle: [{

      }],
      fromLocation: [{}],
      toLocation: [{}]
    }
  )
  console.log("CREATE\n", newRide);
}

async function read(id) {
  const ride = await Ride.query().select().where('id', id);

  console.log('READ\n', ride);

}

async function update() { }

async function deleteTest(id) {
  const ride = await Ride.query().del().where('id', 10);

  console.log('DELETE\n', ride);
}

async function main() {
  //await create();
  //await read(5);
  //await update();
  //await deleteTest();

  let rideIDs = [];
  let returnRides = [];

  const rides = await Ride.query().withGraphFetched('user').modifyGraph('user', builder => {
    builder.where('id', 10);
  });
  console.log(rides)
  rides.forEach(ride => {
    if (ride.user.length === 1) {
      rideIDs.push(ride.id);
    }
  });
  console.log(rideIDs);
  rideIDs.forEach(async (id) => {
    let location = await Ride.query().withGraphFetched('toLocation').where('id', id);
    console.log(location);
    returnRides.push(location[0]);
  });


  console.log(returnRides);
  if (returnRides.length == 0) {
    console.log( {
      ok: false,
      msge: `Nothing for 10`
    })
  } else {
    console.log( {
      ok: true,
      msge: returnRides
    })
  };


  knex.destroy();
}

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});

main();
