<template>
    <div class="q-pa-md q-gutter-sm">
        <div class="row">
            <div class="col-md-1"></div>
            <div class="col items-center">
                <q-banner rounded :class="$q.dark.isActive?'':'bg-grey-3' ">
                    <template v-slot:avatar>
                        <q-avatar :key="store.getters['user/getAvatarKey']" color="default" text-color="white" size="100px"  >
                            <img :src="user.picture_url">
                        </q-avatar>
                    </template>
                    <div class="row"><div :class="'col text-center text-weight-bold text-h4 ' + ($q.dark.isActive?'':'text-blue-grey-10')">{{user.first_name}} {{user.family_name}}</div></div>
                    <div class="row">
                        <div :class="'col text-center ' + + ($q.dark.isActive?'':'text-blue-grey-8')">@{{user.username}}</div>
                    </div>
                    <div v-show="user.super_admin" class="row">
                        <div :class="'col text-center ' + ($q.dark.isActive?'':'text-blue-grey-8')">Super Admin</div>
                    </div>
                </q-banner>
            </div>
            <div class="col-md-1"></div>
        </div>

        <div class="row">
            <div class="col-md-1"></div>
            <div class="col-md-4 col-xs-12">
                <q-card flat >
                    <q-form>
                        <q-card-section>
                            <div class="text-h6 text-blue-grey-8">Personal Informations</div>
                        </q-card-section>
                        <q-card-section>
                            <div class="q-gutter-lg">
                                <q-input type="email" v-model="user.id" label="Email"  />
                                <q-input type="text" v-model="user.first_name" label="First Name" />
                                <q-input type="text" v-model="user.family_name" label="Last Name" />
                            </div>
                        </q-card-section>
                        <q-card-actions align="right">
                            <q-btn label="Save Modifications" type="submit" icon="save" color="primary" :loading="savingModifs"/>
                        </q-card-actions>
                    </q-form>
                </q-card>
            </div>
            <div class="col-md-1"></div>
            
        </div>
    </div>
</template>

<script>
import api from '../boot/backend-api';
import Store from '../store/index';

export default {
    name: 'settings',
    data(){
        return {
            user: this.$store.getters['user/getUserInfos'],
            store: Store,
            alerts: { 'saveerror': { color: 'negative', message: 'Could not save the data.', icon: 'report_problem' },
                'savesuccess': { color: 'positive', message: 'Modifications saved' },
                'denied': { color: 'warning', icon: 'report_problem', message: 'Denied! Contact an administrator.'}
            },
            savingModifs: false,
            isPwd: true,
            tempPwd: ''
        }
    },
    methods: {
        forceRerenderAvatar() {
            this.$store.commit('increment_avatar_key');
            this.showNotif('top-right', 'savesuccess');
        },
        showNotif (position, alert) {
            const { color, textColor, multiLine, icon, message, avatar, actions } = this.alerts[alert];
            const buttonColor = color ? 'white' : void 0;
            this.$q.notify({
                color,
                textColor,
                icon: icon,
                message,
                position,
                avatar,
                multiLine,
                actions: actions,
                timeout: 2000
            })
        }
    }
}
</script>

<style scoped>

</style>