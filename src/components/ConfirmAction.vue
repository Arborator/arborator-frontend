<template>
	<q-card>
		<q-bar class="bg-primary text-white">
			<q-space />
			<div class="text-weight-bold">Are you sure?</div>
			<q-space />
			<q-btn flat dense icon="close" v-close-popup/>
		</q-bar>
		<q-card-section>
			You are about to perform an irrevocable action. Do you really want to proceed?
		</q-card-section>
		<q-card-actions>
			<q-btn label="Cancel" v-close-popup></q-btn>
			<q-btn @keyup.enter="confirm()" @click="confirm()" label="Confirm" v-close-popup></q-btn>
		</q-card-actions>
	</q-card>	
</template>

<script>
export default {
	name: 'confirm-action',
	props: ['parentAction', 'arg1'],
	data(){
		return {

		}
	},
	methods:{
		confirm(){
			this.$props.parentAction(this.arg1);
		}
	}
}
</script>