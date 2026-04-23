<template>
  <q-card style="min-width: 50vw">
    <q-card-section>
      <div class="text-h6 text-left">{{ $t('github.statusDialog.title') }}</div>
    </q-card-section>
    <q-separator />
    <q-card-section class="q-gutter-md">
      <div class="row items-center justify-between q-col-gutter-sm">
        <div class="text-caption text-grey-8">
          {{ $t('github.statusDialog.selection', { selected: selectedSamples.length, total: statusEntries.length }) }}
        </div>
        <div class="row q-gutter-sm">
          <q-btn flat no-caps size="sm" :label="$t('github.statusDialog.selectAll')" @click="selectAll()" />
          <q-btn flat no-caps size="sm" :label="$t('github.statusDialog.clearSelection')" @click="clearSelection()" />
        </div>
      </div>
    </q-card-section>
    <q-card-section v-if="statusEntries.length">
      <q-list bordered separator>
        <q-item v-for="(sample, index) in statusEntries" :key="sample.sample_name">
          <q-item-section side>
            <q-checkbox v-model="selectedSamples" :val="sample.sample_name" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ sample.sample_name }}</q-item-label>
            <q-item-label caption>
              <q-badge outline color="primary" :label="statusLabel(sample.status)" />
            </q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ sample.changes_number }} {{ sample.changes_number == 1 ? 'change' : 'changes' }}</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-btn size="sm" flat icon="open_in_full" @click="selectedModifiedSamples[index] = true">
              <q-tooltip>{{ $t('github.statusDialog.showChanges') }}</q-tooltip>
            </q-btn>
            <q-btn size="sm" flat icon="restore" @click="resetSamples([sample.sample_name])">
              <q-tooltip>{{ $t('github.statusDialog.resetOne') }}</q-tooltip>
            </q-btn>
            <q-dialog v-model:model-value="selectedModifiedSamples[index]">
              <q-card style="min-width: 50vw">
                <q-card-section>
                  <div class="text-h6 text-left">{{ sample.sample_name }}</div>
                </q-card-section>
                <q-card-section>
                  <pre v-html="highlightedDiff(sample.diff)" />
                </q-card-section>
              </q-card>
            </q-dialog>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-card-section v-else class="text-grey-7">
      {{ $t('github.statusNotif[3]') }}
    </q-card-section>
    <q-card-section>
      <q-form class="q-gutter-md">
        <q-input outlined v-model="message" :label="$t('github.statusDialog.commitInput')" :disable="!statusEntries.length" />
        <div class="row q-gutter-md justify-center">
          <q-btn no-caps flat color="primary" :disable="!selectedSamples.length || isSubmitting" :label="$t('github.statusDialog.resetSelected')" @click="resetSamples(selectedSamples)" />
          <q-btn no-caps color="primary" :disable="!canPush" :loading="isSubmitting" :label="$t('github.statusDialog.pushSelected')" @click="commitChanges()" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>
<script lang="ts">
import { notifyError, notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

import api from '../../api/backend-api';

export default defineComponent({
  name: 'GithubCommitDialog',
  props: {
    projectName: {
      type: String as PropType<string>,
      required: true,
    },
    repositoryName: {
      type: String as PropType<string>,
      required: true,
    },
    modifiedSamples: {
      type: Array as PropType<any[]>,
      required: true,
    },
  },
  data() {
    return {
      message: '',
      isSubmitting: false,
      statusEntries: [] as any[],
      selectedSamples: [] as string[],
      selectedModifiedSamples: [] as boolean[],
    };
  },
  mounted() {
    this.resetLocalState(this.modifiedSamples);
  },
  computed: {
    canPush() {
      return this.selectedSamples.length > 0 && this.message.trim().length > 0 && !this.isSubmitting;
    },
  },
  watch: {
    modifiedSamples: {
      deep: true,
      handler(newSamples) {
        this.resetLocalState(newSamples);
      },
    },
  },
  methods: {
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
    commitChanges() {
      this.isSubmitting = true;
      const githubMessage = this.message + ': committed by ArboratorGrew';
      const data = { commitMessage: githubMessage, sampleNames: this.selectedSamples };
      api
        .commitChanges(this.projectName, data)
        .then(() => {
          notifyMessage({ message: this.$t('github.statusDialog.commitMessage') + `"${this.repositoryName}"` });
          this.$emit('committed');
        })
        .catch((error) => {
          notifyError({ error, caller: 'Error while commiting changes' });
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
  },
});
</script>
