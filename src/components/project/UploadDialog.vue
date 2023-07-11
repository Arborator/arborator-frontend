<template>
  <q-dialog :model-value="uploadDialModel" :maximized="maximizedUploadToggle" transition-show="fade" transition-hide="fade" persistent>
    <q-card style="min-width: 70vw;">
      <q-bar class="bg-primary text-white">
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
      <q-card-section class="q-pa-md">
        <div class="q-gutter-y-md">
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="inputText" icon="title" label="Input text" />
            <q-tab name="inputFile" icon="description" label="Input file" /> 
          </q-tabs>
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel class="q-gutter-md" name="inputText">
              <div>
                <q-select outlined v-model="option" label="select Tokenize option" :options="tokenizeOptions" />
              </div>
              <div v-if="option">
                <q-select 
                  v-if="option.value === 'plainText'"
                  outlined
                  label="Choose the language"
                  v-model="lang"
                  :options="langOptions"
                 />
                <div v-if="option.value === 'vertical'" class="text-body1">
                  Each token on a separate line, with an empty line indicating the end of sentence; 
                  only the first word is considered as a token, the rest of the line is ignored.
                </div>
                <div v-if="option.value === 'horizontal'" class="text-body1">
                 Each sentence on a separate line, the tokens are separated by spaces.
                </div>
              </div>
              <q-input outlined v-model="text" type="textarea" label="text" />
              <q-input outlined v-model="sampleName" label ="Sample Name" />
              <q-input outlined v-model="customUserId" label="Select custom UserId By default it's your username"  />
              <div class="row q-pa-md">
                <q-btn v-close-popup :disable="!disableTokenizeBtn" color="primary" @click="tokenizeSample">Tokenize</q-btn>
              </div>
            </q-tab-panel>

            <q-tab-panel name="inputFile">
              <div class="text-h6 text-blue-grey-8">
                {{ $t('projectView.uploadSelectDial') }}
              </div>
              <div>
                <q-file
                  v-model="uploadSample.attachment.file"
                  label="Pick or drop files"
                  use-chips
                  outlined
                  :loading="uploadSample.submitting"
                  multiple
                  input-style="height:100px"
                  @update:model-value="preprocess"
                >
                  <template #prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template #after>
                    <q-btn
                      color="primary"
                      dense
                      icon="cloud_upload"
                      round
                      :loading="uploadSample.submitting"
                      :disable="uploadSample.attachment.file.length == 0"
                      @click="upload()"
                    />
                    <q-tooltip v-if="uploadSample.attachment.file.length == 0" content-class="text-white bg-primary">
                      Select file to upload
                    </q-tooltip>
                  </template>
                </q-file>
              </div>
              <div>
                <q-expansion-item
                  v-if="userIds.length > 0"
                  icon="perm_identity"
                  label="Custom user id on import"
                  :caption="'By default we use your user name ' + '`' + username + '`'"
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
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { notifyError, notifyMessage } from 'src/utils/notify';
import api from '../../api/backend-api';
import { sample_t } from 'src/api/backend-types';
import { useModelWrapper } from '../../composables/modelWrapper.js';
import { defineComponent, PropType } from 'vue';
import { mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { useProjectStore } from 'src/pinia/modules/project';

export default defineComponent({
  props: {
    uploadDial: { 
      type: Boolean as PropType<boolean>, 
      required: true, 
      },
    samples: { 
      type: Object as PropType<sample_t[]>, 
      required: true,
      }
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
    const userIntersPerSample: {sampleName: string, userIds: string[]}[]= [];
    const uploadSample: {
      submitting: boolean;
      attachment: { name: string | null; file: File[] };
    } = {
      submitting: false,
      attachment: { name: null, file: [] },
    };
    const tokenizeOptions = [
      { value: 'plainText', label: 'Tokenize plain text' },
      { value: 'horizontal', label: 'Horizontal'},
      { value: 'vertical', label:'Vertical'}
    ];
    const option : {value: string, label: string} = {value: '', label: ''};
    const lang: {value: string, label: string} = {value: '', label: ''};
    const langOptions = [
      { value: 'en', label: 'English' },
      { value: 'fr', label: 'French' }, 
    ];
    return {
      files: null,
      maximizedUploadToggle,
      robot: { active: false, name: 'parser', exerciseModeName: 'teacher' },
      uploadSample,
      userIds,
      userIdsPreprocessed: false,
      proceed: false,
      columns,
      userIntersPerSample,
      tab: 'inputText',
      tokenizeOptions,
      option,
      text: '',
      langOptions,
      lang,
      sampleName: '',
      customUserId: '',
    };
  },

  computed: {
    ...mapState(useUserStore, { userid: 'id' }),
    ...mapState(useUserStore, ['username']),
    ...mapState(useProjectStore, ['exerciseMode']),
    disableTokenizeBtn() {
      if (this.option.value == 'plainText'){
        return this.text && this.sampleName  && this.lang.value && this.customUserId ;
      }
      else if (this.option.value){
        return this.text  && this.sampleName && this.customUserId;
      }
      else {
        return false;
      }
    }
  },

  methods: {
    async preprocess() {
      this.userIds = [{old: 'default', new: this.username}];
      this.userIntersPerSample = [];
      for (const file of this.uploadSample.attachment.file) {
        const reader = new FileReader();
        reader.onload = () => {
          const lines = (reader as { result: string }).result.split(/[\r\n]+/g);
          for (const line of lines) {
            if (line.includes("# user_id = ")) {
                const userId = line.split('# user_id = ')[1];
                if (!this.userIds.map((userIdLocal) => userIdLocal.old).includes(userId)) {
                  this.userIds.unshift({ old: userId, new: userId });
                } 
            }
          }
        };
        reader.readAsText(file);
      }
      this.userIdsPreprocessed = true;
    },
    checkUsersInter(file : File) {
      const sampleName = file.name.split(".conllu")[0];
      let interUser: string[] = [];
      let treesFrom: string[] = [];
      const sample = this.samples.filter((sample) => sample.sample_name == sampleName)[0];
      if (sample){  
        treesFrom = sample.treesFrom;
        interUser = treesFrom.filter(userId => this.userIds.map(user => user.new).includes(userId));
        if (interUser.length > 0 ) this.userIntersPerSample.push({sampleName: sample.sample_name, userIds: interUser});
      }
    },
    notifyWarning() {
      let warningMessage = 'You are uploading data for users ';
      this.userIntersPerSample.forEach((existedSample, index, array) => {
        for (const userId of existedSample.userIds){
          warningMessage += `"${userId}", `;
        }
        warningMessage += `which have trees in "${existedSample.sampleName}" sample.`;
        if (index !== array.length - 1) { warningMessage += ' And ';}
      }); 
      warningMessage += 'The new trees will erase the previous ones if any. Do you want to proceed?';
        this.$q.notify({
          message: warningMessage,
          color: 'warning',
          position: 'top',
          actions: [
            { label: 'Proceed', handler: () => { this.uploadSamples(); } },
            { label: 'Dismiss', handler: () => { this.uploadDialModel = false; } }
          ], 
          timeout: 20000,
        });
     
    },
    upload() {
      for (const file of this.uploadSample.attachment.file) this.checkUsersInter(file);
      this.userIntersPerSample.length > 0 ?  this.notifyWarning() :this.uploadSamples();
    },
    uploadSamples() {
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
          notifyMessage({ message: 'upload success' });
        })
        .catch((error) => {
          if (error.response) {
            error.message = error.response.data.message;
            error.permanent = true;
            notifyError({ error: error.message})
          }
          this.$emit('uploaded:sample'); // tell to the parent that a new sample was uploaded and to fetch all samples

          error.caption = 'Check your file please and try again.';
          this.uploadSample.submitting = false;
          this.uploadDialModel = false;
        });
    },
    tokenizeSample() {
      const data = {
        username: this.customUserId,
        text: this.text,
        option: this.option.value,
        lang: this.lang.value,
        sampleName: this.sampleName,
      };
      api
        .tokenizeSample(this.$route.params.projectname as string, data)
        .then((response) => {
          notifyMessage({ message: 'upload success' });
          this.$emit('uploaded:sample');
          this.uploadDialModel = false;
        })
        .catch((error) =>{
          notifyError({ error: 'Invalid request'})
        });
    }      
  },
});
</script>

<style></style>
