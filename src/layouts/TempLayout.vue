<template>
  <q-layout view="lhh Lpr lFf">
    <q-header elevated class="shadow-5 ">
      <q-toolbar>
        <q-btn flat @click="drawerLeft = !drawerLeft" round dense icon="menu" />
        <q-img src="../statics/arboratorNano.png" style="height:20px; width:45px" />
        <q-toolbar-title>
          Arborator
        </q-toolbar-title>
        
        <q-space/>
        
        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn-dropdown color="secondary" label="Log In" icon="account_circle">
            <q-list>
              <q-item clickable v-close-popup to='/login/google'>
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
          <!-- <q-btn round flat dense>
            <q-avatar>
              <q-icon name="fas fa-question-circle"/>
              <q-tooltip :delay="300" content-class="bg-white text-primary">Not logged</q-tooltip>
            </q-avatar>
          </q-btn> -->
          <q-btn flat dense class="text-white" color="primary" @click="$q.fullscreen.toggle()" :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
           :label="$q.fullscreen.isActive ? '' : ''">
            <q-tooltip :delay="300" content-class="bg-white text-primary">Fullscreen</q-tooltip>
          </q-btn>
        </div>

      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
      <q-page-scroller position="bottom">
        <q-btn fab icon="keyboard_arrow_up" color="red" />
      </q-page-scroller>
    </q-page-container>


    <q-footer bordered>
      <q-item-label caption class="text-center text-grey-3">Made by XXX</q-item-label>
    </q-footer>


    <q-drawer
        v-model="drawerLeft"
        :width="180"
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

export default {
  name: 'TempLayout',
  data () {
    return {
      drawerLeft: false,
      isAdmin: true,
      menuList: [
          {
            icon: 'house',
            label: 'Home',
            separator: true,
            to: '/home'
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
    openURL
  }
}
</script>

<style>
</style>
