<template>
  <v-app-bar app dark color="#464343">
    <router-link v-bind:to="{ name: 'home-page' }">
      <img :src="'../../public/pdrivep.png'" height='40' />
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

