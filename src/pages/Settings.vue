<template>
  <div class="q-pa-md q-gutter-sm">
    <div class="row">
      <div class="col-md-1"></div>
      <div class="col items-center">
        <q-banner rounded :class="$q.dark.isActive ? '' : 'bg-grey-3'">
          <template #avatar>
            <q-avatar :key="avatarKey" color="default" text-color="white" size="100px">
              <img :src="getUserInfos.picture_url" />
            </q-avatar>
          </template>
          <div class="row">
            <div :class="'col text-center text-weight-bold text-h4 ' + ($q.dark.isActive ? '' : 'text-blue-grey-10')">
              {{ getUserInfos.first_name }} {{ getUserInfos.family_name }}
            </div>
          </div>
          <div class="row">
            <div :class="'col text-center ' + +($q.dark.isActive ? '' : 'text-blue-grey-8')">@{{ getUserInfos.username }}</div>
          </div>
          <div v-show="getUserInfos.super_admin" class="row">
            <div :class="'col text-center ' + ($q.dark.isActive ? '' : 'text-blue-grey-8')">Super Admin</div>
          </div>
        </q-banner>
      </div>
      <div class="col-md-1"></div>
    </div>

    <div class="row">
      <div class="col-md-1"></div>
      <div class="col-md-4 col-xs-12">
        <q-card flat>
          <q-form>
            <q-card-section>
              <div class="text-h6 text-blue-grey-8">Personal Informations</div>
            </q-card-section>
            <q-card-section>
              <div class="q-gutter-lg">
                <q-input v-model="getUserInfos.id" type="email" label="Email" />
                <q-input v-model="getUserInfos.first_name" type="text" label="First Name" />
                <q-input v-model="getUserInfos.family_name" type="text" label="Last Name" />
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn label="Save Modifications" type="submit" icon="save" color="primary" :loading="savingModifs" />
            </q-card-actions>
          </q-form>
        </q-card>
      </div>
      <div class="col-md-1"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Settings',
  data() {
    return {
      alerts: {
        saveerror: { color: 'negative', message: 'Could not save the data.', icon: 'report_problem' },
        savesuccess: { color: 'positive', message: 'Modifications saved' },
        denied: { color: 'warning', icon: 'report_problem', message: 'Denied! Contact an administrator.' },
      },
      savingModifs: false,
      isPwd: true,
      tempPwd: '',
    };
  },
  computed: {
    ...mapState(useUserStore, ['avatarKey', 'getUserInfos']),
  },
  methods: {
    forceRerenderAvatar() {
      console.log('FIXME : THIS IS EMPTY');
    },
  },
});
</script>

<style scoped></style>
