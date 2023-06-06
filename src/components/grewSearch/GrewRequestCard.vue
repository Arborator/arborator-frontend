<template>
  <q-card style="width: 10%" :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    <q-bar class="bg-primary text-white">
      <q-icon name="img:/svg/grew.svg" size="7rem" />
      <q-space />
      <q-btn v-close-popup flat dense icon="close" />
    </q-bar>
    <q-card-section style="width: 80vw; height: 85vh">
      <q-form class="q-gutter-md" @reset="onResetSearch">
        <div class="q-pa-xs">
          <div class="row">
            <div class="col-10">
              <q-select dense outlined v-model="usersToApply" :options="userOptions" :label="$t('grewSearch.treesType')" color="primary">
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-avatar v-if="scope.opt.value == 'user' || scope.opt.value == 'user_recent'" size="1.2rem" >
                        <img :src="avatar" />
                        <q-badge v-if="scope.opt.value == 'user_recent'" floating transparent color="principal">+</q-badge>
                      </q-avatar>
                      <q-icon v-else :name="scope.opt.icon" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{scope.opt.label}}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>
          <div class="row">
            <div class="col-10">
              <GrewCodeMirror v-model:value="currentQuery" style="height: 70vh"></GrewCodeMirror>
              <q-separator />
            </div>

            <div class="col-2 bg-primary">
              <q-tabs v-model="searchReplaceTab" dense no-caps class="bg-grey-2 primary text-primary">
                <q-tab name="SEARCH" icon="search" :label="$t('grewSearch.search')">
                  <q-tooltip content-class="bg-primary" anchor="top middle" self="bottom middle" :offset="[10, 10]">
                    {{$t('grewSearch.grewSearchTooltip')}}
                  </q-tooltip>
                </q-tab>
                <q-tab name="REWRITE" icon="autorenew" :label="$t('grewSearch.rewrite')">
                  <q-tooltip content-class="bg-primary" anchor="top middle" self="bottom middle" :offset="[10, 10]">
                    {{$t('grewSearch.grewRewriteTooltip')}}
                  </q-tooltip>
                </q-tab>
              </q-tabs>
              <q-separator />

              <q-tab-panels v-model="searchReplaceTab" animated class="shadow-2" @input="usersToApply  == null">
                <q-tab-panel name="SEARCH">
                  <q-tabs v-model="searchQueryTab" dense no-caps vertical switch-indicator class="primary" indicator-color="primary">
                    <template v-for="query in searchQueries" :key="query.name">
                      <q-tab v-ripple :name="query.name" :label="query.name" clickable @click="changeQuery(query.pattern, 'SEARCH')" />
                    </template>
                     <q-tab v-ripple v-if="usersToApply.value === 'all'" name="showDiffs" label="Show divergences" clickable @click="isShowDiff = true" />
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
            </div>
          </div>
          <div class="row">
            <div>
              <q-btn :disable="!usersToApply.value" v-if="searchReplaceTab === 'SEARCH' || currentQueryType === 'SEARCH'" color="primary" :label="$t('grewSearch.search')" no-caps icon="search" @click="onSearch" />
              <q-btn :disable="!usersToApply.value" v-else-if="searchReplaceTab === 'REWRITE' || currentQueryType === 'REWRITE'" color="primary" :label="$t('grewSearch.tryRules')" no-caps icon="autorenew" @click="tryRules" />
              <q-tooltip v-if="!usersToApply.value" content-class="bg-primary" anchor="top middle" self="bottom middle" :offset="[10, 10]">
                {{$t('grewSearch.grewBtnTooltip')}}
              </q-tooltip>
            </div>
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
  <q-dialog v-model="isShowDiff">
    <q-card style="width: 150vw;">
      <q-bar class="bg-primary text-white">
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section>
        <div class="text-h6">
          {{ $t('grewSearch.showDiffTitle') }}
        </div>
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <div class="row q-gutter-sm">
          <div class="col">
            <q-select
              v-model="features"
              filled
              multiple
              :options="featuresSet"
              use-chips
              stack-label
              :label="$t('grewSearch.showDiffFaturesSelect')"
            />
          </div>
          <div class="col">
            <q-select
              v-model="otherUsers"
              filled
              multiple
              :options="users"
              use-chips
              stack-label
              :label="$t('grewSearch.showDiffUsersSelect')"
            />
            <q-tooltip>{{$t('grewSearch.showDiffUsersTooltip')}}</q-tooltip>
          </div>
        </div>
        <div class="row">
          <q-btn :disable="otherUsers.length < 2" v-close-popup :label="$t('grewSearch.showDiffBtn')" color="primary" @click="onShowDiffs" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import grewTemplates from '../../assets/grew-templates.json';
import {mapActions, mapState, mapWritableState} from 'pinia';
import {useGrewSearchStore} from 'src/pinia/modules/grewSearch';
import {useUserStore} from 'src/pinia/modules/user';
import {useProjectStore} from 'src/pinia/modules/project';
import GrewCodeMirror from "components/codemirrors/GrewCodeMirror.vue";

export default defineComponent({
  name: 'GrewRequestCard',
  components: { GrewCodeMirror },
  props: ['parentOnSearch', 'parentOnTryRules', 'parentOnShowDiffs', 'users'],
  data() {
    const currentQueryType: 'SEARCH' | 'REWRITE' = grewTemplates.searchQueries[0].type as 'SEARCH' | 'REWRITE';
    const usersToApplyOptions = [
        { value: 'user', label: this.$t('projectView.tooltipFabGrewUser')},
        { value: 'user_recent', label: this.$t('projectView.tooltipFabGrewUserRecent')},
        { value: 'recent', label: this.$t('projectView.tooltipFabGrewRecent'), icon: 'schedule' },
        { value: 'all', label: this.$t('projectView.tooltipFabGrewAll'), icon: 'groups' },
      ];
    const usersToApply = usersToApplyOptions[0];
    const otherUsers : string[] = [];
    const features : string[] = [];
    return {
      searchReplaceTab: grewTemplates.searchQueries[0].type,
      searchQueryTab: grewTemplates.searchQueries[0].type,
      currentQuery: grewTemplates.searchQueries[0].pattern,
      currentQueryType,
      rewriteCommands: '',
      searchQueries: grewTemplates.searchQueries,
      rewriteQueries: grewTemplates.rewriteQueries,
      usersToApply,
      usersToApplyOptions,
      isShowDiff: false,
      otherUsers,
      features,
    };
  },
  computed: {
    ...mapState(useGrewSearchStore, ['lastQuery']),
    ...mapState(useUserStore, ['isLoggedIn', 'avatar', 'username']),
    ...mapState(useProjectStore, ['shownFeaturesChoices', 'annotationFeatures']),
    userOptions() {
      return this.searchReplaceTab === 'REWRITE' ? this.usersToApplyOptions.filter(option=> option.value !== "all") : this.usersToApplyOptions;
    },
    featuresSet() {
      var featuresSet: string[] = [];
      featuresSet = this.shownFeaturesChoices.filter((feat) => feat != 'FORM')
      featuresSet.splice(2,0,'DEPREL', 'HEAD')
      return featuresSet;
    },
  },
  watch: {
    searchReplaceTab(newVal, oldVal){
      if (newVal === 'REWRITE' && this.usersToApply.value === 'all'){
        this.usersToApply = this.usersToApplyOptions[0];
      }
    }
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
    /**
     * Call parent onsearch function and update store and history
     *
     * @returns void
     */
    onSearch() {
      this.parentOnSearch(this.currentQuery, this.usersToApply.value);
      this.changeLastGrewQuery({ text: this.currentQuery, type: this.currentQueryType });
    },
    /**
     * Call parent onsearch function and update store and history
     *
     * @returns void
     */
    tryRules() {
      this.parentOnTryRules(this.currentQuery, this.usersToApply.value);
      this.changeLastGrewQuery({ text: this.currentQuery, type: this.currentQueryType });
    },
    /**
     * Modify the search pattern (search string)
     *
     * @param {string} pattern
     * @returns void
     */
    changeQuery(query: string, type: 'SEARCH' | 'REWRITE') {
      this.currentQuery = query;
      this.currentQueryType = type;
      if (type === 'REWRITE' && this.usersToApply.value === 'all') {
        this.usersToApply = this.usersToApplyOptions[0];
      }
    },

    /**
     * Reset the search pattern to an empty string
     *
     * @returns void
     */
    onResetSearch() {
      this.currentQuery = '';
      this.rewriteCommands = '';
    },

    onShowDiffs() {
      this.parentOnShowDiffs(this.otherUsers, this.features);
    }
  },
});
</script>
