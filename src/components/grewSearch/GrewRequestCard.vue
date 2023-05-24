<template>
  <q-card style="width: 10%" :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    <q-bar class="bg-primary text-white">
      <q-icon name="img:/svg/grew.svg" size="7rem" />
      <q-space />
      <q-btn v-close-popup flat dense icon="close" />
    </q-bar>
    <q-card-section style="width: 80vw; height: 85vh">
      <q-form class="q-gutter-md" @reset="onResetSearch">
        <div class="q-pa-xs">
          <div class="row">
            <div class="col-10">
              <q-select dense outlined v-model="type" :options="userOptions" :label="$t('grewSearch.treesType')" color="primary">
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-avatar v-if="scope.opt.value == 'user' || scope.opt.value == 'user_recent'" size="1.2rem" >
                        <img :src="avatar" />
                        <q-badge v-if="scope.opt.value == 'user_recent'" floating transparent color="principal">+</q-badge>
                      </q-avatar>
                      <q-icon v-else :name="scope.opt.icon" />  
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{scope.opt.label}}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div> 
          </div>
          <div class="row">
            <div class="col-10">
              <Codemirror v-model:value="currentQuery" style="height: 70vh" :options="cmOption"></Codemirror>
              <q-separator />
            </div>

            <div class="col-2 bg-primary">
              <q-tabs v-model="searchReplaceTab" dense no-caps class="bg-grey-2 primary text-primary">
                <q-tab name="SEARCH" icon="search" :label="$t('grewSearch.search')">
                  <q-tooltip content-class="bg-primary" anchor="top middle" self="bottom middle" :offset="[10, 10]">
                    {{$t('grewSearch.grewSearchTooltip')}}
                  </q-tooltip>
                </q-tab>
                <q-tab name="REWRITE" icon="autorenew" :label="$t('grewSearch.rewrite')">
                  <q-tooltip content-class="bg-primary" anchor="top middle" self="bottom middle" :offset="[10, 10]">
                    {{$t('grewSearch.grewRewriteTooltip')}}
                  </q-tooltip>
                </q-tab>
              </q-tabs>
              <q-separator />

              <q-tab-panels v-model="searchReplaceTab" animated class="shadow-2" @input="type  == null">
                <q-tab-panel name="SEARCH">
                  <q-tabs v-model="searchQueryTab" dense no-caps vertical switch-indicator class="primary" indicator-color="primary">
                    <template v-for="query in searchQueries" :key="query.name">
                      <q-tab v-ripple :name="query.name" :label="query.name" clickable @click="changeQuery(query.pattern, 'SEARCH')" />
                    </template>
                     <q-tab v-ripple v-if="type.value =='all'" name="showDiffs" label="Show divergences" clickable @click="isShowDiff = true" />
                     <q-tab><a href="https://grew.fr/doc/request/" target="_blank">Documentation</a></q-tab>
                  </q-tabs>
                </q-tab-panel>

                <q-tab-panel name="REWRITE">
                  <q-tabs v-model="searchQueryTab" dense no-caps vertical switch-indicator class="primary" indicator-color="primary">
                    <template v-for="query in rewriteQueries" :key="query.name">
                      <q-tab v-ripple :name="query.name" :label="query.name" clickable @click="changeQuery(query.pattern, 'REWRITE')" />
                    </template>
                    <q-tab><a href="https://grew.fr/doc/commands/" target="_blank">Documentation</a></q-tab>
                  </q-tabs>
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </div>
          <div class="row">
            <div>
              <q-btn :disable="!type.value" v-if="searchReplaceTab === 'SEARCH'" color="primary" :label="$t('grewSearch.search')" no-caps icon="search" @click="onSearch" />
              <q-btn :disable="!type.value" v-else-if="searchReplaceTab === 'REWRITE'" color="primary" :label="$t('grewSearch.tryRules')" no-caps icon="autorenew" @click="tryRules" />
              <q-tooltip v-if="!type.value" content-class="bg-primary" anchor="top middle" self="bottom middle" :offset="[10, 10]">
                {{$t('grewSearch.grewBtnTooltip')}}
              </q-tooltip>
            </div>
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
  <q-dialog v-model="isShowDiff">
    <q-card style="width: 150vw;">
      <q-bar class="bg-primary text-white">
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section>
        <div class="text-h6">
          {{ $t('grewSearch.showDiffTitle') }}
        </div>
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <div class="row q-gutter-sm">
          <div class="col">
            <q-select
              v-model="features"
              filled
              multiple
              :options="featuresSet"
              use-chips
              stack-label
              :label="$t('grewSearch.showDiffFaturesSelect')"
            />
          </div>
          <div class="col">
            <q-select
              v-model="otherUsers"
              filled
              multiple
              :options="usersSet"
              use-chips
              stack-label
              :label="$t('grewSearch.showDiffUsersSelect')"
            />
          </div>
        </div>
        <div class="row">
          <q-btn :disable="otherUsers.length == 0" v-close-popup :label="$t('grewSearch.showDiffBtn')" color="primary" @click="onShowDiffs" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import CodeMirror2 from 'codemirror';
// import { codemirror } from "vue-codemirror";
import Codemirror from 'codemirror-editor-vue3';

import 'codemirror/lib/codemirror.css';
import grewTemplates from '../../assets/grew-templates.json';
import {mapActions, mapState, mapWritableState} from 'pinia';
import {useGrewSearchStore} from 'src/pinia/modules/grewSearch';
import {useUserStore} from 'src/pinia/modules/user';
import {useProjectStore} from 'src/pinia/modules/project';


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
  props: ['parentOnSearch', 'parentOnTryRules', 'grewquery', 'parentOnShowDiffs', 'users'],
  data() {
    const currentQueryType: 'SEARCH' | 'REWRITE' = grewTemplates.searchQueries[0].type as 'SEARCH' | 'REWRITE';
    const type : {value: string, label: string, icon: string} = {value : '', label: '', icon : ''};
    const otherUsers : string[] = [];
    const features : string[] = [];
    return {
      searchReplaceTab: grewTemplates.searchQueries[0].type,
      searchQueryTab: grewTemplates.searchQueries[0].type,
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
      type,
      options: [
        { value: 'user', label: this.$t('projectView.tooltipFabGrewUser')},
        { value: 'user_recent', label: this.$t('projectView.tooltipFabGrewUserRecent')},
        { value: 'recent', label: this.$t('projectView.tooltipFabGrewRecent'), icon: 'schedule' },
        { value: 'all', label: this.$t('projectView.tooltipFabGrewAll'), icon: 'groups' },
      ],
      isShowDiff:false,
      otherUsers,
      features,
    };
  },
  computed: {
    ...mapState(useGrewSearchStore, ['lastQuery']),
    ...mapState(useUserStore, ['isLoggedIn', 'avatar', 'username']),
    ...mapState(useProjectStore, ['shownFeaturesChoices']),
    userOptions() {
      return this.searchReplaceTab === 'REWRITE' ? this.options.slice(0, -1) : this.options;
    },
    featuresSet() {
      var featuresSet: string[] = [];
      featuresSet = this.shownFeaturesChoices.filter((feat: any) => feat != 'FORM');
      return featuresSet;
    },
    usersSet() {
      return this.users.filter((user: any) => user != this.username);
    }
  },
  watch: {
    searchReplaceTab(newVal, oldVal){
      if (newVal === 'REWRITE'){
        this.type = {value: '', label: '', icon:''};
      }
    }
  },
  mounted() {
    if (this.lastQuery !== null) {
      this.currentQueryType = this.lastQuery.type;
      this.currentQuery = this.lastQuery.text;
    }
    this.checkGrewQuery();
  },
  methods: {
    ...mapActions(useGrewSearchStore, ['changeLastGrewQuery']),
    /**
     * Call parent onsearch function and update store and history
     *
     * @returns void
     */
    onSearch() {
      this.parentOnSearch(this.currentQuery, this.type.value);
      this.changeLastGrewQuery({ text: this.currentQuery, type: this.currentQueryType });
    },
    /**
     * Call parent onsearch function and update store and history
     *
     * @returns void
     */
    tryRules() {
      this.parentOnTryRules(this.currentQuery, this.type.value);
      this.changeLastGrewQuery({ text: this.currentQuery, type: this.currentQueryType });
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
      this.type = {value : '', label: '', icon: ''};
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
     * Grew query check : verify if it is not empty, and if it's a custom query
     *
     * @returns void
     */
    checkGrewQuery() {
      if (this.grewquery.length > 0) {
        if (this.searchQueries.filter((c) => c.name === 'custom query').length === 0) {
          let customQuery = this.unzip(this.grewquery);
          // this.queries.unshift({ name: 'custom query', pattern: customQuery }); //FIXME
          this.changeQuery(customQuery, this.currentQueryType);
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

    onShowDiffs() {
      this.parentOnShowDiffs(this.type.value, this.otherUsers, this.features);
    }
  },
});
</script>
