<template>
  <q-card style="width: 10%" :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    <q-bar class="bg-primary text-white">
      <q-icon name="img:/svg/grew.svg" size="7rem" />
      <q-space />
      <q-btn v-close-popup flat dense icon="close" />
    </q-bar>

    <q-card-section style="width: 80vw; height: 80vh">
      <q-form class="q-gutter-md" @reset="onResetSearch">
        <div class="q-pa-xs">
          <div class="row">
            <div class="col-10">
              <Codemirror v-model:value="currentQuery" style="height: 70vh" :options="cmOption"></Codemirror>
              <q-separator />
              <div class="full-width row justify-start">
                <q-btn v-if="currentQueryType === 'SEARCH'" color="primary" label="Search" no-caps icon="search" @click="onSearch" />
                <q-btn v-else-if="currentQueryType === 'REWRITE'" color="primary" label="Try Rules" no-caps icon="autorenew" @click="tryRules" />
                <q-space />
                <q-btn label="Get link" no-caps icon="ion-md-link" @click="getgrewlink" />
                <q-space />
                <q-input v-show="grewlink.length !== 0" ref="grewlinkinput" dense class="col-10 self-stretch" :value="grewlink">
                  <template #prepend>
                    <q-icon name="ion-md-link" />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="col-2 bg-primary">
              <q-tabs v-model="searchreplacetab" dense no-caps class="bg-grey-2 primary text-primary">
                <q-tab name="SEARCH" icon="search" label="Search">
                  <q-tooltip content-class="bg-primary" anchor="top middle" self="bottom middle" :offset="[10, 10]">
                    Examples of Grew search statements
                  </q-tooltip>
                </q-tab>
                <q-tab name="REWRITE" icon="autorenew" label="Rewrite">
                  <q-tooltip content-class="bg-primary" anchor="top middle" self="bottom middle" :offset="[10, 10]">
                    Examples of Grew search and replacement statements
                  </q-tooltip>
                </q-tab>
              </q-tabs>
              <q-separator />

              <q-tab-panels v-model="searchreplacetab" animated class="shadow-2">
                <q-tab-panel name="SEARCH">
                  <q-tabs v-model="searchquerytab" dense no-caps vertical switch-indicator class="bg-grey-2 primary" indicator-color="primary">
                    <template v-for="query in searchQueries" :key="query.name">
                      <q-tab v-ripple :name="query.name" :label="query.name" clickable @click="changeQuery(query.pattern, 'SEARCH')" />
                    </template>
                  </q-tabs>
                </q-tab-panel>

                <q-tab-panel name="REWRITE">
                  <q-tabs v-model="searchquerytab" dense no-caps vertical switch-indicator class="bg-grey-2 primary" indicator-color="primary">
                    <template v-for="query in rewriteQueries" :key="query.name">
                      <q-tab v-ripple :name="query.name" :label="query.name" clickable @click="changeQuery(query.pattern, 'REWRITE')" />
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

<script lang="ts">
import CodeMirror2 from 'codemirror';
// import { codemirror } from "vue-codemirror";
import Codemirror from 'codemirror-editor-vue3';

import 'codemirror/lib/codemirror.css';
import grewTemplates from '../../assets/grew-templates.json';
import { mapActions, mapState } from 'pinia';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { defineComponent } from 'vue';
// import 'codemirror/theme/material.css'

CodeMirror2.defineMode('grew', () => {
  const words = {
    global: 'builtin',
    pattern: 'builtin',
    commands: 'builtin',
    without: 'builtin',
  };
  function tokenString(stream: any, state: any) {
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
  function tokenBase(stream: any, state: any) {
    const ch = stream.next();
    // if (ch === '"') {
    //   state.tokenize = tokenString;
    //   return state.tokenize(stream, state);
    // }
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
  name: 'GrewRequestCard',
  components: { Codemirror },
  props: ['parentOnSearch', 'parentOnTryRules', 'grewquery'],
  data() {
    const currentQueryType: 'SEARCH' | 'REWRITE' = grewTemplates.searchQueries[0].type as 'SEARCH' | 'REWRITE';
    return {
      searchreplacetab: grewTemplates.searchQueries[0].type,
      searchquerytab: grewTemplates.searchQueries[0].type,
      currentQuery: grewTemplates.searchQueries[0].pattern,
      currentQueryType,
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
      searchQueries: grewTemplates.searchQueries,
      rewriteQueries: grewTemplates.rewriteQueries,
      grewlink: '',
    };
  },
  computed: {
    ...mapState(useGrewSearchStore, ['lastGrewQuery', 'lastGrewCommand']),
  },
  mounted() {
    const grewHistory = this.$storage.getStorageSync('grewHistory');
    if (grewHistory !== undefined && grewHistory.length > 0) {
      this.change_last_grew_query(grewHistory);
    }

    if (this.lastGrewQuery !== '') {
      this.currentQuery = this.lastGrewQuery;
    }
    if (this.lastGrewCommand !== '') {
      this.rewriteCommands = this.lastGrewCommand;
    }
    this.checkgrewquery();
  },
  methods: {
    ...mapActions(useGrewSearchStore, ['change_last_grew_query', 'change_last_grew_command']),
    /**
     * Call parent onsearch function and update store and history
     *
     * @returns void
     */
    onSearch() {
      this.parentOnSearch(this.currentQuery);
      this.change_last_grew_query(this.currentQuery);
      this.change_last_grew_command(this.rewriteCommands);
      this.$storage.setStorageSync('grewHistory', this.currentQuery);
    },
    /**
     * Call parent onsearch function and update store and history
     *
     * @returns void
     */
    tryRules() {
      this.parentOnTryRules(this.currentQuery);
      this.change_last_grew_query(this.currentQuery);
      this.change_last_grew_command(this.rewriteCommands);
      this.$storage.setStorageSync('grewHistory', this.currentQuery);
    },
    /**
     * Modify the search pattern (search string)
     *
     * @param {string} pattern
     * @returns void
     */
    changeQuery(query: string, type: 'SEARCH' | 'REWRITE') {
      this.currentQuery = query;
      this.currentQueryType = type;
      console.log(this.currentQuery);
    },

    /**
     * Reset the search pattern to an empty string
     *
     * @returns void
     */
    onResetSearch() {
      this.currentQuery = '';
      this.rewriteCommands = '';
    },
    /**
     * Retrieve the grew link based on windows location (current url)
     *
     * @returns void
     */
    getgrewlink() {
      const z = this.zip(this.currentQuery);
      this.grewlink = `${window.location.href.split(`/projects/${this.$route.params.projectname}`)[0]}/projects/${this.$route.params.projectname}${
        this.$route.params.samplename ? `/${this.$route.params.samplename}` : ''
      }?q=${z}`;
      setTimeout(() => {
        (this.$refs.grewlinkinput as HTMLInputElement).select();
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
        if (this.searchQueries.filter((c) => c.name === 'custom query').length === 0) {
          let customquery = this.unzip(this.grewquery);
          // this.queries.unshift({ name: 'custom query', pattern: customquery }); //FIXME
          this.changeQuery(customquery, this.currentQueryType);
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
    zip(s: any) {
      try {
        const dict: { [key: string]: any } = {};
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
    unzip(base64ZippedString: string) {
      try {
        const s = this.atou(base64ZippedString);
        const dict: { [key: string]: string } = {};
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
    utoa(str: string) {
      return window.btoa(unescape(encodeURIComponent(str)));
    },
    /**
     * base64 encoded ascii to ucs-2 string
     *
     * @param {string} str
     * @returns void
     */
    atou(str: string) {
      return decodeURIComponent(escape(window.atob(str)));
    },
  },
});
</script>
