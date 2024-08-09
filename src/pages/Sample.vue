<template>
  <q-splitter v-model="splitterModel" horizontal :limits="[0, 100]" :style="{ height: `${splitterHeight}px` }" emit-immediately>
    <template v-slot:before>
      <AdvancedFilter @trees-saved="getTrees()"  />
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
      </div>
    </template>
  </q-splitter>
</template>

<script lang="ts">
import { mapActions, mapState, mapWritableState } from 'pinia';
import { LocalStorage, QVirtualScroll } from 'quasar';
import AdvancedFilter from 'src/components/sample/AdvancedFilter.vue';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { useTreesStore } from 'src/pinia/modules/trees';
import { PropType, defineComponent } from 'vue';

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
    return {
      splitterModel,
      splitterHeight,
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
    },
  },
  mounted() {
    document.title = `${this.projectname}/${this.samplename}`;
    this.emptyPendingModification();
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
  },
});
</script>
