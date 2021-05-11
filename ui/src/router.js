import Vue from "vue";
import Router from "vue-router";

import Home from "./pages/Home.vue";
import SignIn from "./pages/SignIn.vue";
import SignUp from "./pages/SignUp.vue";
import Accounts from "./pages/Accounts.vue";
import MyRides from "./pages/MyRides.vue";
import DriverDetails from "./pages/DriverDetails.vue";
import Rides from "./pages/Rides.vue";

import DriverSignUp from "./pages/DriverSignUp.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    { name: "home-page", path: "/", component: Home },
    { name: 'MyRides', path: '/MyRides', component: MyRides },
    { name: 'driverDetails', path: '/driverDetails', component: DriverDetails },
    { name: 'rides', path: '/rides', component: Rides },

    { name: "sign-up", path: "/sign-up", component: SignUp },
    { name: "sign-in", path: "/sign-in", component: SignIn },
    { name: "accounts", path: "/accounts", component: Accounts },

    { name: "driverSignUp", path: "/driverSignUp", component: DriverSignUp },
  ]
});
