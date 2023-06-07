<template>
  <q-card style="min-width: 100vw">
    <q-bar class="bg-primary text-white">
      <q-icon name="img:/svg/grew.svg" size="7rem"/>
      <q-space/>
      <div class="text-weight-bold">
        {{ sentenceCount }} <span v-if="sentenceCount === 1">result</span><span v-else>results</span> of the
        {{ totalsents }}
        <span v-if="totalsents === 1">sentence</span><span v-else>sentences</span> in the {{ searchscope }}
      </div>
      <q-space/>
      <q-btn v-close-popup flat dense icon="close"/>
    </q-bar>
    <div v-if="queryType === 'REWRITE' && samplesFrozen.list.length > 0 && canSaveTreeInProject"
         class="row q-pa-md">
      <div>
        <q-btn :disable="!atLeastOneSelected" color="primary" :label="$t('grewSearch.applyRule')" @click="applyRules" />
        <q-tooltip v-if="!atLeastOneSelected">{{ $t('grewSearch.applyRuleTooltip') }}</q-tooltip>
      </div>
    </div>
    <q-card-section>
      <div v-if="samplesFrozen.list.length > 0">
        <div class="q-pa-md">
          <q-checkbox v-if="queryType === 'REWRITE'" v-model="all" @click="selectAllSentences()">
            <q-tooltip>{{ $t('grewSearch.selectAllTooltip') }}</q-tooltip>
          </q-checkbox>
          <q-separator />
        </div>
        <q-virtual-scroll
          :items="samplesFrozen.list"
          style="height: 80vh; width: 100vw"
          :virtual-scroll-slice-size="5"
          v-slot="{ item, index }"
        >
          <q-item :key="index">
            <q-item-section side top v-if="queryType === 'REWRITE'">
              <q-checkbox v-model="samplesFrozen.selected[index]" ></q-checkbox>
            </q-item-section>
            <q-separator dark vertical inset />
            <q-item-section>
              <SentenceCard
                :id="item[1]"
                :key="index"
                :sentence="searchresults[item[0]][item[1]]"
                :index="index"
                :sentence-id="item[1]"
                :matches="searchresults[item[0]][item[1]]"
                :exercise-level="4"
              ></SentenceCard>
            </q-item-section>
          </q-item>
        </q-virtual-scroll>
      </div>
    </q-card-section>
  </q-card>
</template>


<script lang="ts">
import api from '../api/backend-api';
import SentenceCard from './sentence/SentenceCard.vue';
import {useUserStore} from 'src/pinia/modules/user';
import {useProjectStore} from 'src/pinia/modules/project';
import {mapState} from 'pinia';
import {PropType, defineComponent} from 'vue';
import {notifyMessage} from 'src/utils/notify';
import {grewSearchResult_t, sample_t} from 'src/api/backend-types';
import {sentenceConllToJson, sentenceJsonToConll} from "conllup/lib/conll";

export default defineComponent({
  components: {SentenceCard},
  props: {
    searchresults: {
      type: Object as PropType<grewSearchResult_t>,
      required: true,
    },
    totalsents: {
      type: Number,
      required: true,
    },
    searchscope: {
      type: String,
      required: true,
    },
    queryType: {
      type: String,
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
    } = {list: [], indexes: {}, samples: [], selected: {}};

    return {
      searchresultsCopy,
      resultSearchDialog: true,
      samplesFrozen,
      loading: false,
      inResult: true,
      selected: [],
      samples,
      all: false,
    };
  },
  computed: {
    ...mapState(useProjectStore, ['isGuest', 'isAdmin', 'canSaveTreeInProject']),
    ...mapState(useUserStore, ['isSuperAdmin', 'username']),
    sentenceCount() {
      return Object.keys(this.searchresults)
        .map((sa) => Object.keys(this.searchresults[sa]))
        .flat().length;
    },
    atLeastOneSelected() {
      return Object.values(this.samplesFrozen.selected).some((index) => index == true );
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
    
    selectAllSentences() {
      for(const item in this.samplesFrozen.selected){
        this.all ? this.samplesFrozen.selected[item] = true : this.samplesFrozen.selected[item] = false;
      }
    },

    getSelectedResults() {
      let selectedResults: grewSearchResult_t = {};
      for(const item in this.samplesFrozen.selected){
        if (this.samplesFrozen.selected[item] === true){
          const sampleId = this.samplesFrozen.indexes[item][0];
          const sentId = this.samplesFrozen.indexes[item][1];
          if (!selectedResults[sampleId])  selectedResults[sampleId] = {};
          selectedResults[sampleId][sentId] = this.searchresults[sampleId][sentId];
        }  
      }
      return selectedResults; 
      
    },
    applyRules() {
      let toSaveCounter = 0;
      let selectedResults = this.getSelectedResults();
      this.searchresultsCopy = selectedResults;
      for (const sample in selectedResults) {
        for (const sentId in selectedResults[sample]) {
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
          for (const userId in this.searchresultsCopy[sample][sentId].conlls) {
            if (userId !== this.username) delete this.searchresultsCopy[sample][sentId].conlls[userId]
            toSaveCounter += 1;
          }
        }
      }
     if (toSaveCounter >= 1) {
        const datasample = {data: this.searchresultsCopy};
        api
          .applyRule(this.$route.params.projectname as string, datasample)
          .then(() => {
            this.resultSearchDialog = false;
            this.parentOnShowTable(this.resultSearchDialog);
            notifyMessage({message: `Rule applied (user "${this.username}" rewrote and saved "${toSaveCounter}" at once)`});
          });
      } else {
        notifyMessage({
          message: `Nothing to save (user "${this.username}" has "zero" tree matching rewriting pattern)`,
          type: "warning"
        });
      }
    },
  },
});
</script>
