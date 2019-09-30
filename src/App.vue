<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import VueCookies from 'vue-cookies';
import Store from './store/index';
import api from './boot/backend-api';
VueCookies.config('7d');

export default {
  name: 'App',
  data () {
    return {
      store: Store
    }
  },
  mounted() {
    var token = VueCookies.get('authomatic');
    console.log(token);
  },
  methods: {
    parseJwt: function (token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    }
  }
}
</script>

<style>
</style>
