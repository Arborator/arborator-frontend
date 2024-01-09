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
            <div class="col-10 q-pr-md">
              <q-select 
                dense 
                outlined 
                v-model="treeType" 
                :options="treeOptions" 
                :label="$t('grewSearch.treesType')" 
                color="primary"
              >
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
            <div class="col-2">
              <q-select
                v-if="treeType.value === 'others'"
                v-model="otherUser"
                outlined
                dense
                :options="treesFrom"
                label="Select users"
              >
              </q-select>
            </div>
          </div>
          <div class="row">
            <div class="col-10">
              <GrewCodeMirror v-model:value="currentQuery" style="height: 70vh"></GrewCodeMirror>
              <q-separator />
            </div>

            <div class="col-2">
              <q-tabs 
                outlined 
                v-model="searchReplaceTab" 
                dense 
                no-caps 
                active-color="primary" 
                indicator-color="primary" 
                class="primary text-grey"
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
              <q-separator />
              <q-tab-panels v-model="searchReplaceTab" animated class="shadow-2" @input="treeType == null">
                <q-tab-panel name="SEARCH">
                  <q-tabs 
                    v-model="searchQueryTab" 
                    dense 
                    no-caps 
                    vertical 
                    switch-indicator 
                    class="primary" 
                    indicator-color="primary"
                  >
                    <template v-for="query in searchQueries" :key="query.name">
                      <q-tab v-ripple :name="query.name" :label="query.name" clickable @click="changeQuery(query.pattern, 'SEARCH')" />
                    </template>
                    <q-tab><a href="https://grew.fr/doc/request/" target="_blank">Documentation</a></q-tab>
                  </q-tabs>
                </q-tab-panel>

                <q-tab-panel name="REWRITE">
                  <q-tabs 
                    v-model="searchQueryTab"
                    dense 
                    no-caps 
                    vertical 
                    switch-indicator 
                    class="primary" 
                    indicator-color="primary"
                  >
                    <template v-for="query in rewriteQueries" :key="query.name">
                      <q-tab v-ripple :name="query.name" :label="query.name" clickable @click="changeQuery(query.pattern, 'REWRITE')" />
                    </template>
                    <q-tab><a href="https://grew.fr/doc/commands/" target="_blank">Documentation</a></q-tab>
                  </q-tabs>
                </q-tab-panel>
              </q-tab-panels>
              <div v-if="searchReplaceTab === 'REWRITE'" class="q-pa-md">
                <q-btn label="History" icon="history" color="primary" @click="isShowHistory = true" />
              </div>
            </div>
          </div>
          <q-bar class="row q-pa-md absolute-bottom custom-frame2">
            <q-btn v-if="searchReplaceTab === 'SEARCH'" color="primary" :label="$t('grewSearch.search')" no-caps icon="search" @click="onSearch" />
            <q-btn v-if="searchReplaceTab === 'REWRITE'" color="primary" :label="$t('grewSearch.tryRules')" no-caps icon="autorenew" @click="tryRules" />
            {{ treeType.label }}
          </q-bar>
        </div>
      </q-form>
      <AppliedRuleHistory v-if="isShowHistory"  @closed="isShowHistory = false"  @copied-pattern="getCopiedPattern" />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import 'codemirror/theme/gruvbox-dark.css';
import GrewCodeMirror from 'components/codemirrors/GrewCodeMirror.vue';
import grewTemplates from '../../assets/grew-templates.json';
import AppliedRuleHistory from './AppliedRuleHistory.vue';
import { mapActions, mapState } from 'pinia';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { useUserStore } from 'src/pinia/modules/user';
import { useProjectStore } from 'src/pinia/modules/project';
import { LocalStorage } from 'quasar';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'GrewRequestCard',
  components: { GrewCodeMirror, AppliedRuleHistory },
  props: {
    parentOnSearch: {
      type: Function as PropType<CallableFunction>,
      required: true,
    },
    parentOnTryRules: {
      type: Function as PropType<CallableFunction>,
      required: true,
    }, 
    treesFrom: {
      type: Object as PropType<string[]>,
      required: true,
    }
  },
  data() {
    const currentQueryType: 'SEARCH' | 'REWRITE' = grewTemplates.searchQueries[0].type as 'SEARCH' | 'REWRITE';
    const treeTypes = [
        { value: 'recent', label: this.$t('projectView.tooltipFabGrewRecent'), icon: 'schedule' },
        { value: 'user', label: this.$t('projectView.tooltipFabGrewUser')},
        { value: 'user_recent', label: this.$t('projectView.tooltipFabGrewUserRecent')},
        { value: 'validated', label: this.$t('projectView.tooltipFabGrewValidated'), icon:'verified'},
        { value: 'pending', label: this.$t('projectView.tooltipFabGrewPending'), icon:'pending' },
        { value: 'all', label: this.$t('projectView.tooltipFabGrewAll'), icon: 'groups' },
        { value: 'base_tree', label: this.$t('projectView.tooltipFabGrewBaseTree'), icon: 'linear_scale'},
        { value: 'others', label : this.$t('projectView.tooltipFabGrewOther'), icon: 'group'}
      ];
    const treeType = treeTypes[0];
    return {
      searchReplaceTab: grewTemplates.searchQueries[0].type,
      searchQueryTab: grewTemplates.searchQueries[0].type,
      currentQuery: grewTemplates.searchQueries[0].pattern,
      currentQueryType,
      searchQueries: grewTemplates.searchQueries,
      rewriteQueries: grewTemplates.rewriteQueries,
      treeType,
      treeTypes,
      otherUser: '',
      isShowHistory: false,
      savedRulesNumber: 0,
    };
  },
  computed: {
    ...mapState(useGrewSearchStore, ['lastQuery', 'grewTreeTypes', 'canRewriteRule']),
    ...mapState(useUserStore, ['isLoggedIn', 'avatar', 'username']),
    ...mapState(useProjectStore, ['name','blindAnnotationMode','shownFeaturesChoices', 'annotationFeatures', 'canSaveTreeInProject', 'canSeeOtherUsersTrees', 'isValidator']),
    treeOptions() {
      if (this.searchReplaceTab == 'SEARCH') {
        return this.treeTypes.filter((element) => this.grewTreeTypes.includes(element.value));
      }
      else {
        return this.treeTypes.filter((element) => this.grewTreeTypes.includes(element.value) && !['all', 'pending'].includes(element.value));
      }
    },
  },
  watch: {
    searchReplaceTab(newVal){
      if (newVal === 'REWRITE' && this.treeType.value === 'all'){
        this.treeType = this.treeTypes[0];
      }
    }
  },
  mounted() {
    if (this.lastQuery !== null) {
      this.currentQueryType = this.lastQuery.type;
      this.currentQuery = this.lastQuery.text;
      this.treeType = this.treeTypes.filter((option) => option.value === this.lastQuery?.userType)[0];
    }
    this.searchReplaceTab = this.currentQueryType;
    this.treeType = this.treeOptions[0];
    this.savedRulesNumber = (LocalStorage.getItem(this.name) as any[] || []).length;
  },
  methods: {
    ...mapActions(useGrewSearchStore, ['changeLastGrewQuery']),
    onSearch() {
      this.parentOnSearch(this.currentQuery, this.treeType.value, this.otherUser);
      this.changeLastGrewQuery({ text: this.currentQuery, type: this.currentQueryType, userType: this.treeType.value });
    },
    tryRules() {
      this.parentOnTryRules(this.currentQuery, this.treeType.value, this.otherUser);
      this.changeLastGrewQuery({ text: this.currentQuery, type: this.currentQueryType, userType: this.treeType.value });
    },
    changeQuery(query: string, type: 'SEARCH' | 'REWRITE') {
      this.currentQuery = query;
      this.currentQueryType = type;
      if (type === 'REWRITE' && this.savedRulesNumber > 1) {
        this.currentQuery = query.replace('r1', `r${this.savedRulesNumber + 1}`);
      }
      if (type === 'REWRITE' && this.treeType.value === 'all') {
        this.treeType = this.treeTypes[0];
      }
    },
    getCopiedPattern(value: any) {
      this.currentQuery = value;
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