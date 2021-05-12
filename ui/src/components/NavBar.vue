<template>
  <v-app-bar app dark color="#464343">
    <router-link color='#FFFFFF' v-bind:to="{ name: 'home-page' }">
      <v-toolbar-title class="title">
        pdrivep
      </v-toolbar-title>
    </router-link>

    <v-spacer></v-spacer>

    <v-btn text :to="{ name: 'myRides' }">My Rides</v-btn>
    <v-btn text :to="{ name: 'driverDetails' }">Driver Details</v-btn>
    <v-btn :hidden='checkDriver' text :to="{ name: 'driverSignUp' }">Driver Sign Up</v-btn>
    <v-btn text :to="{ name: 'admin' }">Admin</v-btn>

  </v-app-bar>
</template>

<script>
export default {
  name: 'nav-bar',

  computed: {
    checkDriver() {
      this.$axios
        .get(`drives/${this.$store.state.currentUser}`)
        .then(result => {
          if( result.data.msge === `You are not signed up to drive` ) {
            return true;
          } else {
            return false;
          }
        })
        .catch(err => console.log(err));
    }
  }
}
</script>

<style>
  .title {
    font-family: "Copperplate", fantasy;
  }
</style>