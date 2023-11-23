<template>
  <q-card style="width: 10%" :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    <q-bar class="bg-primary text-white sticky-bar">
      <q-icon name="img:/svg/grew.svg" size="7rem" />
      <q-space />
      <q-btn v-close-popup flat dense icon="close" />
    </q-bar>
    <q-card-section style="width: 80vw; height: 85vh">
      <q-form class="q-gutter-md">
        <div class="q-pa-xs">
          <div class="row">
            <div class="col-10">
              <q-select dense outlined v-model="usersToApply" :options="userOptions" :label="$t('grewSearch.treesType')" color="primary">
                <template v-slot:selected-item="scope">
                  <q-chip
                    v-if="scope.opt.value == 'user' || scope.opt.value == 'user_recent'"
                    dense
                    square
                    color="white"
                    text-color="primary"
                    size="md"
                  >
                    <q-avatar>
                      <img :src="avatar" />
                      <q-badge v-if="scope.opt.value == 'user_recent'" floating transparent>+</q-badge>
                    </q-avatar>
                    {{ scope.opt.label }}
                  </q-chip>
                  <q-chip v-else dense square text-color="primary" size="md" :label="scope.opt.label" :icon="scope.opt.icon" />
                </template>

                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-avatar v-if="scope.opt.value == 'user' || scope.opt.value == 'user_recent'" size="1.2rem">
                        <img :src="avatar" />
                        <q-badge v-if="scope.opt.value == 'user_recent'" floating transparent color="principal">+</q-badge>
                      </q-avatar>
                      <q-icon v-else :name="scope.opt.icon" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
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

            <div class="col-2">
              <q-tabs outlined v-model="searchReplaceTab" dense no-caps active-color="primary" indicator-color="primary" class="primary text-grey">
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
              <q-separator />
              <q-tab-panels v-model="searchReplaceTab" animated class="shadow-2" @input="usersToApply == null">
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
            </div>
          </div>
          <q-bar class="row q-pa-md absolute-bottom custom-frame2">
            <q-btn v-if="searchReplaceTab === 'SEARCH'" color="primary" :label="$t('grewSearch.search')" no-caps icon="search" @click="onSearch" />
            <q-btn v-if="searchReplaceTab === 'REWRITE'" color="primary" :label="$t('grewSearch.tryRules')" no-caps icon="autorenew" @click="tryRules" />
            {{ usersToApply.label }}
          </q-bar>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import 'codemirror/theme/gruvbox-dark.css';
import GrewCodeMirror from 'components/codemirrors/GrewCodeMirror.vue';
import grewTemplates from '../../assets/grew-templates.json';
import { mapActions, mapState } from 'pinia';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { useUserStore } from 'src/pinia/modules/user';
import { useProjectStore } from 'src/pinia/modules/project';

import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'GrewRequestCard',
  components: { GrewCodeMirror },
  props: {
    parentOnSearch: {
      type: Function as PropType<CallableFunction>,
      required: true,
    },
    parentOnTryRules: {
      type: Function as PropType<CallableFunction>,
      required: true,
    }
  },
  data() {
    const currentQueryType: 'SEARCH' | 'REWRITE' = grewTemplates.searchQueries[0].type as 'SEARCH' | 'REWRITE';
    const usersToApplyOptions = [
        { value: 'recent', label: this.$t('projectView.tooltipFabGrewRecent'), icon: 'schedule' },
        { value: 'user', label: this.$t('projectView.tooltipFabGrewUser')},
        { value: 'user_recent', label: this.$t('projectView.tooltipFabGrewUserRecent')},
        { value: 'validated', label: this.$t('projectView.tooltipFabGrewValidated'), icon:'verified'},
        { value: 'pending', label: this.$t('projectView.tooltipFabGrewPending'), icon:'pending' },
        { value: 'all', label: this.$t('projectView.tooltipFabGrewAll'), icon: 'groups' },
        { value: 'base_tree', label: this.$t('projectView.tooltipFabGrewBaseTree'), icon: 'linear_scale'},
      ];
    const usersToApply = usersToApplyOptions[0];
    return {
      searchReplaceTab: grewTemplates.searchQueries[0].type,
      searchQueryTab: grewTemplates.searchQueries[0].type,
      currentQuery: grewTemplates.searchQueries[0].pattern,
      currentQueryType,
      searchQueries: grewTemplates.searchQueries,
      rewriteQueries: grewTemplates.rewriteQueries,
      usersToApply,
      usersToApplyOptions,
    };
  },
  computed: {
    ...mapState(useGrewSearchStore, ['lastQuery', 'treeTypesForSearch', 'canRewriteRule']),
    ...mapState(useUserStore, ['isLoggedIn', 'avatar', 'username']),
    ...mapState(useProjectStore, ['blindAnnotationMode','shownFeaturesChoices', 'annotationFeatures', 'canSaveTreeInProject', 'canSeeOtherUsersTrees', 'isValidator']),
    userOptions() {
      if (this.searchReplaceTab == 'SEARCH') {
        return this.usersToApplyOptions.filter((element) => this.treeTypesForSearch.includes(element.value));
      }
      else {
        return this.usersToApplyOptions.filter((element) => this.treeTypesForSearch.includes(element.value) && !['all', 'pending'].includes(element.value));
      }
    },
  },
  watch: {
    searchReplaceTab(newVal){
      if (newVal === 'REWRITE' && this.usersToApply.value === 'all'){
        this.usersToApply = this.usersToApplyOptions[0];
      }
    }

  },
  mounted() {
    if (this.lastQuery !== null) {
      this.currentQueryType = this.lastQuery.type;
      this.currentQuery = this.lastQuery.text;
      this.usersToApply = this.usersToApplyOptions.filter((option) => option.value === this.lastQuery?.userType)[0];
    }
    this.searchReplaceTab = this.currentQueryType;
    this.usersToApply = this.userOptions[0];
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
      this.changeLastGrewQuery({ text: this.currentQuery, type: this.currentQueryType, userType: this.usersToApply.value });
    },
    /**
     * Call parent onsearch function and update store and history
     *
     * @returns void
     */
    tryRules() {
      this.parentOnTryRules(this.currentQuery, this.usersToApply.value);
      this.changeLastGrewQuery({ text: this.currentQuery, type: this.currentQueryType, userType: this.usersToApply.value });
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