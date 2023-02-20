<template>
  <q-card style="max-width: 100vw">
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
    <div v-if="queryType === 'REWRITE' && samplesFrozen.list.length > 0 && (isGuest || isAdmin || isSuperAdmin)"
         class="q-pa-md">
      <q-btn color="primary" label="Apply rules" @click="applyRules"/>
    </div>
    <q-card-section>
      <div v-show="!loading" class="q-pa-md row q-gutter-md">
        <div v-if="samplesFrozen.list.length > 0">
          <q-virtual-scroll
              :items="samplesFrozen.list"
              style="height: 80vh; width: 100vw"
              :virtual-scroll-slice-size="5"
              :virtual-scroll-item-size="200"
              type="list"
          >
            <template #default="{ item, index }">
              <SentenceCard
                  :id="item[1]"
                  :key="index"
                  :sentence="searchresults[item[0]][item[1]]"
                  :index="index"
                  :sentence-id="item[1]"
                  :matches="searchresults[item[0]][item[1]]"
                  :exercise-level="4"
              ></SentenceCard>
            </template>
          </q-virtual-scroll>
        </div>
      </div>
      <div v-show="loading" class="q-pa-md row justify-center">
        <div class="col">
          <q-circular-progress indeterminate size="70px" :thickness="0.22" color="primary"
                               :track-color="$q.dark.isActive ? 'grey' : 'grey-3'"/>
        </div>
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
    };
  },
  computed: {
    ...mapState(useProjectStore, ['isGuest', 'isAdmin']),
    ...mapState(useUserStore, ['isSuperAdmin', 'username']),
    sentenceCount() {
      return Object.keys(this.searchresults)
          .map((sa) => Object.keys(this.searchresults[sa]))
          .flat().length;
      // number of keys in subobjects
    },
  },
  mounted() {
    this.freezeSamples();
    // this.getProjectConfig();
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
      for (const sampleId in this.searchresults) {
        for (const sentId in this.searchresults[sampleId]) {
          listIds.push([sampleId, sentId]);
          index2Ids[index] = [sampleId, sentId];
          selectedIndex[index] = true;
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
    /**
     * Save the graph to backend after modifying its metadata and changing it into an object
     *
     * @returns void
     */
    applyRules() {
      let sentenceJson;
      let conll;
      let toSaveCounter = 0;
      this.searchresultsCopy = this.searchresults;
      for (const sample in this.searchresults) {
        for (const sentId in this.searchresults[sample]) {
          if (!this.searchresults[sample][sentId].conlls[this.username]) {

            sentenceJson = sentenceConllToJson(Object.values(this.searchresults[sample][sentId].conlls)[0])
            sentenceJson.metaJson.user_id = this.username
            sentenceJson.metaJson.timestamp = Math.round(Date.now())
            conll = sentenceJsonToConll(sentenceJson)
            this.searchresultsCopy[sample][sentId].conlls[this.username] = conll
            for (const userId in this.searchresultsCopy[sample][sentId].conlls) {
              if (userId !== this.username) delete this.searchresultsCopy[sample][sentId].conlls[userId]
            }
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
