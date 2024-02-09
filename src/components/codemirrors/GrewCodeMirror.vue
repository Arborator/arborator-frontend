<template>
  <CodemirrorVueWrapper :options="cmOptionMerged" :spellcheck="false"></CodemirrorVueWrapper>
</template>

<script lang="ts">
import 'codemirror/theme/dracula.css';
import CodeMirror from 'codemirror';
import CodemirrorVueWrapper from 'codemirror-editor-vue3';
import 'codemirror-editor-vue3/dist/style.css';

import { defineComponent, PropType } from 'vue';

CodeMirror.defineMode('grew', () => {
  const words = {
    global: 'builtin',
    pattern: 'builtin',
    commands: 'builtin',
    without: 'builtin',
    rule: 'builtin',
  };
  function tokenBase(stream: any, state: any) {
    const ch = stream.next();
    if (ch === '%') {
      stream.skipToEnd();
      return 'comment';
    }
    if (ch === '=') {
      return 'quote';
    }
    if (ch === '<') {
      if (stream.eat('>')) {
        return 'quote';
      }
    }
    if (ch === '-') {
      const nextCh = stream.next();
      if (nextCh === '[' || nextCh === '>') {
        return 'quote';
      }
    }
    if (ch === ']') {
      if (stream.eat('-') && stream.eat('>')) {
        return 'quote';
      }
    }
    if (/\d/.test(ch)) {
      stream.eatWhile(/[\d]/);
      if (stream.eat('.')) {
        stream.eatWhile(/[\d]/);
      }
      return 'number';
    }
    if (/[+\-*&%=<>!?|]/.test(ch)) {
      return 'operator';
    }
    stream.eatWhile(/\w/);
    const cur = stream.current() as 'global' | 'pattern' | 'commands' | 'without';
    return words[cur] || 'variable';
  }

  return {
    startState() {
      return { tokenize: tokenBase, commentLevel: 0 };
    },
    token(stream: any, state: any) {
      if (stream.eatSpace()) return null;
      return state.tokenize(stream, state);
    },
    lineComment: '%',
  };
});

export default defineComponent({
  name: 'GrewCodeMirror',
  components: { CodemirrorVueWrapper },
  props: {
    disabled: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false,
    },
    lineNumbers: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      cmOption: {
        tabSize: 4,
        lineNumbers: this.lineNumbers,
        lineWrapping: true,
        line: true,
        mode: 'grew',
        theme: this.$q.dark.isActive ? 'dracula' : 'default',
      },
    };
  },
  computed: {
    cmOptionMerged() {
      return { ...this.cmOption, readOnly: this.disabled ? 'nocursor' : false };
    },
  },
});
</script>
