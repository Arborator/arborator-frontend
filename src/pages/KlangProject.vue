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
      <q-card v-for="(f, i) in samples" :key="f" style="max-width: 300px; width: 300px" clickable class="text-primary cursor-pointer q-hoverable">
        <span class="q-focus-helper"></span>
        <q-item clickable :to="'/klang/' + kprojectname + '/' + f">
          <q-icon name="music_note" size="lg" />
          <q-item-section>
            <q-item-label caption> {{ i + 1 }}. </q-item-label>
            <q-item-label class="bold"> {{ f }} </q-item-label>
            <q-item-section v-if="isAdmin">
              <q-chip v-for="transcriber in sample2transcribers[f]" :key="transcriber" size="md">
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
          <template #top-left>
            <q-input v-model="tableFilter" class="text-primary" dense debounce="300" placeholder="Search">
              <template #append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
          <template #top-right>
            <q-btn color="primary" icon-right="archive" label="Export to csv" no-caps @click="exportTable" />
          </template>
        </q-table>
      </div>
    </template>
    <q-separator spaced />
    <div class="q-pa-md">
      <q-btn v-if="isAdmin" ref="addAdmins" dense color="primary" icon="add" label="Add admins for the project" @click="openAdminsDialog" />
    </div>
    <q-dialog ref="addAdminsDialog" v-model="adminsDialog">
      <q-card class="export-dialog">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Select admins</div>
        </q-card-section>

        <q-card-section>
          <div class="q-pa-md">
            <q-option-group ref="userList" v-model="selectedAdmins" :options="users" type="checkbox"></q-option-group>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn ref="OKButton" v-close-popup label="OK" color="primary" text-color="white" @click="selectAdmins()"></q-btn>
          <q-btn v-close-popup label="Cancel" color="primary" text-color="white"> </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia';
// import Vue from 'vue';
import { exportFile } from 'quasar';
import api from 'src/api/backend-api';
import { useMainStore } from 'src/pinia';
import { useKlangStore } from 'src/pinia/modules/klang';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { defineComponent } from 'vue';

export default defineComponent({
  props: ['kprojectname'],
  data() {
    const waveWidth = 0;
    const users: { label: string; value: string }[] = [];
    const selectedAdmins: string[] = [];
    const tableColumns: { name: string; label: string; field: CallableFunction; format: CallableFunction }[] = [];
    return {
      waveWidth,
      samples: [],
      adminsDialog: false,
      users,
      selectedAdmins,
      sample2transcribers: {},
      transcribers: [],
      tableColumns,
      tableFilter: '',
      projectAccessible: true,
    };
  },
  computed: {
    ...mapState(useMainStore, { isAdmin: 'isProjectAdmin' }),
    ...mapState(useKlangStore, { admins: 'admins' }),
    // ...mapGetters('config', ['admins']),
    // ...mapGetters('user', ['isSuperAdmin']),
    // isAdmin() {
    //   return this.$store.getters['klang/isAdmin'];
    // },
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
    ...mapActions(useKlangStore, ['fetchKlangProjectSettings']),
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
          notifyError({ error, caller: 'getProjectSamples' });
        });
    },
    getProjectAccessible() {
      api
        .getKlangAccessible(this.kprojectname)
        .then((response) => {
          this.projectAccessible = response.data;
        })
        .catch((error) => {
          notifyError({ error, caller: 'getProjectAccessible' });
        });
    },
    sampleTranscribers() {
      api
        .getKlangProjectTranscribers(this.kprojectname)
        .then((response) => {
          [this.sample2transcribers, this.transcribers, this.tableColumns] = response.data;
        })
        .catch((error) => {
          notifyError({ error, caller: 'sampleTranscribers' });
        });
    },

    wrapCsvValue(val: any, formatFn: CallableFunction | null = null) {
      let formatted = formatFn !== null ? formatFn(val) : val;
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
        notifyError({ error: 'Browser denied file download...' });
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
            if (user.superAdmin !== true) {
              this.users.push({
                label: user.username,
                value: user.username,
              });
            }
          });
        })
        .catch((error) => {
          notifyError({ error, caller: 'getAllUsers' });
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
        .then(() => {
          this.fetchKlangProjectSettings({
            projectname: this.kprojectname,
          });
          notifyMessage({
            message: 'The operation was successfully saved.',
            position: 'top-right',
            color: 'green',
            icon: 'done',
          });
        })
        .catch((error) => {
          notifyError({ error, caller: 'selectAdmins' });
        });
    },
  },
});
</script>

<style lang="stylus" scoped>
.export-dialog {
  min-width: 300px;
}
.bold {
    font-weight: 700;
}
</style>
