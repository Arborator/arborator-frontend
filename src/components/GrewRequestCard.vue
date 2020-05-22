<template>
        <q-card style="width: 100%" :class="$q.dark.isActive?'bg-dark':'bg-grey-1'">

            <q-bar class="bg-primary text-white">
                <q-icon name="img:../statics/svg/grew.svg"  size="7rem" />
                <q-space />
                <q-btn flat dense icon="close" v-close-popup/>
            </q-bar>
            
            <q-card-section style="width:80vw;">
                <q-form @submit="onSearch" @reset="onResetSearch" class="q-gutter-md" >
                <div class="q-pa-xs">
                    <div class="row">
                        <div class="col-10" >
                            <codemirror v-model="searchPattern" :options="cmOption"></codemirror>
                            <q-space />
                            <q-btn color="primary" type="submit" label="Search" />
                        </div>
                        <div class="col-2" >
                            <q-list bordered separator >
                                <q-item v-for="query in queries" :key="query.name" clickable v-ripple @click="changeSearchPattern(query.pattern)">
                                    <q-item-section>
                                        {{query.name}}
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </div>
                    </div>
                </div>
                </q-form>
            </q-card-section>
            
        </q-card>
</template>

<script>

import grewTemplates from '../assets/grew-templates.json';
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
// import 'codemirror/theme/material.css'
import CodeMirror from 'codemirror'
import store from '../store';
  CodeMirror.defineMode('grew', function(_config, parserConfig) {
        var words = {
	    'global': 'builtin',
	    'pattern': 'builtin',
	    'without': 'builtin',
	};

	function tokenBase(stream, state) {
	    var ch = stream.next();

	    if (ch === '"') {
		state.tokenize = tokenString;
		return state.tokenize(stream, state);
	    }

	    if (ch === '%' ) {
		stream.skipToEnd();
		return 'comment';
	    }

	    if (ch === '=' ) {
                return 'quote';
            }

            if (ch === '<') {
		if (stream.eat('>')) {
                    return 'quote';
                }
            }

	    if (ch === '-') {
	    	var next_ch = stream.next();
	    	if ((next_ch === '[') || (next_ch === ">")) {
		    return 'quote';
		}
	    }

            if (ch === ']') {
		if (stream.eat('-') && stream.eat(">")) {
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
	    if ( /[+\-*&%=<>!?|]/.test(ch)) {
		return 'operator';
	    }
	    stream.eatWhile(/\w/);
	    var cur = stream.current();
	    return words[cur] || 'variable';
	}

	function tokenString(stream, state) {
	    var next, end = false, escaped = false;
	    while ((next = stream.next()) != null) {
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
	    startState: function() {return {tokenize: tokenBase, commentLevel: 0};},
	    token: function(stream, state) {
		if (stream.eatSpace()) return null;
		return state.tokenize(stream, state);
	    },
	    lineComment: "%"
	};
    
  });

export default {
    components: { codemirror },
    name: 'GrewRequestCard',
    props: ['parentOnSearch'],
    data() {
        return {
            searchPattern: `% Search for a given word form
pattern { N [form="Form_to_search"] }`,
            cmOption: {
                tabSize: 4,
                styleActiveLine: true,
                lineNumbers: true,
                lineWrapping: true,
                line: true,
                mode: 'grew',
                theme: 'default'
            },
            queries: grewTemplates
        }
    },
    mounted(){
        if (this.$ls.get('grewHistory', '').length > 0) this.$store.commit('change_last_grew_query', this.$ls.get('grewHistory'));
        if (this.$store.getters.getLastGrewQuery.length > 0) this.searchPattern = this.$store.getters.getLastGrewQuery;
    },
    methods: {
        onSearch(){ this.parentOnSearch(this.searchPattern); this.$store.commit('change_last_grew_query', this.searchPattern ); this.$ls.set('grewHistory', this.searchPattern); },
        changeSearchPattern(pattern) { this.searchPattern = pattern; },
        onResetSearch(){ this.searchPattern = ''; }
    }
}
</script>