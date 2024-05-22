<template>
  <q-dialog v-model="conlluDialogOpened" full-width>
    <q-card flat bordered>
      <q-bar class="bg-primary text-white sticky-bar">
        <div class="text-weight-bold">{{ $t('conllDial.title') }}</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section>
        <div class="row">
          <div class="text-h6 col-10">
            <span v-if="view === 'table'"> {{ $t('conllDial.tableView') }} </span>
            <span v-else> {{ $t('conllDial.conllView') }} </span>
          </div>
          <div class="col">
            <q-btn-toggle
              v-model="view"
              no-caps
              toggle-color="primary"
              color="white"
              text-color="primary"
              :options="[
                { label: $t('conllDial.tableView'), value: 'table' },
                { label: $t('conllDial.conllView'), value: 'conll' },
              ]"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-section v-if="view === 'table'" class="q-pa-none">
        <q-table
          flat
          borderd
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
                <q-popup-edit v-if="col !== 'ID'" v-model="props.row[col]" auto-save v-slot="scope">
                  <q-input dense autofocus v-model="scope.value" />
                </q-popup-edit>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
      <q-card-section v-else>
        <Codemirror v-model:value="currentConllContent" :options="cmOption" class="bordered"></Codemirror>
      </q-card-section>
      <q-card-actions class="sticky-card-actions" align="around">
        <q-btn v-close-popup outline color="primary" :label="$t('cancel')" style="width: 45%; margin-left: auto; margin-right: auto" />
        <q-btn v-if="view === 'table'" v-close-popup color="primary" label="Ok" style="width: 45%" @click="onConllDialogOk()" />
        <q-btn v-else v-close-popup color="primary" :label="$t('conllDial.copyConll')" style="width: 45%" @click="copyConll()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import CodeMirror2 from 'codemirror';
import Codemirror from 'codemirror-editor-vue3';
import { _depsConllToJson, _featuresConllToJson, nodesJson_T, tokenJson_T } from 'conllup/lib/conll';
import { copyToClipboard } from 'quasar';
import { sentence_bus_t, table_t } from 'src/types/main_types';
import { notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

CodeMirror2.defineMode('tsv', () => {
  function tokenBase(stream: any) {
    if (stream.string.match(/^#.+/)) {
      stream.skipToEnd();
      return 'comment';
    }

    const ch = stream.next();

    if (/\d/.test(ch)) {
      stream.eatWhile(/[\d]/);
      if (stream.eat('.')) {
        stream.eatWhile(/[\d]/);
      }
      return 'number';
    }
    if (/[+\-*&%=<>!?|:]/.test(ch)) {
      return 'operator';
    }
    stream.eatWhile(/\w/);
    return 'variable';
  }

  return {
    startState() {
      return { tokenize: tokenBase, commentLevel: 0 };
    },
    token(stream: any, state: any) {
      if (stream.eatSpace()) return null;
      return state.tokenize(stream, state);
    },
    lineComment: '#',
  };
});
export default defineComponent({
  components: { Codemirror },
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
        sortBy: 'ID',
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
      currentConllContent: '',
      conllContent: '',
      view: 'table',
      cmOption: {
        tabSize: 8,
        styleActiveLine: true,
        lineNumbers: false,
        lineWrapping: true,
        line: true,
        mode: 'tsv',
        readOnly: true,
      },
    };
  },
  watch: {
    conllTable: {
      handler() {
        this.generateConllFromTable();
        this.currentConllContent = this.sentenceBus.sentenceSVGs[this.userId].exportConll();
      },
      deep: true,
    },
  },
  mounted() {
    this.sentenceBus.on('open:conlluDialog', ({ userId }) => {
      this.userId = userId;
      this.conlluDialogOpened = true;
      this.currentConllContent = this.sentenceBus.sentenceSVGs[this.userId].exportConll();
      this.conllContent = this.sentenceBus.sentenceSVGs[this.userId].exportConll();
      this.nodesJson = this.sentenceBus.sentenceSVGs[this.userId].treeJson.nodesJson;
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
      if (this.currentConllContent !== this.conllContent) {
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
      }
    },
    generateConllFromTable() {
      this.conllTable.forEach((row, index) => {
        this.nodesJson[`${index + 1}`] = {
          ...row,
          FEATS: row.FEATS ? _featuresConllToJson(row.FEATS) : {},
          MISC: row.MISC ? _featuresConllToJson(row.MISC) : {},
          DEPS: row.DEPS ? _depsConllToJson(row.DEPS) : {},
        };
      });
      this.sentenceBus.sentenceSVGs[this.userId].treeJson.nodesJson = { ...this.nodesJson };
    },
    copyConll() {
      copyToClipboard(this.currentConllContent).then(() => {
        notifyMessage({ message: 'Conll Copied!' });
      });
    },
  },
});
</script>

<style scoped>
.bordered {
  border: 1px solid #999999;
}
</style>
