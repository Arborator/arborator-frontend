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

			<q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
				<q-input filled	v-model="projectName" label="Project name" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
				<q-input filled	v-model="description" label="Description" />
				<q-toggle v-model="isPrivate" label="Private?" />
				<div>
					<q-btn type="submit" :loading="submitting" label="create" color="primary" class="q-mt-md" v-close-popup/>
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
			isPrivate: false,
			attachment: { name: null, file: null}
		}
	},
	methods: {
		onSubmitInit(){
			this.submitting = true;
			var form = new FormData();
            this.submitting = true;
            for(const file of this.attachment.file){ form.append('files',file); }
            form.append('import_user',this.$store.getters.getUserInfos.username);
            api.createInitializedProject(this.projectName, form).then( response => { this.attachment.file = []; this.$props.parentGetProjects(); this.submitting = false; this.$q.notify({message: `${this.projectName} uploaded and created.`,color: 'positive'})})
            .catch(error => {console.log(error); this.$q.notify({message: `${error}`,color: 'negative', position:'bottom'}); this.submitting = false; });
		},
		onSubmit(){
			this.submitting = true;
			var form = new FormData();
            this.submitting = true;
			form.append('import_user',this.$store.getters.getUserInfos.username);
			form.append('project_name',this.projectName);
			form.append('description', this.description);
			form.append('private', this.isPrivate);
            api.createProject(form).then( response => { this.attachment.file = []; this.$props.parentGetProjects(); this.submitting = false; this.$q.notify({message: `${this.projectName} uploaded and created.`}); })
            .catch(error => {console.log(error); this.$q.notify({message: `${error}`,color: 'negative', position:'bottom'}); this.submitting = false; });
		},
		onReset(){

		},
		onFileChange(event) { this.attachment.file = event.target.files; }
	}
}
</script>
