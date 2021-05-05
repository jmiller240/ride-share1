<template>
    <v-container>
        <div>
            <h4 class='display-1'>Rides</h4>

            <v-data-table
                v-if='rides'
                class='elevation-1'
                :headers='headers'
                :items='rides'
            >
                <template v-slot:item="{ item }">
                    <tr>
                        <td>{{ item.toLocation.name }}</td>
                        <td>{{ item.date }}</td>
                        <!--td>{{ item.capacity }}</td :disabled='item.capacity < item.passengerCount'-->
                        <td>{{ item.passengerCount }}</td>
                        <td>{{ item.toLocation.state }}</td>
                        <td>{{ item.toLocation.city }}</td>
                        <td>{{ item.toLocation.address }}</td>
                        <td>{{ item.toLocation.zipCode }}</td>
                        <v-btn @click='joinRide(item.id)'>Join Ride</v-btn>
                    </tr>
                </template>
            </v-data-table>
            <div v-else>
                <p>Sorry, no results found. Please try again</p>
                <v-btn color='primary' text :to="{ name: 'home-page' }">Search again</v-btn>
            </div>
        </div>
    </v-container>
</template>

<script>
export default {
    name: 'Rides',

    data() {
        return {
            headers: [
                { text: 'Ride', align: 'start', sortable: false, value: 'name' },
                { text: 'Date', value: 'date' },
                //{ text: 'Capacity', value: 'capacity' },
                { text: 'Passengers', value: 'passengerCount' },
                { text: 'City', value: 'city' },
                { text: 'State', value: 'state' },
                { text: 'Address', value: 'address' },
                { text: 'Zip Code', value: 'zipCode' },
            ],
            rides: [],
        };
    },
    mounted() {
        let sendType = this.$store.state.searchType;
        let sendKey = this.$store.state.searchKey;
        this.$axios
          .get(`/rides/${sendKey}/${sendType}`)
          .then(result => {
            console.log(result.data.ok);
            if (result.data.ok) {
              this.showDialog("Success", result.data.msge);
              //What is returned?
              this.rides = result.data.msge;
            } else {
              this.showDialog("Sorry", result.data.msge);
            }
          })
        .catch((err) => this.showDialog("Failed", err));
    },
    methods: {
        joinRide(id) {
            this.$axios
                .put(`/joinRide/${this.$store.state.currentUser}/${id}`)
                .then(result => {
                    if( result.data.ok ) {
                        this.showDialog("Success", result.data.msge);
                        //What is returned?
                        this.rides = result.data.msge;
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
        },
    }
}
</script>
