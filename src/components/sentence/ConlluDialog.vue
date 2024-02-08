<template>
  <q-dialog v-model="conlluDialogOpened" full-width>
    <q-card>
        <q-bar class="bg-primary text-white sticky-bar">
          <div class="text-weight-bold">Conll Dialog</div>
          <q-space />
          <q-btn v-close-popup flat dense icon="close" />
        </q-bar>
        <q-card-section class="q-pa-none">
          <q-table
            flat
            :rows="conllTable"
            :columns="table.fields"
            class="my-sticky-header-table"
            hide-bottom
            :rows-per-page-options="[0]"
            separator="cell"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td v-for="col of conllColumns" :key="col" :props="props">
                  {{ props.row[col] }}
                    <q-popup-edit v-if="col !== 'ID'" v-model="props.row[col]" auto-save v-slot="scope" >
                      <q-input  
                        dense
                        autofocus
                        v-model="scope.value" 
                       />
                    </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
        <q-card-actions class="sticky-card-actions" align="around">
          <q-btn v-close-popup outline color="primary" :label="$t('cancel')" style="width: 45%; margin-left: auto; margin-right: auto" />
          <q-btn v-close-popup color="primary" label="Ok" style="width: 45%; margin-left: auto; margin-right: auto" @click="onConllDialogOk()" />
        </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { tokenJson_T, _featuresConllToJson, _depsConllToJson, nodesJson_T } from 'conllup/lib/conll';
import { sentence_bus_t, table_t } from 'src/types/main_types';
import { notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

export default defineComponent({
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
  },
  data() {
    const conllTable: any[] = [];
    const conllColumns = ['ID', 'FORM', 'LEMMA', 'UPOS', 'XPOS', 'FEATS', 'HEAD', 'DEPREL', 'DEPS', 'MISC'];
    const nodesJson: nodesJson_T = {};
    const table: table_t<tokenJson_T> = {
      fields: [],
      visibleColumns: [],
      filter: '',
      selected: [],
      loading: false,
      pagination: {
        sortBy: 'key',
        descending: false,
        page: 1,
        rowsPerPage: 10,
      },
      loadingDelete: false,
      exporting: false,
    };
    return {
      conllTable,
      conllColumns,
      nodesJson,
      table,
      userId: '',
      conlluDialogOpened: false,
    };
  },
  mounted() {
    this.sentenceBus.on('open:conlluDialog', ({ userId }) => {
      this.userId = userId;
      this.conlluDialogOpened = true;
      this.nodesJson = this.sentenceBus.sentenceSVGs[this.userId].treeJson.nodesJson;
      console.log(this.nodesJson)
      this.getConllTable();
    });
    this.createTableFields();
  },
  methods: {
    getConllTable() {
      this.conllTable = [];
      for (const node of Object.values(this.nodesJson)) {
        this.conllTable.push({
          ...node,
          FEATS: this.formatTableEntry(node.FEATS),
          DEPS: this.formatTableEntry(node.DEPS),
          MISC: this.formatTableEntry(node.MISC),
        });
      }
    },
    formatTableEntry(entry: any) {
      return Object.entries(entry)
        .map(([key, value]) => `${key}=${value}`)
        .join('|');
    },
    createTableFields() {
      this.conllColumns.forEach((column) => {
        this.table.fields.push({
          name: column,
          label: column,
          sortable: false,
          align: 'left',
          field: column,
        });
      });
    },
    onConllDialogOk() {
      this.conllTable.forEach((row, index) => {
        console.log(_featuresConllToJson(row.FEATS))
        this.nodesJson[`${index + 1}`] = {
          ...row, 
          FEATS: row.FEATS ? _featuresConllToJson(row.FEATS) : {},
          MISC: row.MISC ? _featuresConllToJson(row.MISC) : {},
          DEPS: row.DEPS ? _depsConllToJson(row.DEPS) : {},
        }
      }); 
      this.sentenceBus.sentenceSVGs[this.userId].treeJson.nodesJson = { ...this.nodesJson };
      this.sentenceBus.emit('tree-update:sentence', {
        sentenceJson: {
          metaJson: this.sentenceBus.sentenceSVGs[this.userId].metaJson,
          treeJson: this.sentenceBus.sentenceSVGs[this.userId].treeJson,
        },
        userId: this.userId,
      });  
      notifyMessage({
          message: "Conllu changed locally, don't forget to save !",
          type: 'warning',
          icon: 'warning',
      });   
    },
  },
});
</script>

<style>


</style>
