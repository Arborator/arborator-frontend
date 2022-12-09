<template>
  <q-table
    v-bind="$attrs"
    ref="table"
    v-model:selected="table.selected"
    v-model:pagination="table.pagination"
    selection="multiple"
    :rows="getLexiconData"
    row-key="key"
    binary-state-sort
    :rows-per-page-options="[50]"
    :columns="table.fields"
    :visible-columns="table.visibleColumns"
    card-class="shadow-8"
    table-style="max-height:80vh"
    :loading="lexiconLoading"
    loading-label="loading"
    :filter="table.filter"
    :class="($q.dark.isActive ? 'my-sticky-header-table-dark' : 'my-sticky-header-table') + ' rounded-borders'"
    @row-click="onRowClick"
  >
    <template #header-selection="scope">
      <q-checkbox v-model="scope.selected" />
    </template>

    <template #body-selection="scope">
      <q-checkbox v-model="scope.selected" />
    </template>

    <template #body-cell-form="props">
      <q-td key="form" :props="props">
        <span :class="compareWithBefore && passedLexiconItems.length >= 1 ? 'added-prop' : ''"> {{ props.row.form }} </span>
        <template v-if="compareWithBefore">
          <br />
          <span class="removed-prop">
            <del>
              {{ findOriginalLexiconItem(props.row).feats.form }}
            </del>
          </span>
        </template>
      </q-td>
    </template>

    <template #body-cell-lemma="props">
      <q-td key="lemma" :props="props">
        <span :class="compareWithBefore && passedLexiconItems.length >= 1 ? 'added-prop' : ''"> {{ props.row.lemma }} </span>
        <template v-if="compareWithBefore">
          <br />
          <span class="removed-prop">
            <del>
              {{ findOriginalLexiconItem(props.row).feats.lemma }}
            </del>
          </span>
        </template>
      </q-td>
    </template>

    <template #body-cell-pos="props">
      <q-td key="pos" :props="props">
        <span :class="compareWithBefore && passedLexiconItems.length >= 1 ? 'added-prop' : ''"> {{ props.row.upos }} </span>
        <template v-if="compareWithBefore">
          <br />
          <span class="removed-prop">
            <del>
              {{ findOriginalLexiconItem(props.row).feats.upos }}
            </del>
          </span>
        </template>
      </q-td>
    </template>
    <template #body-cell-gloss="props">
      <q-td key="gloss" :props="props">
        <span :class="compareWithBefore && passedLexiconItems.length >= 1 ? 'added-prop' : ''"> {{ props.row.gloss }} </span>
        <template v-if="compareWithBefore">
          <br />
          <span class="removed-prop">
            <del>
              {{ findOriginalLexiconItem(props.row).Gloss }}
            </del>
          </span>
        </template>
      </q-td>
    </template>
    <!-- <template #body-cell-features="props">
      <q-td key="features" :props="props">
        <span :class="compareWithBefore ? 'added-prop' : ''"> {{ computeFeatureStringWrapper(props.row.features) }} </span>
        <template >
          <br />
          <span class="removed-prop">
            <del>
              {{ computeFeatureStringWrapper(findOriginalLexiconItem(props.row).features) }}
            </del>
          </span>
        </template>
      </q-td>
    </template> -->
    <template #body-cell-frequency="props">
      <q-td key="frequency" :props="props">
        {{ props.row.frequency }}
      </q-td>
    </template>

    <template #top-right>
      <div>
        <q-input v-model="table.filter" borderless dense debounce="300" placeholder="Search">
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <q-btn color="default" flat label="tsv" @click="exportLexiconTSV">
       <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipExportLexicon[0]') }}</q-tooltip>
       </q-btn>
       <q-btn color="default" flat label="json" @click="exportLexiconJSON" >
       <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipExportLexicon[1]') }}
       </q-tooltip>
       </q-btn>
      <div>
        <q-btn-group v-if="compareWithBefore" flat>
          <q-btn color="default" :disable="table.selected.length === 0" flat icon="compare_arrows" @click="get()"
            ><q-tooltip>Generate Grew Rule</q-tooltip></q-btn
          >
          <q-btn color="default" :disable="table.selected.length === 0" flat icon-right="delete_forever" @click="deleteSelected()"
            ><q-tooltip>Unstage selected lexicon changes</q-tooltip></q-btn
          >
        </q-btn-group>
      </div>
    </template>

    <!-- Dynamically inherit slots from parent -->
    <template v-for="slot in parentSlots" #[slot]>
      <slot :name="slot" />
    </template>
  </q-table>
</template>

<script lang="ts">
import api from '../../api/backend-api';
import { computed } from 'vue';
import { mapActions, mapState } from 'pinia';
import { lexiconItem_FE_t, useLexiconStore } from 'src/pinia/modules/lexicon';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { table_t } from 'src/types/main_types';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LexiconTable',
  props: ['passedLexiconItems', 'lexiconLoading', 'compareWithBefore'],
  setup(props, ctx) {
    const parentSlots = computed(() => Object.keys(ctx.slots));

    return { parentSlots };
  },
  data() {
    const lexiconData :{
                    form :string,
                    lemma:string,
                    upos:string,
                    gloss:string,
                    key:string,
                    frequency:number
    }[]=[];
    const table: table_t<lexiconItem_FE_t> = {
      fields: [
        {
          name: 'expand',
          label: 'expand',
          field: 'expand',
          sortable: true,
        },
        {
          name: 'form',
          label: 'Form',
          sortable: true,
          // sort: (a: string, b: string) => {
          //   return a.localeCompare(b);
          // },
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
          field: 'upos',
          // Add a sort function for handling the requested sorting feature
          // sort: (a: string, b: string) => {
          //   console.log('KK a', a, b);
          //   return a.localeCompare(b);
          // },
        },
        // {
        //   name: 'features',
        //   label: 'Features',
        //   align: 'left',
        //   field: 'features',
        //   sortable: false,
        // },
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
    };
    return {
      lexiconData,
      download: [],
      table,
      tableKey: 0,
    };
  },
   mounted(){
  },
  computed: {
    ...mapState(useLexiconStore, ['lexiconItems']),
    getLexiconData(){ 
      for (const lexiconItem of this.passedLexiconItems ){
        this.lexiconData.push({
                        form :lexiconItem.feats.form,
                        lemma:lexiconItem.feats.lemma,
                        upos: lexiconItem.feats.upos,
                        gloss:lexiconItem.feats.Gloss,
                        key:lexiconItem.key,
                        frequency:lexiconItem.freq
                      })
      }
      
      return this.lexiconData;
    },

  },
  methods: {
    ...mapActions(useLexiconStore, ['setLexiconModificationItem', 'removeCoupleLexiconItemBeforeAfter']),
    ...mapActions(useGrewSearchStore, ['switch_grew_dialog', 'change_last_grew_query']),
    onRowClick(evt: Event, row: any) {
      this.setLexiconModificationItem(this.findOriginalLexiconItem(row));
    },
    findOriginalLexiconItem({ key }: { key: string }) {
      const matchLexiconItem = this.lexiconItems.filter((lexiconItem) => {
        if (lexiconItem.key === key) {
          return true;
        }
        return false;
      })[0];
      console.log('KK matchLexiconItem', matchLexiconItem.key);
      return matchLexiconItem;
    },
    deleteSelected() {
      for (const selectedModifiedItem of this.table.selected) {
        this.removeCoupleLexiconItemBeforeAfter(selectedModifiedItem.key);
      }
      this.table.selected = [];
    },
    get() {
      console.log('KK this.table.selected', this.table.selected);
      let grewRuleConcatenated = '';
      let counter = 1;
      for (const after of this.table.selected) {
        const before = this.findOriginalLexiconItem(after);
        console.log(before.key, after.key);
        const thisRule = this.grew_rule_from_lex_item_pair(before, after);
        grewRuleConcatenated += `rule r${counter} {\n${thisRule}\n}\n`;
        counter = counter + 1;
      }
      this.change_last_grew_query({ text: grewRuleConcatenated, type: 'REWRITE' });
      this.switch_grew_dialog(true);
    },

    grew_pattern_from_lex_item(lex_item: lexiconItem_FE_t) {
      let pattern = 'pattern { N[';
      for (const [feat, value] of Object.entries(lex_item.feats)) {
        if (lex_item.feats) {
          pattern += `${feat} = \"${value}\", `;
        } else {
          pattern += `!${feat}, `;
        }
      }
      pattern += '] }';
      return pattern;
    },

    grew_rule_from_lex_item_pair(before: lexiconItem_FE_t, after: lexiconItem_FE_t) {
      let commands = 'commands { ';
      let withouts = '';
      for (const feat in after.feats) {
        if (before.feats[feat] != after.feats[feat]) {
          if (after.feats[feat]) {
            withouts += `\nwithout { N.${feat} = \"${after.feats[feat]}\" }`;
            commands += `N.${feat} = \"${after.feats[feat]}\"; `;
          } else {
            commands += `del_feat N.${feat}; `;
          }
        }
      }
      commands += '}';
      return this.grew_pattern_from_lex_item(before) + withouts + '\n' + commands;
    },

     exportLexiconTSV() {
      const download=[];
       for ( const lexiconItem of this.passedLexiconItems) {
         download.push(lexiconItem);
       }
       const datasample = { data: download };
       api
         .exportLexiconTSV(this.$route.params.projectname as string, datasample)
         .then((response) => {
           const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/tab-separated-values' }));
           const link = document.createElement('a');
           link.href = url;
           link.setAttribute('download', `lexicon_${this.$route.params.projectname}.tsv`);
           document.body.appendChild(link);
           link.click();
           document.body.removeChild(link);
           this.table.exporting = false;
           notifyMessage({ message: 'File downloaded' });
           return [];
         })
        .catch((error) => {
           notifyError({ error });
           return [];
         });
     },
     exportLexiconJSON() {
      const download=[];
      for ( const lexiconItem of this.passedLexiconItems) {
         download.push(lexiconItem);
       }
       const datasample = { data: download };
       api
         .exportLexiconJSON(this.$route.params.projectname as string, datasample)
         .then((response) => {
           const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/json' }));
           const link = document.createElement('a');
           link.href = url;
           link.setAttribute('download', `lexicon_${this.$route.params.projectname}.json`);
           document.body.appendChild(link);
           link.click();
           document.body.removeChild(link);
           this.table.exporting = false;
           notifyMessage({ message: 'File downloaded' });
           return [];
         })
         .catch((error) => {
           notifyError({ error });
           return [];
         });
       this.download = [];
     },
  },
});
</script>

<style>
.added-prop {
  color: #33aa28;
}

.removed-prop {
  color: #ff0000;
}
.my-sticky-header-table th {
   background-color:white;
}
.my-sticky-header-table-dark th{
  background-color:#121212;
}
</style>
