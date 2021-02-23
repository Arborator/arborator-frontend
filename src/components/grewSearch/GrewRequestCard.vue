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
                        </div> 
                        <q-space />
                        <div class="col-2" >
                            <q-list bordered separator >
                                <q-item v-for="query in queries" :key="query.name" clickable v-ripple @click="changeSearchPattern(query.pattern, query.commands)">
                                    <q-item-section>
                                        {{query.name}}
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </div>
                    </div>


                    <div class="row">
                        <div v-if="rewriteCommands!=''" class="col-10" >
                            <codemirror v-model="rewriteCommands" :options="cmOption"></codemirror>
                        </div>
                    </div>



                    <div class="row">
                        <div class="full-width row justify-start  ">

                            <q-btn color="primary" type="submit" label="Search" no-caps />
                            <q-btn v-if="rewriteCommands!=''" color="primary" @click="tryRules" label="try Rules" no-caps />
                            <q-space/>
                            <q-btn icon="ion-md-link" @click="getgrewlink"/>
                            <q-space/>
                            <q-input 
                                ref='grewlinkinput'
                                dense 
                                v-show="grewlink.length!=0" 
                                class="col-10 self-stretch   "
                                :value="grewlink"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="ion-md-link" />
                                </template>
                            </q-input>  
                            </div>
                        </div>
                </div>
                </q-form>
            </q-card-section>
            
        </q-card>
</template>

<script>
import store from '../../store';
import CodeMirror from 'codemirror'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import grewTemplates from '../../assets/grew-templates.json';
// import 'codemirror/theme/material.css'
  CodeMirror.defineMode('grew', function(_config, parserConfig) {
        var words = {
	    'global': 'builtin',
	    'pattern': 'builtin',
	    'commands': 'builtin',
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
    props: ['parentOnSearch', 'parentOnTryRules', 'grewquery'],
    data() {
        return {
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
                theme: (this.$q.dark.isActive?'material-darker':'default')
            },
            queries: grewTemplates,
            grewlink: '',
        }
    },
    mounted(){
        if (this.$ls.get('grewHistory', '').length > 0) this.$store.commit('change_last_grew_query', this.$ls.get('grewHistory'));
        if (this.$store.getters.getLastGrewQuery.length > 0) this.searchPattern = this.$store.getters.getLastGrewQuery;
        if (this.$store.getters.getLastGrewCommand.length > 0) this.rewriteCommands = this.$store.getters.getLastGrewCommand;
        this.checkgrewquery();
    },
    methods: {
        /**
         * Call parent onsearch function and update store and history
         * 
         * @returns void
         */
        onSearch(){ 
            this.parentOnSearch(this.searchPattern); 
            this.$store.commit('change_last_grew_query', this.searchPattern ); 
            this.$store.commit('change_last_grew_command', this.rewriteCommands ); 
            this.$ls.set('grewHistory', this.searchPattern); 
        },
         /**
         * Call parent onsearch function and update store and history
         * 
         * @returns void
         */
        tryRules(){
            console.log(88888,this.queries[6]['pattern']);
            console.log(7789987)
            this.parentOnTryRules(this.queries[6]['pattern'], this.queries[6]['sampleIds']);
        },
        /**
         * Modify the search pattern (search string)
         * 
         * @param {string} pattern 
         * @returns void
         */
        changeSearchPattern(pattern, rewriteCommands) { 
            this.searchPattern = pattern; 
            console.log(this.searchPattern)
            this.rewriteCommands = rewriteCommands; 
        },   
      
        /**
         * Reset the search pattern to an empty string
         * 
         * @returns void
         */
        onResetSearch(){ 
            this.searchPattern = ''; 
            this.rewriteCommands = ''; 
        },
        /**
         * Retrieve the grew link based on windows location (current url) 
         * 
         * @returns void
         */
        getgrewlink(){
                var z = this.zip(this.searchPattern)
                this.grewlink = window.location.href.split('/projects/'+this.$route.params.projectname)[0]+'/projects/'+this.$route.params.projectname+(this.$route.params.samplename ? '/'+this.$route.params.samplename : '')+'?q='+z;
                setTimeout(()=>{this.$refs.grewlinkinput.select();document.execCommand('copy') }, 500)
        },
        /**
         * Grew query check : verify if it is not empty, and if it's a custom query
         * 
         * @returns void
         */
        checkgrewquery(){
            if (this.grewquery.length>0) {
                if (this.queries.filter(c => c.name == "custom query").length==0)
                {
                    var customquery = this.unzip(this.grewquery);
                    this.queries.unshift({"name":"custom query", "pattern":customquery});
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
        zip (s) {
            try {
                var dict = {}
                var data = (s + '').split('')
                var out = []
                var currChar
                var phrase = data[0]
                var code = 256
                for (var i = 1; i < data.length; i++) {
                currChar = data[i]
                if (dict[phrase + currChar] != null) {
                    phrase += currChar
                } else {
                    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0))
                    dict[phrase + currChar] = code
                    code++
                    phrase = currChar
                }
                }
                out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0))
                for (var j = 0; j < out.length; j++) {
                out[j] = String.fromCharCode(out[j])
                }
                return this.utoa(out.join(''))
            } catch (e) {
                console.log('Failed to zip string return empty string', e)
                return ''
            }
        },
        /**
         * Decompress an LZW-encoded base64 string
         * 
         * @param {string} base64ZippedString a string result representing zipped base64; result from the above zip(s) method
         * @returns void
         */
        unzip (base64ZippedString) {
            try {
                var s = this.atou(base64ZippedString)
                var dict = {}
                var data = (s + '').split('')
                var currChar = data[0]
                var oldPhrase = currChar
                var out = [currChar]
                var code = 256
                var phrase
                for (var i = 1; i < data.length; i++) {
                var currCode = data[i].charCodeAt(0)
                if (currCode < 256) {
                    phrase = data[i]
                } else {
                    phrase = dict[currCode] ? dict[currCode] : oldPhrase + currChar
                }
                out.push(phrase)
                currChar = phrase.charAt(0)
                dict[code] = oldPhrase + currChar
                code++
                oldPhrase = phrase
                }
                return out.join('')
            } catch (e) {
                console.log('Failed to unzip string return empty string', e)
                return ''
            }
        },
        /**
         * ucs-2 string to base64 encoded ascii
         * 
         * @param {string} str
         * @returns void
         */
        utoa (str) {
            return window.btoa(unescape(encodeURIComponent(str)))
        },
        /**
         * base64 encoded ascii to ucs-2 string
         * 
         * @param {string} str
         * @returns void
         */
        atou (str) {
            return decodeURIComponent(escape(window.atob(str)))
        }
    }
}
</script>