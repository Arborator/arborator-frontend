<template>
  <div style="min-width: 99vw; min-height: 50vh" class="custom-frame2">
    <q-bar class="bg-primary text-white sticky-bar">
      <q-icon name="img:/svg/grew.svg" size="7rem" />
      <q-space />
      <div class="text-weight-bold">
        {{ sentenceCount }} <span v-if="sentenceCount === 1">result</span><span v-else>results</span> of the
        {{ totalsents }}
        <span v-if="totalsents === 1">sentence</span><span v-else>sentences</span> in the {{ searchscope }}
      </div>
      <q-space />
      <q-btn v-close-popup flat dense icon="close" />
    </q-bar>
    <div v-if="showFilterResults" class="q-pa-md custom-frame1">
      <q-select
        outlined
        dense
        v-model="selectedSample"
        use-input
        hide-dropdown-icon
        input-debounce="0"
        label="Filter results by sample name"
        :options="filteredSamples"
        @filter="filterSamples"
      >
        <template v-slot:selected-item="scope">
          <q-chip v-if="scope.opt !== ''" removable @remove="scope.removeAtIndex(scope.index)" :tabindex="scope.tabindex" dense text-color="primary">
            {{ scope.opt }}
          </q-chip>
        </template>
        <template #append>
          <q-icon name="search" />
        </template>
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey"> No results </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>
    <div>
      <template v-if="samplesFrozen.list.length > 0">
        <q-virtual-scroll
          :key="filteredResults.length"
          :items="filteredResults"
          style="max-width: 99vw"
          :virtual-scroll-slice-size="30"
          v-slot="{ item, index }"
        >
          <div :key="index" style="display: flex">
            <template v-if="queryType === 'REWRITE'">
              <q-checkbox class="custom-frame2 custom-right-border" v-model="samplesFrozen.selected[index]"></q-checkbox>
            </template>
            <div style="flex-grow: 1; overflow: auto">
              <SentenceCard
                :key="index"
                :sentence="searchresults[item[0]][item[1]]"
                :index="index"
                :matches="searchresults[item[0]][item[1]]"
                :blind-annotation-level="4"
              ></SentenceCard>
            </div>
          </div>
        </q-virtual-scroll>
      </template>
    </div>
    <q-bar
      class="absolute-bottom row custom-frame2"
      style="padding-left: 0"
      v-if="queryType === 'REWRITE' && samplesFrozen.list.length > 0 && canRewriteRule"
    >
      <div>
        <q-checkbox v-if="queryType === 'REWRITE'" v-model="all" @click="selectAllSentences()">
          <q-tooltip>{{ $t('grewSearch.selectAllTooltip') }}</q-tooltip>
        </q-checkbox>
      </div>
      <div>
        <q-btn :disable="!atLeastOneSelected" color="primary" :label="$t('grewSearch.applyRule')" @click="applyRules">
          <q-tooltip v-if="!atLeastOneSelected">{{ $t('grewSearch.applyRuleTooltip') }}</q-tooltip>
        </q-btn>
      </div>
    </q-bar>
  </div>
</template>

<script lang="ts">
import { sentenceConllToJson, sentenceJsonToConll } from 'conllup/lib/conll';
import { mapState } from 'pinia';
import { LocalStorage } from 'quasar';
import { grewSearchResult_t, sample_t } from 'src/api/backend-types';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';
import api from '../../api/backend-api';
import SentenceCard from '../sentence/SentenceCard.vue';

export default defineComponent({
  components: { SentenceCard },
  props: {
    searchresults: {
      type: Object as PropType<grewSearchResult_t>,
      required: true,
    },
    totalsents: {
      type: Number as PropType<number>,
      required: true,
    },
    searchscope: {
      type: String as PropType<string>,
      required: true,
    },
    queryType: {
      type: String as PropType<string>,
      required: false,
    },
    query: {
      type: String as PropType<string>,
      required: false,
    },
    userType: {
      type: String as PropType<string>,
      required: false,

    },
    parentOnShowTable: {
      type: Function as PropType<CallableFunction>,
      required: true,
    },
  },

  data() {
    const searchresultsCopy: grewSearchResult_t = {};
    const samples: sample_t[] = [];
    const samplesFrozen: {
      list: string[][];
      indexes: { [key: number]: string[] };
      samples: sample_t[];
      selected: { [key: number]: boolean };
    } = { list: [], indexes: {}, samples: [], selected: {} };
    const filteredSamples: string[] = [];
    return {
      searchresultsCopy,
      resultSearchDialog: true,
      samplesFrozen,
      filteredSamples,
      loading: false,
      selected: [],
      selectedSample: '',
      samples,
      all: false,
      toSaveCounter: 0,
    };
  },
  computed: {
    ...mapState(useProjectStore, ['canSaveTreeInProject', 'isValidator']),
    ...mapState(useGrewSearchStore, ['canRewriteRule']),
    ...mapState(useUserStore, ['username']),
    projectName(): string {
      return this.$route.params.projectname as string;
    },
    sentenceCount() {
      return Object.keys(this.searchresults)
        .map((sa) => Object.keys(this.searchresults[sa]))
        .flat().length;
    },
    atLeastOneSelected() {
      return Object.values(this.samplesFrozen.selected).some((index) => index == true);
    },
    showFilterResults() {
      return this.samplesFrozen.list.length > 0 && !this.$route.params.samplename;
    },
    samplesNames() {
      return Object.keys(this.searchresults);
    },
    filteredResults() {
      if (!this.selectedSample) {
        return this.samplesFrozen.list;
      }
      return this.samplesFrozen.list.filter((value) => value[0] === this.selectedSample);
    },
  },
  watch: {
    'samplesFrozen.selected': {
      handler: function (newVal) {
        if (Object.values(newVal).some(element => element == false)) {
          this.all = false;
        }  
      },
      deep: true,
    }
  },
  mounted() {
    this.freezeSamples();
  },
  methods: {
    /**
     * Freeze the samples in order to speed up computation for onscroll loading view
     *
     * @returns void
     */
    freezeSamples() {
      const listIds = []; // list: [["WAZA_10_Bluetooth-Lifestory_MG","WAZA_10_Bluetooth-Lifestory_MG__86"],["WAZA_10_Bluetooth-Lifestory_MG","WAZA_10_Bluetooth-Lifestory_MG__79"], ...
      let index = 0;
      const index2Ids: { [key: number]: string[] } = {}; // object: {"0":["WAZA_10_Bluetooth-Lifestory_MG","WAZA_10_Bluetooth-Lifestory_MG__86"],"1":["WAZA_10_Bluetooth-Lifestory_MG","WAZA_10_Bluetooth-Lifestory_MG__79"], ...
      const selectedIndex: { [key: number]: boolean } = {};
      this.searchresultsCopy = this.searchresults;
      // this is sent to the sentenceCard: searchresults[item[0]][item[1]], items from this.samplesFrozen.list
      for (const sampleId of Object.keys(this.searchresults).sort()) {
        for (const sentId in this.searchresults[sampleId]) {
          listIds.push([sampleId, sentId]);
          index2Ids[index] = [sampleId, sentId];
          selectedIndex[index] = false;
          this.searchresultsCopy[sampleId][sentId].sample_name = sampleId;
          index += 1;
        }
      }
      Object.freeze(listIds);
      this.samplesFrozen = {
        list: listIds,
        indexes: index2Ids,
        selected: selectedIndex,
        samples: JSON.parse(JSON.stringify(this.samples)),
      };
    },

    filterSamples(val: string, update: (callback: () => void) => void) {
      if (val === '') {
        update(() => {
          this.filteredSamples = this.samplesNames;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.filteredSamples = this.samplesNames.filter((v) => v.toLowerCase().indexOf(needle) > -1);
      });
    },

    selectAllSentences() {
      for (const item in this.filteredResults) {
        this.all ? (this.samplesFrozen.selected[item] = true) : (this.samplesFrozen.selected[item] = false);
      }
    },

    applyRules() {
      this.preprocessResults();
      if (this.toSaveCounter >= 1) {
        const datasample = { data: this.searchresultsCopy };
        api.applyRule(this.$route.params.projectname as string, datasample).then(() => {
          this.resultSearchDialog = false;
          this.parentOnShowTable(this.resultSearchDialog);
          notifyMessage({ message: `Rule applied (user "${this.username}" rewrote and saved "${this.toSaveCounter}" at once)` });
          this.storeAppliedRule();
        });
      } else {
        notifyMessage({
          message: `Nothing to save (user "${this.username}" has "zero" tree matching rewriting pattern)`,
          type: 'warning',
        });
      }
    },

    preprocessResults() {
      let selectedResults = this.getSelectedResults();
      this.searchresultsCopy = selectedResults;
      for (const sample in selectedResults) {
        for (const sentId in selectedResults[sample]) {
          if (!this.isValidator || this.userType !== "validated") {
            let toSaveConll = ""
            if (selectedResults[sample][sentId].conlls[this.username]) {
              toSaveConll = selectedResults[sample][sentId].conlls[this.username]
            } else {
              toSaveConll = Object.values(selectedResults[sample][sentId].conlls)[0]
            }
            const sentenceJson = sentenceConllToJson(toSaveConll)
            sentenceJson.metaJson.user_id = this.username
            sentenceJson.metaJson.timestamp = Math.round(Date.now())
            this.searchresultsCopy[sample][sentId].conlls[this.username] = sentenceJsonToConll(sentenceJson)
          }
          for (const userId in this.searchresultsCopy[sample][sentId].conlls) {
            if (!this.isValidator || this.userType !== "validated") {
              if (userId !== this.username) delete this.searchresultsCopy[sample][sentId].conlls[userId]
            }
            this.toSaveCounter += 1;
          }
        }
      }
    },

    getSelectedResults() {
      let selectedResults: grewSearchResult_t = {};
      for (const item in this.samplesFrozen.selected) {
        if (this.samplesFrozen.selected[item] === true) {
          const sampleId = this.filteredResults[item][0];
          const sentId = this.filteredResults[item][1];
          if (!selectedResults[sampleId]) selectedResults[sampleId] = {};
          selectedResults[sampleId][sentId] = this.searchresults[sampleId][sentId];
        }
      }
      return selectedResults;
    },

    storeAppliedRule() {
      const savedRules = LocalStorage.getItem(this.projectName);
      if (savedRules == null) {
        const savedRule = {
          name: 'r1',
          query: this.query,
          results: this.toSaveCounter,
          date: new Date().toLocaleString('en-GB', { hour12: false }),
        }
        LocalStorage.set(this.projectName, [savedRule]);
      }
      else {
        
        const listRules = savedRules as any[];
        listRules.push({
          name: `r${listRules.length + 1}`,
          query: this.query,
          results: this.toSaveCounter,
          date: new Date().toLocaleString('en-GB', { hour12: false }),
        });
        LocalStorage.set(this.projectName, listRules);
      }
    }
  },
});
</script>

<style scoped>
.absolute-bottom {
  position: sticky;
  bottom: 0;
  z-index: 1;
  height: 40px;
}
</style>
