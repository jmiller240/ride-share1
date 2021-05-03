<template>
  <v-container>
    <v-form>
        <v-container>
          <v-text-field
            label='Search here!'
            :rules="[v => !!v || 'Item is required']"
            v-model='searchKey'
            filled>
          </v-text-field>

          <v-select
            v-model='searchType'
            :items="searchOptions"
            label="Choose search type"
            filled
            required
        ></v-select>    
          
          <v-divider></v-divider>

          <v-btn @click='search'>Search</v-btn>
        </v-container>
    </v-form>

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
</template>

<script>
  export default {
    data: () => {
      return {
        searchOptions: ['Name', 'City', 'State', 'Address', 'Zip Code'],

        searchKey: '',  
        searchType: '',
        succesfulSearch: false,

        dialogHeader: "<no dialogHeader>",
        dialogText: "<no dialogText>",
        dialogVisible: false,
      };
    },
    methods: {
      search() {
        let sendType = this.searchType;
        this.$axios
          .get(`/rides/${this.searchKey}/${sendType.toLowerCase()}`)
          .then(result => {
            if (result.data.ok) {
              this.showDialog("Success", result.data.msge);
              this.successfulSearch = true;
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
    },
  }
</script>

