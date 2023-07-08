<template>
  <div class="custom-frame1">
    <div v-show="!loading" class="row q-gutter-md">
      <q-virtual-scroll
        ref="virtualListRef"
        :items="freezedTrees"
        style="width: 100%;"
        :virtual-scroll-slice-size="10"
        :virtual-scroll-item-size="200"
        v-slot="{item, index}: {item: unknown, index: number}"
      >
          <SentenceCard
            :key="index"
            :sentence="item"
            :index="index"
            search-result=""
            :exercise-level="exerciseLevel"
          >
          </SentenceCard>
      </q-virtual-scroll>
    </div>
    <div v-show="loading" class="q-pa-md row justify-center">
      <div class="absolute-center">
        <q-circular-progress indeterminate size="70px" :thickness="0.22" color="primary" track-color="grey-3"/>
      </div>
    </div>

    <GrewSearch :user-ids="userIds" :sentence-count="numberOfTrees" :search-scope="samplename" />

    <RelationTableMain :sampleName="samplename"/>
  </div>
</template>

<script lang="ts">
import {LocalStorage, QVirtualScroll} from 'quasar';

import SentenceCard from '../components/sentence/SentenceCard.vue';
import GrewSearch from '../components/grewSearch/GrewSearch.vue';
import RelationTableMain from '../components/relationTable/RelationTableMain.vue';
import {mapActions, mapState} from 'pinia';
import {useProjectStore} from 'src/pinia/modules/project';
import {useUserStore} from 'src/pinia/modules/user';
import {useGrewSearchStore} from 'src/pinia/modules/grewSearch';
import {PropType, defineComponent} from 'vue';
import {useTreesStore} from "src/pinia/modules/trees";

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
        this.emptyPendingModification();
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
  computed: {
    ...mapState(useProjectStore, ['isAdmin', 'exerciseMode', 'isTeacher']),
    ...mapState(useUserStore, ['isSuperAdmin']),
    ...mapState(useGrewSearchStore, ['pendingModifications']),
    ...mapState(useTreesStore, ["filteredTrees", "trees", "loading", "numberOfTrees", "exerciseLevel", "freezedTrees"]),
    userIds(){
      var userIds: string[] = [];
      for (const treeObj of Object.values(this.trees)){
        for(const userId in treeObj.conlls){
          if (! userIds.includes(userId)){
            userIds.push(userId);
          }
        }
      }
      return userIds;
    }
  },
  async mounted() {
    this.getSampleTrees({projectName: this.projectname, sampleName: this.samplename})
      .then(() => {
        this.scrollToIndexFromURL();
      });

    document.title = `${this.projectname}/${this.samplename}`;
    LocalStorage.remove('save_status');
  },

  methods: {
    ...mapActions(useGrewSearchStore, ['emptyPendingModification']),
    ...mapActions(useTreesStore, ['getSampleTrees']),
    scrollToIndexFromURL() {
      if (
        !this.loading &&
        this.$refs &&
        this.$refs.virtualListRef &&
        this.$route.params.nr !== undefined &&
        parseInt(this.$route.params.nr as string, 10) <= this.numberOfTrees
      ) {
        const id = parseInt(this.$route.params.nr as string, 10) - 1;
        (this.$refs.virtualListRef as QVirtualScroll).scrollTo(id as number, 'start-force');
      }
    },
  },
});
</script>
