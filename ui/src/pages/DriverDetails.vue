<template>
    <v-container>
        <h4 class='display-1'>Your Driving Plans</h4>

        <v-data-table
            v-if='rides'
            class='elevation-1'
            :headers='headers'
            :items='driverPlans'
        >
            <template v-slot:item="{ item }">
                <tr>
                    <td>{{ item.name }}</td>
                    <td>{{ item.date }}</td>
                    <!--td>{{ item.capacity }}</td :disabled='item.capacity < item.passengerCount'-->
                    <td>{{ item.passengerCount }}</td>
                    <td>{{ item.toLocation.state }}</td>
                    <td>{{ item.toLocation.city }}</td>
                    <td>{{ item.toLocation.address }}</td>
                    <td>{{ item.toLocation.zipCode }}</td>
                    <td>{{ item.vehicle }}</td>
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
                { text: 'Vehicle', value: 'vehicle' },
            ],

            driverPlans: [],

            dialogHeader: "<no dialogHeader>",
            dialogText: "<no dialogText>",
            dialogVisible: false,

            errorMessage: '',
        };
    },
    mounted() {
        this.$axios
            .get(`/drivers/${this.$store.state.currentUser}`)
            .then(result => {
                if( result.data.ok ) {
                    this.showDialog("Success", result.msge);
                    this.driverPlans = result.data.msge;
                } else {
                    this.showDialog("Sorry", result.data.msge);
                }
            })
            .catch((err) => this.showDialog("Failed", err));
    },
    methods: {
        cancelRide(id) {
            this.$axios
                .delete(`/drivers/${this.$store.state.currentUser}/${id}`)
                .then(result => {
                    if( result.ok ) {
                        this.showDialog("Success", result.msge);
                        // Remove ride from display
                        this.driverPlans = result.msge;
                    } else {
                        this.showDialog("Sorry", result.msge);
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
    },
}
</script>
