<template>
  <q-page :class="$q.dark.isActive?'bg-dark':'bg-grey-1'">

    <div class="q-pa-md q-gutter-sm">
      <q-card flat>
        <q-card-section >
          <div :class="$q.dark.isActive?'text-grey-1':'text-blue-grey-8'" class="text-h4 text-center ">Welcome to ArboratorGrew!</div>
        </q-card-section>

        <q-card-actions align="around">
          <q-btn push to="/projects" color="accent" >Access Treebanks</q-btn>
          <q-btn flat :class="$q.dark.isActive?'text-grey-1':'text-blue-grey-8'">Naija</q-btn>
        </q-card-actions>

        <q-card-section class="text-center text-justify" :class="$q.dark.isActive?'text-grey-1':'text-blue-grey-8'">
        {{presentation}}
        </q-card-section>

      </q-card>

    <q-card flat>
      <q-card-section >
        <div class="text-h4 text-center" :class="$q.dark.isActive?'text-grey-1':'text-blue-grey-8'">Features</div>
      </q-card-section>

      <q-card-section >
        <q-carousel
          v-model="slide"
          transition-prev="jump-right"
          transition-next="jump-left"
          swipeable
          animated
          :control-color="$q.dark.isActive?'white':'blue-grey-8'"
          navigation
          infinite
          autoplay
          padding
          arrows
          height="300px"
          :class="$q.dark.isActive?'bg-grey-10 text-white':'text-blue-grey-8'" class=" rounded-borders"
        >
          <q-carousel-slide name="style" class="column no-wrap flex-center">
            <q-icon name="style" size="56px" />
            <div class="q-mt-md text-center">
              {{ lorem }}
            </div>
          </q-carousel-slide>
          <q-carousel-slide name="tv" class="column no-wrap flex-center">
            <q-icon name="live_tv" size="56px" />
            <div class="q-mt-md text-center">
              {{ lorem }}
            </div>
          </q-carousel-slide>
          <q-carousel-slide name="layers" class="column no-wrap flex-center">
            <q-icon name="layers" size="56px" />
            <div class="q-mt-md text-center">
              {{ lorem }}
            </div>
          </q-carousel-slide>
          <q-carousel-slide name="map" class="column no-wrap flex-center">
            <q-icon name="terrain" size="56px" />
            <div class="q-mt-md text-center">
              {{ lorem }}
            </div>
          </q-carousel-slide>
        </q-carousel>
      </q-card-section>

      <q-card-section class="text-justify">
        <p v-for="n in 3" :key="n"><span v-for="i in 5" :key="i"> {{lorem}} </span></p>
      </q-card-section>
    </q-card>

    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-card :class="hover ? 'bg-grey-2' : ''" class="clickable col-1 grid-style-transition shadow-7"
      @mouseover="hover = true" 
      @mouseleave="hover = false" 
      @click="openURL('https://arborator.github.io/draft')"
      :style="hover ? 'transform: scale(0.95);' : ''"
      style="border-radius: 20px 20px 10px 10px">
        <q-card-section>
            <img src="../statics/arborator.quick.svg" width="100em" /> <q-badge align="top" color="positive">No login!</q-badge>
            <q-item-section>
                <q-item-label lines="1"> </q-item-label>
                <q-item-label caption lines="2" :class="$q.dark.isActive?'text-grey':''">
                  CoNLL files graphical editor
                </q-item-label>
            </q-item-section>
        </q-card-section>
      </q-card>
    </q-page-sticky>
  </q-page>
</template>

<style scoped lang="stylus">
.clickable:hover {
  cursor:pointer;
}

.grid-style-transition
  transition transform .28s, background-color .28s

</style>

<script>
import { openURL } from 'quasar';
import api from '../boot/backend-api';
import Store from '../store/index';
import ProjectCard from '../components/ProjectCard.vue';

export default {
  components: {
    ProjectCard
  },
  name: 'PageIndex',
  data() {
    return {
      lorem: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      presentation:`
      Arborator-Grew, a collaborative annotation tool for treebank development. Arborator-Grew combines the features of two preexisting tools: Arborator and Grew. Arborator is a widely used collaborative graphical online dependency treebank annotation tool. Grew is a tool for graph querying and rewriting specialized in structures needed in NLP, i.e. syntactic and semantic dependency trees and graphs. Grew also has an online version, Grew-match, where all Universal Dependencies treebanks in their classical, deep and surface-syntactic flavors can be queried. Arborator-Grew is a complete redevelopment and modernization of Arborator, replacing its own internal database storage by a new Grew API, which adds a powerful query tool to Arborator's existing treebank creation and correction features. This includes complex access control for parallel expert and crowd-sourced annotation, tree comparison visualization, and various exercise modes for teaching and training of annotators. Arborator-Grew opens up new paths of collectively creating, updating, maintaining, and curating syntactic treebanks and semantic graph banks.
      `,
      hover: false,
      search: '',
      slide: 'style',
    }
  },
  mounted(){
  },
  methods:{
    openURL
  }
}
</script>
