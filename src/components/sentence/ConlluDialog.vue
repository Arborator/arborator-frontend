<template>
  <q-dialog v-model="conlluDialogOpened" full-width>
    <q-layout view="lHr LpR lFf" container style="background-color: #282a36">
      <q-header elevated class="bg-primary text-white">
        <q-toolbar>
          <q-toolbar-title>{{ $t('sentenceCard.conllText') }}</q-toolbar-title>
          <q-btn v-close-popup flat round dense icon="close" />
        </q-toolbar>
      </q-header>
      <q-page-container>
        <Codemirror v-model:value="conllContent" :options="cmOption" class="CodeMirror" @focus="codefocus"> </Codemirror>
      </q-page-container>
      <q-footer>
        <q-toolbar inset>
          <q-space />
          <q-btn v-close-popup flat no-caps :label="$t('cancel')" />
          <q-btn v-close-popup color="primary" label="Ok" :disabled="currentConllContent === conllContent" @click="onConllDialogOk()" />
        </q-toolbar>
      </q-footer>
    </q-layout>
  </q-dialog>
</template>

<script lang="ts">
import { sentenceConllToJson } from 'conllup/lib/conll';
import CodeMirror2 from 'codemirror';
import Codemirror from 'codemirror-editor-vue3';
import 'codemirror-editor-vue3/dist/style.css';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/theme/dracula.css';

import { sentence_bus_t } from 'src/types/main_types';
import { notifyError, notifyMessage } from 'src/utils/notify';
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
    return {
      userId: '',
      conlluDialogOpened: false,
      currentConllContent: '',
      conllContent: '',
      cmOption: {
        tabSize: 8,
        styleActiveLine: true,
        lineNumbers: false,
        lineWrapping: true,
        line: true,
        mode: 'tsv',
        theme: 'dracula',
      },
    };
  },
  mounted() {
    this.sentenceBus.on('open:conlluDialog', ({ userId }) => {
      this.userId = userId;
      this.conlluDialogOpened = true;
      this.currentConllContent = this.sentenceBus.sentenceSVGs[this.userId].exportConll();
      this.conllContent = this.sentenceBus.sentenceSVGs[this.userId].exportConll();
    });
  },
  methods: {
    codefocus(cm: any, ev: any) {
      cm.refresh();
      cm.execCommand('selectAll');
      console.log('codefocus()', ev);
    },
    onConllDialogOk() {
      let sentenceJson;
      sentenceJson = sentenceConllToJson(this.conllContent);
      if (!this.isMetaChanged()) {
        this.sentenceBus.emit('tree-update:sentence', {
          sentenceJson,
          userId: this.userId,
        });
        notifyMessage({
          message: "Conllu changed locally, don't forget to save !",
          type: 'warning',
          icon: 'warning',
        });
      } else {
        notifyError({
          error: 'Changing timestamp, user_id, sent_id is not allowed !',
        });
      }
    },
    isMetaChanged() {
      const fixedMetadata = ['timestamp', 'user_id', 'sent_id'];
      const oldMeta = this.sentenceBus.sentenceSVGs[this.userId].metaJson;
      const newMeta = sentenceConllToJson(this.conllContent).metaJson;
      let isMetaChanged = false;
      for (const metaKey of fixedMetadata) {
        if (!Object.keys(newMeta).includes(metaKey) || oldMeta[metaKey] !== newMeta[metaKey]) {
          isMetaChanged = true;
        }
      }
      return isMetaChanged;
    },
  },
});
</script>

<style></style>
