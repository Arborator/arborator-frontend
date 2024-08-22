<template>
  <GrewRequestCard :parentOnSearch="onSearch" :parentOnTryRules="onTryRules" :samples="samples" />
  <q-dialog v-model="resultSearchDialog" maximized transition-show="fade" transition-hide="fade">
    <ResultView 
      :searchResults="resultSearch" 
      :query-type="queryType" 
      :query="query" 
      :userType="userType" 
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
    } = {
      resultSearchDialog: false,
      resultSearch: {},
      queryType: '',
      query: '',
      userType: '',
    };
    return result;
  },
  computed: {
    ...mapState(useProjectStore, ['name']),
  },
  methods: {
    ...mapActions(useGrewHistoryStore, ['saveHistory']),
    onSearch(searchPattern: string, treeType: string, otherUser: string, selectedSamples: string[]) {
      const data = { pattern: searchPattern, userType: treeType, sampleIds: selectedSamples, otherUser: otherUser };
      this.queryType = 'SEARCH';
      this.userType = treeType;
      api
        .searchRequest(this.name, data)
        .then((response) => {
          this.resultSearch = response.data;
          this.saveSearchRequest(searchPattern);
          this.resultSearchDialog = true;
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
    onTryRules(query: string, userType: string, otherUser: string, selectedSamples: string[]) {
      const data = { query: query, userType: userType, sampleIds: selectedSamples, otherUser: otherUser };
      this.queryType = 'REWRITE';
      this.query = query;
      this.userType = userType;
      api
        .tryPackage(this.name, data)
        .then((response) => {
          this.resultSearchDialog = true;
          this.resultSearch = response.data;
        })
        .catch((error) => {
          notifyError({
            error: error.response.data.message,
          });
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
