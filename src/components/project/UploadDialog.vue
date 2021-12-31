<template>
  <q-dialog :model-value="uploadDialModel" :maximized="maximizedUploadToggle" transition-show="fade" transition-hide="fade">
    <q-card style="max-width: 100vw">
      <q-bar>
        <q-space />
        <q-btn v-if="maximizedUploadToggle" dense flat icon="minimize" @click="maximizedUploadToggle = false">
          <q-tooltip v-if="maximizedUploadToggle" content-class="bg-white text-primary">{{ $t('projectView.tooltipWindows[0]') }}</q-tooltip>
        </q-btn>
        <q-btn v-if="!maximizedUploadToggle" dense flat icon="crop_square" @click="maximizedUploadToggle = true">
          <q-tooltip v-if="!maximizedUploadToggle" content-class="bg-white text-primary">{{ $t('projectView.tooltipWindows[1]') }}</q-tooltip>
        </q-btn>
        <q-btn v-close-popup="10" dense flat icon="close" @click="uploadDialModel = false">
          <q-tooltip content-class="bg-white text-primary">{{ $t('projectView.tooltipWindows[2]') }}</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <div class="text-h6 text-blue-grey-8">
          {{ $t('projectView.uploadSelectDial') }}
        </div>
      </q-card-section>

      <q-card-section>
        <!-- <input type="file" id="input-conllu" multiple /> -->
        <q-file
          v-model="uploadSample.attachment.file"
          label="Pick or drop files"
          use-chips
          clearable
          :loading="uploadSample.submitting"
          multiple
          style="max-width: 600px, min-height:1300px"
          @update:model-value="preprocess"
        >
          <template #after>
            <q-btn
              color="primary"
              dense
              icon="cloud_upload"
              round
              :loading="uploadSample.submitting"
              :disable="uploadSample.attachment.file === null || uploadSample.attachment.file === []"
              @click="upload()"
            />
          </template>
        </q-file>
      </q-card-section>
      <q-card-section>
        <q-expansion-item
          v-if="userIds.length > 0"
          icon="perm_identity"
          label="Custom user id on import"
          :caption="'By default we use your user name ' + userid"
          header-class="primary"
        >
          <div class="q-pa-md">
            <q-table
              dense
              table-class="text-grey-8"
              table-header-class="text-primary"
              hide-pagination
              title="Old and new user ids when importing"
              :rows="userIds"
              row-key="old"
              :columns="columns"
            >
              <template #body="props">
                <q-tr v-if="props.row.old === 'default'" :props="props" dense class="bg-blue-grey-1">
                  <q-td key="old" :props="props" dense class="text-italic">
                    <q-tooltip>to be used for all trees without user_id</q-tooltip>
                    {{ props.row.old }}
                  </q-td>
                  <q-td key="new" :props="props" dense style="cursor: pointer">
                    <q-tooltip>click to modify</q-tooltip>
                    {{ props.row.new }}
                    <q-popup-edit v-model="props.row.new" dense>
                      <q-input v-model="props.row.new" color="primary" dense autofocus />
                    </q-popup-edit>
                  </q-td>
                </q-tr>
                <q-tr v-else :props="props" dense>
                  <q-td key="old" :props="props" dense>
                    <q-tooltip>user_id found in files</q-tooltip>
                    {{ props.row.old }}
                  </q-td>
                  <q-td key="new" :props="props" dense style="cursor: pointer">
                    <q-tooltip>click to modify</q-tooltip>
                    {{ props.row.new }}
                    <q-popup-edit v-model="props.row.new" dense>
                      <q-input v-model="props.row.new" color="primary" dense autofocus />
                    </q-popup-edit>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </q-expansion-item>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import api from '../../api/backend-api.js';
import { useModelWrapper } from '../../composables/modelWrapper.js';

export default {
  props: ['uploadDial'],
  setup(props, { emit }) {
    return {
      uploadDialModel: useModelWrapper(props, emit, 'uploadDial'),
    };
  },

  data() {
    return {
      files: null,
      maximizedUploadToggle: false,
      robot: { active: false, name: 'parser', exerciseModeName: 'teacher' },
      uploadSample: {
        submitting: false,
        attachment: { name: null, file: null },
      },
      userIds: [],
      userIdsList: [],
      userIdsPreprocessed: false,
      columns: [
        {
          name: 'old',
          required: true,
          label: 'Original',
          align: 'left',
          field: (row) => row.old,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: 'new',
          required: true,
          label: 'New',
          align: 'left',
          field: (row) => row.new,
          format: (val) => `${val}`,
          sortable: true,
        },
      ],

      alerts: {
        uploadsuccess: { color: 'positive', message: 'Upload success' },
        uploadfail: {
          color: 'negative',
          message: 'Upload failed',
          icon: 'report_problem',
        },
        deletesuccess: { color: 'positive', message: 'Delete success' },
        deletefail: {
          color: 'negative',
          message: 'Delete failed',
          icon: 'report_problem',
        },
        GitHubPushSuccess: {
          color: 'positive',
          message: 'Successfully pushed your data to GitHub',
        },
        getLexiconSuccess: {
          color: 'positive',
          message: 'got lexicon. TODO: get the real lexicon!!!',
        },
      },
    };
  },

  computed: {
    //   uploadDialModel: {
    //     get() {
    //       return this.uploadDial;
    //     },
    //     set(newValue) {
    //       this.$emit("update:uploadDial", newValue);
    //     },
    //   },
    userid: {
      get() {
        return this.$store.getters['user/getUserInfos'].username;
      },
    },
  },

  methods: {
    async preprocess() {
      if (!this.uploadSample.attachment.file) {
        return;
      }

      this.userIds = [
        {
          old: 'default',
          new: this.$store.getters['user/getUserInfos'].username,
        },
      ];
      for (const file of this.uploadSample.attachment.file) {
        const reader = new FileReader();
        reader.onload = () => {
          const lines = reader.result.split(/[\r\n]+/g);
          // lines.forEach((line) => {
          for (const line of lines) {
            if (line[0] === '#') {
              if (line.slice(2, 9) === 'user_id') {
                const splittedMeta = line.split(' ');
                const userId = splittedMeta[splittedMeta.length - 1];
                if (!this.userIds.map((userIdLocal) => userIdLocal.old).includes(userId)) {
                  this.userIds.unshift({ old: userId, new: userId });
                }
              }
            }
          }
        };
        reader.readAsText(file);
      }
      this.userIdsPreprocessed = true;
    },
    upload() {
      const form = new FormData();
      if (this.$store.getters['config/exerciseMode']) {
        this.robot.name = 'teacher';
        this.robot.active = true;
      }
      form.append('robotname', this.robot.name);
      form.append('robot', this.robot.active);
      this.uploadSample.submitting = true;
      for (const file of this.uploadSample.attachment.file) {
        form.append('files', file);
      }
      form.append('import_user', this.$store.getters['user/getUserInfos'].username);
      form.append('userIdsConvertor', JSON.stringify(this.userIds));
      api
        .uploadSample(this.$route.params.projectname, form)
        .then((response) => {
          this.uploadSample.attachment.file = null;
          this.$emit('uploaded:sample'); // tell to the parent that a new sample was uploaded and to fetch all samples
          this.uploadDialModel = false;
          this.uploadSample.submitting = false;
          this.showNotif('top-right', 'uploadsuccess');
        })
        .catch((error) => {
          if (error.response) {
            error.message = error.response.data.message;
            error.permanent = true;
          }
          this.$emit('uploaded:sample'); // tell to the parent that a new sample was uploaded and to fetch all samples

          error.caption = 'Check your file please and try again.';
          this.uploadSample.submitting = false;
          this.uploadDialModel = false;
          this.$store.dispatch('notifyError', { error });
        });
    },
    // TODO : refactor all of these $q.notify in a proper single file
    showNotif(position, alert) {
      const { color, textColor, multiLine, icon, message, avatar, actions } = this.alerts[alert];
      const buttonColor = color ? 'white' : void 0;
      this.$q.notify({
        color,
        textColor,
        icon,
        message,
        position,
        avatar,
        multiLine,
        actions,
        timeout: 2000,
      });
    },
  },
};
</script>

<style></style>
