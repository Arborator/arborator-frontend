<template>
  <q-table
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
    table-style="max-height:80vh"
    row-key="sample_name"
    hide-no-data
    :pagination="table.pagination"
    @update:selected="getSelectedSamples()"
  >
    <template #top-right>
      <q-input v-model="table.filter" dense debounce="300" :placeholder="$t('projectView.search')" text-color="blue-grey-8">
        <template #append>
          <q-icon name="search" />
        </template>
        <q-tooltip :delay="300" content-class="text-white bg-primary">
          {{ $t('projectView.tooltipSearch') }}
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
            :disable="freezed && isOwner"
            outline
            color="white"
            :text-color="$q.dark.isActive ? 'white' : 'black'"
            class="full-width"
            :to="'/projects/' + name + '/' + props.row.sample_name"
            no-caps
            >
            {{ props.row.sample_name }}
          </q-btn>
        </q-td>
        <q-td key="sentences" :props="props">{{ props.row.sentences }}</q-td>
        <q-td key="tokens" :props="props">{{ props.row.tokens }}</q-td>
        <q-td key="treesFrom" :props="props">
          <div v-if="Object.keys(props.row.treeByUser).length >= 5">
            {{ props.row.treesFrom.length }} users
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
  </template>
<script lang="ts">
import api from '../../api/backend-api';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { sample_t } from '../../api/backend-types';
import { table_t } from '../../types/main_types';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'ProjectTable',
  emits: ['selected-samples'],
  props: {
    parentUnselectSamples: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
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
          label: this.$t('projectView.tableFields[0]'),
          sortable: true,
          field: 'samplename',
        },
        {
          name: 'sentences',
          label: this.$t('projectView.tableFields[1]'),
          sortable: true,
          field: 'sentences',
        },
        {
          name: 'tokens',
          label: this.$t('projectView.tableFields[2]'),
          sortable: true,
          field: 'number_tokens',
        },
        {
          name: 'treesFrom',
          label: this.$t('projectView.tableFields[3]'),
          sortable: true,
          field: 'treesFrom',
        },
        {
          name: 'blindAnnotationLevel',
          label: this.$t('projectView.tableFields[4]'),
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
        rowsPerPage: 10,
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
    }
  },
  computed: {
    ...mapState(useProjectStore, [
      'name',
      'isAdmin',
      'freezed', 
      'isOwner', 
      'blindAnnotationMode'
    ]),
  },
  watch: {
    parentUnselectSamples(newVal) {
      if(newVal) {
        this.table.selected = [];
        this.getSelectedSamples();
      }
    }
  },
  methods: {
    getSelectedSamples() {
      this.$emit('selected-samples', this.table.selected);
    },
    searchSamples(rows: sample_t[], terms: any) {
      return rows.filter((row) => row.sample_name.toLowerCase().indexOf(terms.toLowerCase) !== -1);
    },
    updateBlindAnnotationLevel(sample: sample_t) {
      setTimeout(() => {
        // IMPORTANT : Since quasar v2 (vue v3), the update method (in q-select) occurs BEFORE the value is updated
        // So we need to use this hack of setTimeout if we want to access to the updated sample.blindAnnotationLevel
        api
          .updateSampleBlindAnnotationLevel(this.name, sample.sample_name, sample.blindAnnotationLevel)
          .then(() => {
            notifyMessage({ message: 'The new blind annotation level was correctly saved in the server' });
          })
          .catch((error) => {
            notifyError({ error });
          });
      }, 0);
    },
  }
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
