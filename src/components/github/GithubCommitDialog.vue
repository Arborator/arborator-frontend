<template>
  <q-card style="min-width: 50vw">
    <q-card-section>
      <div class="text-h6 text-left">{{ $t('github.commitDialog.title') }}</div>
    </q-card-section>
    <q-separator />
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
  },
  data() {
    return {
      message: '',
    };
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
  },
});
</script>
