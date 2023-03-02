<template>
    <q-dialog v-model="emailCollectDialog" persistent>
      <q-card style="max-width: 50vw;">
        <q-form @submit="onSubmitEmail">
            <q-bar class="bg-primary text-white">
                <q-space />
                <q-btn dense flat icon="close" v-close-popup /> 
            </q-bar>
            <q-card-section>
                <div class="text-center">
                    <img v-if="$q.dark.isActive" alt="Arborator" src="/svg/arborator.grew.white.svg" class="brandinglogo" />
                    <img v-else alt="Arborator" src="/svg/arborator.grew.svg" class="brandinglogo" />
                </div>
            </q-card-section>
            <q-card-section class="text-body2 text-weight-light text-justify" :class="$q.dark.isActive ? 'text-white' : 'text-blue-grey-10'"> {{ $t('homepage.textGetUserEmailDialog[0]')}} </q-card-section>
            <q-card-section>
                <q-input 
                    v-model="email"
                    type="email" 
                    label="Email" 
                    :rules="[
                        (val) => (val && val.length > 0) ||  $t('homepage.inputErrorText[0]'),
                        (val) => (isValidEmail(val)) ||  $t('homepage.inputErrorText[1]'),
                    ]"
                />
                <div class="text-weight-light" :class="$q.dark.isActive ? 'text-white' : 'text-blue-grey-10'">
                    <q-checkbox size="xs" v-model="validate" />{{ $t('homepage.textGetUserEmailDialog[1]')}}
                </div>
            </q-card-section>
            <q-card-actions align="around">
                <div>
                    <q-btn :disable="!validate || email === ''" type="submit" color="primary">
                        {{ $t('homepage.textGetUserEmailDialog[2]')}}
                    </q-btn>
                    <q-tooltip v-if="!validate" content-class="text-white bg-primary">{{ $t('homepage.tootltipBtnSumbitUserEmail')}}</q-tooltip>
                </div>
                <div>
                    <q-btn outline color="red-10" @click="notShareEmail">
                        {{ $t('homepage.notShareEmailBtn')}}
                    </q-btn>
                </div>
            </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
</template>
<script lang="ts">
import api from '../../api/backend-api';
import {LocalStorage} from 'quasar';
import {notifyError, notifyMessage} from 'src/utils/notify';
import {mapActions, mapState} from 'pinia';
import {useUserStore} from 'src/pinia/modules/user';

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
        ...mapState(useUserStore, ['username'])
    },
    methods: {
        isValidEmail(val: any) {
            let emailRegExp = new RegExp('^[A-Za-z0-9._%+-]+@[a-z0-9-]+\.[A-Za-z]{2,4}$')
            return emailRegExp.test(val)
        },
        onSubmitEmail() {
            api
              .updateUser({email : this.email })
              .then((response) => {
                notifyMessage({message: 'Email updated'})
              })
              .catch((error) => {
                notifyError({error})
              })
        }, 
        notShareEmail() {
            LocalStorage.set('shareEmail', false);
            this.emailCollectDialog = false;
        }
    }
});
</script>
<style>

</style>