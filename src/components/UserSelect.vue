<template>
    <q-card bordered class="col">
        <q-card-section class="row">
            <div class="col-md-7 text-h6">
                Share "{{ projectName }}"
            </div>
            <div class="col-md-1 offset-md-4">
                <q-btn outline round size="sm" color="primary" icon="question_mark"
                    href="https://arborator.github.io/arborator-documentation/#/?id=collaborating-in-projects"
                    target="_blank">
                    <q-tooltip content-class="text-white bg-primary"> Assistence </q-tooltip>
                </q-btn>
            </div>     
        </q-card-section>
        <q-card-section>
            <div class="row q-gutter-md">
                <div class="col-9">
                    <q-select outlined v-model="selectedUsers" :options="filteredUserOptions" dense stack-label multiple
                        use-input hide-dropdown-icon label="Add new users">
                        <template v-slot:selected-item="scope">
                            <q-chip v-if="scope.opt.email" removable @remove="scope.removeAtIndex(scope.index)"
                                :tabindex="scope.tabindex" dense text-color="primary">
                                <q-avatar color="primary" text-color="white">
                                    <img :src="scope.opt.avatar" />
                                </q-avatar>
                                {{ scope.opt.username }}
                            </q-chip>
                            <q-badge v-else>*none*</q-badge>
                        </template>
                        <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                                <q-item-section avatar>
                                    <q-avatar size="1.2rem">
                                        <img :src="scope.opt.avatar" />
                                    </q-avatar>
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label>{{ scope.opt.username }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.email }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </template>
                        <template v-slot:no-option>
                            <q-item>
                                <q-item-section class="text-grey">
                                    No results
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>
                </div>
                <div class="col-1">
                    <q-btn-dropdown outline color="primary" no-caps :label="targetRole">
                        <q-list v-for="role in roles">
                            <q-item clickable v-close-popup @click="targetRole =role">
                                <q-item-section>
                                    <q-item-label>{{ role }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                </div>
            </div>
        </q-card-section>
        <q-card-section class="q-pa-none" v-if="!(selectedUsers.length > 0)">
            <div class="text-h6 q-pa-md">
                Users with access
            </div>
            <div>
                <q-list v-for="member in projectMembers">
                    <q-item class="item">
                        <q-item-section top avatar>
                            <q-avatar rounded>
                                <img :src="member.avatar">
                            </q-avatar>
                        </q-item-section>

                        <q-item-section>
                            <q-item-label>{{ member.username }}</q-item-label>
                            <q-item-label caption>
                                {{ member.email }}
                            </q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn-dropdown flat outline color="primary" no-caps label="Role">
                                <q-list>
                                    <q-item clickable v-close-popup>
                                        <q-item-section avatar>
                                            <q-icon v-if="admins.includes(member.username)" name="done" />
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label>Admin</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                    <q-item clickable v-close-popup>
                                        <q-item-section avatar>
                                            <q-icon v-if="validators.includes(member.username)" name="done" />
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label>Validator</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                    <q-item clickable v-close-popup>
                                        <q-item-section avatar>
                                            <q-icon v-if="annotators.includes(member.username)" name="done" />
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label>Annotator</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                    <q-item clickable v-close-popup>
                                        <q-item-section avatar>
                                            <q-icon v-if="guests.includes(member.username)" name="done" />
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label>Guest</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                    <q-separator />
                                    <q-item clickable v-close-popup @click="revokeUserAccess(member.username)">
                                        <q-item-section>
                                            <q-item-label>Revoke access</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </q-btn-dropdown>
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>
        </q-card-section>
        <q-card-section class="q-gutter-md" v-else>
            <div class="text-weight-regular">
                <q-checkbox v-model="sendNotif" label="Send notification" />
            </div>
            <div class="row justify-between">
                <q-btn outline icon="link" color="primary" label="Copy link" @click="copyLink()" />
                <q-btn color="primary" label="Share" @click="updateUserAccess"/>
            </div>
        </q-card-section>
    </q-card>
</template>
<script lang="ts">
import api from '../api/backend-api';
import { mapState, mapWritableState, } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { user_t } from '../api/backend-types';
import { defineComponent, PropType } from 'vue';

interface userOption_t {
    username: string,
    email: string,
    avatar: string,
}

export default defineComponent({
    name: 'UserSelect',
    props: {
        projectName: {
            type: String as PropType<string>,
            required: true,
        },
    },
    data() {
        const users: user_t[] = [];
        const userOptions: userOption_t[] = [];
        const selectedUsers: userOption_t[] = [];
        const roles: string[] = ['Admin', 'Validator', 'Annotator', 'Guest'];
        return {
            users,
            userOptions,
            selectedUsers,
            roles,
            targetRole: 'Role',
            sendNotif: false,
        };
    },
    computed: {
        ...mapWritableState(useProjectStore, ['admins', 'validators', 'annotators', 'guests']),
        excludedUserOptions() {
            return [...this.admins, ...this.validators, ...this.annotators, ...this.guests];
        },
        filteredUserOptions() {
            this.userOptions = this.users.reduce((options: userOption_t[], user) => {
                if (!this.excludedUserOptions.includes(user.username)) {
                    options.push({
                        username: user.username,
                        email: user.email,
                        avatar: user.picture_url
                    })
                }
                return options;
            }, []);
            return this.userOptions;
        },
        projectMembers() {
            let projectMembers = [];
            projectMembers = this.users.reduce((options: userOption_t[], user) => {
                if (this.excludedUserOptions.includes(user.username)) {
                    options.push({
                        username: user.username,
                        email: user.email,
                        avatar: user.picture_url
                    })
                }
                return options;
            }, []);
            return projectMembers;
        },

    },
    mounted() {
        this.getUsers();
    },
    methods: {
        getUsers() {
            api
              .getUsers()
              .then((response) => {
                    this.users = response.data;
               })
              .catch((error) => {
                    notifyError({ error });
            });
        },
        updateUserAccess() {
            const data = {
                targetRole: this.targetRole.toLowerCase(), 
                selectedUsers: this.selectedUsers.map((user) => user.username)
            };
            api
              .updateManyProjectUserAccess(this.projectName, data)
              .then((response) => {
                notifyMessage({ message: 'New members saved on the server', icon: 'save' });
                this.selectedUsers = [];
                this.admins = response.data.admins;
                this.guests = response.data.guests;
                this.annotators = response.data.annotators;
                this.validators = response.data.validators
              })
              .catch((error) => { 
                notifyError({ error }); 
            });
        },
        revokeUserAccess(username: string) {
            api
              .deleteProjectUserAccess(this.projectName, username)
              .then((response) => {
                notifyMessage({ message: 'Guest removal saved on the server', icon: 'save' });
                this.admins = response.data.admins;
                this.guests = response.data.guests;
                this.annotators = response.data.annotators;
                this.validators = response.data.validators
              })
              .catch((error) => {
                notifyError({ error });
              });
        },
    }


});
</script>
<style scoped lang="stylus">

.item:hover {
background-color: #8e7fc029;
}

</style>