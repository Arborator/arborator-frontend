<template>
	<q-card :class="$q.dark.isActive?'':'bg-blue-grey-1 text-black'" style="max-width: 100vw;">
		<q-bar class="bg-primary text-white">
			<q-space />
			<div class="text-weight-bold">Settings</div>
			<q-space />
			<q-btn dense flat icon="close" v-close-popup>
				<q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
			</q-btn>
		</q-bar>
		<q-card-section>
			<div class="text-h6">{{infos.name}}</div>
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
	</q-card>
</template>

<script>
import api from '../boot/backend-api.js';
export default {
	props: ['projectname'],
	data(){
		return{
			infos: {}
		}
	},
	mounted(){
		this.getProjectInfos();
	},
	methods:{
		getProjectInfos(){
			api.getProjectSettings(this.$props.projectname).then(response => {this.infos = response.data;}).catch(error => {console.log(error); this.$q.notify({message: `${error}`, color:'negative', position: 'bottom'});})
		}
	}
}
</script>