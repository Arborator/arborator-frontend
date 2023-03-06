<template>
    <q-dialog v-model="emailCollectDialog" persistent>
      <q-card style="min-width: 50vw;">
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
             <q-card-section class="text-body2 text-weight-light text-justify q-pt-none" :class="$q.dark.isActive ? 'text-white' : 'text-blue-grey-10'"> {{ $t('homepage.textGetUserEmailDialog[1]')}} </q-card-section>
              <q-card-section class="text-body2 text-weight-light text-justify q-pt-none" :class="$q.dark.isActive ? 'text-white' : 'text-blue-grey-10'"> {{ $t('homepage.textGetUserEmailDialog[2]')}} </q-card-section>
            <q-card-section>
                <q-input 
                    v-model="email"
                    :disable="notShareEmail == true"
                    type="email" 
                    label="Email" 
                    :rules="[emailRules]"
                />
                <div class="text-weight-light" :class="$q.dark.isActive ? 'text-white' : 'text-blue-grey-10'">
                    <q-checkbox size="xs" v-model="shareEmail" v-on:click.event="notShareEmail = false"/>{{ $t('homepage.checkboxEmailDialog[0]')}}
                </div>
                <div class="text-weight-light" :class="$q.dark.isActive ? 'text-white' : 'text-blue-grey-10'">
                    <q-checkbox size="xs" v-model="subscribeNewsletter" v-on:click.event="notShareEmail = false" />{{ $t('homepage.checkboxEmailDialog[2]')}}
                </div>
                <div class="text-weight-light" :class="$q.dark.isActive ? 'text-white' : 'text-blue-grey-10'">
                    <q-checkbox size="xs" v-model="notShareEmail" v-on:click.event="chooseNotShareEmail" />{{ $t('homepage.checkboxEmailDialog[1]')}}
                </div>
            </q-card-section>
            <q-card-actions align="around">
                <div>
                    <q-btn :disable="!notShareEmail && !shareEmail" type="submit" color="primary">
                        {{ $t('homepage.submitEmailBtn')}}
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
        shareEmail: false,
        notShareEmail: false,
        subscribeNewsletter: false,
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
        emailRules() {
            if (!this.notShareEmail){
                return this.email.length > 0 || this.$t('homepage.inputErrorText[0]') , this.isValidEmail(this.email) || this.$t('homepage.inputErrorText[1]')
            }
        },
        chooseNotShareEmail() {
            this.shareEmail = false;
            this.subscribeNewsletter = false; 
            this.email = '';  
        },
        onSubmitEmail() {
            this.emailCollectDialog = false
            api
              .updateUser({email : this.email, not_share_email: this.notShareEmail, receive_newsletter: this.subscribeNewsletter })
              .then((response) => {
                notifyMessage({message: this.$t('homepage.submitMessage')})
              })
              .catch((error) => {
                notifyError({error})
              })
        }, 
    }
});
</script>
<style>

</style>