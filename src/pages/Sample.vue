<template>
  <q-page :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    <div v-show="!loading" class="q-pa-md row q-gutter-md">
      <q-virtual-scroll
        ref="virtualListRef"
        :items="sentencesFrozen.list"
        style="max-height: 95vh; width: 99vw"
        :virtual-scroll-slice-size="7"
        :virtual-scroll-item-size="200"
      >
        <template v-slot="{ item, index }">
          <SentenceCard
            :key="index"
            :ref="'sc' + index"
            :id="'sc' + index"
            :sentence="sentences[item]"
            :index="index"
            :sentenceId="item"
            searchResult=""
            v-on:refresh:trees="getSampleTrees"
            :exerciseLevel="exerciseLevel"
          >
          </SentenceCard>
        </template>
      </q-virtual-scroll>
    </div>
    <div v-show="loading" class="q-pa-md row justify-center">
      <div class="absolute-center">
        <q-circular-progress indeterminate size="70px" :thickness="0.22" color="primary" track-color="grey-3" />
      </div>
    </div>
    <template v-if="!($store.getters['config/exerciseMode'] && !$store.getters['config/isTeacher'])">
      <GrewSearch :sentenceCount="sentenceCount" />
      <RelationTableMain />
    </template>
  </q-page>
</template>

<script>
import Vue from 'vue';

import { mapGetters } from 'vuex';

import { LocalStorage, openURL } from 'quasar';

import api from '../boot/backend-api';

import Store from '../store/index';

import SentenceCard from '../components/sentence/SentenceCard';
import GrewSearch from '../components/grewSearch/GrewSearch';
import RelationTableMain from '../components/relationTable/RelationTableMain';

let heavyList = [];

export default {
  components: {
    SentenceCard,
    GrewSearch,
    RelationTableMain,
  },
  props: ['projectname', 'samplename', 'nr', 'user'],
  data() {
    return {
      exerciseLevel: 4,
      svg: '',
      tab: 'gold',
      loading: true,
      sentences: {},
      sentencesFrozen: { list: [], indexes: {} },
      window: { width: 0, height: 0 },
      virtualListIndex: 15,
      scrolalaTimeStep: 10, // give the scroll 10 seconds
    };
  },
  computed: {
    ...mapGetters('config', ['isAdmin', 'exerciseMode']),
    ...mapGetters('user', ['isSuperAdmin']),
    sentenceCount() {
      return Object.keys(this.sentences).length;
    },
  },
  created() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },
  mounted() {
    this.getSampleTrees();
    document.title = `${this.$route.params.projectname}/${this.$route.params.samplename}`;
    if (this.$route.query.q && this.$route.query.q.length > 0) this.searchDialog = true;
    LocalStorage.remove('save_status');
  },
  beforeRouteLeave(to, from, next) {
    if (this.$store.getters.getPendingModifications.size > 0) {
      const answer = window.confirm('Do you really want to leave? you have unsaved changes!');
      if (answer) {
        this.$store.commit('empty_pending_modification');
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
  methods: {
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    getSampleTrees() {
      this.loading = true;
      api
        .getSampleTrees(this.projectname, this.samplename)
        .then((response) => {
          this.sentences = response.data.sample_trees;
          this.exerciseLevel = response.data.exercise_level;
          this.freezesentences();
          this.$forceUpdate();
          this.loading = false;
          if (this.$refs && this.$refs.virtualListRef && this.$route.params.nr) {
            this.intr = setInterval(() => {
              this.scrolala();
            }, 1000);
          }
        })
        .catch((error) => {
          this.$store.dispatch('notifyError', { error });
          this.loading = false;
        });
    },
    scrolala() {
      if (
        !this.loading &&
        this.$refs &&
        this.$refs.virtualListRef &&
        this.$route.params.nr !== undefined &&
        parseInt(this.$route.params.nr, 10) <= this.sentencesFrozen.list.length
      ) {
        const id = parseInt(this.$route.params.nr, 10) - 1;
        this.$refs.virtualListRef.scrollTo(id);
        clearInterval(this.intr);
        setTimeout(() => {
          if (`sc${id}` in this.$refs) this.$refs[`sc${id}`].autoopen(this.$route.params.user);
        }, 2000);
      }
      this.scrolalaTimeStep -= 1;
      if (!this.scrolalaTimeStep) clearInterval(this.intr);
    },
    freezesentences() {
      let index = 0;
      const listsentences = [];
      const index2sentId = {};
      for (const sentId in this.sentences) {
        if (Object.prototype.hasOwnProperty.call(this.sentences, sentId)) {
          listsentences.push(sentId);
          index2sentId[index] = sentId;
          index += 1;
        }
      }
      heavyList = listsentences;
      Object.freeze(heavyList);
      this.sentencesFrozen = { list: heavyList, indexes: index2sentId };
    },
  },
};
</script>
