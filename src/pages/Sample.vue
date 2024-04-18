<template>
  <q-splitter v-model="splitterModel" horizontal :limits="[0, 100]" :style="{ height: `${splitterHeight}px` }" emit-immediately>
    <template v-slot:before>
      <AdvancedFilter />
    </template>
    <template v-slot:after>
      <div class="custom-frame1">
        <div v-show="!loading">
          <q-virtual-scroll
            :key="filteredTrees.length.toString() + Object.keys(filteredTrees).join('')"
            ref="virtualListRef"
            :items="Object.values(filteredTrees)"
            :style="{ maxHeight: `${splitterHeight * ((100 - splitterModel) / 100) - 1}px`, width: '100%' }"
            :virtual-scroll-slice-size="50"
            :virtual-scroll-item-size="70"
          >
            <template #default="{ item, index }">
              <SentenceCard
                :key="samplename + item.sent_id"
                :sentence="item"
                :index="index"
                :blind-annotation-level="blindAnnotationLevel"
                :is-focused="focusedSentences[index]"
                @focused-sent="loseFocus"
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

        <GrewSearch :sentence-count="numberOfTrees" :search-scope="samplename" :sample-names="[samplename]" :trees-from="userIds" />

        <RelationTableMain :sample-names="[samplename]" :treesFrom="userIds" />
      </div>
    </template>
  </q-splitter>
</template>

<script lang="ts">
import { QVirtualScroll } from 'quasar';

import { mapActions, mapState, mapWritableState } from 'pinia';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { useTreesStore } from 'src/pinia/modules/trees';
import { PropType, defineComponent } from 'vue';

import AdvancedFilter from 'src/components/sample/AdvancedFilter.vue';
import GrewSearch from '../components/grewSearch/GrewSearch.vue';
import RelationTableMain from '../components/relationTable/RelationTableMain.vue';
import SentenceCard from '../components/sentence/SentenceCard.vue';

export default defineComponent({
  components: {
    SentenceCard,
    GrewSearch,
    RelationTableMain,
    AdvancedFilter,
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
  data() {
    const splitterModel: number = 10;
    const splitterHeight: number = 0;
    const focusedSentences: boolean[] = [];
    return {
      splitterModel,
      splitterHeight,
      focusedSentences,
    };
  },
  computed: {
    ...mapState(useGrewSearchStore, ['pendingModifications']),
    ...mapState(useTreesStore, ['trees', 'filteredTrees', 'loading', 'numberOfTrees', 'userIds', 'blindAnnotationLevel']),
    ...mapWritableState(useTreesStore, ['reloadTrees']),
  },
  created() {
    window.addEventListener('resize', this.calculateHeight);
  },
  watch: {
    reloadTrees(newVal) {
      if (newVal) this.getTrees();
    }
  },
  mounted() {
    document.title = `${this.projectname}/${this.samplename}`;
    this.getTrees();
    this.calculateHeight();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calculateHeight);
  },
  methods: {
    ...mapActions(useGrewSearchStore, ['emptyPendingModification']),
    ...mapActions(useTreesStore, ['getSampleTrees', 'applyFilterTrees', 'getUsersTags']),
    getTrees() {
      this.getSampleTrees({ projectName: this.projectname, sampleName: this.samplename }).then(() => {
        this.scrollToIndexFromURL();
        this.focusedSentences = Array(Object.keys(this.filteredTrees).length).fill(false);
        this.reloadTrees = false;
      }); 
    },
    scrollToIndexFromURL() {
      if (!this.loading && this.$refs && this.$refs.virtualListRef && this.$route.params.nr !== undefined) {
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
        console.log("We didn't find the header, we will consider a header size of 35");
        this.splitterHeight = window.innerHeight - 35;
      }
    },
    loseFocus(value: any) {
      const index = this.filteredTrees.findIndex((tree) => tree.sent_id == value);
      for (const sentId in this.focusedSentences) {
        this.focusedSentences[sentId] = parseInt(sentId) == index;
      }
    },
  },
});
</script>
