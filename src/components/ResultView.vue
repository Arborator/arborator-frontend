<template>
  <q-card style="max-width: 100vw">
    <q-bar class="bg-primary text-white">
      <q-icon name="img:/svg/grew.svg" size="7rem" />
      <q-space />
      <div class="text-weight-bold">
        {{ sentenceCount }} <span v-if="sentenceCount === 1">result</span><span v-else>results</span> (of the {{ totalsents }}
        <span v-if="totalsents === 1">sentence</span><span v-else>occurrences</span> in the {{ searchscope }})
      </div>
      <q-space />
      <q-btn v-close-popup flat dense icon="close" />
    </q-bar>
    <div v-if="queryType ==='REWRITE'  && (samplesFrozen.list.length > 0) && (isGuest || isAdmin || isSuperAdmin)" class="q-pa-md" >
      <q-btn color="primary" label="Apply rules" @click="save"/>
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
          <q-circular-progress indeterminate size="70px" :thickness="0.22" color="primary" :track-color="$q.dark.isActive ? 'grey' : 'grey-3'" />
        </div>
      </div>
    </q-card-section>
    <!-- <q-card-section>
      <q-btn color="primary" @click="save" label="Save conll" no-caps />
    </q-card-section> -->
  </q-card>
</template>

<script lang="ts">
import api from '../api/backend-api';
import SentenceCard from './sentence/SentenceCard.vue';
import { useUserStore } from 'src/pinia/modules/user';
import { useProjectStore } from 'src/pinia/modules/project';
import { mapState } from 'pinia'; 
import { PropType, defineComponent } from 'vue';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { grewSearchResult_t, sample_t } from 'src/api/backend-types';

export default defineComponent({
  components: { SentenceCard },
  // props: ['searchresults', 'totalsents', 'searchscope', 'parentOnShowTable'],
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
    queryType:{
      type:String,

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
    ...mapState(useProjectStore,  ['isGuest','isAdmin']),
    ...mapState(useUserStore,['isSuperAdmin']),
    sentenceCount() {
      return Object.keys(this.searchresults)
        .map((sa) => this.searchresults[sa])
        .flat().length; // number of keys in subobjects
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
      // console.log('samples to freeze', JSON.stringify(this.searchresults) );
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
      // heavyList = listIds;
      Object.freeze(listIds);
      this.samplesFrozen = {
        list: listIds,
        indexes: index2Ids,
        selected: selectedIndex,
        samples: JSON.parse(JSON.stringify(this.samples)),
      };
      // console.log(this.samplesFrozen)
    },
    /**
     * Requests project configuration from backend and put it into the store
     *
     * @returns void
     * removed by kirian 2020_08_04 22h59
     */
    // getProjectConfig(){
    //     api.getProjectSettings(this.$route.params.projectname)
    //     .then(response => {
    //         this.$store.commit('config/set_project_config', response.data);
    //     })
    //     .catch(error => {
    //         this.$store.dispatch("notifyError", {error: error});
    //     });
    // },
    /**
     * Save the graph to backend after modifying its metadata and changing it into an object
     *
     * @returns void
     */
    save() {
      const sentenceIds: string[] = [];
      for ( const index of Object.keys(this.samplesFrozen.selected)){
         if (this.samplesFrozen.selected[parseInt(index)]) sentenceIds.push(this.samplesFrozen.list[parseInt(index)][1]);
      }
      for (const samplename in this.searchresultsCopy) {
        for (const sentId in this.searchresultsCopy[samplename]) {
          if (!sentenceIds.includes(sentId)) {
            console.log(sentId);
            delete this.searchresultsCopy[samplename][sentId];
          }
        }
        if (Object.keys(this.searchresultsCopy[samplename]).length === 0) {
          delete this.searchresultsCopy[samplename];
        }
      }
      if (Object.keys(this.searchresultsCopy).length !== 0) {
        const datasample = { data: this.searchresultsCopy };
        api
        .saveConll(this.$route.params.projectname as string, datasample)
        .then(() => {
          this.resultSearchDialog = false;
          this.parentOnShowTable(this.resultSearchDialog);
          notifyMessage({ message: 'Conll Saved' });
        });
      } 
      else {
        console.log('not ok');
      }
    },
    // var query = { results: this.searchresults, sentenceIds: sentenceIds };
    // api
    //   .applyRulesProject(this.$route.params.projectname, query)
    //   .then((response) => {
    //     // this.resultSearchDialog = true;
    //     // this.resultSearch = response.data;
    //     console.log(response.data)
    //   })
    //   .catch((error) => {
    //     this.$store.dispatch("notifyError", {
    //       error: error.response.data.message,
    //     });
    //   });
    getProjectSamples() {
      api.getProjectSamples(this.$route.params.projectname as string).then((response) => {
        this.samples = response.data;
      });
    },
    deleteSamples() {
      for (const sample of this.samplesFrozen.samples) {
        api
          .deleteSample(this.$route.params.projectname as string, sample.sample_name)
          .then(() => {
            this.samplesFrozen.selected = [];
            notifyMessage({ message: 'delete success' });
            this.getProjectSamples();
          })
          .catch((error) => {
            notifyError({ error });
          });
      }
    },
  },
});
</script>
