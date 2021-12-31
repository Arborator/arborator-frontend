<template>
  <q-page class="full-width column wrap justify-start items-start content-start">
    &nbsp;
    <div class="q-pa-xl q-gutter-lg">
      <div class="text-h3 text-primary">Klang: {{ kprojectname }}</div>
      <q-badge :color="$q.dark.isActive ? 'grey' : 'primary'">
        {{ samples.length }} {{ samples.length == 1 ? $t('projectHub.sample') : $t('projectHub.samples') }}
      </q-badge>
    </div>
    &nbsp;
    <div class="q-pa-lg row items-start q-gutter-lg">
      <q-card style="max-width: 300px; width: 300px" clickable v-for="(f, i) in samples" :key="f" class="text-primary cursor-pointer q-hoverable">
        <span class="q-focus-helper"></span>
        <q-item clickable :to="'/klang/' + kprojectname + '/' + f">
          <q-icon name="music_note" size="lg" />
          <q-item-section>
            <q-item-label caption> {{ i + 1 }}. </q-item-label>
            <q-item-label> {{ f }} </q-item-label>
          </q-item-section>
        </q-item>
      </q-card>
    </div>
    <q-separator spaced />
    <div class="q-pa-md">
      <q-btn dense color="primary" icon="add" label="Add admins for the project" ref="addAdmins" @click="openAdminsDialog" v-if="isSuperAdmin" />
    </div>
    <q-dialog v-model="adminsDialog" ref="addAdminsDialog">
      <q-card class="export-dialog">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Select admins</div>
        </q-card-section>

        <q-card-section>
          <div class="q-pa-md">
            <q-option-group :options="users" type="checkbox" v-model="selectedAdmins" ref="userList"></q-option-group>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="OK" color="primary" text-color="white" @click="selectAdmins()" ref="OKButton" v-close-popup></q-btn>
          <q-btn label="Cancel" color="primary" text-color="white" v-close-popup> </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style lang="stylus" scoped>
.export-dialog {
  min-width: 300px;
}
</style>

<script>
import Vue from 'vue';
import { mapGetters } from 'vuex';
import api from '../api/backend-api';

export default {
  props: ['kprojectname'],
  data() {
    return {
      samples: [],
      adminsDialog: false,
      users: [],
      selectedAdmins: [],
    };
  },
  computed: {
    ...mapGetters('config', ['admins']),

    ...mapGetters('user', ['isSuperAdmin']),
  },

  created() {
    this.waveWidth = window.innerWidth;
  },

  mounted() {
    this.getProjectSamples();
    this.getAllUsers();
    document.title = `Klang: ${this.kprojectname}`;
  },

  methods: {
    /**
     * Retrieve conll files from backend
     *
     * @returns void
     */
    getProjectSamples() {
      api
        .getKlangProjectSamples(this.kprojectname)
        .then((response) => {
          this.samples = response.data;
        })
        .catch((error) => {
          this.$store.dispatch('notifyError', { error });
        });
    },
    /**
     * Get all non-superadmin users from user list on backend
     *
     * @returns void
     */
    getAllUsers() {
      api
        .getUsers()
        .then((response) => {
          const users = response.data;
          users.forEach((user) => {
            if (user.super_admin !== true) {
              this.users.push({
                label: user.username,
                value: user.username,
              });
            }
          });
        })
        .catch((error) => {
          this.$store.dispatch('notifyError', { error });
        });
    },
    /**
     * Open Select Admins Dialog
     *
     * @returns void
     */
    openAdminsDialog() {
      this.selectedAdmins = this.admins;
      this.adminsDialog = true;
    },
    /**
     * Set the selected users as admins for the project
     *
     * @returns void
     */
    selectAdmins() {
      api
        .setKlangProjectAdmins(this.kprojectname, this.selectedAdmins)
        .then((response) => {
          this.$store.dispatch('klang/fetchKlangProjectSettings', {
            projectname: this.kprojectname,
          });
          this.$q.notify({
            message: 'The operation was successfully saved.',
            position: 'top-right',
            color: 'green',
            icon: 'done',
          });
        })
        .catch((error) => {
          this.$store.dispatch('notifyError', { error });
        });
    },
  },
};
</script>
