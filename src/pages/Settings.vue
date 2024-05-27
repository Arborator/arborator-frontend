<template>
  <div class="q-pa-md q-gutter-sm">
    <div class="row">
      <div class="col-md-1"></div>
      <div class="col items-center">
        <q-banner rounded :class="$q.dark.isActive ? '' : 'bg-grey-3'">
          <template #avatar>
            <q-avatar :key="avatarKey" color="default" text-color="white" size="100px">
              <img :src="pictureUrl" alt="avatar" />
            </q-avatar>
          </template>
          <div class="row">
            <div :class="'col text-center text-weight-bold text-h4 ' + ($q.dark.isActive ? '' : 'text-blue-grey-10')">
              {{ firstName }} {{ familyName }}
            </div>
          </div>
          <div class="row">
            <div :class="'col text-center ' + +($q.dark.isActive ? '' : 'text-blue-grey-8')">@{{ username }}</div>
          </div>
          <div v-show="superAdmin" class="row">
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
          <q-form @submit="onSubmitModifications">
            <q-card-section>
              <div class="text-h6 text-blue-grey-8">{{ $t('settingsPage.title') }}</div>
            </q-card-section>
            <q-card-section>
              <div class="q-gutter-lg">
                <q-input v-model="email" type="email" label="Email" />
                <q-input v-model="firstName" type="text" :label="$t('settingsPage.firstName')" />
                <q-input v-model="familyName" type="text" :label="$t('settingsPage.familyName')" />
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn type="submit" icon="save" color="primary">
                {{ $t('settingsPage.saveModifications') }}
              </q-btn>
            </q-card-actions>
          </q-form>
        </q-card>
      </div>
      <div class="col-md-1"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Settings',
  computed: {
    ...mapWritableState(useUserStore, ['email', 'firstName', 'familyName']),
    ...mapState(useUserStore, ['avatarKey', 'pictureUrl', 'superAdmin', 'username']),
  },
  methods: {
    ...mapActions(useUserStore, ['updateUserInformation']),
    onSubmitModifications() {
      const data = {
        email: this.email as string,
        first_name: (this.firstName as string) || '',
        family_name: (this.familyName as string) || '',
      };
      this.updateUserInformation(data);
    },
  },
});
</script>


