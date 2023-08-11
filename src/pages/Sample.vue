<template>
  <q-splitter
    v-model="splitterModel"
    horizontal
    :limits="[0, 100]"
    :style="{height: `${splitterHeight}px`}"
    emit-immediately
  >
    <template v-slot:before>
      <div class="q-gutter-md cols" style="padding: 0 10px">

        <div class="q-gutter-md row">
          <q-btn @click="applyFilterTrees" color="primary">Apply filter</q-btn>
          <span>{{ Object.keys(filteredTrees).length }} trees</span>
        </div>

          <q-input filled v-model="textFilter" label="Text filter" style="max-width: 800px">
          </q-input>
        <div class="row q-gutter-md">

          <q-select
            class="col"
            style="max-width: 300px"
            v-model="usersToHaveTree"
            filled
            multiple
            :options="userIds"
            use-chips
            stack-label
            :label="$t('grewSearch.selectSetOfUserToHaveTree')"
          />
          <q-select
            class="col"
            style="max-width: 300px"
            v-model="usersToNotHaveTree"
            filled
            multiple
            :options="userIds"
            use-chips
            stack-label
            :label="$t('grewSearch.selectSetOfUserToNotHaveTree')"
          />
        </div>
        <div class="row q-gutter-md">

          <q-select
            class="col"
            style="max-width: 300px"
            v-model="usersToHaveDiffs"
            filled
            multiple
            :options="userIds"
            use-chips
            stack-label
            :label="$t('grewSearch.selectSetOfUserToHaveDiffs')"
          >
            <q-tooltip>{{ $t('grewSearch.showDiffUsersTooltip') }}</q-tooltip>
          </q-select>
          <q-select
            class="col"
            style="max-width: 300px"
            v-model="usersToNotHaveDiffs"
            filled
            multiple
            :options="userIds"
            use-chips
            stack-label
            :label="$t('grewSearch.selectSetOfUserToNotHaveDiffs')"
          >
            <q-tooltip>{{ $t('grewSearch.showDiffUsersTooltip') }}</q-tooltip>
          </q-select>
        </div>

        <q-select
          v-model="featuresSetForDiffs"
          filled
          multiple
          :options="featuresSet"
          use-chips
          stack-label
          :label="$t('grewSearch.showDiffFaturesSelect')"
        >
          <q-tooltip>{{ $t('grewSearch.showDiffFeaturesTooltip') }}</q-tooltip>
        </q-select>

      </div>
    </template>

    <template v-slot:after>
      <div class="custom-frame1">
        <div v-show="!loading">
          <q-virtual-scroll
            :key="filteredTrees.length.toString() + Object.keys(filteredTrees).join('')"
            ref="virtualListRef"
            :items="Object.values(filteredTrees)"
            :style="{maxHeight: `${splitterHeight * ((100 - splitterModel)/100) - 1}px`, width: '100%'}"
            :virtual-scroll-slice-size="50"
            :virtual-scroll-item-size="70"
          >
            <template #default="{ item, index }">
              <SentenceCard
                :key="samplename + item.sent_id"
                :sentence="item"
                :index="index"
                search-result=""
                :exercise-level="exerciseLevel"
                @reload="getSampleTrees"
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

        <GrewSearch :user-ids="userIds" :sentence-count="numberOfTrees" :search-scope="samplename"/>

        <RelationTableMain :sampleName="samplename"/>
      </div>
    </template>
  </q-splitter>
</template>

<script lang="ts">
import {LocalStorage, QVirtualScroll} from 'quasar';

import SentenceCard from '../components/sentence/SentenceCard.vue';
import GrewSearch from '../components/grewSearch/GrewSearch.vue';
import RelationTableMain from '../components/relationTable/RelationTableMain.vue';
import {mapActions, mapState, mapWritableState} from 'pinia';
import {useProjectStore} from 'src/pinia/modules/project';
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
  data(): { splitterModel: number; splitterHeight: number; } {
    return {
      splitterModel: 0,
      splitterHeight: 0,
    }
  },
  computed: {
    ...mapState(useProjectStore, ['exerciseMode', 'isTeacher', 'featuresSet']),
    ...mapState(useGrewSearchStore, ['pendingModifications']),
    ...mapState(useTreesStore, ["trees", "filteredTrees", "loading", "numberOfTrees", "exerciseLevel"]),
    ...mapWritableState(useTreesStore, ["textFilter", "usersToHaveTree", "usersToNotHaveTree", "usersToHaveDiffs", "usersToNotHaveDiffs", "featuresSetForDiffs"]),
    userIds(): string[] {
      var userIds: string[] = [];
      for (const treeObj of Object.values(this.trees)) {
        for (const userId in treeObj.conlls) {
          if (!userIds.includes(userId)) {
            userIds.push(userId);
          }
        }
      }
      return userIds;
    }
  },
  created() {
    window.addEventListener('resize', this.calculateHeight);
  },
  mounted() {
    this.getSampleTrees({projectName: this.projectname, sampleName: this.samplename})
      .then(() => {
        this.scrollToIndexFromURL();
      });

    document.title = `${this.projectname}/${this.samplename}`;
    LocalStorage.remove('save_status');
    this.calculateHeight();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calculateHeight);
  },

  methods: {
    ...mapActions(useGrewSearchStore, ['emptyPendingModification']),
    ...mapActions(useTreesStore, ['getSampleTrees', 'applyFilterTrees']),
    scrollToIndexFromURL() {
      if (
        !this.loading &&
        this.$refs &&
        this.$refs.virtualListRef &&
        this.$route.params.nr !== undefined
        // parseInt(this.$route.params.nr as string, 10) <= this.numberOfTrees
      ) {
        const sendId = this.$route.params.nr as string;
        const nrAsInt = parseInt(this.$route.params.nr as string, 10) - 1;
        const indexInValues = Object.values(this.trees).findIndex((tree) => tree.sent_id === sendId);
        const indexForScroll = indexInValues !== -1 ? indexInValues : nrAsInt;
        (this.$refs.virtualListRef as QVirtualScroll).scrollTo(indexForScroll, 'start-force');
      }
    },
    calculateHeight(): void {
      const header = document.getElementById('main-header');
      if (header !== null) {
        this.splitterHeight = window.innerHeight - header.offsetHeight;
      } else {
        console.log("We didn't find the header, we will consider a header size of 35")
        this.splitterHeight = window.innerHeight - 35;
      }
    },
  },

});
</script>
