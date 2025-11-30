<template>
  <div style="min-width: 99vw; min-height: 50vh" class="custom-frame2">
    <q-bar class="bg-primary text-white sticky-bar">
      <q-icon name="img:/svg/grew.svg" size="7rem" />
      <q-space />
      <div class="text-weight-bold">{{ occurrencesCount }} </div>
      <q-space />
      <q-btn flat dense icon="close" @click="closeDial()" />
    </q-bar>
    <div class="q-pa-md row q-gutter-md custom-frame1 justify-end">
      <q-btn class="col-2" outline :disable="pendingModifications.size === 0" color="primary" label="Save pending trees" @click="saveAllTrees()">
        <q-badge v-if="pendingModifications.size > 0" color="red" floating>
          {{ pendingModifications.size }}
        </q-badge>
      </q-btn>
      <q-btn class="col-2" color="primary" label="Export results" @click="exportResults()" />
    </div>
    <div>
      <template v-if="samplesFrozen.list.length > 0">
        <q-virtual-scroll
          :key="samplesFrozen.list.length"
          :items="samplesFrozen.list"
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
                :sentence="searchResults[item[0]][item[1]]"
                :index="index"
                :matches="searchResults[item[0]][item[1]]"
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
        <q-checkbox v-model="all" @click="selectAllSentences()">
          <q-tooltip>{{ $t('grewSearch.selectAllTooltip') }}</q-tooltip>
        </q-checkbox>
      </div>

      <div v-for="user in availableSaveAs">
        <q-btn 
          :disable="!atLeastOneSelected"
          :label="$t('grewSearch.applyRuleAs', [user])" 
          color="primary"
          @click="applyRules(user)">
          <q-tooltip v-if="!atLeastOneSelected">{{ $t('grewSearch.applyRuleTooltip') }}</q-tooltip>
        </q-btn>
      </div>
      <div>
        {{ treeLabel }}
      </div>
    </q-bar>
  </div>
</template>

<script lang="ts">
import { sentenceConllToJson, sentenceJsonToConll, emptySentenceJson } from 'conllup/lib/conll';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { grewSearchResult_t, sample_t } from 'src/api/backend-types';
import { useGithubStore } from 'src/pinia/modules/github';
import { useGrewHistoryStore } from 'src/pinia/modules/grewHistory';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { useTreesStore } from 'src/pinia/modules/trees';
import { notifyMessage, notifyError } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

import api from '../../api/backend-api';
import SentenceCard from '../sentence/SentenceCard.vue';

export default defineComponent({
  components: { SentenceCard },
  props: {
    searchResults: {
      type: Object as PropType<grewSearchResult_t>,
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
    treeLabel: {
      type: String as PropType<string>,
      required: false,
    },
    availableSaveAs: {
      type: Array as PropType<string[]>,
      required: false,
    },
  },

  data() {
    const searchResultsCopy: grewSearchResult_t = {};
    const samples: sample_t[] = [];
    const samplesFrozen: {
      list: string[][];
      indexes: { [key: number]: string[] };
      samples: sample_t[];
      selected: { [key: number]: boolean };
    } = { list: [], indexes: {}, samples: [], selected: {} };
    const filteredSamples: string[] = [];
    return {
      searchResultsCopy,
      samplesFrozen,
      filteredSamples,
      loading: false,
      selected: [],
      selectedSample: '',
      samples,
      all: false,
      toSaveCounter: 0,
      users: new Set(),
    };
  },
  computed: {
    ...mapState(useProjectStore, ['name', 'canSaveTreeInProject', 'isValidator']),
    ...mapState(useGrewSearchStore, ['canRewriteRule']),
    ...mapState(useUserStore, ['username', 'isLoggedIn']),
    ...mapState(useTreesStore, ['pendingModifications']),
    ...mapWritableState(useGithubStore, ['reloadCommits']),
    projectName(): string {
      return this.$route.params.projectname as string;
    },
    occurrencesCount() {
      const users = new Set(); // set of users (to report how many ≠ users)
      let nb_occ = 0;
      let nb_sent = 0;
      for (let sample_id in this.searchResults) { 
        for (let sent_id in this.searchResults[sample_id]) {
          nb_sent += 1;
          let sent_data = this.searchResults[sample_id][sent_id];
          if ("matches" in sent_data) {
            for (let user_id in sent_data["matches"]) {
              users.add (user_id);
              nb_occ += sent_data["matches"][user_id].length
            }
          }
        }
      }
      const nb_user = users.size
      return `${nb_occ} occurence${nb_occ > 1 ? "s" : ""} in ${nb_sent} sentence${nb_sent > 1 ? "s" : ""} (for ${nb_user} user${nb_user > 1 ? "s" : ""})`
    },
    atLeastOneSelected() {
      return Object.values(this.samplesFrozen.selected).some((index) => index);
    },
    samplesNames() {
      return Object.keys(this.searchResults);
    },
  },
  watch: {
    'samplesFrozen.selected': {
      handler: function (newVal) {
        if (Object.values(newVal).some((element) => !element)) {
          this.all = false;
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.freezeSamples();
  },
  methods: {
    ...mapActions(useGrewHistoryStore, ['saveHistory']),
    ...mapActions(useTreesStore, ['emptyPendingModification']),
    freezeSamples() {
      const listIds = []; // list: [["WAZA_10_Bluetooth-Lifestory_MG","WAZA_10_Bluetooth-Lifestory_MG__86"],["WAZA_10_Bluetooth-Lifestory_MG","WAZA_10_Bluetooth-Lifestory_MG__79"], ...
      let index = 0;
      const index2Ids: { [key: number]: string[] } = {}; // object: {"0":["WAZA_10_Bluetooth-Lifestory_MG","WAZA_10_Bluetooth-Lifestory_MG__86"],"1":["WAZA_10_Bluetooth-Lifestory_MG","WAZA_10_Bluetooth-Lifestory_MG__79"], ...
      const selectedIndex: { [key: number]: boolean } = {};
      this.searchResultsCopy = this.searchResults;
      // this is sent to the sentenceCard: searchresults[item[0]][item[1]], items from this.samplesFrozen.list
      for (const sampleId of Object.keys(this.searchResults).sort()) {
        for (const sentId in this.searchResults[sampleId]) {
          listIds.push([sampleId, sentId]);
          index2Ids[index] = [sampleId, sentId];
          selectedIndex[index] = false;
          this.searchResultsCopy[sampleId][sentId].sample_name = sampleId;
          index += 1;
          for (const user in this.searchResults[sampleId][sentId].conlls) {
            this.users.add(user);
          }
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
      for (const item in this.samplesFrozen.list) {
        this.samplesFrozen.selected[item] = this.all;
      }
    },

    applyRules(saveAs: string) {
      let selectedResults: grewSearchResult_t = {};
      for (const item in this.samplesFrozen.selected) {
        if (this.samplesFrozen.selected[item]) {
          this.toSaveCounter += 1;
          const sampleId = this.samplesFrozen.list[item][0];
          const sentId = this.samplesFrozen.list[item][1];
          let grewSearchResultSentence = this.searchResults[sampleId][sentId]
          if (Object.keys(grewSearchResultSentence.conlls).length !== 1) { alert ("Please report: Not singleton user") } // assertion
          // 1 item for loop!
          let sentenceJson = emptySentenceJson()
          for (let userId in grewSearchResultSentence.conlls) {
            sentenceJson = sentenceConllToJson(grewSearchResultSentence.conlls[userId]);
            sentenceJson.metaJson.user_id = saveAs;
            sentenceJson.metaJson.timestamp = Math.round(Date.now());
          }
          grewSearchResultSentence["conlls"] = { saveAs: sentenceJsonToConll(sentenceJson)}
          if (!selectedResults[sampleId]) selectedResults[sampleId] = {};
          selectedResults[sampleId][sentId] = grewSearchResultSentence
        }
      }
      const datasample = { data: selectedResults };
      api.applyRule(this.projectName, datasample).then(() => {
        this.reloadCommits += 1;
        if (this.isLoggedIn) this.saveAppliedRule();
        notifyMessage({ message: `Rule applied (user "${saveAs}" rewrote and saved "${this.toSaveCounter}" at once)` });
        this.$emit('closed');
      });
    },

    exportResults() {
      const data = { searchResults: this.searchResults, users: [...this.users] };
      api
        .exportGrewResults(this.name, data)
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `dump_${this.projectName}.zip`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          notifyMessage({ message: 'Grew results are exported' });
        })
        .catch((error) => {
          notifyError({ error, caller: 'exportResults' });
        })
    },

    saveAppliedRule() {
      const historyRecord = {
        type: 'rewrite',
        request: this.query,
        modifiedSentences: this.toSaveCounter,
      };
      this.saveHistory(historyRecord);
    },

    saveAllTrees() {
      const groupedConlls = [...this.pendingModifications.values()].reduce((groupedConlls, sentence) => {
        const group = (groupedConlls[sentence.sampleName] || []);
        group.push(sentence.conll)
        groupedConlls[sentence.sampleName] = group
        return groupedConlls;
      }, {});
      for (const [sampleName, conlls] of Object.entries(groupedConlls)) {
        const data = { conllGraph: (conlls as string[]).join('\n\n') };
        api
          .saveAllTrees(this.name, sampleName, data)
          .then(() => {
            notifyMessage({ position: 'top', message: 'Saved on the server', icon: 'save' });
            this.emptyPendingModification();
            this.$emit('reload-results');
          })
          .catch((error) => {
            notifyError({ error, caller: 'saveAllTrees' });
          });
      }
    },

    closeDial() {
      if (this.pendingModifications.size > 0) {
        this.$q.notify({
          message: `You have ${this.pendingModifications.size} changes non saved, don't forget to save them!`,
          position: 'top',
          color: 'warning',
          timeout: 5000,
          closeBtn: 'X',
          actions: [
            {
              label: 'Save All',
              handler: () => {
                this.saveAllTrees();
                this.$emit('closed')
              },
            },
            {
              label: 'Dismiss',
              handler: () => {
                this.emptyPendingModification();
                this.$emit('closed');
              },
            },
          ],
        });
      }
      else {
        this.$emit('closed');
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
