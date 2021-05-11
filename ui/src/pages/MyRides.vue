<template>
  <v-container>
    <h4 class="display-1">My Rides</h4>

<<<<<<< HEAD
        <!-- TODO: change v-if statement to match Rides.vue -->
        <v-data-table
            v-if='myRides != 0'
            class='elevation-1'
            :headers='headers'
            :items='myRides'
        >
            <template v-slot:item="{ item }">
                <tr>
                    <td>{{ item.toLocation.name }}</td>
                    <td>{{ item.date }}</td>
                    <!--td>{{ item.capacity }}</td-->
                    <td>{{ item.passengerCount }}</td>
                    <td>{{ item.toLocation.state }}</td>
                    <td>{{ item.toLocation.city }}</td>
                    <td>{{ item.toLocation.address }}</td>
                    <td>{{ item.toLocation.zipCode }}</td>
                    <td>{{ item.vehicle }}</td>
                    <v-btn color='red' @click='leaveRide(item.id)'>Leave Ride</v-btn>
                </tr>
            </template>
        </v-data-table>
        <div v-else>
            <p>Sorry, you don't have any rides yet! Click here to find one: </p>
            <v-btn color='primary' text :to="{ name: 'home-page' }">Find a ride</v-btn>
        </div>
    </v-container>
=======
    <v-data-table
      v-if="myRides"
      class="elevation-1"
      :headers="headers"
      :items="myRides"
    >
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.toLocation.name }}</td>
          <td>{{ item.date }}</td>
          <td>{{ item.passengerCount }}</td>
          <td>{{ item.toLocation.state }}</td>
          <td>{{ item.toLocation.city }}</td>
          <td>{{ item.toLocation.address }}</td>
          <td>{{ item.toLocation.zipCode }}</td>
          <v-btn color="red" @click="leaveRide(item.id)">Leave Ride</v-btn>
        </tr>
      </template>
    </v-data-table>
    <div v-else>
      <p>{{ errorMessage }}</p>
      <v-btn color="primary" text :to="{ name: 'home-page' }"
        >Find a ride</v-btn
      >
    </div>

    <div class="text-xs-center">
      <v-dialog v-model="dialogVisible" width="500">
        <v-card>
          <v-card-title primary-title>
            {{ dialogHeader }}
          </v-card-title>

          <v-card-text>
            {{ dialogText }}
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text v-on:click="hideDialog">Okay</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
>>>>>>> 64edceb319235b623e38a59a52b2936a8aed7807
</template>

<script>
export default {
  name: "MyRides",

<<<<<<< HEAD
    data() {
        return {
            headers: [
                { text: 'Ride', align: 'start', sortable: false, value: 'na me' },
                { text: 'Date', value: 'date' },
                //{ text: 'Capacity', value: 'capacity' },
                { text: 'Passengers', value: 'passengerCount' },
                { text: 'City', value: 'city' },
                { text: 'State', value: 'state' },
                { text: 'Address', value: 'address' },
                { text: 'Zip Code', value: 'zipCode' },
                { text: 'Vehicle', value: 'vehicle' },
            ],
            myRides: [],
        };
    },
    mounted() {
        this.$axios
            .get(`/rides/${this.$store.state.currentUser}`)
            .then((result) => {
                    if( result.data.ok ) {
                        this.showDialog("Success", result.data.msge);
                        //What is returned?
                        this.myRides = result.data.msge;
                    } else {
                        this.showDialog("Sorry", result.data.msge);
                    }
                })
                .catch((err) => this.showDialog("Failed", err));
    },
    methods: {
        leaveRide(id) {
            this.$axios
                // FLIP variables
                .delete(`/rides/${this.$store.state.currentUser}/${id}`)
                .then(result => {
                    if( result.data.ok ) {
                        this.showDialog("Success", result.data.msge);
                        this.myRides = result.data.msge;
                    } else {
                        this.showDialog("Sorry", result.data.msge);
                    }
                })
                .catch((err) => this.showDialog("Failed", err));
        }
=======
  data() {
    return {
      headers: [
        { text: "Ride", align: "start", sortable: false, value: "name" },
        { text: "Date", value: "date" },
        //{ text: 'Capacity', value: 'capacity' },
        { text: "Passengers", value: "passengerCount" },
        { text: "City", value: "city" },
        { text: "State", value: "state" },
        { text: "Address", value: "address" },
        { text: "Zip Code", value: "zipCode" },
        //{ text: 'Vehicle', value: 'vehicle' },
      ],
      myRides: [],

      errorMessage: "",
    };
  },
  mounted() {
    this.$axios
      .get(`/rides/${this.$store.state.currentUser}`)
      .then((result) => {
        if (result.data.ok) {
          //this.showDialog("Success", result.data.msge);
          //What is returned?
          this.myRides = result.data.msge;
        } else {
          this.errorMessage = result.data.msge;
        }
      })
      .catch((err) => this.showDialog("Failed", err));
  },
  methods: {
    leaveRide(id) {
      this.$axios
        .delete(`/rides/${id}/${this.$store.state.currentUser}`)
        .then((result) => {
          if (result.data.ok) {
            this.showDialog("Success", result.data.msge);
            //What is returned?
            this.myRides = result.data.msge;
          } else {
            this.showDialog("Sorry", result.data.msge);
          }
        })
        .catch((err) => this.showDialog("Failed", err));
    },
    showDialog(header, text) {
      this.dialogHeader = header;
      this.dialogText = text;
      this.dialogVisible = true;
    },
    hideDialog() {
      this.dialogVisible = false;
      if (this.accountCreated) {
        this.$router.push({ name: "home-page" });
      }
>>>>>>> 64edceb319235b623e38a59a52b2936a8aed7807
    },
  },
};
</script>
