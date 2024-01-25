<template>
  <q-dialog v-model="showHistoryDial" full-width persistent>
    <q-card style="min-width: 50vw">
      <q-bar class="bg-primary text-white sticky-bar">
        <q-space />
        <q-btn v-close-popup flat dense icon="close" @click="closeDial()" />
      </q-bar>
      <q-card-section>
          <div class="row q-gutter-md">
            <div class="col-8">
              <q-input dense outlined v-model="search" label="Search in the history">
                <template #append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col">
              <q-select
                dense
                outlined
                v-model="historyType"
                :options="['All', 'Search', 'Rewrite']"
                label="Select category"          
              >
              </q-select>
            </div>
          </div>
        </q-card-section>
        <q-card-section v-if="filteredHistory.length > 0">
          <div class="row" style="justify-content: right;">
            <q-btn flat no-caps color="primary" icon="delete" label="Delete history"></q-btn>
          </div>
          <q-list v-for="record in filteredHistory" bordered separator class="custom-frame2">
            <q-item>
              <q-item-section top avatar>
                <q-item-label caption> {{ formatDate(record.date) }}</q-item-label>
                <q-checkbox v-model="val" />
              </q-item-section>
              <q-item-section>
                <GrewCodeMirror v-model:value="record.request" :disabled="true" :line-numbers="false"></GrewCodeMirror>
              </q-item-section>
              <q-item-section side top>
                <q-item-label v-if="record.type === 'rewrite'" caption>
                  {{ record.modified_sentences }} modified sentences
                </q-item-label>
                <q-item-label v-else caption>
                  No modified sentence
                </q-item-label>

                <q-toggle v-model="record.favorite" color="primary" checked-icon="star" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section v-else>
          No history in this project
        </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">

import GrewCodeMirror from '../codemirrors/GrewCodeMirror.vue';

import { mapActions, mapState } from 'pinia';
import { useGrewHistoryStore } from 'src/pinia/modules/grewHistory';
import { useProjectStore } from 'src/pinia/modules/project';
import { grewHistoryRecord_t } from 'src/api/backend-types';
import { defineComponent} from 'vue';

export default defineComponent({
  components: {
    GrewCodeMirror
  },
  name: 'GrewHistory',
  data() {
      return {
        showHistoryDial: true,
        search: '',
        historyType: 'All',
        val: false
      };
  },
  computed: {
    ...mapState(useGrewHistoryStore, ['grewHistory', 'rewriteHistory', 'searchHistory']),
    ...mapState(useProjectStore, ['name']),
    filteredHistory(): grewHistoryRecord_t[]  {
      if (this.historyType === 'Search') {
        return this.searchHistory;
      }
      if (this.historyType === 'Rewrite') {
        return this.rewriteHistory;
      }
      return this.grewHistory;
    }
  },
  mounted() {
    this.getHistory();
  },
  methods: {
    ...mapActions(useGrewHistoryStore, ['getHistory']),
    formatDate(timestamp: number) {
      return new Date(timestamp).toLocaleString('en-GB', { hour12: false });
    },
    closeDial() {
      this.$emit('closed');
    },
  },
});
</script>
<style>

</style>
