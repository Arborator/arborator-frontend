<template>
    <q-dialog v-model="emailCollectDialog" persistent>
      <q-card style="max-width: 50vw;">
        <q-form @submit="onSubmit">
            <q-bar class="bg-primary text-white">
                <q-space />
                <q-btn dense flat icon="close" v-close-popup /> 
            </q-bar>
            <q-card-section class="text-body2 text-weight-light text-justify text-blue-grey-10"> {{ $t('homepage.textGetUserEmailDialog[0]')}} </q-card-section>
            <q-card-section>
                <q-input 
                    v-model="email"
                    type="email" 
                    label="Email" 
                    :rules="[
                        (val) => (val && val.length > 0) ||  'Please type something',
                        (val) => (isValidEmail(val)) ||  'Please type valid email',
                    ]"
                />
                <div class="text-weight-light text-blue-grey-10">
                    <q-checkbox size="xs" v-model="validate" />{{ $t('homepage.textGetUserEmailDialog[1]')}}
                </div>
            </q-card-section>
            <q-card-actions align="around">
                <q-btn color="primary">{{ $t('homepage.textGetUserEmailDialog[2]')}}</q-btn>
            </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
</template>
<script lang="ts">
import {useUserStore} from 'src/pinia/modules/user';
import {mapActions, mapState} from 'pinia';

import {defineComponent} from 'vue';
export default defineComponent({
    name: 'EmailCollectDialog',
    props: {      
    },
    data() {
      return {
        emailCollectDialog: true, 
        validate: false,
        email:'', 
      }  

    }, 
    computed: {
        ...mapState(useUserStore, ['getUserInfos', 'loggedWithGithub']),
    }, 
    methods: {
        isValidEmail(val: any) {
            let emailRegExp = new RegExp('^[A-Za-z0-9._%+-]+@[a-z0-9-]+\.[A-Za-z]{2,4}$')
            return emailRegExp.test(val)
        }
    }
});
</script>
<style>

</style>