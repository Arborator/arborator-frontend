<template>
  <!----------------- Start ConllDialog ------------------->
  <q-dialog v-model="connluDialogOpened" full-width>
    <q-layout view="Lhh lpR fff" container class="bg-white">
      <q-header class="bg-primary">
        <q-toolbar>
          <q-toolbar-title>CoNLL of TODO : sentenceId </q-toolbar-title>
          <q-btn flat v-close-popup round dense icon="close" />
        </q-toolbar>
      </q-header>
      <q-page-container>
        <q-page>
          <codemirror
            v-model="conllContent"
            :options="cmOption"
            class="CodeMirror"
            @focus="codefocus"
          >
          </codemirror>
          <!-- </codemirror> -->
          <!-- @input="codechange($event)"  ($event)-->
        </q-page>
      </q-page-container>
      <q-footer>
        <q-toolbar inset>
          <!-- <q-toolbar-title>Footer</q-toolbar-title> --><q-space />
          <q-btn flat no-caps label="Cancel" v-close-popup />
          <q-btn
            color="primary"
            @click="onConllDialogOk()"
            label="Ok"
            v-close-popup
            :disabled="currentConllContent == conllContent"
          />
        </q-toolbar>
      </q-footer>
    </q-layout>
  </q-dialog>
  <!----------------- End ConllDialog ------------------->
</template>

<script>
import { conllToJson } from "../../helpers/Conll";
import { codemirror } from "vue-codemirror";
import CodeMirror from "codemirror";

CodeMirror.defineMode("tsv", function (_config, parserConfig) {
  function tokenBase(stream, state) {
    if (stream.string.match(/^#.+/)) {
      stream.skipToEnd();
      return "comment";
    }

    var ch = stream.next();

    if (/\d/.test(ch)) {
      stream.eatWhile(/[\d]/);
      if (stream.eat(".")) {
        stream.eatWhile(/[\d]/);
      }
      return "number";
    }
    if (/[+\-*&%=<>!?|:]/.test(ch)) {
      return "operator";
    }
    stream.eatWhile(/\w/);
    var cur = stream.current();
    return "variable";
  }

  // function tokenString(stream, state) {	}

  return {
    startState: function () {
      return { tokenize: tokenBase, commentLevel: 0 };
    },
    token: function (stream, state) {
      if (stream.eatSpace()) return null;
      return state.tokenize(stream, state);
    },
    lineComment: "#",
  };
}); // end codemirror

export default {
  components: { codemirror },
  props: ["sentenceBus"],
  data() {
    return {
      connluDialogOpened: false,
      currentConllContent: "",
      conllContent: "",
      cmOption: {
        tabSize: 8,
        styleActiveLine: true,
        // lineNumbers: true,
        lineWrapping: true,
        line: true,
        mode: "tsv",

        theme: "default",
      },
    };
  },
  computed: {},
  mounted() {
    this.sentenceBus.$on("open:conlluDialog", ({ userId }) => {
      this.userId = userId;
      this.connluDialogOpened = true;
      this.currentConllContent = this.sentenceBus[this.userId].exportConll();
      this.conllContent = this.sentenceBus[this.userId].exportConll();
    });
  },
  methods: {
    codefocus(cm, ev) {
      cm.refresh();
      cm.execCommand("selectAll");
    },
    onConllDialogOk() {
      try {
        const treeJson = conllToJson(this.conllContent);
        this.sentenceBus[this.userId].treeJson = treeJson.tree;
        this.sentenceBus[this.userId].META = treeJson.META;
        this.sentenceBus[this.userId].refresh();
        // TODO : notify success
      } catch (error) {
        console.error(error);
        error.caption = "The format of your CoNLL-U is not correct";
        this.$store.dispatch("notifyError", { error: error });
        // this.snap.treedata.s.paper.clear();
        // this.start(this.currentConllContent, { nodes: [], edges: [] }, this.id);
        // this.up(false, false);
      }
    },
  },
};
</script>



<style>
</style>