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
        <template #default="{ item, index }">
          <SentenceCard
            :id="'sc' + index"
            :key="index"
            :ref="'sc' + index"
            :sentence="sentences[item]"
            :index="index"
            :sentence-id="item"
            search-result=""
            :exercise-level="exerciseLevel"
          >
          </SentenceCard>
        </template>
      </q-virtual-scroll>
    </div>
    <div v-show="loading" class="q-pa-md row justify-center">
      <div class="absolute-center">
        <q-circular-progress indeterminate size="70px" :thickness="0.22" color="primary" track-color="grey-3"/>
      </div>
    </div>
    <GrewSearch :sentence-count="sentenceCount" :search-scope="samplename" @reload="refreshWindow" />
    <RelationTableMain :sampleName="samplename" />
  </q-page>
</template>

<script lang="ts">
import {LocalStorage} from 'quasar';

import api from '../api/backend-api';

import SentenceCard from '../components/sentence/SentenceCard.vue';
import GrewSearch from '../components/grewSearch/GrewSearch.vue';
import RelationTableMain from '../components/relationTable/RelationTableMain.vue';
import {mapActions, mapState} from 'pinia';
import {useProjectStore} from 'src/pinia/modules/project';
import {useUserStore} from 'src/pinia/modules/user';
import {notifyError} from 'src/utils/notify';
import {useGrewSearchStore} from 'src/pinia/modules/grewSearch';
import {sentence_t} from 'src/types/main_types';
import {PropType, defineComponent} from 'vue';

export default defineComponent({
  components: {
    SentenceCard,
    GrewSearch,
    RelationTableMain,
  },
  beforeRouteLeave(to, from, next) {
    if (this.pendingModifications.size > 0) {
      const answer = window.confirm('Do you really want to leave? you have unsaved changes!');
      if (answer) {
        this.empty_pending_modification();
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
  props: {
    projectname: {
      type: String as PropType<string>,
      required: true,
    },
    samplename: {
      type: String as PropType<string>,
      required: true,
    },
  },
  data() {
    const sentencesFrozen: {
      list: string[];
      indexes: { [key: number]: string };
    } = {list: [], indexes: {}};
    const sentences: { [key: string]: sentence_t } = {};
    return {
      intr: setTimeout(() => {
        console.log('KK find better to init timeout');
      }, 0),
      sentences,
      exerciseLevel: 4,
      svg: '',
      tab: 'gold',
      loading: true,
      sentencesFrozen,
      window: {width: 0, height: 0},
      virtualListIndex: 15,
      scrolalaTimeStep: 10, // give the scroll 10 seconds
    };
  },
  computed: {
    ...mapState(useProjectStore, ['isAdmin', 'exerciseMode', 'isTeacher']),
    ...mapState(useUserStore, ['isSuperAdmin']),
    ...mapState(useGrewSearchStore, ['pendingModifications']),
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
    LocalStorage.remove('save_status');
  },

  methods: {
    ...mapActions(useGrewSearchStore, ['empty_pending_modification']),
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    refreshWindow() {
      location.reload();
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
          notifyError({error});
          this.loading = false;
        });
    },
    scrolala() {
      if (
        !this.loading &&
        this.$refs &&
        this.$refs.virtualListRef &&
        this.$route.params.nr !== undefined &&
        parseInt(this.$route.params.nr as string, 10) <= this.sentencesFrozen.list.length
      ) {
        const id = parseInt(this.$route.params.nr as string, 10) - 1;
        (this.$refs.virtualListRef as HTMLElement).scrollTo(id as any);
        clearInterval(this.intr);
        setTimeout(() => {
          if (`sc${id}` in this.$refs) (this.$refs[`sc${id}`] as any).autoopen(this.$route.params.user); // FIXME : what is this autoopen ????
        }, 2000);
      }
      this.scrolalaTimeStep -= 1;
      if (!this.scrolalaTimeStep) clearInterval(this.intr);
    },
    freezesentences() {
      let index = 0;
      const listsentences: string[] = [];
      const index2sentId: { [key: number]: string } = {};
      for (const sentId in this.sentences) {
        if (Object.prototype.hasOwnProperty.call(this.sentences, sentId)) {
          listsentences.push(sentId);
          index2sentId[index] = sentId;
          index += 1;
        }
      }
      const heavyList = listsentences;
      Object.freeze(heavyList);
      this.sentencesFrozen = {list: heavyList, indexes: index2sentId};
    },
  },
});
</script>
