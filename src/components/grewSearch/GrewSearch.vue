<template>
  <div>
    <q-page-sticky :position="breakpoint ? 'bottom-right' : 'bottom-right'" :offset="breakpoint ? [18, 18] : [30, 80]" style="z-index: 999">
      <q-btn size="20px" round color="primary" icon="img:/svg/g.svg" @click="searchDialog = !searchDialog">
        <q-tooltip content-class="bg-primary" content-style="font-size: 16px"> Search with Grew in this sample </q-tooltip>
      </q-btn>
    </q-page-sticky>
    <q-dialog v-model="searchDialog" seamless position="right" full-width>
      <GrewRequestCard :parent-on-search="onSearch" :parent-on-try-rules="onTryRules" :grewquery="$route.query.q || ''"></GrewRequestCard>
    </q-dialog>
    <q-dialog v-model="resultSearchDialog" transition-show="fade" transition-hide="fade">
      <ResultView
        :searchresults="resultSearch"
        :totalsents="sentenceCount"
        :rules-grew="rulesGrew"
        searchscope="sample"
        :parent-on-show-table="onShowTable"
      ></ResultView>
    </q-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import GrewRequestCard from './GrewRequestCard';
import ResultView from '../ResultView';
import api from '../../api/backend-api';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { mapWritableState } from 'pinia';

export default {
  components: {
    GrewRequestCard,
    ResultView,
  },
  props: ['sentenceCount', 'sampleId', 'showTable'],
  data() {
    return {
      resultSearchDialog: false,
      resultSearch: {},
      rulesGrew: {},
      window: { width: 0, height: 0 },
    };
  },
  computed: {
    breakpoint() {
      return this.window.width <= 400;
    },
    ...mapWritableState(useGrewSearchStore, ['grewDialog']),
    // searchDialog: {
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
    this.searchDialog = this.showTable;
  },
  methods: {
    // getRelationTable(type) {
    //   var data = { table_type: type };
    //   api
    //     .getRelationTable(this.$route.params.projectname, data)
    //     .then((response) => {
    //       this.relationTableInfos = response.data;
    //       this.relationTableDial = true;
    //     })
    //     .catch((error) => {
    //       this.$store.dispatch("notifyError", { error: error });
    //     });
    // },
    onShowTable(resultSearchDialog) {
      this.resultSearchDialog = resultSearchDialog;
      this.searchDialog = false;
    },
    onSearch(searchPattern) {
      const query = { pattern: searchPattern };
      if (this.$route.params.samplename) {
        api
          .searchSample(this.$route.params.projectname, this.$route.params.samplename, query)
          .then((response) => {
            this.resultSearch = response.data;
            this.resultSearchDialog = true;
          })
          .catch((error) => {
            notifyError({ error });
          });
      } else {
        api
          .searchProject(this.$route.params.projectname, query)
          .then((response) => {
            this.resultSearch = response.data;
            this.resultSearchDialog = true;
          })
          .catch((error) => {
            notifyError({ error });
          });
      }
    },
    onTryRules(Rules, SampleIds) {
      const query = { rules: Rules, sampleId: SampleIds };
      api
        .tryRulesProject(this.$route.params.projectname, query)
        .then((response) => {
          this.resultSearchDialog = true;
          this.resultSearch = response.data.trees;
        })
        .catch((error) => {
          notifyError({
            error: error.response.data.message,
          });
        });
    },
  },
};
</script>

<style></style>
