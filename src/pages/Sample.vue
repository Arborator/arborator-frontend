<template>
  <q-splitter
    v-model="splitterModel"
    horizontal
    :limits="[0, 100]"
    :style="{height: `${splitterHeight}px`}"
    emit-immediately
  >
    <template v-slot:before>
      <div class="row q-pa-md">
        <div class="col-8">
          <q-input v-model="textFilter" label="Text filter" outlined dense color="primary"></q-input>
        </div>
        <div class="col-3 q-px-md q-gutter-md">
          <q-select 
            outlined 
            dense 
            v-model="selectedTags" 
            use-chips
            multiple 
            option-value="value" 
            label="Tags" 
            :options="defaultTags" 
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
        <div>
          <q-btn @click="applyFilter" color="primary">Apply filter</q-btn>
        </div>
      </div>      
      <div class="q-pa-md">
        <div class="row text-h6">
         Advanced filters
          <q-space/>
          <q-btn flat color="primary" @click="clearAll()">clear all</q-btn>
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
                label="Select set of users"
              />
            </div>
            <q-btn-dropdown outline split color="primary" :label="filter.operator">
              <q-list v-for="value of filterOperators">
                <q-item clickable @click="filter.operator = value">
                  <q-item-section>{{ value }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-btn-dropdown outline split color="primary" :label="filter.choice">
              <q-list v-for="value of filterChoices">
                <q-item clickable @click="filter.choice = value">
                  <q-item-section>{{ value }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-btn v-if="index != 0" outline class="col-1" color="primary" icon="delete" @click="removeRow(index)" />
            <q-btn v-if="index == listFilters.length-1 && index < 3 " outline class="col-1" color="primary" icon="add" @click="addRow()" />
          </div>
        </div>
        <q-select
          dense
          outlined
          class="q-pt-md"
          v-model="featuresSetForDiffs"
          multiple
          :options="featuresSet"
          use-chips
          stack-label
          :label="$t('grewSearch.showDiffFaturesSelect')"
        >
          <q-tooltip>{{ $t('grewSearch.showDiffFeaturesTooltip') }}</q-tooltip>
        </q-select> 
        <div class="q-pt-md text-body1">
          <span>{{ Object.keys(filteredTrees).length }} trees  
          <q-tooltip>{{numberOfTreesPerUser}}</q-tooltip> 
          </span>     
        </div>
      </div>
    </template>
    <template v-slot:after>
      <div class="custom-frame1">
        <div v-show="!loading">
          <q-virtual-scroll
            :key="filteredTrees.length.toString() + Object.keys(filteredTrees).join('')"
            ref="virtualListRef"
            :items="Object.values(filteredTrees)"
            :style="{maxHeight: `${splitterHeight * ((100 - splitterModel)/100) - 1}px`, width: '100%'}"
            :virtual-scroll-slice-size="50"
            :virtual-scroll-item-size="70"
          >
            <template #default="{ item, index }">
              <SentenceCard
                :key="samplename + item.sent_id"
                :sentence="item"
                :index="index"
                search-result=""
                :blind-annotation-level="blindAnnotationLevel"
                @reload="getSampleTrees"
              >
              </SentenceCard>
            </template>
          </q-virtual-scroll>
        </div>
        <div v-show="loading" class="q-pa-md row justify-center">
          <div class="absolute-center">
            <q-circular-progress indeterminate size="70px" :thickness="0.22" color="primary" track-color="grey-3"/>
          </div>
        </div>

        <GrewSearch :user-ids="userIds" :sentence-count="numberOfTrees" :search-scope="samplename"/>
        <RelationTableMain :sampleName="samplename"/>
      </div>
    </template>
  </q-splitter>
</template>

<script lang="ts">
import {LocalStorage, QVirtualScroll} from 'quasar';

import SentenceCard from '../components/sentence/SentenceCard.vue';
import GrewSearch from '../components/grewSearch/GrewSearch.vue';
import RelationTableMain from '../components/relationTable/RelationTableMain.vue';
import {mapActions, mapState, mapWritableState} from 'pinia';
import {useProjectStore} from 'src/pinia/modules/project';
import {useGrewSearchStore} from 'src/pinia/modules/grewSearch';
import {useTagsStore} from 'src/pinia/modules/tags';
import {PropType, defineComponent} from 'vue';
import {useTreesStore} from "src/pinia/modules/trees";

export default defineComponent({
  components: {
    SentenceCard,
    GrewSearch,
    RelationTableMain,
  },
  beforeRouteLeave(to, from, next) {
    if (this.pendingModifications.size > 0) {
      const answer = window.confirm('Do you really want to leave? you have unsaved changes!');
      if (answer) {
        this.emptyPendingModification();
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
  props: {
    projectname: {
      type: String as PropType<string>,
      required: true,
    },
    samplename: {
      type: String as PropType<string>,
      required: true,
    },
  },
  data() { 
    const splitterModel: number = 10; 
    const splitterHeight: number = 0; 
    const filterOperators: string[] = ['Have', 'Not Have'];
    const filterChoices: string[] = ['Trees', 'Differences'];
    const listFilters: { setUsers: string[], operator: string, choice: string} [] = [];
    return {
      selectedUsers: [],
      filterChoices,
      filterOperators,
      splitterModel,
      splitterHeight,
      listFilters,
    }
  },
  computed: {
    ...mapState(useProjectStore, ['blindAnnotationMode', 'isValidator', 'featuresSet']),
    ...mapState(useGrewSearchStore, ['pendingModifications']),
    ...mapState(useTreesStore, ["trees", "filteredTrees", "loading", "numberOfTreesPerUser","numberOfTrees", "userIds", "blindAnnotationLevel"]),
    ...mapState(useTagsStore, ["defaultTags"]),
    ...mapWritableState(useTreesStore, ["textFilter", "usersToHaveTree", "usersToNotHaveTree", "usersToHaveDiffs", "usersToNotHaveDiffs", "featuresSetForDiffs", "selectedTags"]),
  },
  created() {
    window.addEventListener('resize', this.calculateHeight);
  },
  mounted() {
    this.getSampleTrees({projectName: this.projectname, sampleName: this.samplename})
      .then(() => {
        this.scrollToIndexFromURL();
      });
    document.title = `${this.projectname}/${this.samplename}`;
    LocalStorage.remove('save_status');
    this.calculateHeight();
    this.listFilters.push(
      { setUsers: [], 
        operator: this.filterOperators[0], 
        choice: this.filterChoices[0],
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calculateHeight);
  },
  methods: {
    ...mapActions(useGrewSearchStore, ['emptyPendingModification']),
    ...mapActions(useTreesStore, ['getSampleTrees', 'applyFilterTrees', 'getUsersTags']),
    scrollToIndexFromURL() {
      if (
        !this.loading &&
        this.$refs &&
        this.$refs.virtualListRef &&
        this.$route.params.nr !== undefined
        // parseInt(this.$route.params.nr as string, 10) <= this.numberOfTrees
      ) {
        const sendId = this.$route.params.nr as string;
        const nrAsInt = parseInt(this.$route.params.nr as string, 10) - 1;
        const indexInValues = Object.values(this.trees).findIndex((tree) => tree.sent_id === sendId);
        const indexForScroll = indexInValues !== -1 ? indexInValues : nrAsInt;
        (this.$refs.virtualListRef as QVirtualScroll).scrollTo(indexForScroll, 'start-force');
      }
    },
    calculateHeight(): void {
      const header = document.getElementById('main-header');
      if (header !== null) {
        this.splitterHeight = window.innerHeight - header.offsetHeight;
      } else {
        console.log("We didn't find the header, we will consider a header size of 35")
        this.splitterHeight = window.innerHeight - 35;
      }
    },
    applyFilter(){
      for(const filter of this.listFilters){
        if(filter.choice === 'Trees' && filter.operator === 'Have') {
          this.usersToHaveTree = filter.setUsers;
        }
        if(filter.choice === 'Trees' && filter.operator === 'Not Have') {
          this.usersToNotHaveTree = filter.setUsers;
        }
        if(filter.choice === 'Differences' && filter.operator === 'Have') {
          this.usersToHaveDiffs = filter.setUsers;
        }
        if(filter.choice === 'Differences' && filter.operator === 'Not Have') {
          this.usersToNotHaveDiffs = filter.setUsers;
        }
      }
      this.applyFilterTrees();
    },
    addRow() {
      this.listFilters.push({
        setUsers: [],
        operator: this.filterOperators[0],
        choice: this.filterChoices[0],
      })
    },
    removeRow(index: number){
      this.listFilters.splice(index, 1);
    },
    clearAll() {
      this.textFilter = '';
      this.usersToHaveTree = [];
      this.usersToNotHaveDiffs = [];
      this.usersToHaveDiffs = [];
      this.usersToNotHaveDiffs = [];
      this.selectedUsers = [];
      this.applyFilterTrees();
      this.listFilters = [];
      this.listFilters.push(
        { setUsers: [], 
          operator: this.filterOperators[0], 
          choice: this.filterChoices[0],
      });
    },
  },

});
</script>
