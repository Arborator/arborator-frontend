<template>
  <q-dialog :model-value="uploadDialModel" :maximized="maximizedUploadToggle" transition-show="fade" transition-hide="fade">
    <q-card style="max-width: 100vw">
      <q-bar>
        <q-space />
        <q-btn v-if="maximizedUploadToggle" dense flat icon="minimize" @click="maximizedUploadToggle = false">
          <q-tooltip content-class="bg-white text-primary">{{ $t('projectView.tooltipWindows[0]') }}</q-tooltip>
        </q-btn>
        <q-btn v-if="!maximizedUploadToggle" dense flat icon="crop_square" @click="maximizedUploadToggle = true">
          <q-tooltip content-class="bg-white text-primary">{{ $t('projectView.tooltipWindows[1]') }}</q-tooltip>
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

<script lang="ts">
import { notifyError } from 'src/utils/notify';
import api from '../../api/backend-api';
import { useModelWrapper } from '../../composables/modelWrapper.js';
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { useProjectStore } from 'src/pinia/modules/project';

export default defineComponent({
  props: {
    uploadDial: { type: Boolean, required: true },
  },
  setup(props, { emit }) {
    return {
      uploadDialModel: useModelWrapper(props, emit, 'uploadDial'),
    };
  },
  data() {
    let maximizedUploadToggle = false;

    let columns: {
      name: string;
      required: boolean;
      label: string;
      align: string;
      field: (a: { old: unknown; new: unknown }) => unknown;
      format: (a: unknown) => unknown;
      sortable: boolean;
    }[] = [
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
    ];

    const userIds: { old: string; new: string }[] = [];
    const uploadSample: {
      submitting: boolean;
      attachment: { name: string | null; file: File[] };
    } = {
      submitting: false,
      attachment: { name: null, file: [] },
    };
    return {
      files: null,
      maximizedUploadToggle,
      robot: { active: false, name: 'parser', exerciseModeName: 'teacher' },
      uploadSample,
      userIds,
      userIdsList: [],
      userIdsPreprocessed: false,
      columns,

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
    ...mapState(useUserStore, { userid: 'id' }),
    ...mapState(useUserStore, ['username']),
    ...mapState(useProjectStore, ['exerciseMode']),
  },

  methods: {
    async preprocess() {
      if (!this.uploadSample.attachment.file) {
        return;
      }

      this.userIds = [
        {
          old: 'default',
          new: this.username,
        },
      ];
      for (const file of this.uploadSample.attachment.file) {
        const reader = new FileReader();
        reader.onload = () => {
          const lines = (reader as { result: string }).result.split(/[\r\n]+/g);
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
      if (this.exerciseMode) {
        this.robot.name = 'teacher';
        this.robot.active = true;
      }
      form.append('robotname', this.robot.name);
      form.append('robot', this.robot.active as any);
      this.uploadSample.submitting = true;
      for (const file of this.uploadSample.attachment.file) {
        form.append('files', file);
      }
      form.append('import_user', this.username);
      form.append('userIdsConvertor', JSON.stringify(this.userIds));
      api
        .uploadSample(this.$route.params.projectname as string, form)
        .then(() => {
          this.uploadSample.attachment.file = [];
          this.$emit('uploaded:sample'); // tell to the parent that a new sample was uploaded and to fetch all samples
          this.uploadDialModel = false;
          this.uploadSample.submitting = false;
          this.$q.notify({ message: 'upload success' });
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
          notifyError({ error });
        });
    },
  },
});
</script>

<style></style>
