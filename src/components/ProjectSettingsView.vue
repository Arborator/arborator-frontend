<template>
	<q-card :class="$q.dark.isActive?'':'bg-blue-grey-1 text-black'" style="width: 100vw;">
		<q-bar class="bg-primary text-white">
			<q-space />
			<div class="text-weight-bold">Settings</div>
			<q-space />
			<q-btn dense flat icon="close" v-close-popup>
				<q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
			</q-btn>
		</q-bar>
		<q-card-section>
			<!-- <div class="text-h6">{{infos.name}}</div> -->
			<q-banner rounded >
					<q-img :ratio="16/9" :src="imageEmpty?'../statics/project.jpg':imageCleaned" basic >
						<div class="absolute-bottom text-h6">
							<q-icon v-show="infos.is_private" name="lock" color="negative" size="lg"></q-icon>
							<q-icon v-show="!infos.is_private" name="public" color="positive" size="lg"></q-icon>
							{{infos.name}}
						</div>
					</q-img>

				<template v-slot:action>
					<q-btn flat label="Change Image" />
					<q-btn flat label="Change Name" />
				</template>
			</q-banner>
		</q-card-section>
		<q-card-section class="q-pa-md row items-start q-gutter-md">
			<q-card>
				<q-card-section>
					<div class="text-h6">Admins</div>
				</q-card-section>
				<q-card-section>
					<q-list bordered separator>
						<q-item v-for="admin in infos.admins" :key="admin" clickable v-ripple>
							<q-item-section>{{admin}}</q-item-section>
						</q-item>
					</q-list>
				</q-card-section>
			</q-card>
			<q-card>
				<q-card-section>
					<div class="text-h6">Guests</div>
				</q-card-section>
				<q-card-section>
					<q-list bordered separator>
						<q-item v-for="guest in infos.guests" :key="guest" clickable v-ripple>
							<q-item-section>{{guest}}</q-item-section>
						</q-item>
					</q-list>
				</q-card-section>
			</q-card>
		</q-card-section>
		<q-card-section>
			<codemirror v-model="config" :options="cmOption"></codemirror>
		</q-card-section>
	</q-card>
</template>

<script>
import { codemirror } from 'vue-codemirror';
import 'codemirror/mode/python/python.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';
import api from '../boot/backend-api.js';
export default {
	components: { codemirror },
	props: ['projectname'],
	data(){
		return{
			infos: {},
			config: `[configuration]
url			=	http://arborator.ilpga.fr/   # don't forget the trailing slash!
functionsfilename 		=	functions.config
categoriesfilename 		=	categories.config
defaultfunction		=	dep
defaultcategory 		=	NOM
defaultNumberSentences		=	50
newTree			=	nouvel arbre
erase			=	--ERASE--
root			=	ROOT
categoryindex		=	1 # the index in the list of shown features that will use category colors and open when clicked on 
defaultUser 		= 	default
directory			=	arborator
ericfuncsfilename 		=	ericfuncs.config
ericcatsfilename		=	ericcats.config
corpusfolder		=	corpus # in the root folder
db			=	arborator.db.sqlite
showAllTrees		=	True # TODO: bad hack
exportfolder		=	export # in the project folder
importAnnotatorName		= parser # edit only before entering texts into the database parser prof
teacher	=	prof 
baseAnnotatorName		=	parser # name of user that should serve as the base for the annotator to start her tree
exoBaseAnnotatorName	=	prof # name of user that should serve as the base for the student to start her tree
treeorder			=	newest # order of trees per sentence. what to put first. choices: newest, user, importAnnotator, default (alphabetical)
showTreesOfValidatedTexts	=	1 # give the number of the text status (see below) to be shown to all, anything but the numbers in text status will switch off this feature
allVisibleForNonAnnotators	=	0 # if 0: no, if 1: yes=if a user is not registered as annotator, she can see every tree
validatorsCanModifyTokens	=	1 # if 0 modif only by admins; if 1: validators, too
editable			=	1


[shown features]  # you decide which of the features of the token will be shown: t=token, cat=tag, ...
0 			=	t
1			=	tag
2			=	lemma

[shown sentencefeatures]  # you decide which of the features of the sentence will be shown: 
#0 			=	sent_id
1 			=	text

############################## scores for evaluation of student annotators #############
[evalutation scores]
governors			=	50
functions			=	30
categories			=	30
lemmas			=	0

############################## users whose annotation is visible to everyone #############
[visible to everyone]
#0 			=	guest
0 			=	parser
1 			=	prof

############################## different status of a text  #############
[text status]
0 			=	todo
1			=	ok
2			=	problem

############################## different status of a tree #############
[tree status]
0 			=	todo
1			=	ok
2			=	problem


############################## appearance of the tree javascript!!! #############
[look]
look			=	'''
tab=8; 			// space between tokens
line=25 		// line height
dependencyspace=320; 	// y-space for dependency representation
xoff=8; 		// placement of the start of a depdency link in relation to the center of the word
linedeps=6; 		// y distance between two arrows arriving at the same token (rare case)
pois=4; 		// size of arrow pointer
tokdepdist=15; 		// distance between tokens and depdendency relation
funccurvedist=8;	// distance between the function name and the curves highest point
depminh = 15; 		// minimum height for dependency
worddistancefactor = 2; // distant words get higher curves. this factor fixes how much higher.
rootTriggerSquare = 50; // distance from top of svg above which root connections are created and minimum width of this zone (from 0 to 50 par example the connection jumps to the middle)
extraspace=50 // extends the width of the svg in order to fit larger categories
defaultattris={"font": '14px "Arial"', "text-anchor":'start'};
attris = {"t":		{"font": '18px "Arial"', "text-anchor":'start',"fill": '#000',"cursor":'move',"stroke-width": '0'}, 
	  "cat":	{"font": '12px "Times"', "text-anchor":'start',"fill": '#036',"cursor":'pointer'},
	  "lemma":	{"font": '14px "Times"', "text-anchor":'start',"fill": '#036'},
	  "depline":	{"stroke": '#999',"stroke-width":'1',"stroke-dasharray": ''},
	  "deptext":	{"font": '12px "Times"', "font-style":'italic', "fill": '#999',"cursor":'pointer'},
	  "dragdepline":	{"stroke": '#8C1430',"stroke-width":'2',"stroke-dasharray": ''},
	  "dragdeplineroot":	{"stroke": '#985E16',"stroke-width":'2',"stroke-dasharray": ''},
	  "source":	{"fill": '#245606'},
	  "target":	{"fill": '#8C1430',"cursor": 'url("images/connect.png"),pointer', "font-style":'italic'}, 
	  "form":	{"font-style":'italic'}
	  };
'''
`,
			cmOption: {
                tabSize: 4,
                styleActiveLine: true,
                lineNumbers: true,
                lineWrapping: true,
                line: true,
                mode: 'python',
                theme: 'material-darker'
            }
		}
	},
	mounted(){
		this.getProjectInfos();
	},
	computed: {
        imageEmpty(){
            if(this.infos.image == null){ this.infos.image = "b''";}
            if(this.infos.image == "b''" ) {return true;}
            else if(this.infos.image.length < 1) {return true;}
            else{ return false; }
        },
        imageCleaned(){
            var clean = this.infos.image.replace('b', '');
            clean = clean.replace(/^'/g,'');
            clean = clean.replace(/'$/g,'');
            return 'data:image/png;base64, '+clean;
        }        
    },
	methods:{
		getProjectInfos(){
			api.getProjectSettings(this.$props.projectname).then(response => {this.infos = response.data;}).catch(error => {console.log(error); this.$q.notify({message: `${error}`, color:'negative', position: 'bottom'});})
		}
	}
}
</script>