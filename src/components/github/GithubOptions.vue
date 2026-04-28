<template>
  <q-btn outline color="primary" no-caps icon="fab fa-github" label="Github Options" @click="openGithubDialog()" />
  
  <q-dialog v-model="isShowGithubDialog" style="backdrop-filter: blur(4px)">
    <q-card style="width: 90vw; max-width: 1000px; max-height: 95vh; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.15)">
      <q-card-section class="bg-primary text-white q-pa-sm text-center" style="position: relative;">
        <div class="text-h6 text-weight-bold">GITHUB OPTIONS</div>
        <q-btn icon="close" flat round dense v-close-popup size="md" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%);" />
      </q-card-section>

      <q-card-section class="bg-orange-1 text-orange-10 q-pa-md q-mt-md">
        <div class="row items-start no-wrap">
         <q-icon name="warning" size="20px" class="q-mr-sm q-mt-xs" />
         <div class="text-body2">
          {{ $t('github.concurrentModificationsWarning') }}
         </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md" style="overflow: hidden; flex-grow: 1">
        <div class="q-pa-md">
          <div class="text-h6 text-weight-bold q-mb-md text-grey-8">
            {{ $t('github.statusLabel').toUpperCase() }}
          </div>
          
          <div class="bg-blue-1 rounded-borders q-pa-sm q-mb-sm" style="border-left: 5px solid #667eea;">
            <div class="row items-center">
              <q-avatar 
                icon="published_with_changes" 
                size="32px" 
                color="primary" 
                text-color="white"
              />
              <div class="q-ml-sm">
                <div v-if="changesNumber > 0" class="text-h6">
                  <span class="text-weight-bold">{{ changesNumber }}</span>
                  <span class="q-ml-sm">
                    <span v-if="changesNumber === 1">{{ $t('github.statusNotif[1]') }}</span>
                    <span v-else>{{ $t('github.statusNotif[2]') }}</span>
                  </span>
                </div>
                <div v-else class="text-h6 text-green-8 text-weight-bold">
                  {{ $t('github.statusNotif[3]') }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="statusEntries.length">
            <div class="text-body2 text-grey-8 q-mb-md">
              {{ $t('github.statusDialog.selection', { selected: selectedSamples.length, total: statusEntries.length }) }}
            </div>
            <div class="row q-gutter-md q-mb-lg">
              <q-btn flat no-caps :label="$t('github.statusDialog.selectAll')" @click="selectAll()" />
              <q-btn flat no-caps :label="$t('github.statusDialog.clearSelection')" @click="clearSelection()" />
            </div>

            <q-list bordered separator class="rounded-borders q-mb-lg">
              <q-item v-for="(sample, index) in statusEntries" :key="sample.sample_name">
                <q-item-section side>
                  <q-checkbox v-model="selectedSamples" :val="sample.sample_name" size="lg" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-600 text-body1">{{ sample.sample_name }}</q-item-label>
                  <q-item-label caption class="q-mt-sm">
                    <q-badge outline color="primary" :label="statusLabel(sample.status)" />
                  </q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body2">{{ sample.changes_number }} {{ sample.changes_number == 1 ? 'change' : 'changes' }}</q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <div class="row q-gutter-sm">
                    <q-btn size="md" flat icon="open_in_full" @click="selectedModifiedSamples[index] = true">
                      <q-tooltip>{{ $t('github.statusDialog.showChanges') }}</q-tooltip>
                    </q-btn>
                    <q-btn size="md" flat icon="restore" @click="confirmResetSamples([sample.sample_name])">
                      <q-tooltip>{{ $t('github.statusDialog.resetOne') }}</q-tooltip>
                    </q-btn>
                    <q-dialog v-model:model-value="selectedModifiedSamples[index]">
                      <q-card style="min-width: 60vw">
                        <q-card-section>
                          <div class="text-h6 text-left">{{ sample.sample_name }}</div>
                        </q-card-section>
                        <q-card-section>
                          <pre v-html="highlightedDiff(sample.diff)" style="font-size: 13px" />
                        </q-card-section>
                      </q-card>
                    </q-dialog>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>

            <div class="q-mb-lg">
              <q-input 
                outlined 
                v-model="message" 
                :label="$t('github.statusDialog.commitInput')"
                :disable="!statusEntries.length"
                class="q-mb-lg"
              />
              <div class="row q-gutter-md justify-center">
                <q-btn 
                  no-caps 
                  flat 
                  color="primary"
                  :disable="!selectedSamples.length || isSubmitting" 
                  :label="$t('github.statusDialog.resetSelected')" 
                  @click="confirmResetSamples([...selectedSamples])" 
                />
                <q-btn 
                  no-caps 
                  color="primary"
                  :disable="!canPush" 
                  :loading="isSubmitting" 
                  :label="$t('github.statusDialog.pushSelected')" 
                  @click="commitChanges()" 
                />
              </div>
            </div>
          </div>
          <div v-else class="text-grey-7 text-center q-pa-md">
            <div class="text-h6">{{ $t('github.statusNotif[3]') }}</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-lg q-pb-md q-px-md q-gutter-sm row justify-center" style="gap: 16px;">
        <q-btn
          unelevated
          :color="checkPulls ? 'positive' : 'grey-5'"
          :disable="!checkPulls || isCheckingPulls"
          :loading="isCheckingPulls"
          style="border-radius: 8px; text-transform: none; padding: 8px 16px; font-weight: 500; font-size: 13px; min-width: 120px;"
          @click="pullChanges()"
          class="action-btn"
        >
          <q-icon name="ion-md-git-pull-request" size="18px" class="q-mr-sm" />
          Pull
        </q-btn>

        <q-btn
          unelevated
          color="primary"
          style="border-radius: 8px; text-transform: none; padding: 8px 16px; font-weight: 500; font-size: 13px; min-width: 120px;"
          @click="isShowGithubDialog = false; isShowPullRequestDialog = true"
          class="action-btn"
        >
          <q-icon name="ion-md-git-merge" size="18px" class="q-mr-sm" />
          Pull Request
        </q-btn>

        <q-btn
          unelevated
          color="negative"
          style="border-radius: 8px; text-transform: none; padding: 8px 16px; font-weight: 500; font-size: 13px; min-width: 120px;"
          @click="isShowGithubDialog = false; triggerConfirm(deleteSynchronization)"
          class="action-btn"
        >
          <q-icon name="cancel_presentation" size="18px" class="q-mr-sm" />
          {{ $t('github.removeSync[0]') }}
        </q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="isShowPullRequestDialog" persistent>
    <GithubPullRequestDialog :projectName="projectName" :repositoryName="repositoryName" @created="isShowPullRequestDialog = false" />
  </q-dialog>
  <q-dialog v-model="confirmActionDial">
    <ConfirmAction 
      :parent-action="confirmActionCallback" 
      :target-name="projectName"
      :message="confirmActionMessage"
      :hint="confirmActionHint"
      :label="confirmActionLabel"
    />
  </q-dialog>
</template>

<script lang="ts">
import { AxiosError } from 'axios';
import { mapState } from 'pinia';

import { useGithubStore } from 'src/pinia/modules/github';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

import api from '../../api/backend-api';
import GithubPullRequestDialog from './GithubPullRequestDialog.vue';
import ConfirmAction from '../shared/ConfirmAction.vue';

export default defineComponent({
  components: {
    GithubPullRequestDialog,
    ConfirmAction,
  },
  name: 'GithubOptions',
  emits: ['remove', 'pulled'],
  props: {
    projectName: {
      type: String as PropType<string>,
      required: true,
    },
    repositoryName: {
      type: String as PropType<string>,
      required: true,
    },
  },
  data() {
    const confirmActionCallback = null as unknown as CallableFunction;
    const modifiedSamples = [] as any[];
    return {
      isShowGithubDialog: false,
      isShowPullRequestDialog: false,
      confirmActionDial: false,
      confirmActionCallback,
      confirmActionMessage: '',
      confirmActionHint: '',
      confirmActionLabel: '',
      checkPulls: false,
      isCheckingPulls: false,
      changesNumber: 0,
      modifiedSamples,
      statusEntries: [] as any[],
      selectedSamples: [] as string[],
      selectedModifiedSamples: [] as boolean[],
      message: '',
      isSubmitting: false,
    };
  },
  computed: {
    ...mapState(useGithubStore, ['reloadCommits']),
    ...mapState(useUserStore, ['username']),
    ...mapState(useProjectStore, ['isOwner']),
    repositoryLink() {
      return `https://github.com/${this.repositoryName}`;
    },
    canPush() {
      return this.selectedSamples.length > 0 && this.message.trim().length > 0 && !this.isSubmitting;
    },
  },
  mounted() {
    this.getChanges();
  },
  watch: {
    reloadCommits() {
      this.getChanges();
    },
  },
  methods: {
    openGithubDialog() {
      this.isShowGithubDialog = true;
      this.getPulls(true);
    },
    getChanges() {
      api
        .getChanges(this.projectName)
        .then((response) => {
          this.modifiedSamples = response.data;
          this.changesNumber = this.modifiedSamples.length;
          this.resetLocalState(this.modifiedSamples);
        })
        .catch((error) => {
          const axiosError = error as AxiosError;

          if (axiosError.response?.status === 404) {
            this.modifiedSamples = [];
            this.changesNumber = 0;
            this.checkPulls = false;
            this.statusEntries = [];
            this.selectedSamples = [];
            return;
          }

          notifyError({ error, caller: 'GithubOptions.getChanges' });
        });
    },
    resetLocalState(samples: any[]) {
      this.statusEntries = [...samples];
      this.selectedModifiedSamples = new Array(samples.length).fill(false);
      this.selectedSamples = samples.map((sample) => sample.sample_name);
    },
    selectAll() {
      this.selectedSamples = this.statusEntries.map((sample) => sample.sample_name);
    },
    clearSelection() {
      this.selectedSamples = [];
    },
    getPulls(silent = false) {
      this.isCheckingPulls = true;
      api
        .checkPull(this.projectName)
        .then((response) => {
          this.checkPulls = response.data;
          if (this.checkPulls) {
            notifyMessage({ message: 'New changes are available. Please pull the latest updates.' });
            return;
          }

          if (!silent && !this.checkPulls && this.isOwner) {
            notifyMessage({ message: `You don't have changes to pull` });
          }
        })
        .catch((error) => {
          notifyError({ error, caller: 'getPulls' });
        })
        .finally(() => {
          this.isCheckingPulls = false;
        });
    },
    commitChanges() {
      this.isSubmitting = true;
      const githubMessage = this.message + ': committed by ArboratorGrew';
      const data = { commitMessage: githubMessage, sampleNames: this.selectedSamples };
      api
        .commitChanges(this.projectName, data)
        .then(() => {
          notifyMessage({ message: this.$t('github.statusDialog.commitMessage') + `"${this.repositoryName}"` });
          this.getChanges();
          this.message = '';
        })
        .catch((error) => {
          notifyError({ error, caller: 'Error while committing changes' });
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    },
    resetSamples(sampleNames: string[]) {
      this.isSubmitting = true;
      api
        .resetChanges(this.projectName, { sampleNames })
        .then(() => {
          notifyMessage({ message: this.$t('github.statusDialog.resetMessage') });
          return api.getChanges(this.projectName);
        })
        .then((response) => {
          this.resetLocalState(response.data);
        })
        .catch((error) => {
          notifyError({ error, caller: 'Error while resetting changes' });
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    },
    deleteSynchronization() {
      api
        .deleteSynchronization(this.projectName)
        .then(() => {
          this.$emit('remove');
        })
        .catch((error) => {
          notifyError({ error, caller: 'deleteSynchronization' });
        });
    },
    pullChanges() {
      api
        .pullChanges(this.projectName)
        .then(() => {
          this.checkPulls = false;
          notifyMessage({ message: `The changes from ${this.repositoryName} are pulled in ${this.projectName}` });
          this.$emit('pulled');
        })
        .catch((error) => {
          notifyError({ error, caller: 'pullChanges' });
        });
    },
    statusLabel(status: string) {
      return this.$t(`github.statusDialog.statuses.${status}`);
    },
    highlightedDiff(diff: string) {
      return diff
        .split('\n')
        .map(line => {
          if (line.startsWith('-')) {
            return `<span class="text-red">${line}</span>`;
          } else if (line.startsWith('+')) {
            return `<span class="text-green">${line}</span>`;
          } else {
            return line;
          }
        })
        .join('\n');
    },
    confirmResetSamples(sampleNames: string[]) {
      const changesToReset = this.statusEntries
        .filter((sample) => sampleNames.includes(sample.sample_name))
        .reduce((total, sample) => total + Number(sample.changes_number || 0), 0);

      if (!changesToReset || this.isSubmitting) {
        return;
      }

      this.confirmActionCallback = () => {
        this.resetSamples(sampleNames);
      };
      this.confirmActionMessage = this.$t('github.statusDialog.resetConfirmMessage', {
        count: changesToReset,
        plural: changesToReset > 1 ? 's' : '',
      }) as string;
      this.confirmActionHint = this.$t('github.statusDialog.resetConfirmHint', {
        projectName: this.projectName,
      }) as string;
      this.confirmActionLabel = this.$t('github.statusDialog.resetConfirmLabel') as string;
      this.confirmActionDial = true;
    },
    triggerConfirm(method: CallableFunction) {
      this.confirmActionDial = true;
      this.confirmActionCallback = method;
    },
  },
});
</script>

<style lang="stylus" scoped>
pre
  background #f5f5f5
  padding 16px
  border-radius 6px
  overflow-x auto

.action-btn
  transition all 0.3s ease
  &:hover
    transform translateY(-2px)
    box-shadow 0 6px 16px rgba(0, 0, 0, 0.15)
</style>
