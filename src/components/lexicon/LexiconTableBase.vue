<template>
  <q-table
    v-bind="$attrs"
    ref="table"
    v-model:selected="table.selected"
    selection="multiple"
    :rows="passedLexiconItems"
    :row-key="(row) => row.key"
    :columns="table.columns"
    :visible-columns="table.visibleColumns"
    card-class="shadow-8"
    :key="tableKey"
    table-style="max-height:80vh"
    :rows-per-page-options="[50]"
    :loading="lexiconLoading"
    loading-label="loading"
    :filter="table.filter"
    binary-state-sort
    :class="($q.dark.isActive ? 'my-sticky-header-table-dark' : 'my-sticky-header-table') + ' rounded-borders'"
    :v-model:pagination="table.pagination"
    @row-click="onRowClick"
  >
    <!-- <template v-slot:body-cell="props">
        <td v-if="props.row.changed === 'replace'" style="background: mediumseagreen">
          {{ props.value }}
        </td>
        <td v-else-if="props.row.changed === 'add'" style="background: orange">
          {{ props.value }}
        </td>
        <td v-else-if="props.row.changed === 'delete'" style="background: #f34336">
          {{ props.value }}
        </td>
        <td v-else>{{ props.value }}</td>
      </template> -->
    <!-- <template v-slot:body-selection="scope">
        
      </template> -->
    <template #header-selection="scope">
      <q-checkbox v-model="scope.selected" />
    </template>

    <template #body-selection="scope">
      <q-checkbox v-model="scope.selected" />
    </template>

    <template #body-cell-form="props">
      <q-td key="form" :props="props">
        <q-badge color="green">
          {{ props.row.form }}
        </q-badge>
        <template v-if="compareWithBefore && lexiconItems.length >= 1">
          <br />
          <del>
            {{ myFilter(props.row).form }}
          </del>
        </template>
      </q-td>
    </template>

    <template #body-cell-pos="props">
      <q-td key="pos" :props="props">
        <q-badge color="red">
          {{ props.row.pos }}
        </q-badge>
        <template v-if="compareWithBefore && lexiconItems.length >= 1">
          <br />
          <del>
            {{ myFilter(props.row).pos }}
          </del>
        </template>
      </q-td>
    </template>

    <template #body-cell-lemma="props">
      <q-td key="lemma" :props="props">
        <q-badge color="brown">
          {{ props.row.lemma }}
        </q-badge>
        <template v-if="compareWithBefore && lexiconItems.length >= 1">
          <br />
          <del>
            {{ myFilter(props.row).lemma }}
          </del>
        </template>
      </q-td>
    </template>

    <template #body-cell-frequency="props">
      <q-td key="frequency" :props="props">
        <q-badge color="orange">
          {{ props.row.frequency }}
        </q-badge>
        <template v-if="compareWithBefore && lexiconItems.length >= 1">
          <br />
          <del>
            {{ myFilter(props.row).frequency }}
          </del>
        </template>
      </q-td>
    </template>

    <template #body-cell-gloss="props">
      <q-td key="gloss" :props="props">
        <q-badge color="blue">
          {{ props.row.gloss }}
        </q-badge>
        <template v-if="compareWithBefore && lexiconItems.length >= 1">
          <br />
          <del>
            {{ myFilter(props.row).gloss }}
          </del>
        </template>
      </q-td>
    </template>

    <template #body-cell-features="props">
      <q-td key="form" :props="props">
        <q-badge color="purple"> {{ computeFeatureStringWrapper(props.row.features) }} </q-badge>
      </q-td>
      <template v-if="compareWithBefore && lexiconItems.length >= 1">
        <br />
        <del>
          {{ computeFeatureStringWrapper(myFilter(props.row).form) }}
        </del>
      </template>
    </template>
    <template v-slot:top-right>
      <div>
        <q-input borderless dense debounce="300" v-model="table.filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input></div
    ></template>

    <!-- <template v-slot:body-cell="props">
        <td v-if="props.row.changed === 'replace'" style="background: mediumseagreen">
          {{ props.value }}
        </td>
        <td v-else-if="props.row.changed === 'add'" style="background: orange">
          {{ props.value }}
        </td>
        <td v-else-if="props.row.changed === 'delete'" style="background: #f34336">
          {{ props.value }}
        </td>
        <td v-else>{{ props.value }}</td>
      </template> -->
    <!-- Dynamically inherit slots from parent -->
    <template v-for="slot in parentSlots" #[slot]>
      <slot :name="slot" />
    </template>
  </q-table>
</template>

<script>
import { computed } from 'vue';
import { mapGetters } from 'vuex';
import { computeFeatureString } from './lexiconHelper';

export default {
  name: 'LexiconTable',
  setup(props, ctx) {
    const parentSlots = computed(() => Object.keys(ctx.slots));

    return { parentSlots };
  },
  props: ['passedLexiconItems', 'lexiconLoading', 'compareWithBefore'],
  computed: {
    ...mapGetters('lexicon', ['lexiconItems']),
  },
  data() {
    return {
      selected: [],
      openFeatures: false,
      tableExporting: false,
      currentword: null,
      someFeatureChanged: false,
      exporting: false,
      RulesGrew: [],
      currentinfo: null,
      tempfeat: '',
      infotochange: null,
      temp_features: '',
      indexfeat: 0,
      resultSearchDialog: false,
      // searchDialog: false,
      RulesApplied: false,
      uploadDial: false,
      maximizedUploadToggle: false,
      tsvOK: false,
      download: [],
      uploadLexicon: [],
      CompareDics: false,
      dics: [],
      featTable: {
        form: [],
        pos: [],
        featl: [],
        miscl: [],
        lemma: [],
        gloss: [],
        changed: null,
        columns: [
          {
            name: 'a',
            align: 'center',
            label: 'Attribute',
            field: 'a',
            sortable: true,
            style: 'width: 33%',
          },
          {
            name: 'v',
            label: 'Value',
            field: 'v',
            sortable: true,
          },
          {
            name: 'actions',
            label: 'Actions',
            field: '',
            align: 'center',
            style: 'width: 8%',
          },
        ],
      },
      options: {
        // attribute table dialog specific stuff
        annof: [], // = annotationFeatures from conf!!!
        annofFEATS: {}, // obj version (instead of list)
        annofMISC: {}, // obj version (instead of list)
        splitregex: '',
        relav: [],
        currentoptions: [],
        extendedrel: false,
        lemmaoptions: [{ name: 'Lemma', values: 'String' }],
        catoptions: [],
      },
      table: {
        columns: [
          {
            name: 'expand',
            label: 'expand',
            field: 'expand',
          },
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
            field: 'pos',
          },
          {
            name: 'features',
            label: 'Features',
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
            name: 'frequency',
            label: 'Frequency',
            sortable: true,
            align: 'left',
            field: 'frequency',
          },
        ],
        visibleColumns: ['form', 'lemma', 'pos', 'features', 'gloss', 'frequency'],
        filter: '',
        selected: [],
        loading: false,
        pagination: {
          sortBy: 'name',
          descending: false,
          page: 1,
          rowsPerPage: 10,
        },
        loadingDelete: false,
        exporting: false,
      },
      alerts: {
        noRuletoApply: { color: 'negative', message: 'No rule to apply' },
        noModification: { color: 'negative', message: 'No modification' },
        getRulegrewSuccess: { color: 'positive', message: 'got rule grew.' },
        onlyOneFile: { color: 'negative', message: 'One file is expected' },
        onlyTSVFile: { color: 'negative', message: 'TSV file is expected' },
      },
      uploadSample: {
        submitting: false,
        attachment: { name: null, file: null },
      },
      tableKey: 0,
    };
  },
  methods: {
    computeFeatureStringWrapper(featureObj) {
      return computeFeatureString(featureObj);
    },
    onRowClick(evt, row) {
      console.log('KK onRowClick', row);
      //   this.someFeatureChanged = false;
      //   this.infotochange = '';
      //   this.currentword = row.form;
      //   this.openFeatures = true;
      // const formattedItem = {};
      // formattedItem.form = [{ a: 'Form', v: row.form }];
      // formattedItem.lemma = [{ a: 'Lemma', v: row.lemma }];
      // formattedItem.pos = [{ a: 'POS', v: row.pos }];
      // formattedItem.gloss = [{ a: 'Gloss', v: row.gloss }];
      // formattedItem.features = [];
      // for (const keyValue of Object.entries(row.features)) {
      //   formattedItem.features.push({
      //     a: keyValue[0],
      //     v: keyValue[1],
      //   });
      // }

      this.$store.dispatch('lexicon/setLexiconModificationItem', row);
      //   this.featTable.changed = row.changed;
      //   if (row.features === '_') {
      //     this.featTable.featl = [];
      //   } else {
      //     for (const a in row.features.split('|')) {
      //       if (Object.prototype.hasOwnProperty.call(row.features.split('|'), a)) {
      //         this.featTable.featl.push({
      //           a: row.features.split('|')[a].split('=')[0],
      //           v: row.features.split('|')[a].split('=')[1],
      //         });
      //       }
      //     }
      //   }
      //   if (row.features === '_' || row.features === '') {
      //     this.currentinfo = `${row.form} ${row.lemma} ${row.POS} ${row.gloss} _`;
      //   } else {
      //     this.currentinfo = `${row.form} ${row.lemma} ${row.POS} ${row.gloss} ${row.features}`;
      //   }
    },
    myFilter({ key }) {
      const matchLexiconItem = this.lexiconItems.filter((lexiconItem) => {
        if (lexiconItem.key === key) {
          return true;
        }
        return false;
      })[0];
      return matchLexiconItem;
    },
  },
};
</script>
