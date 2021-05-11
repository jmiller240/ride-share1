<template>
    <v-container>
        <!-- Display Vehicles -->
        <div>
            <h4 class='display-1'>Admin</h4>

            <v-data-table
                class='elevation-1'
                :headers='headers'
                :items='vehicles'
            >
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-toolbar-title>Vehicles</v-toolbar-title>
                        <v-divider
                            class='mx-4'
                            inset
                            vertical>
                        </v-divider>
                        <v-spacer></v-spacer>
                        <v-dialog v-model='dialog' max-width='500px'>
                            <template v-slot:activator='{ on, attrs }'>
                                <v-btn
                                    color='primary'
                                    dark
                                    class='mb-2'
                                    v-bind='attrs'
                                    v-on='on'
                                >
                                    New Vehicle
                                </v-btn>
                            </template>
                            <v-card>
                                <v-card-title><span class='headline'>{{ formTitle }}</span></v-card-title>
                                <v-card-text>
                                    <v-container>
                                        <v-row>
                                            <v-col cols='12' sm='6' md='4'>
                                                <v-text-field
                                                    v-model='editedVehicle.make'
                                                    label='Make' />
                                            </v-col>
                                            <v-col cols='12' sm='6' md='4'>
                                                <v-text-field
                                                    v-model='editedVehicle.model'
                                                    label='Model' />
                                            </v-col>
                                            <v-col cols='12' sm='6' md='4'>
                                                <v-text-field
                                                    v-model='editedVehicle.color'
                                                    label='Color' />
                                            </v-col>
                                            <v-col cols='12' sm='6' md='4'>
                                                <v-text-field
                                                    v-model='editedVehicle.type'
                                                    label='Vehicle Type' />
                                            </v-col>
                                            <v-col cols='12' sm='6' md='4'>
                                                <v-text-field
                                                    v-model='editedVehicle.capacity'
                                                    label='Capacity' />
                                            </v-col>
                                            <v-col cols='12' sm='6' md='4'>
                                                <v-text-field
                                                    v-model='editedVehicle.mpg'
                                                    label='MPG' />
                                            </v-col>
                                            <v-col cols='12' sm='6' md='4'>
                                                <v-text-field
                                                    v-model='editedVehicle.licenseState'
                                                    label='License State' />
                                            </v-col>
                                            <v-col cols='12' sm='6' md='4'>
                                                <v-text-field
                                                    v-model='editedVehicle.licensePlate'
                                                    label='License Plate' />
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </v-card-text>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        color='blue darken-1'
                                        text
                                        @click='close'
                                    > Cancel </v-btn>
                                    <v-btn
                                        color='blue darken-1'
                                        text
                                        @click='save'
                                    > Save </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>

                        <v-dialog v-model='dialogDelete' max-width='500px'>
                            <v-card>
                                <v-card-title class='headline'>Are you sure you want to delete this item?</v-card-title>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color='blue darken-1' text @click='closeDelete'>Cancel</v-btn>
                                    <v-btn color='blue darken-1' text @click='deleteVehicleConfirm'>OK</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-toolbar>
                </template>

                <template v-slot:[`item.actions`]='{ item }'>
                    <v-btn text @click='editVehicleItem(item)'> Edit </v-btn>
                    <v-btn text @click='deleteVehicleItem(item)'> Delete </v-btn>
                </template>
            </v-data-table>
        </div>

        <!-- Display ride controls -->
        <div>

        </div>
    </v-container>
</template>


<script>
export default {
    name: "admin",
    
    data() {
        return {
            dialog: false,
            dialogDelete: false,

            dialogHeader: "<no dialogHeader>",
            dialogText: "<no dialogText>",
            dialogVisible: false,

            errorMessage: '',
            
            vehicleHeaders: [
                { text: 'Make', align: 'start', sortable: false, value: 'make' },
                { text: 'Model', value: 'model' },
                { text: 'Color', value: 'color' },
                { text: 'Vehicle Type', value: 'type'},
                { text: 'Capacity', value: 'capcity' },
                { text: 'MPG', value: 'mpg' },
                { text: 'License State', value: 'licenseState' },
                { text: 'License Plate', value: 'licensePlate' },
            ],
            vehicles: [],
            editedIndex: -1,
            editedVehicle: {
                make: '',
                model: '',
                color: '',
                type: '',
                mpg: 0,
                licenseState: '',
                licensePlate: '',
            },
            defaultVehicle: {
                make: '',
                model: '',
                color: '',
                type: '',
                mpg: 0,
                licenseState: '',
                licensePlate: '',
            },
        };
    },

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'New Item' : 'Edit Item';
        },
    },

    watch: {
        dialog(val) {
            val || this.close();
        },
        dialogDelete(val) {
            val || this.closeDelete();
        },
    },

    mounted() {
        this.$axios
            .get(`/vehicles`)
            .then(result => {
                if( result.data.ok ) {
                    this.showDialog("Success", result.data.msge);
                    this.vehicles = result.data.msge;
                } else {
                    this.showDialog("Sorry", result.data.msge);
                }
            })
            .catch(err => this.showDialog(err));
    },

    methods: {
        editVehicleItem(item){
            this.editedIndex = this.vehicles.indexOf(item);
            this.editedVehicle = Object.assign({}, item);
            this.dialog = true;
        },
        deleteVehicleItem(item) {
            this.editedIndex = this.vehicles.indexOf(item);
            this.editedVehicle = Object.assign({}, item);
            this.dialogDelete = true;
        },
        deleteVehicleConfirm() {
            this.vehicles.splice(this.editedIndex, 1);
            this.closeDelete();
        },
        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedVehicle = Object.assign({}, this.defaultVehicle);
                this.editedIndex = -1;
            });
        },
        closeDelete() {
            this.dialogDelete = false;
            this.$nextTick(() => {
                this.editedVehicle = Object.assign({}, this.defaultVehicle);
                this.editedIndex = -1
            });
        },
        save() {
            if( this.editedIndex > -1 ) {
                Object.assign(this.vehicles[this.editedIndex], this.editedVehicle);
            } else {
                this.vehicles.push(this.editedVehicle);
            }
            this.close();
        },
    },
}
</script>
