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
                        <td>{{ item.name }}</td>
                        <td>{{ item.state }}</td>
                        <td>{{ item.city }}</td>
                        <td>{{ item.address }}</td>
                        <td>{{ item.zipCode }}</td>
                        <v-btn @click='join'>Join Ride</v-btn>
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
                { text: 'State', value: 'state' },
                { text: 'Address', value: 'address' },
                { text: 'Zip Code', value: 'zipCode' },
            ],
            rides: [],
        }
    },
    mounted() {
        let sendType = this.$store.state.searchType;
        let sendKey = this.$store.state.searchKey
        this.$axios
          .get(`/rides/${sendKey}/${sendType.toLowerCase()}`)
          .then(result => {
            if (result.data.ok) {
              this.showDialog("Success", result.data.msge);
              this.successfulSearch = true;
              //What is returned?
              this.rides = result.data;
            } else {
              this.showDialog("Sorry", result.data.msge);
            }
          })
        .catch((err) => this.showDialog("Failed", err));
    }
}
</script>
