<template>
  <q-dialog v-model="conlluDialogOpened" full-width>
    <q-card flat bordered>
      <q-bar class="bg-primary text-white sticky-bar">
        <div class="text-weight-bold">{{ $t('conllDial.title') }}</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section>
        <q-tabs v-model="view">
          <q-tab v-if="isLoggedIn" no-caps name="table" label="Table" />
          <q-tab no-caps name="conll" label="Conll" />
        </q-tabs>
        <q-tab-panels v-model="view">
          <q-tab-panel v-if="isLoggedIn" name="table">
            <q-table
              flat borderd
              :rows="conllTable"
              :columns="table.fields"
              class="my-sticky-header-table"
              hide-bottom
              :rows-per-page-options="[0]"
              separator="cell"
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="ID" :props="props">
                    {{ props.row.ID }}
                  </q-td>
                  <q-td key="FORM" :props="props">
                    {{ props.row.FORM }}
                    <q-popup-edit 
                      v-model="props.row.FORM" 
                      buttons
                      label-set="Save"
                      label-cancel="Close"
                      :validate="checkForm" 
                      v-slot="scope"
                    >
                      <q-input 
                        v-model="scope.value" 
                        dense 
                        autofocus
                        :error="formatErrorTable.FORM.error"
                        :error-message="formatErrorTable.FORM.message"
                        @keyup.enter="scope.set" 
                      />
                    </q-popup-edit>
                  </q-td>
                  <q-td key="LEMMA" :props="props">
                    {{ props.row.LEMMA }}
                    <q-popup-edit 
                      v-if="!props.row.ID.includes('-')" 
                      v-model="props.row.LEMMA" 
                      buttons
                      label-set="Save"
                      label-cancel="Close"
                      :validate="checkLemma" 
                      v-slot="scope" 
                    >
                      <q-input 
                        v-model="scope.value" 
                        dense 
                        autofocus 
                        :error="formatErrorTable.LEMMA.error"
                        :error-message="formatErrorTable.LEMMA.message" 
                        @keyup.enter="scope.set"
                      />
                    </q-popup-edit>
                  </q-td>
                  <q-td key="UPOS" :props="props">
                    {{ props.row.UPOS }}
                    <q-popup-edit
                      v-if="!props.row.ID.includes('-')"
                      v-model="props.row.UPOS"
                      buttons
                      label-set="Save"
                      label-cancel="Close"
                      :validate="checkUPOS"
                      v-slot="scope"
                    >
                      <q-input
                        v-model="scope.value"
                        :error="formatErrorTable.UPOS.error"
                        :error-message="formatErrorTable.UPOS.message"
                        dense
                        autofocus
                        @keyup.enter="scope.set"
                      />
                    </q-popup-edit>
                  </q-td>
                  <q-td key="XPOS">
                    {{ props.row.XPOS }}
                    <q-popup-edit v-if="!props.row.ID.includes('-')" v-model="props.row.XPOS" auto-save v-slot="scope" >
                      <q-input v-model="scope.value" dense autofocus />
                    </q-popup-edit>
                  </q-td>
                  <q-td key="FEATS" :props="props">
                    {{ props.row.FEATS }}
                    <q-popup-edit
                      v-if="!props.row.ID.includes('-')"
                      v-model="props.row.FEATS"
                      buttons
                      label-set="Save"
                      label-cancel="Close"
                      :validate="checkFEATS"
                      v-slot="scope"
                    >
                      <q-input
                        v-model="scope.value"
                        :error="formatErrorTable.FEATS.error"
                        :error-message="formatErrorTable.FEATS.message"
                        dense
                        autofocus
                        @keyup.enter="scope.set"
                      />
                    </q-popup-edit>
                  </q-td>
                  <q-td key="HEAD" :props="props">
                    {{ props.row.HEAD }}
                    <q-popup-edit
                      v-if="!props.row.ID.includes('-')"
                      v-model.number="props.row.HEAD"
                      buttons
                      label-set="Save"
                      label-cancel="Close"
                      :validate="checkHEAD"
                      v-slot="scope"
                    >
                      <q-input
                        type="number"
                        v-model.number="scope.value"
                        :error="formatErrorTable.HEAD.error"
                        :error-message="formatErrorTable.HEAD.message"
                        dense
                        autofocus
                        @keyup.enter="scope.set"
                      />
                    </q-popup-edit>
                  </q-td>
                  <q-td key="DEPREL" :props="props">
                    {{ props.row.DEPREL }}
                    <q-popup-edit
                      v-if="!props.row.ID.includes('-')"
                      v-model="props.row.DEPREL"
                      buttons
                      label-set="Save"
                      label-cancel="Close"
                      :validate="checkDEPREL"
                      v-slot="scope"
                    >
                      <q-input
                        v-model="scope.value"
                        :error="formatErrorTable.DEPREL.error"
                        :error-message="formatErrorTable.DEPREL.message"
                        dense
                        autofocus
                        @keyup.enter="scope.set"
                      />
                    </q-popup-edit>
                  </q-td>
                  <q-td key="DEPS">
                    {{ props.row.DEPS }}
                    <q-popup-edit v-if="!props.row.ID.includes('-')" v-model="props.row.DEPS" auto-save v-slot="scope" >
                      <q-input v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
                    </q-popup-edit>
                  </q-td>
                  <q-td key="MISC">
                    {{ props.row.MISC }}
                    <q-popup-edit v-model="props.row.MISC" auto-save v-slot="scope" >
                      <q-input v-model="scope.value" dense autofocus  @keyup.enter="scope.set" />
                    </q-popup-edit>
                  </q-td>
                  <q-menu
                    touch-position
                    context-menu
                  >
                    <TokensReplaceDialog 
                      :sentence-bus="sentenceBus" 
                      :reactive-sentences-obj="reactiveSentencesObj" 
                      :user-id="userId" 
                      :token="props.row"
                      @reload="getConllTable()"
                    />
                  </q-menu>
                </q-tr>
              </template>
            </q-table>
          </q-tab-panel>
          <q-tab-panel name="conll">
            <Codemirror v-model:value="currentConllContent" :options="cmOption" class="bordered"></Codemirror>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
      <q-card-actions class="sticky-card-actions" align="around">
        <q-btn v-close-popup outline color="primary" :label="$t('cancel')" style="width: 45%; margin-left: auto; margin-right: auto" />
        <q-btn v-if="isLoggedIn && view === 'table'" v-close-popup color="primary" label="Ok" style="width: 45%;" @click="onConllDialogOk()" />
        <q-btn v-else v-close-popup color="primary" :label="$t('conllDial.copyConll')" style="width: 45%;" @click="copyConll()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import Codemirror from 'codemirror-editor-vue3';
import TokensReplaceDialog from './TokensReplaceDialog.vue';

import { copyToClipboard } from 'quasar';
import { tokenJson_T, _featuresConllToJson, _depsConllToJson, nodesJson_T, groupsJson_T, enhancedNodesJson_T, sentenceConllToJson, sentenceJsonToConll } from 'conllup/lib/conll';
import { mapState, mapActions } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { useTreesStore } from 'src/pinia/modules/trees';
import { sentence_bus_t, table_t, reactive_sentences_obj_t } from 'src/types/main_types';

import { notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';
import { grewSearchResultSentence_t } from 'src/api/backend-types';

interface formatError_t {
  [key: string]: {
    error: boolean, 
    message: string
  }
}
export default defineComponent({
  components: { Codemirror, TokensReplaceDialog },
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
    reactiveSentencesObj: {
      type: Object as PropType<reactive_sentences_obj_t>,
      required: true,
    },
    sentenceData: {
      type: Object as PropType<grewSearchResultSentence_t>,
      required: true,
    }
  },
  data() {
    const conllTable: any[] = [];
    const conllColumns = ['ID', 'FORM', 'LEMMA', 'UPOS', 'XPOS', 'FEATS', 'HEAD', 'DEPREL', 'DEPS', 'MISC'];
    const conllColumnsToCheck = ['FORM', 'LEMMA', 'UPOS', 'FEATS', 'HEAD', 'DEPREL'];
    const nodesJson: nodesJson_T = {};
    const groupsJson: groupsJson_T = {};
    const enhancedNodesJson: enhancedNodesJson_T = {};
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
    const formatErrorTable: formatError_t = {};
    return {
      conllTable,
      conllColumns,
      conllColumnsToCheck,
      nodesJson,
      groupsJson,
      enhancedNodesJson,
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
      formatErrorTable,
    };
  },
  computed: {
    ...mapState(useProjectStore, ['annotationFeatures']),
    ...mapState(useUserStore, ['isLoggedIn']),
  },
  mounted() {
    this.sentenceBus.on('open:conlluDialog', ({ userId }) => {
      this.userId = userId;
      this.conlluDialogOpened = true;
      this.currentConllContent = this.sentenceData.conlls[this.userId];
      this.getConllTable();
    });
    this.createTableFields();
    this.conllColumnsToCheck.forEach((column) => {
      this.formatErrorTable[column] = { error: false, message: '' };
    });
    this.view = this.isLoggedIn ? 'table' : 'conll';
  },
  methods: {
    ...mapActions(useTreesStore, ['generateNewMetaText']),
    getConllTable() {
      this.conllTable = [];
      this.conllContent = this.sentenceBus.sentenceSVGs[this.userId].exportConll();
      const { nodesJson, groupsJson, enhancedNodesJson } = this.sentenceBus.sentenceSVGs[this.userId].treeJson;

      this.nodesJson = { ...nodesJson };
      this.groupsJson = { ...groupsJson };
      this.enhancedNodesJson = { ...enhancedNodesJson };

      Object.values(this.nodesJson).forEach((node) => {
        const multiWordId = `${node.ID}-${parseInt(node.ID) + 1}`;
        const multiWordNode = this.groupsJson[multiWordId];
        const enhancedNodeId= Object.keys(this.enhancedNodesJson).find(id => Number(id.split('.')[0]) === Number(node.ID));
        const emptyNode = this.enhancedNodesJson[enhancedNodeId!];
    
        if (emptyNode) {
          this.addConllRow(emptyNode);
        }

        if (multiWordNode) {
          this.addConllRow(multiWordNode);
        }

        this.addConllRow(node);
        });
    },

    addConllRow(node: any) {
      this.conllTable.push({
      ...node,
      HEAD: node.HEAD === -1 ? '_' : node.HEAD,
      FEATS: this.formatTableEntry(node.FEATS, '=') || '_',
      DEPS: this.formatTableEntry(node.DEPS, ':') || '_',
      MISC: this.formatTableEntry(node.MISC, '=') || '_',
      });
    },
  
    formatTableEntry(entry: any, linkOperator: string ) {
      return Object.entries(entry)
        .map(([key, value]) => `${key}${linkOperator}${value}`)
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
      this.generateConllFromTable();
      if (this.currentConllContent !== this.conllContent) {
        this.sentenceBus.emit('tree-update:sentence', {
          sentenceJson: {
            metaJson: this.sentenceBus.sentenceSVGs[this.userId].metaJson,
            treeJson: this.sentenceBus.sentenceSVGs[this.userId].treeJson,
          },
          userId: this.userId,
        });
        const sentenceJson = sentenceConllToJson(this.reactiveSentencesObj[this.userId].exportConll());
        const newMetaJson = this.generateNewMetaText(sentenceJson);
        this.sentenceBus.emit('tree-update:sentence', {
          sentenceJson: {
            metaJson: newMetaJson,
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
      const newNodesJson: nodesJson_T = {};
      const newGroupsJson: groupsJson_T = {};
      const newEnhancedNodesJson: enhancedNodesJson_T = {};
      this.conllTable.forEach((row) => {
        if (row.ID.includes('-')) {
          newGroupsJson[row.ID] = {
            ...row,
            FEATS: row.FEATS ? _featuresConllToJson(row.FEATS) : {},
            MISC: row.MISC ? _featuresConllToJson(row.MISC) : {},
            DEPS: row.DEPS ? _depsConllToJson(row.DEPS) : {},
          }
        }
        else if (row.ID.includes('.')) {
          newEnhancedNodesJson[row.ID] = {
            ...row,
            FEATS: row.FEATS ? _featuresConllToJson(row.FEATS) : {},
            MISC: row.MISC ? _featuresConllToJson(row.MISC) : {},
            DEPS: row.DEPS ? _depsConllToJson(row.DEPS) : {},
          };
        }
        else {
          newNodesJson[row.ID] = {
            ...row,
            FEATS: row.FEATS ? _featuresConllToJson(row.FEATS) : {},
            MISC: row.MISC ? _featuresConllToJson(row.MISC) : {},
            DEPS: row.DEPS ? _depsConllToJson(row.DEPS) : {},
          }; 
        }
      });
      this.sentenceBus.sentenceSVGs[this.userId].treeJson.nodesJson = { ...newNodesJson};
      this.sentenceBus.sentenceSVGs[this.userId].treeJson.groupsJson = { ...newGroupsJson };
      this.sentenceBus.sentenceSVGs[this.userId].treeJson.enhancedNodesJson = { ...newEnhancedNodesJson };
      this.currentConllContent = this.sentenceBus.sentenceSVGs[this.userId].exportConll();
    },
    copyConll() {
      copyToClipboard(this.currentConllContent).then(() => {
        notifyMessage({ message: 'Conll Copied!' });
      });
    },
    checkLemma(val: string) {
      if (val === '') {
        return this.setError('LEMMA', true, 'Lemma must not be empty');
      }
      return this.setError('LEMMA', false, '');
    },
    checkForm(val: string) {
      if (val === '') {
        return this.setError('FORM', true, 'Form must not be empty');
      }
      return this.setError('FORM', false, '');
    },
    checkUPOS(val: string) {
      if(!this.annotationFeatures.UPOS.includes(val) && val !== '_') {
        return this.setError('UPOS', true, 'This UPOS does not exist in your annotation config');
      }
      return this.setError('UPOS', false, '');
    }, 
    checkHEAD(val: number) {
      if ((val !== -1 && (val < 0 || val > this.conllTable.length)) || String(val) === "") {
        return this.setError('HEAD', true, 'HEAD value must be either -1 or 0 or < sentence length');
      }
      return this.setError('HEAD', false, '');
    },
    checkFEATS(val: string) {
      const featuresJson = _featuresConllToJson(val);
      for (const [feat, value] of Object.entries(featuresJson)) {
        if (!feat || !value) {
          return this.setError('FEATS', true, "You can't add empty features");
        }
        if (!this.annotationFeatures.FEATS.map((feat) => feat.name).includes(feat)) {
          return this.setError('FEATS', true, `The feature "${feat}" doesn't exist in your project config`);
        }
        const index = this.annotationFeatures.FEATS.map((feat) => feat.name).indexOf(feat);
        if (!this.annotationFeatures.FEATS[index].values.includes(value) || index === -1) {
          return this.setError('FEATS', true, `The value "${value}" of the feature "${feat}" doesn't exist in your project config`);
        }
      }
      return this.setError('FEATS', false, '');
    },
    checkDEPREL(val: string) {
      const splitRegex = new RegExp(`[${this.annotationFeatures.DEPREL.map((dep) => dep.join).join('')}]`, 'g');
      const splittedDeprels = val.split(splitRegex);
      if (val === '') {
        return this.setError('DEPREL', true, "You can't put an empty value for DEPREL");
      }
      for (const splittedDeprel of splittedDeprels) {
        let depExist = false;
        for (const dep of this.annotationFeatures.DEPREL) {
          if (dep.values.includes(splittedDeprel)) {
            depExist = true;
            break;
          }
        }
        if (!depExist && val !== '_') {
          return this.setError('DEPREL', true, "The value of deprel doesn't exist in your config");
        };
      }
      return this.setError('DEPREL', false, '');
    },
    setError(col: string, isError: boolean, errorMsg: string) {
      this.formatErrorTable[col].error = isError;
      this.formatErrorTable[col].message = errorMsg;
      return !isError;
    },
  },
});
</script>

<style scoped>
.bordered {
  border: 1px solid #999999;
}
</style>
