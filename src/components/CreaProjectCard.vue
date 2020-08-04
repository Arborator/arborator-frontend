<template>
	<q-card :class="$q.dark.isActive?'bg-dark':'bg-grey-1'">
		<q-bar>
			<q-space />
			<q-btn dense flat icon="close" v-close-popup>
				<q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
			</q-btn>
		</q-bar>
		<q-card-section>
			<!-- <q-form @submit="onSubmitInit" @reset="onReset" class="q-gutter-md">
				<q-input filled	v-model="projectName" label="Project name" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
				<input type="file" class="form-control" @change="onFileChange" multiple/>
				<div>
					<q-btn type="submit" :loading="submitting" label="upload" color="teal" class="q-mt-md">
						<template v-slot:loading><q-spinner-facebook/></template>
					</q-btn>
					<q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
				</div>
			</q-form> -->

			<q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md" id="createprojectform">
				<q-input id="projectnameinput" filled v-model="projectName" label="Project name" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
				<q-input id="descriptioninput" filled v-model="description" label="Description" />
				<!-- <q-toggle v-model="visibility" label="Visibility" /> -->
				<div>
				<q-btn-toggle label="Visibility"  glossy v-model="visibility" toggle-color="primary" :options="[
					{label: 'Private', value: 0},
					{label: 'Visible', value: 1},
					{label: 'Open', value: 2}]" />
				</div>
				<!-- <q-toggle v-model="isOpen" label="Open Project" /> -->
				<q-toggle v-model="showAllTrees" label="Show All Trees" />
				<div>
					<q-btn id="submitproject" type="submit" :loading="submitting" label="create" color="primary" class="q-mt-md" v-close-popup/>
					<q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
				</div>
			</q-form>

			
		</q-card-section>
	</q-card>
</template>

<script>

import api from '../boot/backend-api';

export default {
	props:['parentGetProjects'],
	data(){
		return {
			submitting: false,
			projectName: '',
			description: '',
			visibility: 2,
			isOpen: true,
			showAllTrees: true,
			attachment: { name: null, file: null}
		}
	},
	methods: {
		/**
		 * Not used ! Handle project submission and creation for initializing
		 * 
		 * @deprecated
		 * @returns void
		 */
		onSubmitInit(){
			this.submitting = true;
			var form = new FormData();
			this.submitting = true;
			for(const file of this.attachment.file){ form.append('files',file); }
			form.append('import_user',this.$store.getters.getUserInfos.username);
			api.createInitializedProject(this.projectName, form).then( response => { this.attachment.file = []; this.$props.parentGetProjects(); this.submitting = false; this.$q.notify({message: `${this.projectName} uploaded and created.`,color: 'positive'})})
			.catch(error => {this.$store.dispatch("notifyError", {error: error}); this.submitting = false; });
		},
		/**
		 * Handle project submission by creating form data and sending to backend
		 * 
		 * @returns void
		 */
		onSubmit(){
			this.submitting = true;
			var form = new FormData();
			this.submitting = true;
			form.append('import_user',this.$store.getters.getUserInfos.username);
			form.append('project_name',this.projectName);
			form.append('description', this.description);
			form.append('visibility', this.visibility);
			// form.append('is_open', this.isOpen);
			form.append('show_all_trees', this.showAllTrees);
			this.$store.dispatch("resetProjectConfig"); // reset annotationFeature object
			api.createProject(form)
			.then( response => { 
				this.attachment.file = []; 
				this.$props.parentGetProjects(); 
				this.submitting = false; 
				this.$q.notify({message: `${this.projectName} uploaded and created.`});
			})
			.catch(error => {
				this.$store.dispatch("notifyError", {error: error});
				this.submitting = false;
			});
		},
		/**
		 * @TODO : Nothing yet ,to delete ?
		 */
		onReset(){},
		/**
		 * Attach the file when the event is triggerred
		 * 
		 * @param {Event} event
		 * @returns void
		 */
		onFileChange(event) { 
			this.attachment.file = event.target.files;
		}
	}
}
</script>
