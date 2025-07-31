<template>
  <q-table
    bordered
    flat
    :key="tableKey"
    v-model:selected="table.selected"
    :class="($q.dark.isActive ? 'my-sticky-header-table-dark' : 'my-sticky-header-table') + ' rounded-borders'"
    :rows="samples"
    :columns="table.fields"
    :loading="table.loading"
    loading-label="loading"
    :filter="table.filter"
    :filter-method="searchSamples"
    binary-state-sort
    :visible-columns="blindAnnotationMode ? table.visibleColumnsBlindAnnotationMode : table.visibleColumns"
    selection="multiple"
    :table-header-class="$q.dark.isActive ? 'text-white' : 'text-primary'"
    virtual-scroll
    row-key="sampleName"
    hide-no-data
    :pagination="table.pagination"
    @update:selected="getSelectedSamples()"
  >
    <template #top-right>
      <q-input v-model="table.filter" dense debounce="300" :placeholder="$t('projectTable.search')" text-color="blue-grey-8">
        <template #append>
          <q-icon name="search" />
        </template>
        <q-tooltip :delay="300" content-class="text-white bg-primary">
          {{ $t('projectTable.tooltipSearch') }}
        </q-tooltip>
      </q-input>
    </template>

    <template #body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <q-checkbox v-model="props.selected" dense />
        </q-td>
        <q-td key="samplename" :props="props">
          <q-btn
            :disable="freezed && !isOwner"
            outline
            color="white"
            :text-color="$q.dark.isActive ? 'white' : 'black'"
            class="full-width"
            :to="'/projects/' + name + '/' + props.row.sampleName"
            no-caps
          >
            {{ props.row.sampleName }}
            <q-menu
              context-menu
              touch-position
            > 
              <q-list>
                <q-item v-close-popup clickable @click="showRenameSampleDial(props.row.sampleName)">
                  <q-item-section>Rename sample</q-item-section>
                  <q-item-section side>
                    <q-icon name="edit" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-td>
        <q-td key="sentences" :props="props">{{ props.row.sentences }}</q-td>
        <q-td key="tokens" :props="props">{{ props.row.tokens }}</q-td>
        <q-td key="treesFrom" :props="props">
          <div v-if="Object.keys(props.row.treeByUser).length >= 5">
            {{ props.row.treesFrom.length }} {{ $t('projectTable.users') }}
            <q-tooltip>
              <p v-for="(nSentences, userId) in props.row.treeByUser" :key="userId" :props="userId">{{ userId }} ({{ nSentences }})</p>
            </q-tooltip>
          </div>
          <div v-else>
            <div v-for="(nSentences, userId) in props.row.treeByUser" :key="userId" :props="userId">{{ userId }} ({{ nSentences }})</div>
          </div>
        </q-td>
        <q-td key="blindAnnotationLevel" :props="props">
          <q-select
            v-model="props.row.blindAnnotationLevel"
            outlined
            :options="blindAnnotationModeOptions"
            map-options
            emit-value
            label="Blind annotation model"
            :dense="false"
            :disable="!isAdmin"
            @update:model-value="updateBlindAnnotationLevel(props.row)"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <q-dialog v-model="isShowRenameDial">
   <RenameSample :sample-name="selectedSample" /> 
  </q-dialog>
</template>
<script lang="ts">
import api from 'src/api/backend-api';
import { sample_t } from 'src/api/backend-types';
import { table_t } from 'src/types/main_types';
import RenameSample from 'src/components/project/RenameSample.vue';

import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

export default defineComponent({
  name: 'ProjectTable',
  components: {
    RenameSample,
  },
  emits: ['selected-samples'],
  props: {
    samples: {
      type: Array as PropType<sample_t[]>,
      required: true,
    },
  },
  data() {
    const selected: sample_t[] = [];
    const table: table_t<sample_t> = {
      fields: [
        {
          name: 'samplename',
          label: this.$t('projectTable.tableFields[0]'),
          sortable: true,
          field: 'samplename',
        },
        {
          name: 'sentences',
          label: this.$t('projectTable.tableFields[1]'),
          sortable: true,
          field: 'sentences',
        },
        {
          name: 'tokens',
          label: this.$t('projectTable.tableFields[2]'),
          sortable: true,
          field: 'number_tokens',
        },
        {
          name: 'treesFrom',
          label: this.$t('projectTable.tableFields[3]'),
          sortable: true,
          field: 'treesFrom',
        },
        {
          name: 'blindAnnotationLevel',
          label: this.$t('projectTable.tableFields[4]'),
          sortable: true,
          field: 'blindAnnotationLevel',
        },
      ],
      selected,
      visibleColumns: ['samplename', 'treesFrom', 'tokens', 'sentences'],
      visibleColumnsBlindAnnotationMode: ['samplename', 'blindAnnotationLevel', 'treesFrom', 'tokens', 'sentences'],
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'samplename',
        descending: true,
        page: 1,
        rowsPerPage: 50,
      },
      loadingDelete: false,
      exporting: false,
    };
    return {
      selected,
      table,
      tableKey: 0,
      blindAnnotationModeOptions: [
        {
          label: '1: validated_visible',
          value: 1,
        },
        {
          label: '2: local_feedback',
          value: 2,
        },
        {
          label: '3: global_feedback',
          value: 3,
        },
        {
          label: '4: no_feedback',
          value: 4,
        },
      ],
      isShowRenameDial: false,
      selectedSample: '',
    };
  },
  computed: {
    ...mapState(useProjectStore, ['name', 'isAdmin', 'freezed', 'isOwner', 'blindAnnotationMode']),
  },
  watch: {
    samples(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.getSelectedSamples();
      }
    },
  },
  methods: {
    getSelectedSamples() {
      this.$emit('selected-samples', this.table.selected);
    },
    searchSamples(rows: sample_t[], terms: any) {
      return rows.filter((row) => row.sampleName.toLowerCase().indexOf(terms.toLowerCase()) !== -1);
    },
    updateBlindAnnotationLevel(sample: sample_t) {
      setTimeout(() => {
        // IMPORTANT : Since quasar v2 (vue v3), the update method (in q-select) occurs BEFORE the value is updated
        // So we need to use this hack of setTimeout if we want to access to the updated sample.blindAnnotationLevel
        api
          .updateSampleBlindAnnotationLevel(this.name, sample.sampleName, sample.blindAnnotationLevel)
          .then(() => {
            notifyMessage({ message: 'The new blind annotation level was correctly saved in the server' });
          })
          .catch((error) => {
            notifyError({ error, caller: 'updateBlindAnnotationLevel' });
          });
      }, 0);
    },
    showRenameSampleDial(sampleName: string) {
      this.isShowRenameDial = true;
      this.selectedSample = sampleName;
    }
  },
});
</script>
<style scoped lang="stylus">
.my-sticky-header-table {
  /* max height is important */
  .q-table__middle {
    max-height: 70vh;
    min-height: 20vh;
  }

  .q-table__top, .q-table__bottom, thead tr:first-child th { /* bg color is important for th; just specify one */
    background-color: $grey-1; /* #eeeeee */
  }

  thead tr:first-child th {
    position: sticky;
    top: 0;
    opacity: 1;
    z-index: 2;
  }
}
.q-table__bottom {
  display: flex;
  align-items: center;
  justify-content: center;
}

.my-sticky-header-table-dark {
  /* max height is important */
  .q-table__middle {
    max-height: 70vh;
    min-height: 20vh;
  }

  .q-table__top, .q-table__bottom, thead tr:first-child th { /* bg color is important for th; just specify one */
    background-color: #1d1d1d;
  }

  thead tr:first-child th {
    position: sticky;
    top: 0;
    opacity: 1;
    z-index: 2;
  }
}
</style>
