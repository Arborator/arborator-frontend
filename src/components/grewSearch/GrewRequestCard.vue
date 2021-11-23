<template>
  <q-card style="width: 100%" :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    <q-bar class="bg-primary text-white">
      <q-icon name="img:/svg/grew.svg" size="7rem" />
      <q-space />
      <q-btn flat dense icon="close" v-close-popup />
    </q-bar>

    <q-card-section style="width: 80vw">
      <q-form @submit="onSearch" @reset="onResetSearch" class="q-gutter-md">
        <div class="q-pa-xs">
          <div class="row">
            <div class="col-10">
              <Codemirror v-model:value="searchPattern" :options="cmOption"></Codemirror>
              <q-separator />
              <Codemirror v-if="rewriteCommands !== ''" v-model:value="rewriteCommands" :options="cmOption"></Codemirror>
              <div class="full-width row justify-start">
                <q-btn color="primary" type="submit" label="Search" no-caps icon="search" />
                <q-space />
                <q-btn v-if="rewriteCommands !== ''" color="primary" @click="tryRules" label="Try Rules" no-caps icon="autorenew" />
                <q-space />
                <q-btn label="Get link" no-caps icon="ion-md-link" @click="getgrewlink" />
                <q-space />
                <q-input ref="grewlinkinput" dense v-show="grewlink.length !== 0" class="col-10 self-stretch" :value="grewlink">
                  <template v-slot:prepend>
                    <q-icon name="ion-md-link" />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="col-2 bg-primary">
              <q-tabs v-model="searchreplacetab" dense no-caps class="bg-grey-2 primary text-primary">
                <q-tab name="search" icon="search" label="Search">
                  <q-tooltip content-class="bg-primary" anchor="top middle" self="bottom middle" :offset="[10, 10]">
                    Examples of Grew search statements
                  </q-tooltip>
                </q-tab>
                <q-tab name="replace" icon="autorenew" label="Replace">
                  <q-tooltip content-class="bg-primary" anchor="top middle" self="bottom middle" :offset="[10, 10]">
                    Examples of Grew search and replacement statements
                  </q-tooltip>
                </q-tab>
              </q-tabs>
              <q-separator />

              <q-tab-panels v-model="searchreplacetab" animated class="shadow-2">
                <q-tab-panel name="search">
                  <q-tabs v-model="searchquerytab" dense no-caps vertical switch-indicator class="bg-grey-2 primary" indicator-color="primary">
                    <template v-for="query in queries" :key="query.name">
                      <q-tab
                        :name="query.name"
                        :label="query.name"
                        v-if="query.commands === ''"
                        clickable
                        v-ripple
                        @click="changeSearchPattern(query.pattern, query.commands)"
                      />
                    </template>
                  </q-tabs>
                </q-tab-panel>

                <q-tab-panel name="replace">
                  <q-tabs v-model="searchquerytab" dense no-caps vertical switch-indicator class="bg-grey-2 primary" indicator-color="primary">
                    <template v-for="query in queries" :key="query.name">
                      <q-tab
                        :name="query.name"
                        :label="query.name"
                        v-if="query.commands !== ''"
                        clickable
                        v-ripple
                        @click="changeSearchPattern(query.pattern, query.commands)"
                      />
                    </template>
                  </q-tabs>
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import CodeMirror2 from 'codemirror';
// import { codemirror } from "vue-codemirror";
import Codemirror from 'codemirror-editor-vue3';

import 'codemirror/lib/codemirror.css';
import grewTemplates from '../../assets/grew-templates.json';
// import 'codemirror/theme/material.css'

CodeMirror2.defineMode('grew', (_config, parserConfig) => {
  const words = {
    global: 'builtin',
    pattern: 'builtin',
    commands: 'builtin',
    without: 'builtin',
  };
  function tokenBase(stream, state) {
    const ch = stream.next();
    if (ch === '"') {
      state.tokenize = tokenString;
      return state.tokenize(stream, state);
    }
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
    const cur = stream.current();
    return words[cur] || 'variable';
  }
  function tokenString(stream, state) {
    let next;
    let end = false;
    let escaped = false;
    while ((next = stream.next()) !== null) {
      if (next === '"' && !escaped) {
        end = true;
        break;
      }
      escaped = !escaped && next === '\\';
    }
    if (end && !escaped) {
      state.tokenize = tokenBase;
    }
    return 'string';
  }
  return {
    startState() {
      return { tokenize: tokenBase, commentLevel: 0 };
    },
    token(stream, state) {
      if (stream.eatSpace()) return null;
      return state.tokenize(stream, state);
    },
    lineComment: '%',
  };
});
export default {
  components: { Codemirror },
  name: 'GrewRequestCard',
  props: ['parentOnSearch', 'parentOnTryRules', 'grewquery'],
  data() {
    return {
      searchreplacetab: 'search',
      searchquerytab: grewTemplates[0].name,
      searchPattern: `% Search for a given word form
pattern { N [form="Form_to_search"] }`,
      rewriteCommands: '',
      cmOption: {
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        line: true,
        mode: 'grew',
        theme: this.$q.dark.isActive ? 'material-darker' : 'default',
      },
      queries: grewTemplates,
      grewlink: '',
    };
  },
  mounted() {
    const grewHistory = this.$storage.getStorageSync('grewHistory');
    if (grewHistory !== undefined && grewHistory.length > 0) {
      this.$store.commit('change_last_grew_query', grewHistory);
    }

    if (this.$store.getters.getLastGrewQuery.length > 0) {
      this.searchPattern = this.$store.getters.getLastGrewQuery;
    }
    if (this.$store.getters.getLastGrewCommand.length > 0) {
      this.rewriteCommands = this.$store.getters.getLastGrewCommand;
    }
    this.checkgrewquery();
  },
  methods: {
    /**
     * Call parent onsearch function and update store and history
     *
     * @returns void
     */
    onSearch() {
      this.parentOnSearch(this.searchPattern);
      this.$store.commit('change_last_grew_query', this.searchPattern);
      this.$store.commit('change_last_grew_command', this.rewriteCommands);
      this.$storage.setStorageSync('grewHistory', this.searchPattern);
    },
    /**
     * Call parent onsearch function and update store and history
     *
     * @returns void
     */
    tryRules() {
      console.log('tryRules()', this.queries[6].pattern);
      console.log('this.queries = ', this.queries);
      this.parentOnTryRules(this.queries[6].pattern, this.queries[6].sampleIds);
    },
    /**
     * Modify the search pattern (search string)
     *
     * @param {string} pattern
     * @returns void
     */
    changeSearchPattern(pattern, rewriteCommands) {
      this.searchPattern = pattern;
      console.log(this.searchPattern);
      this.rewriteCommands = rewriteCommands;
    },

    /**
     * Reset the search pattern to an empty string
     *
     * @returns void
     */
    onResetSearch() {
      this.searchPattern = '';
      this.rewriteCommands = '';
    },
    /**
     * Retrieve the grew link based on windows location (current url)
     *
     * @returns void
     */
    getgrewlink() {
      const z = this.zip(this.searchPattern);
      this.grewlink = `${window.location.href.split(`/projects/${this.$route.params.projectname}`)[0]}/projects/${this.$route.params.projectname}${
        this.$route.params.samplename ? `/${this.$route.params.samplename}` : ''
      }?q=${z}`;
      setTimeout(() => {
        this.$refs.grewlinkinput.select();
        document.execCommand('copy');
      }, 500);
    },
    /**
     * Grew query check : verify if it is not empty, and if it's a custom query
     *
     * @returns void
     */
    checkgrewquery() {
      if (this.grewquery.length > 0) {
        if (this.queries.filter((c) => c.name === 'custom query').length === 0) {
          console.log('checkgrewquery()', {
            name: 'custom query',
            pattern: customquery,
          });
          let customquery = this.unzip(this.grewquery);
          this.queries.unshift({ name: 'custom query', pattern: customquery });
          this.changeSearchPattern(customquery);
          this.onSearch(); // autostart the query?
        }
      }
    },
    /**
     * Apply LZW-compression to a string (s) and return base64 compressed string.
     *
     * @param {string} s
     * @returns void
     */
    zip(s) {
      try {
        const dict = {};
        const data = `${s}`.split('');
        const out = [];
        let currChar;
        let phrase = data[0];
        let code = 256;
        for (let i = 1; i < data.length; i += 1) {
          currChar = data[i];
          if (dict[phrase + currChar] !== null) {
            phrase += currChar;
          } else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code += 1;
            phrase = currChar;
          }
        }
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        for (let j = 0; j < out.length; j += 1) {
          out[j] = String.fromCharCode(out[j]);
        }
        return this.utoa(out.join(''));
      } catch (e) {
        console.log('Failed to zip string return empty string', e);
        return '';
      }
    },
    /**
     * Decompress an LZW-encoded base64 string
     *
     * @param {string} base64ZippedString a string result representing zipped base64; result from the above zip(s) method
     * @returns void
     */
    unzip(base64ZippedString) {
      try {
        const s = this.atou(base64ZippedString);
        const dict = {};
        const data = `${s}`.split('');
        let currChar = data[0];
        let oldPhrase = currChar;
        const out = [currChar];
        let code = 256;
        let phrase;
        for (let i = 1; i < data.length; i += 1) {
          const currCode = data[i].charCodeAt(0);
          if (currCode < 256) {
            phrase = data[i];
          } else {
            phrase = dict[currCode] ? dict[currCode] : oldPhrase + currChar;
          }
          out.push(phrase);
          currChar = phrase.charAt(0);
          dict[code] = oldPhrase + currChar;
          code += 1;
          oldPhrase = phrase;
        }
        return out.join('');
      } catch (e) {
        console.log('Failed to unzip string return empty string', e);
        return '';
      }
    },
    /**
     * ucs-2 string to base64 encoded ascii
     *
     * @param {string} str
     * @returns void
     */
    utoa(str) {
      return window.btoa(unescape(encodeURIComponent(str)));
    },
    /**
     * base64 encoded ascii to ucs-2 string
     *
     * @param {string} str
     * @returns void
     */
    atou(str) {
      return decodeURIComponent(escape(window.atob(str)));
    },
  },
};
</script>
