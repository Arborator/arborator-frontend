<template>
  <div>
    <q-page-sticky :position="breakpoint ? 'bottom-right' : 'bottom-right'" :offset="breakpoint ? [18, 18] : [30, 80]" style="z-index: 999">
      <q-btn size="20px" round @click="searchDialog = !searchDialog" color="primary" icon="img:/svg/g.svg">
        <q-tooltip content-class="bg-primary" content-style="font-size: 16px"> Search with Grew in this sample </q-tooltip>
      </q-btn>
    </q-page-sticky>
    <q-dialog v-model="searchDialog" seamless position="right" full-width>
      <GrewRequestCard :parentOnSearch="onSearch" :parentOnTryRules="onTryRules" :grewquery="$route.query.q || ''"></GrewRequestCard>
    </q-dialog>
    <q-dialog v-model="resultSearchDialog" transition-show="fade" transition-hide="fade">
      <ResultView
        :searchresults="resultSearch"
        :totalsents="sentenceCount"
        :rulesGrew="rulesGrew"
        searchscope="sample"
        :parentOnShowTable="onShowTable"
      ></ResultView>
    </q-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import GrewRequestCard from './GrewRequestCard';
import ResultView from '../ResultView';
import api from '../../api/backend-api';

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
  mounted() {
    this.searchDialog = this.showTable;
  },
  computed: {
    breakpoint() {
      return this.window.width <= 400;
    },
    searchDialog: {
      get() {
        return this.$store.getters['grewSearch/grewDialog'];
      },
      set(value) {
        this.$store.dispatch('grewSearch/switch_grew_dialog', value);
      },
    },
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
            this.$store.dispatch('notifyError', { error });
          });
      } else {
        api
          .searchProject(this.$route.params.projectname, query)
          .then((response) => {
            this.resultSearch = response.data;
            this.resultSearchDialog = true;
          })
          .catch((error) => {
            this.$store.dispatch('notifyError', { error });
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
          this.$store.dispatch('notifyError', {
            error: error.response.data.message,
          });
        });
    },
  },
};
</script>

<style></style>
