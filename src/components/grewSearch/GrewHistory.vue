<template>
  <q-dialog v-model="showHistoryDial" full-width persistent maximized>
    <q-card style="min-width: 50vw">
      <q-bar class="bg-primary text-white sticky-bar">
        <q-space />
        <q-btn v-close-popup flat dense icon="close" @click="closeDial()" />
      </q-bar>
      <q-card-section>
        <div class="row q-gutter-md">
          <div class="col-8">
            <q-input dense outlined v-model="filterRequest" :label="$t('grewHistory.searchLabel')">
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
              :options="historyTypes"
              option-value="value"
              option-label="label"
              :label="$t('grewHistory.selectLabel')"
            >
            </q-select>
          </div>
        </div>
      </q-card-section>
      <q-card-section v-if="filteredHistory.length > 0">
        <div class="row" style="justify-content: right">
          <q-btn flat no-caps color="primary" icon="delete" :label="$t('grewHistory.deleteHistory')" @click="triggerConfirm(deleteAllHistory)">
            <q-tooltip>
              {{ $t('grewHistory.deleteTooltip') }}
            </q-tooltip>
          </q-btn>
        </div>
        <q-scroll-area style="height: 80vh">
          <q-list v-for="record in filteredHistory" bordered separator class="custom-frame2">
            <q-item>
              <q-item-section top avatar>
                <q-item-label caption> {{ formatDate(record.date) }}</q-item-label>
                <q-item-label v-if="record.type === 'rewrite'" caption>
                  {{ record.modified_sentences }} {{ $t('grewHistory.modifiedSentences') }}
                </q-item-label>
                <q-item-label v-else caption> {{ $t('grewHistory.noModifiedSentences') }} </q-item-label>
                <q-toggle v-model="record.favorite" color="primary" checked-icon="star" @update:model-value="updateHistoryFavorites(record)">
                  <q-tooltip v-if="!record.favorite">
                    {{ $t('grewHistory.favoriteTooltip[0]') }}
                  </q-tooltip>
                  <q-tooltip v-else>
                    {{ $t('grewHistory.favoriteTooltip[1]') }}
                  </q-tooltip>
                </q-toggle>
              </q-item-section>
              <q-item-section>
                <GrewCodeMirror v-model:value="record.request" :disabled="true" :line-numbers="false"></GrewCodeMirror>
              </q-item-section>
              <q-item-section side>
                <q-btn flat icon="content_copy" color="primary" @click="copyRequest(record)">
                  <q-tooltip>
                    {{ $t('grewHistory.copyTooltip') }}
                  </q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-card-section>
      <q-card-section v-else> {{ $t('grewHistory.noSearchResults') }} </q-card-section>
      <q-dialog v-model="confirmDelete">
        <ConfirmAction :parent-action="confirmActionCallback" :target-name="name"></ConfirmAction>
      </q-dialog>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia';
import { grewHistoryRecord_t } from 'src/api/backend-types';
import { useGrewHistoryStore } from 'src/pinia/modules/grewHistory';
import { useProjectStore } from 'src/pinia/modules/project';
import { notifyMessage } from 'src/utils/notify';
import { defineComponent } from 'vue';

import ConfirmAction from '../ConfirmAction.vue';
import GrewCodeMirror from '../codemirrors/GrewCodeMirror.vue';

export default defineComponent({
  components: {
    GrewCodeMirror,
    ConfirmAction,
  },
  name: 'GrewHistory',
  data() {
    const historyTypes = [
      { value: 'all', label: this.$t('grewHistory.historyTypes[0]') },
      { value: 'search', label: this.$t('grewHistory.historyTypes[1]') },
      { value: 'rewrite', label: this.$t('grewHistory.historyTypes[2]') },
      { value: 'favorites', label: this.$t('grewHistory.historyTypes[3]') },
    ];
    const confirmActionCallback = null as unknown as CallableFunction;
    return {
      showHistoryDial: true,
      filterRequest: '',
      historyTypes,
      historyType: historyTypes[0],
      confirmDelete: false,
      confirmActionCallback,
    };
  },
  computed: {
    ...mapState(useGrewHistoryStore, ['grewHistory', 'rewriteHistory', 'searchHistory', 'favoriteHistory']),
    ...mapState(useProjectStore, ['name']),
    filteredHistory(): grewHistoryRecord_t[] {
      if (this.historyType.value == 'search') {
        return this.searchInHistory(this.searchHistory);
      }
      if (this.historyType.value == 'rewrite') {
        return this.searchInHistory(this.rewriteHistory);
      }
      if (this.historyType.value == 'favorites') {
        return this.searchInHistory(this.favoriteHistory);
      }
      return this.searchInHistory(this.grewHistory);
    },
  },
  mounted() {
    this.getHistory();
  },
  methods: {
    ...mapActions(useGrewHistoryStore, ['getHistory', 'updateHistory', 'deleteAllHistory']),
    formatDate(timestamp: number) {
      return new Date(timestamp).toLocaleString('en-GB', { hour12: false });
    },
    closeDial() {
      this.$emit('closed');
    },
    updateHistoryFavorites(historyRecord: grewHistoryRecord_t) {
      this.updateHistory(historyRecord.uuid, { favorite: historyRecord.favorite });
    },
    searchInHistory(history: grewHistoryRecord_t[]) {
      return history.filter((record) => {
        return record.request.toLowerCase().includes(this.filterRequest.toLowerCase());
      }, []);
    },
    copyRequest(record: grewHistoryRecord_t) {
      this.$emit('copied-request', record);
      notifyMessage({ message: 'Request copied' });
    },
    triggerConfirm(method: CallableFunction) {
      this.confirmDelete = true;
      this.confirmActionCallback = method;
    },
  },
});
</script>
<style></style>
