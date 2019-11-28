<template>
        <q-card style="width: 100%">

            <q-bar class="bg-primary text-white">
                <div class="text-weight-bold">Grew Matcher</div>
                <q-space />
                <q-btn flat dense icon="close" v-close-popup/>
            </q-bar>
            
            <q-card-section>
                <q-form @submit="onSearch" @reset="onResetSearch" class="q-gutter-md" >
                <div class="q-pa-md">
                    <div class="row">
                        <div class="col">
                            <codemirror v-model="searchPattern" :options="cmOption"></codemirror>
                            <q-space />
                            <q-btn color="primary" type="submit" label="Search" />
                        </div>
                        <div class="col">
                            <q-list bordered separator>
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
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material-darker.css'
import CodeMirror from 'codemirror'
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
                theme: 'material-darker'
            },
            queries: [ 
                {name:'POS query', pattern:`
% Search for a token of a given upos
% Available tags: ADJ, ADP, ADV, AUX, CONJ, DET, INTJ, NOUN, NUM, PART, PRON, PROPN, PUNCT, SCONJ, SYM, VERB, X
pattern { N [upos="NUM"] }`}, 
                {name:'Form query', pattern:`
% Search for a given word form
pattern { N [form="Form_to_search"] }`},
                {name:'Lemma query', pattern:`% Search for a given lemma (lemmatization is not available for all languages)

pattern { N [lemma="Lemma_to_search"] }`},
                {name:'Dependency relation query', pattern:`% Search for a dependency relation
% Available relations are:
%   acl, acl:relcl, advcl, advmod, amod, appos, aux, aux:pass, case, cc, ccomp,
%   compound, conj, cop, csubj, dep, det, discourse, obj, expl, iobj, mark,
%   fixed, flat, neg, nmod, nmod:poss, nsubj, nsubj:pass, nummod, parataxis, punct, root, xcomp

pattern { GOV -[advcl]-> DEP }`},
                {name:'Relation and tags query', pattern:`% Search for a "det" dependency relation
% such that the governor's tag is different from NOUN, PROPN and ADJ

pattern {
  GOV [upos <> NOUN|ADJ|PROPN];
  GOV -[det]-> DEP;
}`}
            ]
        }
    },
    mounted(){
        if (this.$store.getters.getLastGrewQuery.length > 0) this.searchPattern = this.$store.getters.getLastGrewQuery;
    },
    methods: {
        onSearch(){ this.parentOnSearch(this.searchPattern); this.$store.commit('change_last_grew_query', this.searchPattern ); },
        changeSearchPattern(pattern) { this.searchPattern = pattern; },
        onResetSearch(){ this.searchPattern = ''; }
    }
}
</script>