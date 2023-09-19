<template>
  <!----------------- Start ConllDialog ------------------->
  <q-dialog v-model="conlluDialogOpened" full-width>
    <q-layout view="Lhh lpR fff" container class="bg-white">
      <q-header class="bg-primary">
        <q-toolbar>
          <q-toolbar-title>{{ $t('sentenceCard.conllText') }}</q-toolbar-title>
          <q-btn v-close-popup flat round dense icon="close" />
        </q-toolbar>
      </q-header>
      <q-page-container style="background-color: #282a36">
        <Codemirror v-model:value="conllContent" :options="cmOption" class="CodeMirror" @focus="codefocus"> </Codemirror>
      </q-page-container>
      <q-footer>
        <q-toolbar inset>
          <!-- <q-toolbar-title>Footer</q-toolbar-title> --><q-space />
          <q-btn v-close-popup flat no-caps :label="$t('cancel')" />
          <q-btn v-close-popup color="primary" label="Ok" :disabled="currentConllContent === conllContent" @click="onConllDialogOk()" />
        </q-toolbar>
      </q-footer>
    </q-layout>
  </q-dialog>
  <!----------------- End ConllDialog ------------------->
</template>

<script lang="ts">
import conllup from 'conllup';
const sentenceConllToJson = conllup.sentenceConllToJson;

// import { codemirror } from "vue-codemirror";
import CodeMirror2 from 'codemirror';

import Codemirror from 'codemirror-editor-vue3';

// plugin-style
import 'codemirror-editor-vue3/dist/style.css';

// language
import 'codemirror/mode/javascript/javascript.js';

// theme
import 'codemirror/theme/dracula.css';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { sentence_bus_t } from 'src/types/main_types';
import { PropType } from 'vue';

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

  // function tokenString(stream, state) {	}

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
}); // end codemirror

import { defineComponent } from 'vue';

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
  computed: {},
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
      try {
        sentenceJson = sentenceConllToJson(this.conllContent);
      } catch (error) {
        notifyError({
          error,
        });
        return;
      }
      const oldMeta = this.sentenceBus.sentenceSVGs[this.userId].metaJson;
      const newMeta = sentenceJson.metaJson;

      let isMetaChanged = false;
      for (const [metaKey, metaValue] of Object.entries(newMeta)) {
        if (metaValue !== oldMeta[metaKey]) {
          if (['timestamp', 'user_id', 'sent_id', 'text'].includes(metaKey)) {
            isMetaChanged = true;
          }
        }
      }
      if (!isMetaChanged) {
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
          error: 'Changing timestamp, user_id, sent_id or text is not allowed !',
        });
      }
    },
  },
});
</script>

<style></style>
