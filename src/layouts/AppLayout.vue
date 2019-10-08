<template>
  <q-layout view="lHr Lpr lFf">
    <q-header bordered class=" bg-white">
      <q-toolbar>
        <q-btn flat @click="drawerLeft = !drawerLeft" round dense icon="menu" color="primary" />
        <q-toolbar-title desktop-only >
          <q-btn flat dense size="xl" square to="/"><img alt="Arborator" src="../statics/arborator.text.white.svg" style="width:11vw"/></q-btn>
        </q-toolbar-title>

        <q-space />
        
        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn-dropdown v-show="!store.getters.isLoggedIn" color="secondary" outline label="Log In" icon="account_circle">
            <q-list>
              <q-item clickable v-close-popup @click="openURL('https://127.0.0.1:5000/login/google')">
              <!-- <q-item clickable v-close-popup @click="login('google')"> -->
                <q-item-section avatar>
                  <q-icon name='fab fa-google'/>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Connect via</q-item-label>
                  <q-item-label>Google</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn v-show="store.getters.isLoggedIn" round flat dense >
            <q-avatar>
              <q-icon v-show="store.getters.getUserInfos.avatar == ''" name="account_circle" />
              <q-avatar :key="store.getters.getAvatarKey" v-show="store.getters.getUserInfos.picture_url != ''" color="default" text-color="white"   >
                  <img :src="store.getters.getUserInfos.picture_url">
              </q-avatar>
              <q-tooltip :delay="300" content-class="bg-white text-primary">Logged as {{store.getters.getUserInfos.username}}</q-tooltip>
            </q-avatar>
          </q-btn>
          <!-- <q-btn round flat dense>
            <q-avatar>
              <q-icon name="fas fa-question-circle"/>
              <q-tooltip :delay="300" content-class="bg-white text-primary">Not logged</q-tooltip>
            </q-avatar>
          </q-btn> -->
          <q-btn flat dense color="primary" @click="$q.fullscreen.toggle()" :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
           :label="$q.fullscreen.isActive ? '' : ''">
            <q-tooltip :delay="300" content-class="bg-white text-primary">Fullscreen</q-tooltip>
          </q-btn>
        </div>

      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
      <q-page-scroller position="bottom-right">
        <q-btn fab icon="keyboard_arrow_up" color="secondary" />
      </q-page-scroller>
    </q-page-container>


    <q-footer bordered>
      <q-item-label caption class="text-center text-grey-3">Made by XXX</q-item-label>
    </q-footer>


    <q-drawer
        v-model="drawerLeft"
        :width="200"
        :breakpoint="700"
        content-class="bg-primary"
        behavior="mobile"
      >
      <q-scroll-area class="fit">
        <q-list v-for="(menuItem, index) in menuList" :key="index">

          <q-item v-show="isAdmin || menuItem.label!='Admin'" :to="menuItem.to" clickable :active="menuItem.label === 'Outbox'" v-ripple
          class='text-white'>
            <q-item-section avatar>
              <q-icon :name="menuItem.icon" />
            </q-item-section>
            <q-item-section>
              {{ menuItem.label }}
            </q-item-section>
          </q-item>

          <q-separator v-if="menuItem.separator" />

        </q-list>
      </q-scroll-area>
    </q-drawer>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'
import api from '../boot/backend-api';
import Store from '../store/index';

export default {
  name: 'TempLayout',
  data () {
    return {
      store: Store,
      drawerLeft: false,
      isAdmin: true,
      search: '',
      menuList: [
          {
            icon: 'house',
            label: 'Home',
            separator: true,
            to: '/'
          },
          {
            icon: 'settings',
            label: 'Settings',
            separator: false,
            to: '/settings'
          },
          {
            icon: 'vpn_key',
            label: 'Admin',
            separator: false,
            to: '/adminpanel'
          }
        ]
    }
  },
  methods: {
    openURL,
    login(provider){
      api.auth(provider)
      .then(response => {
        console.log(response)
      })
      .catch(error => {console.log(error)})
    }
  }
}
</script>

<style>
</style>
