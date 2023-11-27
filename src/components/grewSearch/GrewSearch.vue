<template>
  <q-page-sticky :position="breakpoint ? 'bottom-right' : 'bottom-right'" :offset="breakpoint ? [18, 18] : [30, 80]"
    style="z-index: 999">
    <q-btn size="20px" round color="primary" icon="img:/svg/g.svg" @click="grewDialog = !grewDialog">
      <q-tooltip anchor="center left" content-class="bg-primary" content-style="font-size: 16px"> {{
        $t('projectView.tooltipFabGrew') }} </q-tooltip>
    </q-btn>
  </q-page-sticky>
  <q-dialog v-model="grewDialog" seamless position="right" full-width>
    <GrewRequestCard 
      :parentOnSearch="onSearch" 
      :parentOnTryRules="onTryRules" 
      :trees-from="treesFrom"
    ></GrewRequestCard>
  </q-dialog>
  <q-dialog v-model="resultSearchDialog" maximized transition-show="fade" transition-hide="fade">
    <ResultView 
      :searchresults="resultSearch" 
      :totalsents="sentenceCount" 
      :searchscope="searchScope"
      :parentOnShowTable="onShowTable" 
      :query-type="queryType" 
      :userType="userType"
    ></ResultView>
  </q-dialog>
</template>

<script lang="ts">
import GrewRequestCard from './GrewRequestCard.vue';
import ResultView from '../ResultView.vue';
import api from '../../api/backend-api';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { mapWritableState, mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { notifyError } from 'src/utils/notify';
import { defineComponent, PropType } from 'vue';
import { grewSearchResult_t } from 'src/api/backend-types';

export default defineComponent({
  components: {
    GrewRequestCard,
    ResultView,
  },
  emits: ['reload'],
  props: {
    sentenceCount: {
      type: Number as PropType<number>,
      required: true,
    },
    sampleNames: {
      type: Object as PropType<string[]>,
      default: [],
    },
    treesFrom: {
      type: Object as PropType<string[]>,
      required: true,
    },
    searchScope: {
      type: String as PropType<string>,
      required: true,
    },
  },
  data() {
    const result: {
      resultSearchDialog: boolean,
      resultSearch: grewSearchResult_t,
      queryType: string,
      userType: string,
      window: { width: number; height: number },
    } = {
      resultSearchDialog: false,
      resultSearch: {},
      queryType: "",
      userType: "",
      window: { width: 0, height: 0 },
    };
    return result;
  },
  computed: {
    breakpoint() {
      return this.window.width <= 400;
    },
    ...mapWritableState(useGrewSearchStore, ['grewDialog']),
    ...mapState(useUserStore, ['username']),
  },
  methods: {
    onShowTable(resultSearchDialog: any) {
      this.resultSearchDialog = resultSearchDialog;
      this.grewDialog = false;
      if (this.queryType == 'REWRITE') this.$emit('reload');
    },
    onSearch(searchPattern: string, userType: string, otherUser: string) {
      const data = { pattern: searchPattern, userType: userType, sampleIds: this.sampleNames, otherUser: otherUser };
      this.queryType = 'SEARCH';
      this.userType = userType;
      api
        .searchRequest(this.$route.params.projectname as string, data)
        .then((response) => {
          this.resultSearch = response.data;
          this.resultSearchDialog = true;
        })
        .catch((error) => {
          notifyError({ error });
        });

    },
    onTryRules(query: string, userType: string, otherUser: string) {
      const data = { query: query, userType: userType, sampleIds: this.sampleNames, otherUser: otherUser };
      this.queryType = 'REWRITE';
      this.userType = userType;
      api
        .tryPackage(this.$route.params.projectname as string, data)
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
  },
});
</script>

<style></style>
