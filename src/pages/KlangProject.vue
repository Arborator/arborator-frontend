<template>
  <q-page class="full-width row wrap justify-start items-start content-start">
    &nbsp;
    <q-chip
      label="Available Samples"
      color="primary"
      text-color="white"
      style="font-size: 15px"
    ></q-chip>
    <q-separator spaced />
    &nbsp;
    <div class="row q-col-gutter-md q-pa-lg">
      <div
        clickable
        v-for="(f, i) in samples"
        :key="f"
        style="min-width: 300px"
      >
        <div>
          <q-btn
            no-caps
            color="primary"
            :label="i + '. ' + f"
            icon="music_note"
            :to="'/klang/' + kprojectname + '/' + f"
          />
        </div>
      </div>
    </div>
    <q-separator spaced />
    <div class="q-pa-md">
      <q-btn
        dense
        color="primary"
        icon="add"
        label="Add admins for the project"
        ref="addAdmins"
        @click="openAdminsDialog"
        v-if="isSuperAdmin"
      />
    </div>
    <q-dialog v-model="adminsDialog" ref="addAdminsDialog">
      <q-card class="export-dialog">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Select admins</div>
        </q-card-section>

        <q-card-section>
          <div class="q-pa-md">
            <q-option-group
              :options="users"
              type="checkbox"
              v-model="selectedAdmins"
              ref="userList"
            ></q-option-group>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="OK"
            color="primary"
            text-color="white"
            @click="selectAdmins()"
            ref="OKButton"
            v-close-popup
          ></q-btn>
          <q-btn
            label="Cancel"
            color="primary"
            text-color="white"
            v-close-popup
          >
          </q-btn>
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
import Vue from "vue";
import api from "../boot/backend-api";
import { mapGetters } from "vuex";

export default {
  props: ["kprojectname"],
  data() {
    return {
      samples: [],
      adminsDialog: false,
      users: [],
      selectedAdmins: [],
    };
  },
  computed: {
    ...mapGetters("config", ["admins"]),

    ...mapGetters("user", ["isSuperAdmin"]),
  },

  created() {
    this.waveWidth = window.innerWidth;
  },

  mounted() {
    this.getProjectSamples();
    this.getAllUsers();
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
          this.$store.dispatch("notifyError", { error: error });
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
            if (user.super_admin !== true)
              this.users.push({
                label: user.username,
                value: user.username,
              });
          });
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
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
          this.$store.dispatch("config/fetchKlangProjectSettings", {
            projectname: this.kprojectname,
          });
          this.$q.notify({
            message: "The operation was successfully saved.",
            position: "top-right",
            color: "green",
            icon: "done",
          });
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
  },
};
</script>
