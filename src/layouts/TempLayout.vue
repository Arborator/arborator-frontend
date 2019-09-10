<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="shadow-5 " reveal>
      <q-toolbar>
        <q-img src="../statics/arboratorNano.png" style="height:20px; width:45px" />
        <q-toolbar-title>
          Arborator
        </q-toolbar-title>
        

        <q-space/>
        
        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn flat dense label="Admin" icon="fas fa-tools"></q-btn>
          <q-btn round flat dense>
            <q-avatar>
              <q-icon name="fas fa-question-circle"/>
              <q-tooltip :delay="300" content-class="bg-white text-primary">Not logged</q-tooltip>
            </q-avatar>
          </q-btn>
          <q-btn flat dense class="text-white" color="primary" @click="$q.fullscreen.toggle()" :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
           :label="$q.fullscreen.isActive ? '' : ''">
            <q-tooltip :delay="300" content-class="bg-white text-primary">Fullscreen</q-tooltip>
          </q-btn>
        </div>

      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>


    <q-footer reveal bordered>
      <div class="text-center">Made by XXX</div>
    </q-footer>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'TempLayout',
  data () {
    return {
      leftDrawerOpen: false
    }
  },
  methods: {
    openURL
  }
}
</script>

<style>
</style>
