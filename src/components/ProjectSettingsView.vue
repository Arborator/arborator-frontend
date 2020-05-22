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
		<q-card-section class="q-pa-sm row q-gutter-md"> 
			<q-banner rounded class="col-md-4 offset-md-4 col-xs-12 col-sm-12">
					<q-img :ratio="16/9" :src="imageEmpty?'../statics/images/project.jpg':imageCleaned" basic >
						<div class="absolute-bottom text-h6">
							<q-icon v-show="infos.is_private" name="lock" :color="$q.dark.isActive?'red-13':'negative'" size="lg"></q-icon>
							<q-icon v-show="!infos.is_private" name="public" color="positive" size="lg"></q-icon>
							{{infos.name}}
						</div>
					</q-img>

				<template v-slot:action>
					<q-file v-model="uploadImage.image" label="Change Image" borderless standout filled use-chips clearable :loading="uploadImage.submitting" >
						<template v-slot:after >
							<q-btn color="primary" icon="cloud_upload" round @click="uploadProjectImage()" :loading="uploadImage.submitting" :disable="uploadImage.image == null" accept=".jpg, image/*"/>
						</template>
					</q-file>
				</template>
			</q-banner>
		</q-card-section>
		<q-card-section>
			<q-input v-model="infos.description" style="height: 100px;" label="Description" filled clearable type="textarea"/>
			<q-btn color="primary" @click="changeDescription()" label="save description" icon="save" dense flat ></q-btn>
		</q-card-section>
		<q-card-section class="q-pa-sm row items-start q-gutter-md">
			<q-card class="col col-sm-12">
				<q-list>
					<q-item tag="label" v-ripple>
						<q-item-section>
						<q-item-label>Private</q-item-label>
						<q-item-label caption>If true, only you and super admins will be able to see the project</q-item-label>
						</q-item-section>
						<q-item-section avatar>
						<q-toggle  color="blue" v-model="infos.is_private" checked-icon="check" unchecked-icon="clear" @input="changeIsPrivate()" />
						</q-item-section>
					</q-item>
					<q-item tag="label" v-ripple>
						<q-item-section>
						<q-item-label>All trees visible</q-item-label>
						<q-item-label caption>If true, annotators will be able to see others' trees</q-item-label>
						</q-item-section>
						<q-item-section avatar>
						<q-toggle  color="blue" v-model="infos.show_all_trees" checked-icon="check" unchecked-icon="clear" @input="changeShowAllTrees()" />
						</q-item-section>
					</q-item>
					<q-item tag="label" v-ripple>
						<q-item-section>
						<q-item-label>Open project</q-item-label>
						<q-item-label caption>If true, anyone can edit samples</q-item-label>
						</q-item-section>
						<q-item-section avatar>
						<q-toggle  color="green" v-model="infos.is_open" checked-icon="check" unchecked-icon="clear" @input="changeOpenProject()" />
						</q-item-section>
					</q-item>
				</q-list>
			</q-card>
			<q-card class="col col-xs-12">
				<q-card-section>
					<div class="text-h6 text-center">Default User Tree <q-btn v-show="admin" flat round icon="add" :color="$q.dark.isActive?'purple-12':'primary'" @click="addDefaultUserTreeDial = true"></q-btn></div>
				</q-card-section>
				<q-card-section >
					<q-list bordered separator class="list-size">
						<q-item v-for="dut in infos.default_user_trees" :key="dut.id" clickable v-ripple >
							<q-item-section>{{dut.username}}</q-item-section>
							<q-item-section side><q-btn v-show="admin" dense round flat icon="remove" :color="$q.dark.isActive?'red-13':'negative'" @click="triggerConfirm(removeDefaultUserTree, dut.id)" ></q-btn></q-item-section>
						</q-item>
					</q-list>
				</q-card-section>
			</q-card>
		</q-card-section>
		<q-card-section class="row items-start q-gutter-md">
			<q-card class="col col-xs-12">
				<q-card-section>
					<div class="text-h6 text-center">Admins <q-btn v-show="admin" flat round icon="add" :color="$q.dark.isActive?'purple-12':'primary'" @click="addAdminDial = true"></q-btn></div>
				</q-card-section>
				<q-card-section>
					<q-list bordered separator class="list-size">
						<q-item v-for="admin in infos.admins" :key="admin" clickable v-ripple >
							<q-item-section>{{admin}}</q-item-section>
							<q-item-section side><q-btn v-show="admin" dense round flat icon="remove" :color="$q.dark.isActive?'red-13':'negative'" @click="triggerConfirm(removeAdmin, admin)"></q-btn></q-item-section>
						</q-item>
					</q-list>
				</q-card-section>
			</q-card>
			<q-card class="col col-xs-12">
				<q-card-section>
					<div class="text-h6 text-center">Guests <q-btn v-show="admin" flat round icon="add" :color="$q.dark.isActive?'purple-12':'primary'" @click="addGuestDial = true"></q-btn></div>
				</q-card-section>
				<q-card-section >
					<q-list bordered separator class="list-size">
						<q-item v-for="guest in infos.guests" :key="guest" clickable v-ripple >
							<q-item-section>{{guest}}</q-item-section>
							<q-item-section side><q-btn v-show="admin" dense round flat icon="remove" :color="$q.dark.isActive?'red-13':'negative'" @click="triggerConfirm(removeGuest, guest)"></q-btn></q-item-section>
						</q-item>
					</q-list>
				</q-card-section>
			</q-card>
		</q-card-section>
		<q-card-section class="q-pa-sm row items-start q-gutter-md">
			<q-card class="full-width">
				<q-card-section><div class="text-h6 text-center">Relations SubLabels (to form a deprel)</div></q-card-section>
				<q-card-section>
					<q-expansion-item expand-separator icon="edit" label="Advanced Insertion" caption="Manually insert a batch of deprel using a text format">
						<q-btn icon="save" :color="$q.dark.isActive?'purple-12':'primary'" class="full-width" flat label="save textual values" @click="triggerConfirm(saveTextLabels)" ></q-btn>
	  					<codemirror v-model="txtLabels" :options="cmOption"></codemirror>
					</q-expansion-item>
				</q-card-section>
				<q-card-section class="row q-gutter-md q-pa-sm">
					<div class="col-md-4 col-xs-12 col-sm-12" v-for="(listrel, index) in infos.labels" :key="index">
						<q-btn-group spread flat>
							<q-btn flat square icon="add" :color="$q.dark.isActive?'purple-12':'primary'" @click="addLabelDial = true; stockid = listrel.id;">Label</q-btn>
							<q-btn flat square icon="remove" :color="$q.dark.isActive?'red-13':'negative'"  @click="triggerConfirm(removeLabelColumn, listrel.id)" >Column</q-btn>
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
								<q-item-section side><q-btn v-show="admin" dense round flat icon="remove" :color="$q.dark.isActive?'red-13':'negative'" @click="triggerConfirm(removeLabel, item)"></q-btn></q-item-section>

							</q-item>
							</template>
						</q-virtual-scroll>
					</div>
					<div class="col-md-4 col-xs-12 col-sm-12">
						<q-btn flat :color="$q.dark.isActive?'purple-12':'primary'" icon="add" label="" class="full-width full-height" @click="addLabelColumn()"></q-btn>
					</div>
				</q-card-section>
			</q-card>
		</q-card-section>
		<q-card-section class="q-pa-md row items-start ">
			<q-card class="full-width">
				<q-card-section><div class="text-h6 text-center">Categories (POS tags)</div></q-card-section>
				<q-card-section>
					<q-expansion-item expand-separator icon="edit" label="Advanced Insertion" caption="Manually insert a batch of tags using a text format">
						<q-btn icon="save" :color="$q.dark.isActive?'purple-12':'primary'" class="full-width" flat label="save textual values" @click="triggerConfirm(saveTextCats)"></q-btn>
	  					<codemirror v-model="txtCats" :options="cmOption"></codemirror>
					</q-expansion-item>
				</q-card-section>
				<q-card-section class="row q-gutter-md q-pa-md">
					<div class="col">
						<q-btn flat square icon="add" :color="$q.dark.isActive?'purple-12':'primary'" class="full-width" @click="addCatDial = true">Cat</q-btn>
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
								<q-item-section side><q-btn v-show="admin" dense round flat icon="remove" :color="$q.dark.isActive?'red-13':'negative'" @click="triggerConfirm(removeCat, item)"></q-btn></q-item-section>
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
		<q-dialog v-model="addAdminDial" transition-show="fade" transition-hide="fade">  <user-select-table :parentCallback="addAdmin" :general="true"></user-select-table>   </q-dialog>
		<q-dialog v-model="addGuestDial" transition-show="fade" transition-hide="fade">  <user-select-table :parentCallback="addGuest" :general="true"></user-select-table>   </q-dialog>
		<q-dialog v-model="addDefaultUserTreeDial" transition-show="fade" transition-hide="fade">  <user-select-table :parentCallback="addDefaultUserTree" :general="false" :projectname="$props.projectname"></user-select-table>   </q-dialog>
		<q-dialog v-model="confirmActionDial"> <confirm-action :parentAction="confirmActionCallback" :arg1="confirmActionArg1"></confirm-action> </q-dialog>
		<q-dialog v-model="addCatDial">
			<q-card>
				<q-bar class="bg-primary text-white">
					<q-space />
					<div class="text-weight-bold">Add a Category</div>
					<q-space />
					<q-btn flat dense icon="close" v-close-popup/>
				</q-bar>
				<q-card-section > 
					<q-form @submit="addCat" @reset="resetCat">
						<q-input v-model="entryCat" label="Cat (Part-of-Speech)" counter dense></q-input>
						<q-btn rounded flat label="Reset" type="reset" />
						<q-btn color="primary" icon="add" label="Add" type="submit" v-close-popup/>
					</q-form>
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
					<q-form @submit="addLabel" @reset="resetLabel">
						<q-input v-model="entryLabel" label="Label Part (for deprel)" counter dense></q-input>
						<q-btn rounded flat label="Reset" type="reset" />
						<q-btn color="primary" icon="add" label="Add" type="submit" v-close-popup/>
					</q-form>
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
import ConfirmAction from '../components/ConfirmAction.vue';

export default {
	name: 'project-settings-view',
	components: { codemirror, UserSelectTable, ConfirmAction },
	props: ['projectname'],
	data(){
		return{
			addAdminDial: false,
			addGuestDial: false,
			addLabelDial: false,
			addCatDial: false,
			addDefaultUserTreeDial: false,
			confirmActionDial: false,
			confirmActionCallback: null,
			confirmActionArg1: '',
			entryCat: '',
			entryLabel: '',
			stockid: '',
			uploadImage: {image: null, submitting: false},
			infos: {admins:[], guests:[], labels:[], cats:[], description: ''},
			txtCats: `# please drop your categories here in a comma separated format. For instance:
VER,DET,NOMcom`,
			txtLabels: `# please drop your labels here in a comma separated format with one column per line. For instance:
subj,comp,vocative
:aux,:caus,:cleft`,
			config: ``,
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
		getProjectInfos(){ api.getProjectSettings(this.$props.projectname).then(response => {
			console.log(response.data); 
			this.infos = response.data; }).catch(error => {
				this.$store.dispatch("notifyError", {error: error}); 
				this.$q.notify({message: `${error}`, color:'negative', position: 'bottom'});}) },



		addAdmin(selected){ api.setProjectUserRole(this.$props.projectname, 'admin', selected[0].id).then(response => {this.$q.notify({message:`Change saved!`}); this.infos = response.data}).catch(error => {this.$store.dispatch("notifyError", {error: error})});  },
		removeAdmin(userid){ api.removeProjectUserRole(this.$props.projectname, 'admin', userid).then( response => {this.$q.notify({message:`Change saved!`}); this.infos = response.data;} ).catch(error => {this.$store.dispatch("notifyError", {error: error})});  },
		addGuest(selected){ api.setProjectUserRole(this.$props.projectname, 'guest', selected[0].id).then(response=> {this.$q.notify({message:`Change saved!`});this.infos = response.data;}).catch(error => {this.$store.dispatch("notifyError", {error: error})});  },
		removeGuest(userid){ api.removeProjectUserRole(this.$props.projectname, 'guest', userid).then( response => {this.$q.notify({message:`Change saved!`}); this.infos = response.data;} ).catch(error => {this.$store.dispatch("notifyError", {error: error})});  },
		addLabel(){  api.addProjectStockLabel(this.$props.projectname, this.stockid, this.entryLabel).then(response => {this.$q.notify({message:`Change saved!`}); this.infos.labels = response.data; this.entryLabel='';}).catch(error => { this.$store.dispatch("notifyError", {error: error}); })  },
		removeLabel(item){ api.removeProjectStockLabel(this.$props.projectname, item.id, item.stock_id, item.value).then(response => {this.$q.notify({message:`Change saved!`}); this.infos.labels = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); })  },
		resetLabel(){ this.entryLabel = ''; },
		addLabelColumn(){ api.addProjectStock(this.$props.projectname).then(response => {this.$q.notify({message:`Change saved!`}); this.infos.labels = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); })  },
		removeLabelColumn(stockid){ api.removeProjectStock(this.$props.projectname, stockid).then(response => {this.$q.notify({message:`Change saved!`}); this.infos.labels = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); })  },
		addCat(){ api.addProjectCatLabel(this.$props.projectname, this.entryCat).then(response => {this.$q.notify({message:`Change saved!`}); this.infos.cats = response.data; this.entryCat = '';}).catch(error => { this.$store.dispatch("notifyError", {error: error}); }) },
		removeCat(cat){ api.removeProjectCatLabel(this.$props.projectname, cat).then(response => {this.$q.notify({message:`Change saved!`}); this.infos.cats = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); })},
		resetCat(){ this.entryCat = ''; },

		addDefaultUserTree(selected){ api.addDefaultUserTree(this.$props.projectname, selected[0]).then(response => {this.$q.notify({message:`Change saved!`}); this.infos = response.data;}).catch(error => {this.$store.dispatch("notifyError", {error: error})});  },
		removeDefaultUserTree(dutid){ api.removeDefaultUserTree(this.$props.projectname, dutid).then( response => {this.$q.notify({message:`Change saved!`}); this.infos = response.data;} ).catch(error => {this.$store.dispatch("notifyError", {error: error})});  },
		

		changeShowAllTrees(){ api.modifyShowAllTrees(this.$props.projectname, this.infos.show_all_trees).then(response => {this.$q.notify({message:'Change saved!'}); this.infos = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); }) },
		changeOpenProject(){ api.modifyOpenProject(this.$props.projectname, this.infos.is_open).then(response => {this.$q.notify({message:`Change saved!`}); this.infos = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); }) },
		changeIsPrivate(){ api.modifyPrivate(this.$props.projectname, this.infos.is_private).then(response => {this.$q.notify({message:`Change saved!`}); this.infos = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); }) },
		changeDescription(){ api.modifyDescription(this.$props.projectname, this.infos.description).then(response => {this.$q.notify({message:`Change saved!`}); this.infos = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); }) },
		uploadProjectImage(){ 
			this.uploadImage.submitting = true;
			var form = new FormData();
			form.append('files', this.uploadImage.image);
			// for(const file of this.uploadImage.image){ form.append('files',file); }
			api.uploadProjectImage(this.$props.projectname, form).then(response => {
				this.uploadImage.submitting = false;
				this.uploadImage.image = null;
				this.$q.notify({message:`Uploaded image saved!`}); this.infos = response.data; 
			}).catch(error => { this.$store.dispatch("notifyError", {error: error});  this.uploadImage.submitting = false;}); 
		},


		saveTextCats(){ 
			api.saveTxtCats(this.$props.projectname, this.txtCats).then(response => { this.$q.notify({message:`Change saved!`}); this.infos.cats = response.data;}).catch(error => { this.$store.dispatch("notifyError", {error: error}); }); 
		},
		saveTextLabels(){ 
			api.saveTxtLabels(this.$props.projectname, this.txtLabels).then(response => { console.log(JSON.stringify(response.data)); this.$q.notify({message:`Change saved!`}); this.infos.labels = response.data;}).catch(error => { this.$store.dispatch("notifyError", {error: error}); }); 
		},

		triggerConfirm(method, arg){
			this.confirmActionDial = true;
			this.confirmActionCallback = method;
			this.confirmActionArg1 = arg;
		}
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
.cm-height {
	height: 50px;
}
</style>