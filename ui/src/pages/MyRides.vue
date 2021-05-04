<template>
    <v-container>
        <h4 class='display-1'>My Rides</h4>

        <v-data-table
            v-if='rides.ok'
            class='elevation-1'
            :headers='headers'
            :items='rides'
        >
            <template v-slot:item="{ item }">
                <tr>
                    <td>{{ item.name }}</td>
                    <td>{{ item.date }}</td>
                    <!--td>{{ item.capacity }}</td-->
                    <td>{{ item.passengerCount }}</td>
                    <td>{{ item.state }}</td>
                    <td>{{ item.city }}</td>
                    <td>{{ item.address }}</td>
                    <td>{{ item.zipCode }}</td>
                    <v-btn color='red' @click='leaveRide(item.id)'>Leave Ride</v-btn>
                </tr>
            </template>
        </v-data-table>
        <div v-else>
            <p>Sorry, you don't have any rides yet! Click here to find one: </p>
            <v-btn color='primary' text :to="{ name: 'home-page' }">Find a ride</v-btn>
        </div>
    </v-container>
</template>

<script>
export default {
    name: 'myRides',

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
            myRides: [],
        };
    },
    mounted() {
        this.$axios
            .get(`/rides/${this.$store.state.currentUser}`)
            .then(result => {
                    if( result.ok ) {
                        this.showDialog("Success", result.msge);
                        //What is returned?
                        this.myRides = result.msge;
                    } else {
                        this.showDialog("Sorry", result.msge);
                    }
                })
                .catch((err) => this.showDialog("Failed", err));
    },
    methods: {
        leaveRide(id) {
            this.$axios
                .delete(`/rides/${this.$store.state.currentUser}/${id}`)
                .then(result => {
                    if( result.ok ) {
                        this.showDialog("Success", result.msge);
                        //What is returned?
                        this.myRides = result.msge;
                    } else {
                        this.showDialog("Sorry", result.msge);
                    }
                })
                .catch((err) => this.showDialog("Failed", err));
        }
    },
}
</script>
