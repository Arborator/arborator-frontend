<template>
  <q-splitter v-model="splitterModel" horizontal :limits="[0, 100]" :style="{ height: `${splitterHeight}px` }" emit-immediately>
    <template v-slot:before>
      <AdvancedFilter @trees-saved="getTrees()" :parent-on-validate="validateAllTrees"  />
    </template>
    <template v-slot:after>
      <div class="custom-frame1" >
        <div v-show="!loading">
          <Video
            v-if="isVideo()"
          >
          </Video>
          <q-virtual-scroll
            :key="filteredTrees.length.toString() + Object.keys(filteredTrees).join('')"
            ref="virtualListRef"
            :items="Object.values(filteredTrees)"
            :style="{ maxHeight: `${splitterHeight * ((100 - splitterModel) / 100) - 1}px`, width: '100%' }"
            :virtual-scroll-slice-size="50"
            :virtual-scroll-item-size="70"
            @virtual-scroll="sentenceCardRefs()"
          >
            <template #default="{ item, index }" >
              <SentenceCard
                :ref="'card'+index"
                :key="samplename + item.sent_id"
                :sentence="item"
                :index="index"
                :blind-annotation-level="blindAnnotationLevel"
                :ud-validation="udValidationPassed[item.sent_id] || {}"
                @closeCards="closeAllCard()"
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
import api from 'src/api/backend-api';
import AdvancedFilter from 'src/components/sample/AdvancedFilter.vue';
import SentenceCard from '../components/sentence/SentenceCard.vue';
import Video from 'src/components/sentence/Video.vue';
import { QVirtualScroll } from 'quasar';

import { mapActions, mapState, mapWritableState } from 'pinia';
import { notifyError } from 'src/utils/notify';
import { useTreesStore } from 'src/pinia/modules/trees';
import { useProjectStore } from 'src/pinia/modules/project';
import { PropType, defineComponent, ref } from 'vue';

export default defineComponent({
  components: {
    SentenceCard,
    AdvancedFilter,
    Video,
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
    const splitterModel: number = 13;
    const splitterHeight: number = 0;
    const udValidationPassed: { [sentId: string]: { [userId: string]: { message: string, passed: boolean } } } = {};
    return {
      splitterModel,
      splitterHeight,
      udValidationPassed,
      languageDetected: false,
      cardRefs: [] as any[]
    };
  },
  computed: {
    ...mapState(useTreesStore, [
      'trees',
      'filteredTrees',
      'loading',
      'numberOfTrees',
      'userIds',
      'blindAnnotationLevel',
      'pendingModifications',
      'sortedSentIds'
    ]),
    ...mapState(useProjectStore, ['name']),
    ...mapWritableState(useTreesStore, ['reloadTrees', 'reloadValidation']),
    sampleName() {
      return this.$route.params.samplename as string;
    }
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
    this.reloadValidation = false;
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calculateHeight);
  },
  methods: {
    ...mapActions(useTreesStore, ['emptyPendingModification']),
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
    validateAllTrees() {
      api
        .validateAllTrees(this.name, this.sampleName)
        .then((response) => {
          const validationResults = response.data.message;
          for (const userId of Object.keys(validationResults)) {
            for (const sentId of Object.keys(validationResults[userId])) {
              if (!Object.keys(this.udValidationPassed).includes(sentId)) {
                this.udValidationPassed[sentId] = {};
              }
              let userTreeValidation = { message: validationResults[userId][sentId], passed: false };
              this.udValidationPassed[sentId][userId] = userTreeValidation;
            }
          }
          this.reloadValidation = true;
        })
        .catch((error) => {
          notifyError({ error, caller: 'validateAllTrees' });
        });
    },
    isVideo(){
      if(this.filteredTrees[0]){
        const conll = Object.values(this.filteredTrees[0].conlls)[0]
        const videoUrl= conll.match(/video_url = (.*?)\n/)
        return videoUrl !== null
      }
      return false
    },
    getVideoUrl(): string {
      if(this.filteredTrees[0]){
        const conll = Object.values(this.filteredTrees[0].conlls)[0]
        const videoUrl= conll.match(/video_url = (.*?)\n/)
        if (videoUrl){
          return videoUrl[1].toString()
        }
      }
      return ''
    },
    closeAllCard(){
      this.cardRefs.forEach(card => {
        card.closeCard()
      });
    },
    sentenceCardRefs(){
      let refs = [] as any[]
      for (let i = 0; i < this.filteredTrees.length; i++) {
        const sentenceCard = this.$refs['card' + i] as any;
        if (sentenceCard) {
          refs.push(sentenceCard)
        }
      }
      this.cardRefs = refs
    }
  },
});
</script>
