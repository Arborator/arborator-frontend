<template>
  <q-layout view="lHh Lpr lFf">
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
              <q-item clickable v-close-popup @click="openURL(store.getters.getSource + '/login/google')">
                <q-item-section avatar>
                  <q-icon name='fab fa-google'/>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Connect via</q-item-label>
                  <q-item-label>Google</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="openURL(store.getters.getSource + '/login/github')">
                <q-item-section avatar>
                  <q-icon name='fab fa-github'/>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Connect via</q-item-label>
                  <q-item-label>GitHub</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn v-show="store.getters.isLoggedIn" round flat dense color="purple"  >
            <q-avatar>
              <q-icon v-show="store.getters.getUserInfos.avatar == ''" name="account_circle" />
              <q-avatar v-show="store.getters.getUserInfos.picture_url != ''" :key="store.getters.getAvatarKey" color="default" text-color="white"   >
                  <img :src="store.getters.getUserInfos.picture_url">
              </q-avatar>
            </q-avatar>
            
            <q-menu transition-show="jump-down" transition-hide="jump-up">
              <div class="row no-wrap q-pa-md">
                <div class="column">
                    <q-list>
                      <q-item clickable v-ripple to="/settings">
                        <q-item-section avatar> <q-icon name="settings" /> </q-item-section>
                        <q-item-section> Settings </q-item-section>
                      </q-item>
                      <q-item v-show="store.getters.getUserInfos.super_admin" clickable v-ripple to="/admin">
                        <q-item-section avatar> <q-icon name="vpn_key" /> </q-item-section>
                        <q-item-section> Admin </q-item-section>
                      </q-item>
                    </q-list>
                </div>

                <q-separator vertical inset class="q-mx-lg" />

                <div class="column items-center">
                  <q-icon v-show="store.getters.getUserInfos.avatar == ''" name="account_circle" />
                  <q-avatar v-show="store.getters.getUserInfos.picture_url != ''" :key="store.getters.getAvatarKey" color="default" text-color="white">
                    <img :src="store.getters.getUserInfos.picture_url">
                  </q-avatar>
                  <div class="text-subtitle1 q-mt-md q-mb-xs">{{store.getters.getUserInfos.username}}</div>
                  <q-btn color="negative" label="Logout" size="sm" v-close-popup @click="logout()"/>
                </div>
              </div>
            </q-menu>
          </q-btn>
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
      <q-item-label caption class="text-center text-grey-3">Made at Almanach, Inria</q-item-label>
    </q-footer>


    <q-drawer
        v-model="drawerLeft"
        :width="200"
        :breakpoint="400"
        content-class="bg-primary"
        dark
        show-if-above
        bordered
      >

      <q-img class="absolute-top" src="https://cdn.quasar.dev/img/material.png" style="height: 150px">
          <div class="absolute-bottom bg-transparent">
            <q-avatar size="56px" class="q-mb-sm">
              <img :src="store.getters.getUserInfos.picture_url">
            </q-avatar>
            <div class="text-weight-bold">Razvan Stoenescu</div>
            <div>@rstoenescu</div>
          </div>
        </q-img>

      <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px; ">
        <q-list v-for="(menuItem, index) in menuList" :key="index" padding>

          <q-item v-show="store.getters.isLoggedIn || menuItem.public" :to="menuItem.to" clickable :active="menuItem.label === 'Outbox'" v-ripple
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
import { openURL } from 'quasar';
import api from '../boot/backend-api';
import Store from '../store/index';

export default {
  name: 'TempLayout',
  data () {
    return {
      store: Store,
      drawerLeft: false,
      isAdmin: false,
      search: '',
      menuList: [
          {
            icon: 'house',
            label: 'Home',
            separator: true,
            public: true,
            to: '/'
          },
          {
            icon: 'settings',
            label: 'Settings',
            separator: false,
            public: false,
            to: '/settings'
          },
          {
            icon: 'vpn_key',
            label: 'Admin',
            separator: false,
            public: false,
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
        console.log(response);
      })
      .catch(error => {console.log(error)})
    },
    logout() {
      this.store.dispatch("logout", { user: this.store.getters.getUserInfos.username}).then(() => {  this.$router.push('/').catch(error => {});  })
    },
  }
}
</script>

<style>
</style>
