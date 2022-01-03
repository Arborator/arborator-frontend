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

    <div v-if="projectAccessible" class="q-pa-lg row items-start q-gutter-lg">
      <q-card style="max-width: 300px; width: 300px" clickable v-for="(f, i) in samples" :key="f" class="text-primary cursor-pointer q-hoverable">
        <span class="q-focus-helper"></span>
        <q-item clickable :to="'/klang/' + kprojectname + '/' + f">
          <q-icon name="music_note" size="lg" />
          <q-item-section>
            <q-item-label caption> {{ i + 1 }}. </q-item-label>
            <q-item-label class="bold"> {{ f }} </q-item-label>
            <q-item-section v-if="isAdmin">
              <q-chip v-for="transcriber in sample2transcribers[f]" size="md" :key="transcriber">
                <q-avatar icon="account_circle" color="primary" text-color="white" size="sm" />
                {{ transcriber }}
              </q-chip>
            </q-item-section>
          </q-item-section>
        </q-item>
      </q-card>
    </div>
    <div v-else class="q-pa-lg row items-start q-gutter-lg">
      <q-icon name="lock" size="xl" color="primary" /> <br />
      <h1 class="text-primary">no access</h1>
    </div>
    <template v-if="isAdmin">
      <div class="q-pa-md full-width">
        <q-table
          :rows="transcribers"
          row-key="name"
          :rows-per-page-options="[0]"
          class="text-primary"
          table-header-class="text-white bg-primary"
          flat
          bordered
          :filter="tableFilter"
        >
          <template v-slot:top-left>
            <q-input class="text-primary" dense debounce="300" v-model="tableFilter" placeholder="Search">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
          <template v-slot:top-right>
            <q-btn color="primary" icon-right="archive" label="Export to csv" no-caps @click="exportTable" />
          </template>
        </q-table>
      </div>
    </template>
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
.bold {
    font-weight: 700;
}
</style>

<script>
// import Vue from 'vue';
import { mapGetters } from 'vuex';
import { exportFile } from 'quasar';
import api from '../boot/backend-api';

export default {
  props: ['kprojectname'],
  data() {
    return {
      samples: [],
      adminsDialog: false,
      users: [],
      selectedAdmins: [],
      sample2transcribers: {},
      transcribers: [],
      tableColumns: [],
      tableFilter: '',
      projectAccessible: true,
    };
  },
  computed: {
    ...mapGetters('config', ['admins']),
    ...mapGetters('user', ['isSuperAdmin']),
    isAdmin() {
      return this.$store.getters['klang/isAdmin'];
    },
    // projectTranscribers() {
    //   return this.sampleTranscribers();
    // },
    // projectAccessible() {
    //   return this.getProjectAccessible();
    // },
  },

  created() {
    this.waveWidth = window.innerWidth;
  },

  mounted() {
    this.getProjectSamples();
    this.getAllUsers();
    document.title = `Klang: ${this.kprojectname}`;
    this.sampleTranscribers();
    this.getProjectAccessible();
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
    getProjectAccessible() {
      api
        .getKlangAccessible(this.kprojectname)
        .then((response) => {
          this.projectAccessible = response.data;
        })
        .catch((error) => {
          this.$store.dispatch('notifyError', { error });
        });
    },
    sampleTranscribers() {
      api
        .getKlangProjectTranscribers(this.kprojectname)
        .then((response) => {
          [this.sample2transcribers, this.transcribers, this.tableColumns] = response.data;
        })
        .catch((error) => {
          this.$store.dispatch('notifyError', { error });
        });
    },

    wrapCsvValue(val, formatFn) {
      let formatted = formatFn !== void 0 ? formatFn(val) : val;
      formatted = formatted === void 0 || formatted === null ? '' : String(formatted);
      formatted = formatted.split('"').join('""');
      /**
       * Excel accepts \n and \r in strings, but some other CSV parsers do not
       * Uncomment the next two lines to escape new lines
       */
      // .split('\n').join('\\n')
      // .split('\r').join('\\r')

      return `"${formatted}"`;
    },
    exportTable() {
      // naive encoding to csv format
      const content = [this.tableColumns.map((col) => this.wrapCsvValue(col.label))]
        .concat(
          this.transcribers.map((row) =>
            this.tableColumns
              .map((col) =>
                this.wrapCsvValue(typeof col.field === 'function' ? col.field(row) : row[col.field === void 0 ? col.name : col.field], col.format)
              )
              .join(',')
          )
        )
        .join('\r\n');

      const status = exportFile('table-export.csv', content, 'text/csv');

      if (status !== true) {
        this.$store.dispatch('notifyError', {
          message: 'Browser denied file download...',
          color: 'negative',
          icon: 'warning',
        });
      }
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
