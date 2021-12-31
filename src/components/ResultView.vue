<template>
  <q-card style="max-width: 100vw">
    <q-bar class="bg-primary text-white">
      <q-icon name="img:/svg/grew.svg" size="7rem" />
      <q-space />
      <div class="text-weight-bold">
        {{ sentenceCount }} <span v-if="sentenceCount === 1">result</span><span v-else>results</span> (of the {{ totalsents }}
        <span v-if="totalsents === 1">sentence</span><span v-else>sentences</span> in the {{ searchscope }})
      </div>
      <q-space />
      <q-btn flat dense icon="close" v-close-popup />
    </q-bar>
    <!-- <q-bar class="bg-primary text-white">
        <q-space />
        <div class="text-weight-bold">Results</div>
        <q-space />
        <q-btn flat dense icon="close" v-close-popup/>
        </q-bar> -->
    <q-card-section>
      <div v-show="!loading" class="q-pa-md row q-gutter-md">
        <q-virtual-scroll
          :items="this.samplesFrozen.list"
          style="height: 80vh; width: 90vw"
          :virtual-scroll-slice-size="5"
          :virtual-scroll-item-size="200"
          type="table"
        >
          <template v-slot="{ item, index }">
            <tr :key="index">
              <td>
                <q-toggle v-model="samplesFrozen.selected[index]" checked-icon="check" unchecked-icon="clear" />
              </td>
              <td>
                <sentence-card
                  :key="index"
                  :id="item[1]"
                  :sentence="searchresults[item[0]][item[1]]"
                  :index="index"
                  :sentenceId="item[1]"
                  searchResult="searchResult"
                ></sentence-card>
              </td>
            </tr>
          </template>
        </q-virtual-scroll>
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

<script>
import api from '../api/backend-api';
import SentenceCard from './sentence/SentenceCard';

export default {
  components: { SentenceCard },
  props: ['searchresults', 'totalsents', 'searchscope', 'parentOnShowTable'],

  data() {
    return {
      resultSearchDialog: true,
      samplesFrozen: { list: [], indexes: {}, samples: [] },
      loading: false,
      inResult: true,
      selected: [],
    };
  },
  computed: {
    sentenceCount() {
      return Object.keys(this.searchresults)
        .map((sa) => Object.keys(this.searchresults[sa]))
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
      const index2Ids = {}; // object: {"0":["WAZA_10_Bluetooth-Lifestory_MG","WAZA_10_Bluetooth-Lifestory_MG__86"],"1":["WAZA_10_Bluetooth-Lifestory_MG","WAZA_10_Bluetooth-Lifestory_MG__79"], ...
      const selectedIndex = {};
      // this is sent to the sentenceCard: searchresults[item[0]][item[1]], items from this.samplesFrozen.list
      for (const sampleId in this.searchresults) {
        for (const sentId in this.searchresults[sampleId]) {
          listIds.push([sampleId, sentId]);
          index2Ids[index] = [sampleId, sentId];
          selectedIndex[index] = true;
          this.searchresults[sampleId][sentId].sample_name = sampleId;
          index += 1;
        }
      }
      // heavyList = listIds;
      Object.freeze(listIds);
      this.samplesFrozen = {
        list: listIds,
        indexes: index2Ids,
        selected: selectedIndex,
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
      const changedConllUser = this.$store.getters['user/getUserInfos'].username;
      const sentenceIds = [];
      const objLength = Object.keys(this.samplesFrozen.selected).length;
      for (let i = 0; i < objLength; i += 1) {
        if (this.samplesFrozen.selected[i] === true) sentenceIds.push(this.samplesFrozen.list[i][1]);
      }
      for (const samplename in this.searchresults) {
        for (const sentId in this.searchresults[samplename]) {
          if (sentenceIds.includes(sentId) === false) {
            console.log(sentId);
            delete this.searchresults[samplename][sentId];
          }
        }
        if (Object.keys(this.searchresults[samplename]).length === 0) {
          delete this.searchresults[samplename];
        }
      }
      if (Object.keys(this.searchresults) !== 0) {
        const datasample = { data: this.searchresults };
        api.saveConll(this.$route.params.projectname, datasample).then((response) => {
          this.resultSearchDialog = false;
          this.parentOnShowTable(this.resultSearchDialog);
          this.$q.notify({ message: 'Conll Saved' });
        });
      } else {
        console.log('not ok');
      }
      // console.log(this.searchresults["ABJ_GWA_06_Ugo-Lifestory_MG"]["conlls"])
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
      api.getProjectSamples(this.$route.params.projectname).then((response) => {
        this.samples = response.data;
      });
    },
    deleteSamples() {
      for (const sample of this.table.selected) {
        api
          .deleteSample(this.$route.params.projectname, sample.sample_name)
          .then((response) => {
            this.table.selected = [];
            this.showNotif('top-right', 'deletesuccess');
            this.getProjectSamples();
          })
          .catch((error) => {
            this.$store.dispatch('notifyError', { error });
          });
      }
    },
  },
};
</script>
