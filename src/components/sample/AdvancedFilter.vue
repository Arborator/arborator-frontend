<template>
  <div class="row q-pa-md">
    <Breadcrumbs :height="30" :font-size="16" />
  </div>
  <div class="row q-pa-md q-gutter-md">
    <div class="col-3">
      <q-input 
        v-model="textFilter" 
        :label="$t('advancedFilter.textFilter')" 
        outlined 
        dense 
        color="primary"
        @keyup.enter="applyAdvancedFilter()"
      ></q-input>
    </div>
    <div class="col-1">
      <q-input v-model="sentIdFilter" outlined dense :label="$t('advancedFilter.sentIdFilter')" @keyup.enter="applyAdvancedFilter()" />
    </div>
    <div class="col-1">
      <q-select
        outlined
        dense
        v-model="selectedTags"
        use-chips
        multiple
        option-value="value"
        label="Tags"
        :options="userTags"
        emit-value
        @focus="getUsersTags()"
      >
        <template class="q-pa-md" v-slot:option="scope">
          <div class="row q-pa-xs">
            <q-chip v-bind="scope.itemProps" size="sm" :label="scope.opt.value" />
          </div>
          <q-separator />
        </template>
      </q-select>
    </div>
    <div class="col-1">
      <q-btn @click="applyAdvancedFilter" color="primary">{{ $t('advancedFilter.applyFilter') }}</q-btn>
    </div>
    <div class="col-1">
      <q-select
        outlined
        dense
        v-model="order"
        :options="orderOptions"
        :label="$t('advancedFilter.orderLength')"
        @update:model-value="orderFilteredTrees(order)"
       />
    </div>
    <div class="col-1">
      <q-separator vertical />
      <q-btn no-caps v-if="config === 'ud' && !blindAnnotationMode" color="primary" :label="$t('advancedFilter.validateAllTrees')" @click="validateAllTrees()">
        <q-tooltip>
          {{ $t('advancedFilter.validateAllTreesTooltip') }}
        </q-tooltip>
      </q-btn>
    </div>
    <div class="col-2">
      <q-btn 
        v-if="isLoggedIn && !blindAnnotationMode" 
        outline 
        :disable="pendingModifications.size === 0" 
        color="primary" 
        :label="$t('advancedFilter.savePendingTrees')" 
        @click="saveAllTrees()"
      >
        <q-badge v-if="pendingModifications.size > 0" color="red" floating>
          {{ pendingModifications.size }}
        </q-badge>
      </q-btn>
    </div>
  </div>
  <div class="q-pa-md">
    <div class="row text-h6">
      {{ $t('advancedFilter.advancedFilter') }}
      <q-space />
      <q-btn flat color="primary" @click="clearAll()">{{ $t('advancedFilter.clearAll') }}</q-btn>
    </div>
    <div v-for="(filter, index) in listFilters">
      <div class="row q-gutter-md q-pt-md">
        <div class="col-6">
          <q-select
            outlined
            dense
            v-model="filter.setUsers"
            multiple
            :options="userIds"
            use-chips
            stack-label
            :label="$t('advancedFilter.usersSelect')"
          />
        </div>
        <q-btn-dropdown outline split color="primary" :label="filter.operator.label">
          <q-list v-for="operator of filterOperators">
            <q-item clickable @click="filter.operator = operator">
              <q-item-section>{{ operator.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn-dropdown outline split color="primary" :label="filter.choice.label">
          <q-list v-for="choice of filterChoices">
            <q-item clickable @click="filter.choice = choice">
              <q-item-section>{{ choice.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-select
          v-if="filter.choice.val == 'diff'"
          class="col-2"
          dense
          outlined
          v-model="filter.diffSetFeatures"
          multiple
          :options="featuresSet"
          use-chips
          stack-label
          :label="$t('grewSearch.showDiffFaturesSelect')"
        >
          <q-tooltip>{{ $t('grewSearch.showDiffFeaturesTooltip') }}</q-tooltip>
        </q-select>
        <q-btn v-if="index != 0" outline class="col-1" color="primary" icon="delete" @click="removeRow(index)" />
        <q-btn v-if="index == listFilters.length - 1 && index < 3" outline class="col-1" color="primary" icon="add" @click="addRow()" />
      </div>
    </div>
    <div class="q-pt-md text-body1">
      <span
        >{{ Object.keys(filteredTrees).length }} trees
        <q-tooltip>{{ numberOfTreesPerUser }}</q-tooltip>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { useTagsStore } from 'src/pinia/modules/tags';
import { useTreesStore } from 'src/pinia/modules/trees';
import { useUserStore } from 'src/pinia/modules/user';
import { notifyError, notifyMessage } from 'src/utils/notify';

import { defineComponent, PropType } from 'vue';
import { api } from 'src/boot/axios';
import Breadcrumbs from 'src/layouts/Breadcrumbs.vue';

interface filter_t {
  setUsers: string[];
  operator: element_t;
  choice: element_t;
  diffSetFeatures: string[];
}
interface element_t {
  val: string;
  label: string;
}

export default defineComponent({
  name: 'AdvancedFilter',
  emits: ['trees-saved'],
  components: {
    Breadcrumbs,
  },
  props: {
    parentOnValidate: {
      type: Function as PropType<CallableFunction>,
      required: true,
    }
  },
  data() {
    const filterOperators: element_t[] = [
      { val: 'have', label: this.$t('advancedFilter.filterOperators[0]') },
      { val: 'not_have', label: this.$t('advancedFilter.filterOperators[1]') },
    ];
    const filterChoices: element_t[] = [
      { val: 'tree', label: this.$t('advancedFilter.filterChoices[0]') },
      { val: 'diff', label: this.$t('advancedFilter.filterChoices[1]') },
    ];
    const listFilters: filter_t[] = [];
   
    return {
      selectedUsers: [],
      filterChoices,
      filterOperators,
      listFilters,
      order: 'initial',
      orderOptions: ['initial', 'ascending', 'descending'],
    };
  },
  computed: {
    ...mapState(useProjectStore, ['featuresSet', 'name', 'config', 'blindAnnotationMode']),
    ...mapState(useTreesStore, ['trees', 'filteredTrees', 'numberOfTreesPerUser', 'numberOfTrees', 'userIds', 'sortedSentIds']),
    ...mapState(useTagsStore, ['userTags']),
    ...mapWritableState(useTreesStore, [
      'textFilter',
      'sentIdFilter',
      'usersToHaveTree',
      'usersToNotHaveTree',
      'usersToHaveDiffs',
      'usersToNotHaveDiffs',
      'featuresSetForDiffs',
      'featuresSetForNotDiffs',
      'selectedTags',
      'pendingModifications'
    ]),
    ...mapState(useUserStore, ['isLoggedIn']),
    sampleName() {
      return this.$route.params.samplename as string;
    },
  },
  mounted() {
    this.clearAll();
  },
  methods: {
    ...mapActions(useTreesStore, ['applyFilterTrees', 'getUsersTags', 'orderFilteredTrees', 'emptyPendingModification']),
    applyAdvancedFilter() {
      this.initializeFilters();
      for (const filter of this.listFilters) {
        if (filter.choice.val === 'tree' && filter.operator.val === 'have') {
          this.usersToHaveTree = filter.setUsers;
        }
        if (filter.choice.val === 'tree' && filter.operator.val === 'not_have') {
          this.usersToNotHaveTree = filter.setUsers;
        }
        if (filter.choice.val === 'diff' && filter.operator.val === 'have') {
          this.usersToHaveDiffs = filter.setUsers;
          this.featuresSetForDiffs = filter.diffSetFeatures;
        }
        if (filter.choice.val === 'diff' && filter.operator.val === 'not_have') {
          this.usersToNotHaveDiffs = filter.setUsers;
          this.featuresSetForNotDiffs = filter.diffSetFeatures;
        }
      }
      this.applyFilterTrees();
    },
    clearAll() {
      this.textFilter = '';
      this.initializeFilters();
      this.applyFilterTrees();
      this.listFilters = [];
      this.addRow();
    },
    addRow() {
      this.listFilters.push({
        setUsers: [],
        operator: this.filterOperators[0],
        choice: this.filterChoices[0],
        diffSetFeatures: [],
      });
    },
    removeRow(index: number) {
      this.listFilters.splice(index, 1);
    },
    initializeFilters() {
      this.usersToHaveTree = [];
      this.usersToNotHaveTree = [];
      this.usersToNotHaveDiffs = [];
      this.usersToHaveDiffs = [];
      this.featuresSetForDiffs = [];
      this.featuresSetForNotDiffs = [];
    },
    saveAllTrees() {
      const data = {
        conllGraph: [...this.pendingModifications.values()].map((sentence) => sentence.conll).join('\n\n')
      };
      api
        .saveAllTrees(this.name, this.sampleName, data)
        .then(() => {
          notifyMessage({ position: 'top', message: 'Saved on the server', icon: 'save' });
          this.emptyPendingModification();
          this.$emit('trees-saved');
        })
        .catch((error) => {
          notifyError({ error: `Error happened while saving trees ${error}` });
        });
    },
    validateAllTrees() {
      this.parentOnValidate();
    }
  },
});
</script>
