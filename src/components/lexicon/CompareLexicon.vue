<template>
  <div class="table">
    <q-table
      ref="table"
      :key="tableKey"
      v-model:selected="table.selected"
      title="Dictionaries"
      :class="($q.dark.isActive ? 'my-sticky-header-table-dark' : 'my-sticky-header-table') + ' rounded-borders'"
      :rows="data"
      :columns="table.fields"
      row-key="key"
      :v-model:pagination="table.pagination"
      :filter="table.filter"
      binary-state-sort
      :rows-per-page-options="[0]"
      :visible-columns="table.visibleColumns"
      :table-header-class="$q.dark.isActive ? 'text-white' : 'text-primary'"
      virtual-scroll
      card-class="shadow-8"
      selection="multiple"
      table-style="max-height:80vh"
    >
      <template #top-right>
        <q-btn color="default" flat label="Rule Grew" @click="changeLexicon()"
          ><q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipRuleGrewLexicon') }}</q-tooltip></q-btn
        >
        <q-input v-model="table.filter" borderless dense debounce="300" placeholder="Search">
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template #body-cell="props">
        <td v-if="props.row.type === 'In the two dictionaries with the same information'" style="background: mediumseagreen">
          {{ props.value }}
        </td>
        <td v-else-if="props.row.type === 'In the two dictionaries with different information'" style="background: orange">
          {{ props.value }}
        </td>
        <td v-else-if="props.row.type === 'Identical form in both dictionaries with different information'" style="background: orange">
          {{ props.value }}
        </td>
        <td v-else-if="props.row.type === 'Only in the old dictionary'" style="background: #7ef0cc">
          {{ props.value }}
        </td>
        <td v-else-if="props.row.type === 'Only in the imported dictionary'" style="background: #faa5cb">
          {{ props.value }}
        </td>
      </template>
    </q-table>
    <q-dialog v-model="searchDialog" seamless position="right" full-width>
      <template v-if="!(exerciseMode && !isTeacher)">
        <GrewSearch :sentence-count="data.length" :sample-id="sampleId" :show-table="searchDialog" />
      </template>
    </q-dialog>

    <!-- :totalsents="project.infos.number_sentences" -->
  </div>
</template>

<script lang="ts">
import api from '../../api/backend-api';
import GrewSearch from '../grewSearch/GrewSearch.vue';
import grewTemplates from '../../assets/grew-templates.json';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { grew_templates_t, table_t } from 'src/types/main_types';

interface CompareLexiconItem_t {
  toChange: string;
  features: unknown;
  lemma: string;
  form: string;
  POS: string;
  gloss: string;
}

export default {
  name: 'CompareLexicon',
  components: { GrewSearch },
  props: ['data', 'sampleId'],
  component: {
    GrewSearch,
  },
  data() {
    const table: table_t<CompareLexiconItem_t> = {
      fields: [
        {
          name: 'form',
          label: 'Form',
          sortable: true,
          align: 'left',
          field: 'form',
        },
        {
          name: 'lemma',
          label: 'Lemma',
          sortable: true,
          align: 'left',
          field: 'lemma',
        },
        {
          name: 'pos',
          label: 'POS',
          sortable: true,
          align: 'left',
          field: 'POS',
        },
        {
          name: 'features',
          label: 'Features',
          sortable: true,
          align: 'left',
          field: 'features',
        },
        {
          name: 'gloss',
          label: 'Gloss',
          sortable: true,
          align: 'left',
          field: 'gloss',
        },
        {
          name: 'key',
          label: 'Key',
          sortable: true,
          align: 'left',
          field: 'key',
        },
        {
          name: 'type',
          label: 'Type',
          sortable: true,
          align: 'left',
          field: 'type',
        },
        {
          name: 'toChange',
          label: 'Difference',
          sortable: true,
          align: 'left',
          field: 'toChange',
        },
      ],
      visibleColumns: ['form', 'lemma', 'pos', 'features', 'gloss', 'type', 'toChange'],
      filter: '',
      pagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 10,
      },
      selected: [],
      loading: false,
      loadingDelete: false,
    };
    const queries: grew_templates_t = grewTemplates as grew_templates_t;

    return {
      table,
      RulesApplied: false,
      queries,
      featCheck: false,
      currentinfo: '',
      infotochange: '',
      searchDialog: false,
      resultSearchDialog: false,
      resultSearch: {},

      tableKey: 0,
      alerts: {
        noRuletoApply: { color: 'negative', message: 'No rule to apply' },
        onlyDifference: {
          color: 'negative',
          message: 'Select only those who have a difference',
        },
      },
    };
  },
  computed: {
    ...mapState(useProjectStore, ['exerciseMode', 'isTeacher']),
  },
  methods: {
    changeLexicon() {
      const RulesGrew = [];
      if (this.table.selected.length === 0) {
        for (let i = 0; i < this.data.length; i += 1) {
          if (this.data[i].toChange !== '_' && this.data[i].toChange) {
            this.table.selected.push(this.data[i]);
          }
        }
      } else {
        for (let i = 0; i < this.table.selected.length; i += 1) {
          if (this.table.selected[i].toChange === '_' || !this.table.selected[i].toChange) {
            this.featCheck = true;
          }
        }
      }
      if (this.featCheck === false) {
        for (let i = 0; i < this.table.selected.length; i += 1) {
          if (this.table.selected[i].features === '_') {
            this.currentinfo = `${this.table.selected[i].form} ${this.table.selected[i].lemma} ${this.table.selected[i].POS} ${this.table.selected[i].gloss} _`;
          } else {
            this.currentinfo = `${this.table.selected[i].form} ${this.table.selected[i].lemma} ${this.table.selected[i].POS} ${this.table.selected[i].gloss} ${this.table.selected[i].features}`;
          }
          this.infotochange = this.table.selected[i].toChange;
          RulesGrew.push({
            currentInfo: this.currentinfo,
            info2Change: this.infotochange,
          });
        }
        this.getRulesGrew(RulesGrew);
      } else {
        this.$q.notify({ message: 'only difference' });
      }
      this.featCheck = false;
    },

    getRulesGrew(RulesGrew: { currentInfo: string; info2Change: string }[]) {
      if (RulesGrew.length !== 0) {
        let listSampleIds = '';
        for (const i in this.sampleId as number[]) {
          // if (i < this.sampleId.length - 1) {
          //   listSampleIds += `${this.sampleId[i].sample_name}, `;
          // } else {
          listSampleIds += this.sampleId[i].sample_name;
          // }
        }
        const datasample = { data: RulesGrew };
        api.transformation_grew(this.$route.params.projectname as string, datasample).then((response) => {
          if (this.queries.slice(-1)[0].name !== 'Correct lexicon') {
            this.queries.push({
              name: 'Correct lexicon',
              pattern: response.data.rules,
              commands: ' ',
              sampleIds: listSampleIds,
            });
          } else {
            this.queries.slice(-1)[0].pattern = response.data.rules;
            this.queries.slice(-1)[0].commands = ' ';
            this.queries.slice(-1)[0].sampleIds = listSampleIds;
          }
        });
        this.searchDialog = true;
      } else {
        this.$q.notify({ message: 'No rule to apply' });
      }
    },
  },
};
</script>
