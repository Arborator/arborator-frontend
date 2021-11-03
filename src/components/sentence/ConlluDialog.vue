<template>
  <!----------------- Start ConllDialog ------------------->
  <q-dialog v-model="conlluDialogOpened" full-width>
    <q-layout view="Lhh lpR fff" container class="bg-white">
      <q-header class="bg-primary">
        <q-toolbar>
          <q-toolbar-title>CoNLL of TODO : sentenceId </q-toolbar-title>
          <q-btn flat v-close-popup round dense icon="close" />
        </q-toolbar>
      </q-header>
      <q-page-container>
        <q-page>
          <Codemirror v-model:value="conllContent" :options="cmOption" class="CodeMirror" @focus="codefocus"> </Codemirror>
          <!-- </codemirror> -->
          <!-- @input="codechange($event)"  ($event)-->
        </q-page>
      </q-page-container>
      <q-footer>
        <q-toolbar inset>
          <!-- <q-toolbar-title>Footer</q-toolbar-title> --><q-space />
          <q-btn flat no-caps label="Cancel" v-close-popup />
          <q-btn color="primary" @click="onConllDialogOk()" label="Ok" v-close-popup :disabled="currentConllContent === conllContent" />
        </q-toolbar>
      </q-footer>
    </q-layout>
  </q-dialog>
  <!----------------- End ConllDialog ------------------->
</template>

<script>
import { sentenceConllToJson } from 'conllup';
// import { codemirror } from "vue-codemirror";
import CodeMirror2 from 'codemirror';

import Codemirror from 'codemirror-editor-vue3';

// plugin-style
import 'codemirror-editor-vue3/dist/style.css';

// language
import 'codemirror/mode/javascript/javascript.js';

// theme
import 'codemirror/theme/dracula.css';

CodeMirror2.defineMode('tsv', (_config, parserConfig) => {
  function tokenBase(stream, state) {
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
    const cur = stream.current();
    return 'variable';
  }

  // function tokenString(stream, state) {	}

  return {
    startState() {
      return { tokenize: tokenBase, commentLevel: 0 };
    },
    token(stream, state) {
      if (stream.eatSpace()) return null;
      return state.tokenize(stream, state);
    },
    lineComment: '#',
  };
}); // end codemirror

export default {
  components: { Codemirror },
  props: ['sentenceBus'],
  data() {
    return {
      conlluDialogOpened: false,
      currentConllContent: '',
      conllContent: '',
      cmOption: {
        tabSize: 8,
        styleActiveLine: true,
        // lineNumbers: true,
        lineWrapping: true,
        line: true,
        mode: 'tsv',

        theme: 'dracula',
      },
    };
  },
  computed: {},
  mounted() {
    this.sentenceBus.on('open:conlluDialog', ({ userId }) => {
      this.userId = userId;
      this.conlluDialogOpened = true;
      this.currentConllContent = this.sentenceBus[this.userId].exportConll();
      this.conllContent = this.sentenceBus[this.userId].exportConll();
    });
  },
  methods: {
    codefocus(cm, ev) {
      cm.refresh();
      cm.execCommand('selectAll');
    },
    onConllDialogOk() {
      const sentenceJson = sentenceConllToJson(this.conllContent);
      const oldMeta = this.sentenceBus[this.userId].metaJson;
      const newMeta = sentenceJson.metaJson;

      let isMetaChanged = 0;
      for (const [metaKey, metaValue] of Object.entries(newMeta)) {
        if (metaValue !== oldMeta[metaKey]) {
          if (['timestamp', 'user_id', 'sent_id', 'text'].includes(metaKey)) {
            isMetaChanged = 1;
          }
        }
      }
      if (!isMetaChanged) {
        this.sentenceBus.emit('tree-update:sentence', {
          sentenceJson,
          userId: this.userId,
        });
        this.$q.notify({
          message: 'Conllu changed',
        });
      } else {
        this.$store.dispatch('notifyError', {
          error: 'Changing timestamp, user_id, sent_id or text is not allowed !',
        });
      }
    },
  },
};
</script>

<style></style>
