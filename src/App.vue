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
    var session = VueCookies.get("session");
    if(token != null) console.log('token', token);
    if(session != null) {
      console.log('session', session);
      // api.whoAmI().then(response =>{
      //   console.log(response)} 
      // ).catch(error => { console.log(error); });
      this.store.dispatch("checkSession", {})
        // .then(() => {
        //   this.$router.push('/');
        // })
    }
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
