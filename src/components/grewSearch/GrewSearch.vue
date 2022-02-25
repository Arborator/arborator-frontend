<template>
  <div>
    <q-page-sticky :position="breakpoint ? 'bottom-right' : 'bottom-right'" :offset="breakpoint ? [18, 18] : [30, 80]" style="z-index: 999">
      <q-btn size="20px" round color="primary" icon="img:/svg/g.svg" @click="grewDialog = !grewDialog">
        <q-tooltip content-class="bg-primary" content-style="font-size: 16px"> Search with Grew in this sample </q-tooltip>
      </q-btn>
    </q-page-sticky>
    <q-dialog v-model="grewDialog" seamless position="right" full-width>
      <GrewRequestCard :parent-on-search="onSearch" :parent-on-try-rules="onTryRules" :grewquery="$route.query.q || ''"></GrewRequestCard>
    </q-dialog>
    <q-dialog v-model="resultSearchDialog" transition-show="fade" transition-hide="fade">
      <ResultView :searchresults="resultSearch" :totalsents="sentenceCount" searchscope="sample" :parent-on-show-table="onShowTable"></ResultView>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import GrewRequestCard from './GrewRequestCard.vue';
import ResultView from '../ResultView.vue';
import api from '../../api/backend-api';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { mapWritableState } from 'pinia';
import notifyError from 'src/utils/notify';
import { defineComponent } from 'vue';
import { grewSearchResult_t } from 'src/api/backend-types';

export default defineComponent({
  components: {
    GrewRequestCard,
    ResultView,
  },
  props: ['sentenceCount', 'sampleId', 'showTable'],
  data() {
    const resultSearch: grewSearchResult_t = {};
    return {
      resultSearchDialog: false,
      resultSearch,
      rulesGrew: {},
      window: { width: 0, height: 0 },
    };
  },
  computed: {
    breakpoint() {
      return this.window.width <= 400;
    },
    ...mapWritableState(useGrewSearchStore, ['grewDialog']),
    // grewDialog: {
    //   get() {
    //     const grewSearchStore = useGrewSearchStore();
    //     return grewSearchStore.grew;
    //   },
    //   set(value) {
    //     this.$store.dispatch('grewSearch/switch_grew_dialog', value);
    //   },
    // },
  },
  mounted() {
    this.grewDialog = this.showTable;
  },
  methods: {
    onShowTable(resultSearchDialog: any) {
      this.resultSearchDialog = resultSearchDialog;
      this.grewDialog = false;
    },
    onSearch(searchPattern: string) {
      const query = { pattern: searchPattern };
      if (this.$route.params.samplename) {
        api
          .searchSample(this.$route.params.projectname as string, this.$route.params.samplename as string, query)
          .then((response) => {
            this.resultSearch = response.data;
            this.resultSearchDialog = true;
          })
          .catch((error) => {
            notifyError({ error });
          });
      } else {
        api
          .searchProject(this.$route.params.projectname as string, query)
          .then((response) => {
            this.resultSearch = response.data;
            this.resultSearchDialog = true;
          })
          .catch((error) => {
            notifyError({ error });
          });
      }
    },
    onTryRules(query: string) {
      const sampleId = (this.$route.params.samplename as string) || null;
      api
        .tryPackage(this.$route.params.projectname as string, sampleId, query)
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
