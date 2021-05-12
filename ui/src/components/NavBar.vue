<template>
  <v-app-bar app dark color="primary">
    <router-link v-bind:to="{ name: 'home-page' }">
      <v-toolbar-title class="white--text">
        Ride-Share
      </v-toolbar-title>
    </router-link>

    <v-spacer></v-spacer>

    <v-btn text :to="{ name: 'myRides' }">My Rides</v-btn>
    <v-btn text :to="{ name: 'driverDetails' }">Driver Details</v-btn>
    <v-btn text :to="{ name: 'driverSignUp' }">Driver Sign Up</v-btn>

  </v-app-bar>
</template>

