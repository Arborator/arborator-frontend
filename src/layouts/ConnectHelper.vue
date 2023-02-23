<!--CONNECT HELPERS : TO SEND WITH SOCKET IO WHEN USER CONNECT AND DISCONNECT-->
<!--https://stackoverflow.com/questions/56550164/how-can-i-mimic-onbeforeunload-in-a-vue-js-2-application/56551646#56551646-->
<template>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {socket} from "src/sockets/rooms";
import {mapState} from "pinia";
import {useUserStore} from "src/pinia/modules/user";
import {notifyMessage} from "src/utils/notify";

export default defineComponent({
  name: 'TempLayout',
  computed: {
    ...mapState(useUserStore, ['username']),
  },
  mounted() {
    setInterval(this.sendStillConnected, 5000);
    socket.on('connection_event', (text: string)=>{
      notifyMessage({message: text, timeout: 3000})
    })
  },
  methods: {
    sendStillConnected() {
      socket.emit("still_connected", {username: this.username})
    }
  },
});
</script>

<style>
</style>
