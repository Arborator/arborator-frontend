<template>
	<q-card :class="$q.dark.isActive?'':'bg-blue-grey-1 text-black'" class="full">
		<q-bar class="bg-primary text-white">
			<q-space />
			<div class="text-weight-bold">Settings</div>
			<q-space />
			<q-btn dense flat icon="close" v-close-popup>
				<q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
			</q-btn>
		</q-bar>
		<q-card-section class="q-pa-md row q-gutter-md">
			<q-banner rounded class="col-md-4 offset-md-4">
					<q-img :ratio="16/9" :src="imageEmpty?'../statics/project.jpg':imageCleaned" basic >
						<div class="absolute-bottom text-h6">
							<q-icon v-show="infos.is_private" name="lock" color="negative" size="lg"></q-icon>
							<q-icon v-show="!infos.is_private" name="public" color="positive" size="lg"></q-icon>
							{{infos.name}}
						</div>
					</q-img>

				<template v-slot:action>
					<!-- <q-btn flat label="Change Image" />
					<q-btn flat label="Change Name" /> -->
				</template>
			</q-banner>
		</q-card-section>
		<q-card-section class="q-pa-md row items-start q-gutter-md">
			<q-card class="col">
				<q-card-section>
					<div class="text-h6 text-center">Admins <q-btn v-show="admin" flat round icon="add" color="primary" @click="addAdminDial = true"></q-btn></div>
				</q-card-section>
				<q-card-section>
					<q-list bordered separator class="list-size">
						<q-item v-for="admin in infos.admins" :key="admin" clickable v-ripple >
							<q-item-section>{{admin}}</q-item-section>
							<q-item-section side><q-btn v-show="admin" dense round flat icon="remove" color="negative" @click="removeAdmin(admin)"></q-btn></q-item-section>
						</q-item>
					</q-list>
				</q-card-section>
			</q-card>
			<q-card class="col full-height">
				<q-card-section>
					<div class="text-h6 text-center">Guests <q-btn v-show="admin" flat round icon="add" color="primary" @click="addGuestDial = true"></q-btn></div>
				</q-card-section>
				<q-card-section >
					<q-list bordered separator class="list-size">
						<q-item v-for="guest in infos.guests" :key="guest" clickable v-ripple @click="removeGuest(guest)">
							<q-item-section>{{guest}}</q-item-section>
							<q-item-section side><q-btn v-show="admin" dense round flat icon="remove" color="negative" @click="removeGuest(guest)"></q-btn></q-item-section>
						</q-item>
					</q-list>
				</q-card-section>
			</q-card>
		</q-card-section>
		<q-card-section class="q-pa-md row items-start ">
			<q-card class="full-width">
				<q-card-section><div class="text-h6 text-center">Relations SubLabels (to form a deprel)</div></q-card-section>
				<q-card-section class="row q-gutter-md q-pa-md">
					<div class="col" v-for="(listrel, index) in infos.labels" :key="index">
						<q-btn-group spread flat>
							<q-btn flat square icon="add" color="primary" @click="addLabelDial = true; stockid = listrel.id;">Add Label</q-btn>
							<q-btn flat square icon="remove" color="negative"  @click="removeLabelColumn(listrel.id)">Remove Column</q-btn>
						</q-btn-group>
						<q-virtual-scroll  style="max-height: 150px;" :virtual-scroll-slice-size="5" :virtual-scroll-item-size="10" :items="listrel.labels" bordered separator>
							<template v-slot="{ item, index }">
							<q-item	:key="index" dense>
								<q-item-section>
								<q-item-label>
									<q-chip dense>
										<q-avatar color="secondary" text-color="white">{{index}}</q-avatar>
										{{item.value}}
									</q-chip>
								</q-item-label>
								</q-item-section>
								<q-item-section side><q-btn v-show="admin" dense round flat icon="remove" color="negative" @click="removeLabel(item)"></q-btn></q-item-section>
							</q-item>
							</template>
						</q-virtual-scroll>
					</div>
					<div class="col">
						<q-btn flat color="primary" icon="add" label="" class="full-width full-height" @click="addLabelColumn()"></q-btn>
					</div>
				</q-card-section>
			</q-card>
		</q-card-section>
		<q-card-section class="q-pa-md row items-start ">
			<q-card class="full-width">
				<q-card-section><div class="text-h6 text-center">Categories (POS tags)</div></q-card-section>
				<q-card-section class="row q-gutter-md q-pa-md">
					<div class="col">
						<q-btn flat square icon="add" color="primary" class="full-width" @click="addCatDial = true">Add Cat</q-btn>
						<q-virtual-scroll  style="max-height: 150px;" :virtual-scroll-slice-size="5" :virtual-scroll-item-size="10" :items="infos.cats" bordered separator>
							<template v-slot="{ item, index }">
							<q-item	:key="index" dense>
								<q-item-section>
								<q-item-label>
									<q-chip dense>
										<q-avatar color="secondary" text-color="white">{{index}}</q-avatar>
										{{item}}
									</q-chip>
								</q-item-label>
								</q-item-section>
								<q-item-section side><q-btn v-show="admin" dense round flat icon="remove" color="negative" @click="removeCat(item)"></q-btn></q-item-section>
							</q-item>
							</template>
						</q-virtual-scroll>
					</div>
				</q-card-section>
			</q-card>
		</q-card-section>
		<!-- <q-card-section>
			<codemirror v-model="config" :options="cmOption"></codemirror>
		</q-card-section> -->
		<q-dialog v-model="addAdminDial" transition-show="fade" transition-hide="fade">  <user-select-table :parentCallback="addAdmin"></user-select-table>   </q-dialog>
		<q-dialog v-model="addGuestDial" transition-show="fade" transition-hide="fade">  <user-select-table :parentCallback="addGuest"></user-select-table>   </q-dialog>
		<q-dialog v-model="addCatDial">
			<q-card>
				<q-bar class="bg-primary text-white">
					<q-space />
					<div class="text-weight-bold">Add a Category</div>
					<q-space />
					<q-btn flat dense icon="close" v-close-popup/>
				</q-bar>
				<q-card-section > 
					<q-input bottom-slots v-model="entryCat" label="Cat (Part-of-Speech)" counter dense>
						<template v-slot:after>
						<q-btn round color="primary" icon="add" @click="addCat()" v-close-popup/>
						</template>
					</q-input>
				</q-card-section>
			</q-card>
		</q-dialog>
		<q-dialog v-model="addLabelDial">
			<q-card>
				<q-bar class="bg-primary text-white">
					<q-space />
					<div class="text-weight-bold">Add a Label</div>
					<q-space />
					<q-btn flat dense icon="close" v-close-popup/>
				</q-bar>
				<q-card-section > 
					<q-input bottom-slots v-model="entryLabel" label="Label Part (for deprel)" counter dense>
						<template v-slot:after>
						<q-btn round color="primary" icon="add" @click="addLabel()" v-close-popup/>
						</template>
					</q-input>
				</q-card-section>
			</q-card>
		</q-dialog>
	</q-card>
</template>

<script>
import { codemirror } from 'vue-codemirror';
import 'codemirror/mode/python/python.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';
import api from '../boot/backend-api.js';
import UserSelectTable from '../components/UserSelectTable.vue';
export default {
	components: { codemirror, UserSelectTable },
	props: ['projectname'],
	data(){
		return{
			addAdminDial: false,
			addGuestDial: false,
			addLabelDial: false,
			addCatDial: false,
			entryCat: '',
			entryLabel: '',
			stockid: '',
			infos: {admins:[], guests:[], labels:[], cats:[]},
			// relations: [["subj", "comp", "vocative", "det", "dep", "mod", "conj", "cc", "parataxis", "fixed", "flat", "compound", "discourse", "dislocated", "goeswith", "orphan", "punct", "root"],[":aux",":caus",":cleft",":pred",":appos"],["@comp","@mod","@subj","@dep","@det"]],
			// cats: ["ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "VERB", "X"],
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
		},
		guest(){ return this.infos.guests.includes(this.$store.getters.getUserInfos.id); },
        admin(){ return this.infos.admins.includes(this.$store.getters.getUserInfos.id) || this.$store.getters.getUserInfos.super_admin; }        
    },
	methods:{
		getProjectInfos(){ api.getProjectSettings(this.$props.projectname).then(response => {this.infos = response.data;}).catch(error => {this.$store.dispatch("notifyError", {error: error}); this.$q.notify({message: `${error}`, color:'negative', position: 'bottom'});}) },
		addAdmin(selected){ api.setProjectUserRole(this.$props.projectname, 'admin', selected[0].id).then(response => {this.infos = response.data}).catch(error => {this.$store.dispatch("notifyError", {error: error})});  },
		removeAdmin(userid){ api.removeProjectUserRole(this.$props.projectname, 'admin', userid).then( response => { this.infos = response.data;} ).catch(error => {this.$store.dispatch("notifyError", {error: error})});  },
		addGuest(selected){ api.setProjectUserRole(this.$props.projectname, 'guest', selected[0].id).then(response=> {this.infos = response.data;}).catch(error => {this.$store.dispatch("notifyError", {error: error})});  },
		removeGuest(userid){ api.removeProjectUserRole(this.$props.projectname, 'guest', userid).then( response => { this.infos = response.data;} ).catch(error => {this.$store.dispatch("notifyError", {error: error})});  },
		addLabel(){  api.addProjectStockLabel(this.$props.projectname, this.stockid, this.entryLabel).then(response => { this.infos.labels = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); })  },
		removeLabel(item){ api.removeProjectStockLabel(this.$props.projectname, item.id, item.stock_id, item.value).then(response => { this.infos.labels = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); })  },
		addLabelColumn(){ api.addProjectStock(this.$props.projectname).then(response => { this.infos.labels = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); })  },
		removeLabelColumn(stockid){ api.removeProjectStock(this.$props.projectname, stockid).then(response => { this.infos.labels = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); })  },
		addCat(){ api.addProjectCatLabel(this.$props.projectname, this.entryCat).then(response => { this.infos.cats = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); }) },
		removeCat(cat){ api.removeProjectCatLabel(this.$props.projectname, cat).then(response => { this.infos.cats = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); })}
	}
}
</script>

<style scoped>
.full {
	width: 90vw;
	min-width: 90vw;
}
.list-size {
	height: 150px;
}
</style>