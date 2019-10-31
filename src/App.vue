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
      store: Store,
      alerts: {
        'welcomeback': { color: 'accent', message: `Welcome back! `+this.$store.getters.getUserInfos.username, icon: 'mood'}
      }
    }
  },
  mounted() {
    var token = VueCookies.get('authomatic');
    var session = VueCookies.get("session");
    if(token != null) console.log('token', token);
    if(session != null) {
      api.whoAmI().then(response =>{
        // this.$store.dispatch("setUser", response.data);
        this.store.dispatch("checkSession", {});
        this.showNotif('bottom', 'welcomeback' );
      }).catch(error => { console.log(error); });
      // this.store.dispatch("checkSession", {});
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
    },
    showNotif (position, alert) {
            const { color, textColor, multiLine, icon, message, avatar, actions } = this.alerts[alert];
            const buttonColor = color ? 'white' : void 0;
            this.$q.notify({
                color,
                textColor,
                icon: icon,
                message,
                position,
                avatar,
                multiLine,
                actions: actions,
                timeout: 2000
            })
        }
  }
}
</script>

<style>
</style>
