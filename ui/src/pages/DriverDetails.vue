<template>
    <v-container>
        <h4 class='display-1'>Your Driving Plans</h4>

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
                    <!--td>{{ item.capacity }}</td :disabled='item.capacity < item.passengerCount'-->
                    <td>{{ item.passengerCount }}</td>
                    <td>{{ item.state }}</td>
                    <td>{{ item.city }}</td>
                    <td>{{ item.address }}</td>
                    <td>{{ item.zipCode }}</td>
                    <v-btn color='red' @click='cancelDrive(item.id)'>Cancel</v-btn>              
                </tr>   
            </template>
        </v-data-table>
        <div v-else>
            <p>Sorry, looks like you're not a driver. Click here to search rides</p>
            <v-btn color='primary' text :to="{ name: 'home-page' }">Search Rides</v-btn>
        </div>
    </v-container>
</template>

<script>
export default {
    name: 'driverDetails',

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
            driverPlans: [],
        };
    },
    mounted() {
        this.$axios
            .get( /* FIGURE OUT ROUTE */ )
            .then(result => {
                if( result.ok ) {
                    this.showDialog("Success", result.msge);
                    //What is returned?
                    this.driverPlans = result.msge;
                } else {
                    this.showDialog("Sorry", result.msge);
                }
            })
            .catch((err) => this.showDialog("Failed", err));
    },
    methods: {
        cancelRide(id) {
            this.$axios
                .delete( /* FIGURE OUT ROUTE */ )
                .then(result => {
                    if( result.ok ) {
                        this.showDialog("Success", result.msge);
                        //What is returned?
                        this.driverPlans = result.msge;
                    } else {
                        this.showDialog("Sorry", result.msge);
                    }
                })
                .catch((err) => this.showDialog("Failed", err));
        }
    },
}
</script>
