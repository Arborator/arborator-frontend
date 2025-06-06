<template>
  <q-dialog :model-value="uploadDialModel" persistent>
    <q-card style="min-width: 70vw">
      <q-bar class="bg-primary text-white">
        <q-space />
        <q-btn v-close-popup="10" dense flat icon="close" @click="closeDialog()">
          <q-tooltip content-class="bg-white text-primary">close</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section class="q-gutter-y-md">
        <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
          <q-tab name="inputFile" icon="description" :label="$t('uploadSample.inputFile')" />
          <q-tab name="inputText" icon="title" :label="$t('uploadSample.inputText')" />
        </q-tabs>
        <q-tab-panels v-model="tab">
          <q-tab-panel name="inputFile">
            <q-file
              v-model="uploadSample.attachment.file"
              :label="$t('uploadSample.uploadFileLabel')"
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
            </q-file>
          </q-tab-panel>
          <q-tab-panel class="q-gutter-md" name="inputText">
            <q-select outlined v-model="option" :label="$t('uploadSample.tokenizeSelect')" :options="tokenizeOptions" />
            <div v-if="option">
              <q-select
                v-if="option.value === 'plainText'"
                outlined
                :label="$t('uploadSample.languageSelect')"
                v-model="lang"
                :options="langOptions"
              />
              <div v-if="option.value === 'vertical'" class="text-body1">
                {{ $t('uploadSample.verticalHint') }}
              </div>
              <div v-if="option.value === 'horizontal'" class="text-body1">
                {{ $t('uploadSample.horizontalHint') }}
              </div>
            </div>
            <q-input outlined v-model="text" type="textarea" :label="$t('uploadSample.text')" />
            <q-input outlined v-model="sampleName" :label="$t('uploadSample.sampleName')" />
          </q-tab-panel>
        </q-tab-panels>
        <q-separator />
        <div v-if="collaborativeMode" class="q-px-md">
          <div class="text-h6">
            {{ $t('uploadSample.userIdConfig') }}
          </div>
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-radio v-model="userId" val="username" />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{ $t('uploadSample.userIdOptions[0]') }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-radio v-model="userId" val="validated" />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{ $t('uploadSample.userIdOptions[1]') }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="blindAnnotationMode">
              <q-item-section avatar>
                <q-radio v-model="userId" val="base_tree" />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{ $t('uploadSample.userIdOptions[2]') }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-radio v-model="userId" class="row" val="other" />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{ $t('uploadSample.userIdOptions[3]') }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-input
            v-if="userId === 'other'"
            class="col"
            outlined
            v-model="customUserId"
            :label="$t('uploadSample.customUsername')"
            :rules="[
              (val) => !reservedUserIds.includes(val.toLowerCase()) || `${val} ` + $t('uploadSample.reservedUsernameError'),
              (val) => (val && val.length > 0) || $t('uploadSample.emptyUsernameError'),
            ]"
          />
          <q-separator />
        </div>
        <q-item>
          <q-item-section side top>
            <q-checkbox v-model="rtl" />
          </q-item-section>
          <q-item-section>
            <q-item-label>RTL configuration </q-item-label>
            <q-item-label caption>
              Apply Right To Left script configuration to the sample
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-section class="q-pa-md">
        <div class="row justify-center" v-if="tab === 'inputFile'">
          <q-btn
            no-caps
            color="primary"
            icon="cloud_upload"
            label="Upload sample"
            :loading="uploadSample.submitting"
            :disable="disableUploadBtn"
            @click="uploadSamples()"
            >
            <q-tooltip v-if="uploadSample.attachment.file.length == 0" content-class="text-white bg-primary">
              {{ $t('uploadSample.uploadFileTooltip') }}
            </q-tooltip>
          </q-btn>
        </div>
        <div v-else class="row justify-center">
          <q-btn 
            no-caps
            v-close-popup 
            :disable="!disableTokenizeBtn" 
            label="Tokenize"
            color="primary" 
            @click="tokenizeSample" 
            />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="hasNewFeatures">
    <DetectedTagSetDial 
      :new-feats="newFeatsList" 
      :new-pos="newPosList" 
      :new-rel="newRelationsList" 
      :new-misc="newMiscList"
      @reload-tags-list="reloadDetectedTagsList" 
    />
  </q-dialog>
</template>

<script lang="ts">
import { sentenceConllToJson } from 'conllup/lib/conll';
import { mapState } from 'pinia';
import { sample_t } from 'src/api/backend-types';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

import api from '../../api/backend-api';
import { useModelWrapper } from '../../composables/modelWrapper.js';
import DetectedTagSetDial from './DetectedTagSetDial.vue';

export default defineComponent({
  components: {
    DetectedTagSetDial,
  },
  emits: ['uploaded:sample', 'update:uploadDial'],
  props: {
    uploadDial: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    samples: {
      type: Object as PropType<sample_t[]>,
      required: true,
    },
  },
  setup(props, { emit }) {
    return {
      uploadDialModel: useModelWrapper(props, emit, 'uploadDial'),
    };
  },
  data() {
    const uploadSample: {
      submitting: boolean;
      attachment: { name: string | null; file: File[] };
    } = {
      submitting: false,
      attachment: { name: null, file: [] },
    };
    const tokenizeOptions = [
      { value: 'plainText', label: this.$t('uploadSample.tokenizeOptions[0]') },
      { value: 'horizontal', label: this.$t('uploadSample.tokenizeOptions[1]') },
      { value: 'vertical', label: this.$t('uploadSample.tokenizeOptions[2]') },
    ];
    const option: { value: string; label: string } = { value: '', label: '' };
    const lang: { value: string; label: string } = { value: '', label: '' };
    const langOptions = [
      { value: 'en', label: this.$t('uploadSample.languageOptions[0]') },
      { value: 'fr', label: this.$t('uploadSample.languageOptions[1]') },
    ];
    const samplesWithoutSentIds: string[] = [];
    return {
      files: null,
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
      rtl: false,
      userId: 'username',
      featsList: [] as string[], 
      miscList: [] as string[],
      posList: [] as string[],
      relationsList: [] as string[],
      newFeatsList: [] as string[],
      newMiscList: [] as string[],
      newPosList: [] as string[],
      newRelationsList: [] as { value: string, index: number }[],
    };
  },

  computed: {
    ...mapState(useUserStore, ['username', 'reservedUserIds']),
    ...mapState(useProjectStore, ['blindAnnotationMode', 'collaborativeMode', 'annotationFeatures']),
    disableTokenizeBtn() {
      if (this.option.value == 'plainText') {
        return this.text && this.sampleName && this.lang.value;
      } else {
        return this.text && this.sampleName;
      }
    },
    disableUploadBtn() {
      let disable = true;
      if (this.samplesWithoutSentIds.length > 0) {
        disable = !this.generateNewSentIds;
      } else if (this.uploadSample.attachment.file.length > 0 && this.userId !== 'other') {
        disable = false;
      }
      else if (this.uploadSample.attachment.file.length > 0 && this.userId === 'other' && this.customUserId !== '') {
        disable = false;
      }
      return disable;
    },
    hasNewFeatures() {
      return this.newFeatsList.length >  0 || this.newPosList.length > 0 || this.newRelationsList.length > 0 || this.newMiscList.length > 0;
    }
  },
  methods: {
    async preprocess() {
      this.warningMessage = '';
      this.samplesWithoutSentIds = [];

      for (const file of this.uploadSample.attachment.file) {
        if (file.name.split('.').pop() !== 'conllu') {
          this.warningMessage += `${file.name} is not a conllu file.\n`;
          this.uploadSample.attachment.file = [];
          this.$q.notify({
            message: this.warningMessage,
            position: 'top',
            color: 'warning',
            timeout: 5000,
            closeBtn: 'X',
          });
          return;
        }
        const content = await this.readFileContent(file);
        const sampleName = file.name.split('.conllu')[0];
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
      });
    },
    checkSentIdsErrors(fileContent: string, sampleName: string) {
      const sentIds: any[] = [];
      const sentences = fileContent.replace(/[\r]/g, "").split(/\n\n/).filter((sentence) => sentence);
      for (const sentence of sentences) {
        if (sentenceConllToJson(sentence)['metaJson']['sent_id']) {
          const sentId = sentenceConllToJson(sentence)['metaJson']['sent_id'];
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
          {
            label: 'Continue',
            handler: () => {
              this.generateNewSentIds = true;
            },
          },
          {
            label: 'Dismiss',
            handler: () => {
              this.uploadDialModel = false;
            },
          },
        ],
      });
    },
    uploadSamples() {
      const form = new FormData();
      if (!this.collaborativeMode) this.customUserId = 'validated';
      this.uploadSample.submitting = true;
      for (const file of this.uploadSample.attachment.file) {
        form.append('files', file);
      }
      form.append('userId', this.selectedUserId());
      form.append('rtl', JSON.stringify(this.rtl))
      if (this.generateNewSentIds) {
        form.append('samplesWithoutSentIds', JSON.stringify(this.samplesWithoutSentIds));
      }
      api
        .uploadSample(this.$route.params.projectname as string, form)
        .then((response) => {
          this.uploadSample.attachment.file = [];
          this.$emit('uploaded:sample'); // tell to the parent that a new sample was uploaded and to fetch all samples
          this.uploadDialModel = false;
          this.uploadSample.submitting = false;
          this.featsList = response.data.data.feats;
          this.miscList = response.data.data.misc;
          this.posList = response.data.data.pos;
          this.relationsList = response.data.data.relations;
          this.checkNewFeats();
          notifyMessage({ message: 'upload success' });
        })
        .catch((error) => {
          if (error.response) {
            error.message = error.response.data.message;
            notifyError({ error: error.message });
          }
          this.$emit('uploaded:sample'); 
          this.uploadSample.submitting = false;
          this.uploadDialModel = false;
        });
    },
    checkNewFeats() {
      const annotationUpos = this.annotationFeatures.UPOS;
      const annotationFeats = Object.values(this.annotationFeatures.FEATS).map(feat => feat.name);
      const annotationMisc = Object.values(this.annotationFeatures.MISC).map(misc => misc.name);
      const deprels = this.annotationFeatures.DEPREL;
      const splitRegex = new RegExp(`[${deprels.map(({ join }) => join).join('')}]`, 'g');

      this.newPosList = this.posList.filter(pos => !annotationUpos.includes(pos));
      this.newFeatsList = this.featsList.filter(feat => !annotationFeats.includes(feat));
      this.newMiscList = this.miscList.filter(misc => !annotationMisc.includes(misc));
      
      for (const relation of this.relationsList) {
        const splittedRel = relation.split(splitRegex);
        let index = 0;
        for (const subRel of splittedRel) {
          const found = deprels.some(({ values, join }) => values.includes(subRel) && relation.includes(join + subRel));
          index += 1;
          if (!found) this.newRelationsList.push({ value: subRel, index: index });
        }
      }
    },
    tokenizeSample() {
      const data = {
        username: this.selectedUserId(),
        text: this.text.normalize('NFC'),
        option: this.option.value,
        lang: this.lang.value,
        rtl: this.rtl,
        sampleName: this.sampleName,
      };
      api
        .tokenizeSample(this.$route.params.projectname as string, data)
        .then(() => {
          notifyMessage({ message: 'upload success' });
          this.$emit('uploaded:sample');
          this.uploadDialModel = false;
        })
        .catch(() => {
          notifyError({ error: 'Invalid request' });
        });
    },
    selectedUserId() {
      if (!this.collaborativeMode) {
        return 'validated';
      }
      else if (this.userId === 'username') {
        return this.username;
      }
      else if (this.userId === 'other')  {
        return this.customUserId;
      }
      else {
        return this.userId;
      }
    },
    closeDialog() {
      this.uploadDialModel = false;
      this.uploadSample.attachment.file = [];
    },
    reloadDetectedTagsList() {
      this.newFeatsList = [];
      this.newPosList = [];
      this.newRelationsList = [];
      this.newMiscList = [];
    }
  },
});
</script>

