<template>
  <q-card flat bordered class="col">
    <q-card-section class="row">
      <div class="col-md-7 text-h6">{{ $t('userSelect.share') }} "{{ projectName }}"</div>
      <div class="col-md-1 offset-md-4">
        <q-btn
          outline
          round
          size="sm"
          color="primary"
          icon="question_mark"
          href="https://arborator.github.io/arborator-documentation/#/?id=collaborating-in-projects"
          target="_blank"
        >
          <q-tooltip content-class="text-white bg-primary"> Assistance </q-tooltip>
        </q-btn>
      </div>
    </q-card-section>
    <q-card-section>
      <div class="row q-gutter-md">
        <div class="col-9">
          <q-select
            outlined
            dense
            v-model="selectedUsers"
            use-input
            multiple
            hide-dropdown-icon
            option-value="username"
            option-label="email"
            input-debounce="0"
            :label="$t('userSelect.addUser')"
            :options="filteredUsers"
            @filter="filterOption"
          >
            <template v-slot:selected-item="scope">
              <q-chip
                v-if="scope.opt.username"
                removable
                @remove="scope.removeAtIndex(scope.index)"
                :tabindex="scope.tabindex"
                dense
                text-color="primary"
              >
                <q-avatar color="primary" text-color="white">
                  <img :src="scope.opt.avatar" />
                </q-avatar>
                {{ scope.opt.username }}
              </q-chip>
            </template>
            <template v-slot:option="scope">
              <q-item v-close-popup v-bind="scope.itemProps">
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
                <q-item-section class="text-grey">{{ $t('userSelect.noResult') }}</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="col-1">
          <q-btn-dropdown outline color="primary" no-caps :label="targetRole">
            <q-list v-for="role in filteredRoles">
              <q-item clickable v-close-popup @click="targetRole = role">
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
      <div class="text-h6 q-pa-md">{{ $t('userSelect.userAccess') }}</div>
      <div>
        <q-list v-for="member in projectMembers">
          <q-item class="item">
            <q-item-section top avatar>
              <q-avatar rounded>
                <img :src="member.avatar" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ member.username }}</q-item-label>
              <q-item-label caption>
                {{ member.email }}
              </q-item-label>
            </q-item-section>
            <q-item-section v-if="admins[0] === member.username" side>
              <q-btn outline flat :disable="true" color="primary" :label="$t('userSelect.owner')" />
            </q-item-section>
            <q-item-section v-else side>
              <q-btn-dropdown flat outline color="primary" no-caps :label="userRole(member.username)">
                <q-list>
                  <q-item clickable v-close-popup @click="updateExistingUserAccess(member, 'admin')">
                    <q-item-section avatar>
                      <q-icon v-if="admins.includes(member.username)" name="done" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('userSelect.roles[0]') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="updateExistingUserAccess(member, 'validator')">
                    <q-item-section avatar>
                      <q-icon v-if="validators.includes(member.username)" name="done" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('userSelect.roles[1]') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="updateExistingUserAccess(member, 'annotator')">
                    <q-item-section avatar>
                      <q-icon v-if="annotators.includes(member.username)" name="done" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('userSelect.roles[2]') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item v-if="visibility == 0" clickable v-close-popup @click="updateExistingUserAccess(member, 'guest')">
                    <q-item-section avatar>
                      <q-icon v-if="guests.includes(member.username)" name="done" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('userSelect.roles[3]') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="revokeUserAccess(member.username)">
                    <q-item-section>
                      <q-item-label>{{ $t('userSelect.revokeAccess') }}</q-item-label>
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
        <q-checkbox v-model="sendNotif" :label="$t('userSelect.sendNotfi')" />
      </div>
      <div class="row justify-between">
        <q-btn outline icon="link" color="primary" :label="$t('userSelect.copyLink')" @click="copyLink()">
          <q-tooltip content-class="bg-white text-primary">{{ $t('userSelect.copyLink') }}</q-tooltip>
        </q-btn>
        <q-btn :disable="targetRole === 'Role'" color="primary" :label="$t('userSelect.share')" @click="updateUserAccess" />
      </div>
    </q-card-section>
  </q-card>
</template>
<script lang="ts">
import { mapState, mapWritableState } from 'pinia';
import { copyToClipboard } from 'quasar';
import { useProjectStore } from 'src/pinia/modules/project';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

import api from '../api/backend-api';
import { user_t } from '../api/backend-types';

interface userOption_t {
  username: string;
  email: string;
  avatar: string;
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
    const filteredUsers: userOption_t[] = [];
    const selectedUsers: userOption_t[] = [];
    const roles: string[] = ['Admin', 'Validator', 'Annotator', 'Guest'];
    return {
      users,
      userOptions,
      selectedUsers,
      roles,
      filteredUsers,
      targetRole: 'Role',
      sendNotif: false,
    };
  },
  computed: {
    ...mapWritableState(useProjectStore, ['admins', 'validators', 'annotators', 'guests']),
    ...mapState(useProjectStore, ['visibility', 'isOwner']),
    excludedUserOptions() {
      return [...this.admins, ...this.validators, ...this.annotators, ...this.guests];
    },
    projectMembers() {
      let projectMembers = [];
      projectMembers = this.users.reduce((options: userOption_t[], user) => {
        if (this.excludedUserOptions.includes(user.username)) {
          options.push({
            username: user.username,
            email: user.email,
            avatar: user.pictureUrl,
          });
        }
        return options;
      }, []);
      return projectMembers;
    },
    filteredRoles() {
      if (this.visibility > 0) return this.roles.slice(0, -1);
      else return this.roles;
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
          this.userOptions = this.users.reduce((options: userOption_t[], user) => {
            if (!this.excludedUserOptions.includes(user.username)) {
              options.push({
                username: user.username,
                email: user.email,
                avatar: user.pictureUrl,
              });
            }
            return options;
          }, []);
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
    updateUserAccess() {
      const data = {
        targetRole: this.targetRole.toLowerCase(),
        selectedUsers: this.selectedUsers.map((user) => user.username),
      };
      api
        .updateManyProjectUserAccess(this.projectName, data)
        .then((response) => {
          notifyMessage({ message: 'New members saved on the server', icon: 'save' });
          this.selectedUsers = [];
          this.admins = response.data.admins;
          this.guests = response.data.guests;
          this.annotators = response.data.annotators;
          this.validators = response.data.validators;
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
          this.validators = response.data.validators;
          this.getUsers();
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
    updateExistingUserAccess(member: userOption_t, targetRole: string) {
      this.targetRole = targetRole;
      this.selectedUsers.push(member);
      this.updateUserAccess();
    },
    copyLink() {
      const projectLink = window.location.href;
      copyToClipboard(projectLink)
        .then(() => {
          notifyMessage({ message: 'Project link is copied to clipboard!' });
        })
        .catch(() => {
          notifyError({ error: `Failed to copy` });
        });
    },

    filterOption(val: string, update: (callback: () => void) => void) {
      if (val === '') {
        update(() => {
          this.filteredUsers = this.userOptions;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.filteredUsers = this.userOptions.filter((v) => v.username.toLowerCase().indexOf(needle) > -1);
      });
    },
    userRole(username: string) {
      if (this.admins.includes(username)) return this.roles[0];
      else if (this.validators.includes(username)) return this.roles[1];
      else if (this.annotators.includes(username)) return this.roles[2];
      else if (this.guests.includes(username)) return this.roles[3];
    },
  },
});
</script>
<style scoped lang="stylus">

.item:hover {
background-color: #8e7fc029;
}
</style>
