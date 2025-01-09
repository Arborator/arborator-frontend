<template>
  <q-card style="min-width: 50vw">
    <q-card-section>
      <div class="text-h6 text-left">{{ $t('github.commitDialog.title') }}</div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <q-list bordered separator>
        <q-item v-for="(sample, index) in modifiedSamples" :key="sample.id">
          <q-item-section>
            <q-item-label>{{ sample.sample_name }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ sample.changes_number }} {{ sample.changes_number == 1 ? 'change' : 'changes' }}</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-btn size="sm" flat icon="open_in_full" @click="selectedModifiedSamples[index] = true">
              <q-tooltip>Show changes</q-tooltip>
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
    <q-card-section>
      <q-form class="q-gutter-md">
        <q-input outlined v-model="message" :label="$t('github.commitDialog.commitInput')" />
        <div class="row q-gutter-md justify-center">
          <q-btn no-caps label="Commit" color="primary" @click="commitChanges()" />
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
      selectedModifiedSamples: [] as boolean[],
    };
  },
  mounted() {
    this.selectedModifiedSamples = new Array(this.modifiedSamples.length).fill(false);
  },
  methods: {
    commitChanges() {
      const githubMessage = this.message + ': committed by ArboratorGrew';
      const data = { commitMessage: githubMessage };
      api
        .commitChanges(this.projectName, data)
        .then(() => {
          notifyMessage({ message: this.$t('github.commitDialog.commitMessage') + `"${this.repositoryName}"` });
          this.$emit('committed');
        })
        .catch(() => {
          notifyError({ error: 'Error while commiting changes' });
        });
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
