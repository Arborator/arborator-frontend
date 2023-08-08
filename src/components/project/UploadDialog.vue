<template>
  <q-dialog :model-value="uploadDialModel" :maximized="maximizedUploadToggle" transition-show="fade"
    transition-hide="fade" persistent>
    <q-card style="min-width: 70vw;">
      <q-bar class="bg-primary text-white">
        <q-space />
        <q-btn v-if="maximizedUploadToggle" dense flat icon="minimize" @click="maximizedUploadToggle = false">
          <q-tooltip content-class="bg-white text-primary">{{ $t('projectView.tooltipWindows[0]') }}</q-tooltip>
        </q-btn>
        <q-btn v-if="!maximizedUploadToggle" dense flat icon="crop_square" @click="maximizedUploadToggle = true">
          <q-tooltip content-class="bg-white text-primary">{{ $t('projectView.tooltipWindows[1]') }}</q-tooltip>
        </q-btn>
        <q-btn v-close-popup="10" dense flat icon="close" @click="uploadDialModel = false, uploadSample.attachment.file = []">
          <q-tooltip content-class="bg-white text-primary">{{ $t('projectView.tooltipWindows[2]') }}</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section class="q-pa-md">
        <div class="q-gutter-y-md">
          <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify"
            narrow-indicator>
            <q-tab name="inputFile" icon="description" label="Input file" />
            <q-tab name="inputText" icon="title" label="Input text" />
          </q-tabs>
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel class="q-gutter-md" name="inputText">
              <div>
                <q-select outlined v-model="option" label="select Tokenize option" :options="tokenizeOptions" />
              </div>
              <div v-if="option">
                <q-select v-if="option.value === 'plainText'" outlined label="Choose the language" v-model="lang"
                  :options="langOptions" />
                <div v-if="option.value === 'vertical'" class="text-body1">
                  Each token on a separate line, with an empty line indicating the end of sentence.
                </div>
                <div v-if="option.value === 'horizontal'" class="text-body1">
                  Each sentence on a separate line, the tokens are separated by spaces.
                </div>
              </div>
              <q-input outlined v-model="text" type="textarea" label="text" />
              <q-input outlined v-model="sampleName" label="Sample Name" />
              <q-input outlined v-model="customUserId" label="Custom UserId By default it's your username" />
              <div class="row q-pa-md">
                <q-btn v-close-popup :disable="!disableTokenizeBtn" color="primary"
                  @click="tokenizeSample">Tokenize</q-btn>
              </div>
            </q-tab-panel>

            <q-tab-panel class="q-gutter-md" name="inputFile">
              <div class="text-h6 text-blue-grey-8">
                {{ $t('projectView.uploadSelectDial') }}
              </div>
              <div>
                <q-file v-model="uploadSample.attachment.file" label="Pick or drop files" use-chips outlined
                  :loading="uploadSample.submitting" multiple input-style="height:100px" @update:model-value="preprocess"
                 >
                  <template #prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template #after>
                    <q-btn color="primary" dense icon="cloud_upload" round :loading="uploadSample.submitting"
                      :disable="disableUploadBtn || customUserId === ''" @click="uploadSamples()" />
                    <q-tooltip v-if="uploadSample.attachment.file.length == 0" content-class="text-white bg-primary">
                      Select file to upload
                    </q-tooltip>
                  </template>
                </q-file>
              </div>
              <div>
                <q-input 
                  outlined 
                  v-model="customUserId" 
                  label="Custom UserId By default it's your username"
                  :rules="[(val) => (val && val.length > 0) || 'You can not upload file without userId please type something']"
                  />
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
import { sentenceConllToJson } from "conllup/lib/conll";

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
    const uploadSample: {
      submitting: boolean;
      attachment: { name: string | null; file: File[] };
    } = {
      submitting: false,
      attachment: { name: null, file: [] },
    };
    const tokenizeOptions = [
      { value: 'plainText', label: 'Tokenize plain text' },
      { value: 'horizontal', label: 'Horizontal' },
      { value: 'vertical', label: 'Vertical' }
    ];
    const option: { value: string, label: string } = { value: '', label: '' };
    const lang: { value: string, label: string } = { value: '', label: '' };
    const langOptions = [
      { value: 'en', label: 'English' },
      { value: 'fr', label: 'French' },
    ];
    const samplesWithoutSentIds: string[] = [];
    return {
      files: null,
      maximizedUploadToggle,
      uploadSample,
      tab: 'inputFile',
      tokenizeOptions,
      option,
      text: '',
      langOptions,
      lang,
      sampleName: '',
      customUserId: '',
      warningMessage: '',
      generateNewSentIds: false,
      samplesWithoutSentIds,
    };
  },

  computed: {
    ...mapState(useUserStore, { userid: 'id' }),
    ...mapState(useUserStore, ['username']),
    ...mapState(useProjectStore, ['exerciseMode']),
    disableTokenizeBtn() {
      if (this.option.value == 'plainText') {
        return this.text && this.sampleName && this.lang.value;
      }
      else {
        return this.text && this.sampleName;
      }
    },
    disableUploadBtn() {
      let disable = true;
      if (this.samplesWithoutSentIds.length > 0) {
        disable = !this.generateNewSentIds;
      } else if (this.uploadSample.attachment.file.length > 0) {
        disable = false;
      }
      return disable;
    }
  },
  mounted() {
    this.customUserId = this.username;
  },
  methods: {
    async preprocess() {

      this.warningMessage = '';
      this.samplesWithoutSentIds = [];

      for (const file of this.uploadSample.attachment.file) {
        const content = await this.readFileContent(file);
        const sampleName = file.name.split(".conllu")[0];
        this.checkSentIdsErrors(content as string, sampleName);
      }
      if (this.samplesWithoutSentIds.length > 0) {
        this.triggerFormatErrors();
      }
    },
    async readFileContent(file: File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const content = (reader as { result: string }).result;
          resolve(content);
        };
        reader.onerror = () => {
          reject();
        };
        reader.readAsText(file);
      })
    },
    checkSentIdsErrors(fileContent: string, sampleName: string) {
      const sentIds: any[] = [];
      const sentences = fileContent.split(/\n\n/).filter((sentence) => sentence);

      for (const sentence of sentences) {
        if (sentenceConllToJson(sentence)["metaJson"]["sent_id"]) {
          const sentId = sentenceConllToJson(sentence)["metaJson"]["sent_id"];
          sentIds.push(sentId);
        }
      }
      if (sentences.length !== sentIds.length) this.samplesWithoutSentIds.push(sampleName);
    },
    triggerFormatErrors() {
      this.samplesWithoutSentIds.forEach((sampleName) => {
        this.warningMessage += `"${sampleName}" has sentences without sent_id.\n`;
      });
      this.warningMessage += ` Do want to generate sentences automatically`;
      this.$q.notify({
        message: this.warningMessage,
        position: 'top',
        color: 'warning',
        timeout: 5000,
        closeBtn: 'X',
        actions: [
          { label: 'Continue', handler: () => { this.generateNewSentIds = true; } },
          { label: 'Dismiss', handler: () => { this.uploadDialModel = false; } }
        ]
      });
    },
    uploadSamples() {
      const form = new FormData();
      this.uploadSample.submitting = true;
      for (const file of this.uploadSample.attachment.file) {
        form.append('files', file);
      }
      form.append('userId', this.customUserId);
      if (this.generateNewSentIds) {
        form.append('samplesWithoutSentIds', JSON.stringify(this.samplesWithoutSentIds));
      }
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
            notifyError({ error: error.message })
          }
          this.$emit('uploaded:sample'); // tell to the parent that a new sample was uploaded and to fetch all samples
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
        .catch((error) => {
          notifyError({ error: 'Invalid request' })
        });
    }
  },
});
</script>

<style></style>
