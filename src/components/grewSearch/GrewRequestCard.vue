<template>
  <q-card flat bordered>
    <q-card-section>
      <TreesTypeSelect :grew-option="searchReplaceTab" :samples="samples" @selected-value="getSelectedValues"></TreesTypeSelect>
    </q-card-section>
    <q-card-section>
      <div class="row q-col-gutter-md" style="position: relative">
        <div class="col-3">
          <q-tabs
            outlined
            v-model="searchReplaceTab"
            dense
            no-caps
            active-color="primary"
            indicator-color="primary"
            class="primary bordered text-grey"
          >
            <q-tab name="SEARCH" icon="search" :label="$t('grewSearch.search')">
              <q-tooltip content-class="bg-primary" anchor="top middle" self="bottom middle" :offset="[10, 10]">
                {{ $t('grewSearch.grewSearchTooltip') }}
              </q-tooltip>
            </q-tab>
            <q-tab v-if="canRewriteRule" name="REWRITE" icon="autorenew" :label="$t('grewSearch.rewrite')">
              <q-tooltip content-class="bg-primary" anchor="top middle" self="bottom middle" :offset="[10, 10]">
                {{ $t('grewSearch.grewRewriteTooltip') }}
              </q-tooltip>
            </q-tab>
          </q-tabs>
          <q-tab-panels class="bordered" v-model="searchReplaceTab" animated @transition="switchGrewMode">
            <q-tab-panel name="SEARCH">
              <q-tabs v-model="searchQueryTab" dense no-caps vertical switch-indicator class="primary" indicator-color="primary">
                <template v-for="query in searchQueries" :key="query.name">
                  <q-tab v-ripple :name="query.name" :label="query.name" clickable @click="changeQuery(query.pattern, 'SEARCH')" />
                </template>
                <q-tab><a href="https://grew.fr/doc/request/" target="_blank">Documentation</a></q-tab>
              </q-tabs>
            </q-tab-panel>

            <q-tab-panel name="REWRITE">
              <q-tabs v-model="searchQueryTab" dense no-caps vertical switch-indicator class="primary" indicator-color="primary">
                <template v-for="query in rewriteQueries" :key="query.name">
                  <q-tab v-ripple :name="query.name" :label="query.name" clickable @click="changeQuery(query.pattern, 'REWRITE')" />
                </template>
                <q-tab><a href="https://grew.fr/doc/commands/" target="_blank">Documentation</a></q-tab>
              </q-tabs>
            </q-tab-panel>
          </q-tab-panels>
          <div v-if="isLoggedIn" class="q-pa-md row justify-center">
            <q-btn outline :label="$t('grewHistory.historyBtn')" color="primary" icon="history" @click="isShowHistory = true" />
          </div>
        </div>
        <div class="col-8">
          <GrewCodeMirror v-model:value="currentQuery" style="width: 75%; position: absolute" class="bordered"></GrewCodeMirror>
        </div>
      </div>
    </q-card-section>
    <q-card-actions style="justify-content: right">
      <div class="row q-pa-md">
        <q-btn
          v-if="searchReplaceTab === 'SEARCH'"
          :disable="disableBtn"
          color="primary"
          :label="$t('grewSearch.search')"
          no-caps
          icon="search"
          @click="onSearch"
        >
          <q-tooltip v-if="disableBtn">
            {{ $t('grewSearch.btnDisabledTooltip') }}
          </q-tooltip>
        </q-btn>
        <q-btn v-else :disable="disableBtn" color="primary" :label="$t('grewSearch.tryRules')" no-caps icon="autorenew" @click="tryRules">
          <q-tooltip v-if="disableBtn">
            {{ $t('grewSearch.btnDisabledTooltip') }}
          </q-tooltip>
        </q-btn>
      </div>
    </q-card-actions>
  </q-card>
  <GrewHistory v-if="isShowHistory" @closed="isShowHistory = false" @copied-request="getCopiedRequest" />
</template>

<script lang="ts">

import GrewCodeMirror from 'components/codemirrors/GrewCodeMirror.vue';
import { mapActions, mapState } from 'pinia';
import { sample_t } from 'src/api/backend-types';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { useUserStore } from 'src/pinia/modules/user';
import { PropType, defineComponent } from 'vue';

import grewTemplates from '../../assets/grew-templates.json';
import TreesTypeSelect from '../shared/TreesTypeSelect.vue';
import GrewHistory from './GrewHistory.vue';

export default defineComponent({
  name: 'GrewRequestCard',
  components: { GrewCodeMirror, GrewHistory, TreesTypeSelect },
  props: {
    parentOnSearch: {
      type: Function as PropType<CallableFunction>,
      required: true,
    },
    parentOnTryRules: {
      type: Function as PropType<CallableFunction>,
      required: true,
    },
    samples: {
      type: Object as PropType<sample_t[]>,
      required: true,
    },
  },
  data() {
    const currentQueryType: 'SEARCH' | 'REWRITE' = grewTemplates.searchQueries[0].type as 'SEARCH' | 'REWRITE';
    const data: { selectedSamples: string[]; treeType: string; otherUser: string } = { selectedSamples: [], treeType: 'recent', otherUser: '' };
    return {
      searchReplaceTab: grewTemplates.searchQueries[0].type,
      searchQueryTab: grewTemplates.searchQueries[0].type,
      currentQuery: grewTemplates.searchQueries[0].pattern,
      currentQueryType,
      searchQueries: grewTemplates.searchQueries,
      rewriteQueries: grewTemplates.rewriteQueries,
      data,
      isShowHistory: false,
    };
  },
  computed: {
    ...mapState(useGrewSearchStore, ['lastQuery', 'canRewriteRule']),
    ...mapState(useUserStore, ['isLoggedIn']),
    disableBtn() {
      return this.data.treeType === 'others' && !this.data.otherUser;
    },
  },
  mounted() {
    if (this.lastQuery !== null) {
      this.currentQueryType = this.lastQuery.type;
      this.currentQuery = this.lastQuery.text;
    }
    this.searchReplaceTab = this.currentQueryType;
  },
  methods: {
    ...mapActions(useGrewSearchStore, ['changeLastGrewQuery']),
    getSelectedValues(val: any) {
      this.data = val;
    },
    onSearch() {
      this.parentOnSearch(this.currentQuery.normalize('NFC'), this.data.treeType, this.data.otherUser, this.data.selectedSamples);
      this.changeLastGrewQuery({ text: this.currentQuery.normalize('NFC'), type: this.currentQueryType, userType: this.data.treeType });
    },
    tryRules() {
      this.parentOnTryRules(this.currentQuery.normalize('NFC'), this.data.treeType, this.data.otherUser, this.data.selectedSamples);
      this.changeLastGrewQuery({ text: this.currentQuery.normalize('NFC'), type: this.currentQueryType, userType: this.data.treeType });
    },
    changeQuery(query: string, type: 'SEARCH' | 'REWRITE') {
      this.currentQuery = query;
      this.currentQueryType = type;
    },
    switchGrewMode() {
      const pattern = this.currentQuery.match(/pattern((.|\n)*?)}/);
      if (this.searchReplaceTab === 'REWRITE' && this.currentQueryType === 'SEARCH') {
        if (pattern) {
          this.currentQuery = `rule r {\n \t${pattern[0]} \n \tcommands { \n \t% add the pattern you want to have to replace … \n }\n}`;
          this.currentQueryType = 'REWRITE';
        }
      }
      if (this.searchReplaceTab === 'SEARCH' && this.currentQueryType === 'REWRITE') {
        if (pattern) {
          this.currentQuery = pattern[0];
          this.currentQueryType = 'SEARCH';
        }
      }
    },
    getCopiedRequest(value: any) {
      this.currentQuery = value.request;
      this.currentQueryType = value.type === 'search' ? 'SEARCH' : 'REWRITE';
      this.searchReplaceTab = (value.type as string).toUpperCase();
    },
  },
});
</script>
<style scoped>
.bordered {
  border: 1px solid #999999;
}
.absolute-bottom {
  position: sticky;
  bottom: 0;
  z-index: 1;
  height: 40px;
}
</style>
