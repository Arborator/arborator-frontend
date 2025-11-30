<template>
  <GrewRequestCard :parentOnSearch="onSearch" :parentOnTryRules="onTryRules" :samples="samples" />
  <q-dialog v-model="resultSearchDialog" maximized transition-show="fade" transition-hide="fade">
    <ResultView 
      :searchResults="resultSearch" 
      :query-type="queryType" 
      :query="query" 
      :userType="userType" 
      :treeLabel="treeLabel"
      :availableSaveAs="availableSaveAs"
      @reload-results="reloadResults" 
      @closed="closeDialog"
      />
  </q-dialog>
</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia';
import { grewSearchResult_t, sample_t } from 'src/api/backend-types';
import { useGrewHistoryStore } from 'src/pinia/modules/grewHistory';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { notifyError } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

import api from '../../api/backend-api';
import GrewRequestCard from './GrewRequestCard.vue';
import ResultView from './ResultView.vue';

export default defineComponent({
  components: {
    GrewRequestCard,
    ResultView,
  },
  emits: ['reload'],
  props: {
    sentenceCount: {
      type: Number as PropType<number>,
    },
    searchScope: {
      type: String as PropType<string>,
    },
    samples: {
      type: Object as PropType<sample_t[]>,
      required: true,
    },
  },
  data() {
    const result: {
      resultSearchDialog: boolean;
      resultSearch: grewSearchResult_t;
      queryType: string;
      query: string;
      userType: string;
      treeLabel: string;
      availableSaveAs: string[];
    } = {
      resultSearchDialog: false,
      resultSearch: {},
      queryType: '',
      query: '',
      userType: '',
      treeLabel: '',
      availableSaveAs: ["toto"],
    };
    return result;
  },
  computed: {
    ...mapState(useProjectStore, ['name', 'isValidator', 'blindAnnotationMode']),
    ...mapState(useUserStore, ['isLoggedIn', 'username']),
  },
  methods: {
    ...mapActions(useGrewHistoryStore, ['saveHistory']),
    onSearch(searchPattern: string, treeType: string, treeLabel: string, otherUser: string, selectedSamples: string[]) {
      const data = { pattern: searchPattern, userType: treeType, sampleIds: selectedSamples, otherUser: otherUser };
      this.queryType = 'SEARCH';
      this.userType = treeType;
      this.treeLabel = treeLabel;
      console.log(this.treeLabel)
      api
        .searchRequest(this.name, data)
        .then((response) => {
          this.resultSearch = response.data;
          if (this.isLoggedIn) this.saveSearchRequest(searchPattern);
          this.resultSearchDialog = true;
        })
        .catch((error) => {
          notifyError({ error, caller: 'onSearch' });
        });
    },
    onTryRules(query: string, userType: string, treeLabel: string, otherUser: string, selectedSamples: string[]) {
      const data = { query: query, userType: userType, sampleIds: selectedSamples, otherUser: otherUser };
      this.queryType = 'REWRITE';
      this.query = query;
      this.userType = userType;
      this.treeLabel = treeLabel;

      this.availableSaveAs = [];
      if (this.isValidator) {
        this.availableSaveAs.push("validated");
        if (this.blindAnnotationMode) {
          this.availableSaveAs.push("base_tree");
        }
      }
      if (!this.blindAnnotationMode) {
        this.availableSaveAs.push(this.username)
      }

      api
        .tryPackage(this.name, data)
        .then((response) => {
          this.resultSearchDialog = true;
          this.resultSearch = response.data;
        })
        .catch((error) => {
          notifyError({ error, caller: 'onTryRules' });

        });
    },
    closeDialog() {
      this.resultSearchDialog = false;
      this.$emit('reload');
    },
    reloadResults() {
     
    },
    saveSearchRequest(query: string) {
      const historyRecord = {
        type: 'search',
        request: query,
      };
      this.saveHistory(historyRecord);
    },
  },
});
</script>
