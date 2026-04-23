<template>
  <q-card style="min-width: 50vw">
    <q-bar class="bg-primary text-white">
      <q-space />
      <q-btn v-close-popup flat dense icon="close" />
    </q-bar>
    <q-card-section>
      <div class="text-h6 text-left">Rename Sample</div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div v-if='hasValidated && canChangeGithub && syncGithubRepo' style="margin-bottom: 15px;">
        <div class="q-pa-md bg-orange-1 text-orange-10" >
          <q-icon name="warning" class="q-mr-md" />
          The sample will be renamed on GitHub ({{  syncGithubRepo }}) immediatly!
        </div>
      </div>
      <q-input
        outlined
        v-model="newSampleName"
        label="New sample name"
        :rules="[value => !checkFilename(value) || checkFilename(value)]"
      />
      <div class="flex flex-center">
        <q-btn 
          v-close-popup 
          color="primary"
          :disable="checkFilename(newSampleName) !== ''"
          label="Submit" type="submit" 
          @click="renameSample()"
        />
      </div>

    </q-card-section>
  </q-card>
</template>
<script lang="ts">
import { api } from 'src/boot/axios';
import { sample_t } from 'src/api/backend-types';
import { mapWritableState, mapState } from 'pinia';
import { useGithubStore } from 'src/pinia/modules/github';
import { useProjectStore } from 'src/pinia/modules/project';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { defineComponent, PropType } from 'vue';
import { checkFilename } from 'src/utils/misc';

export default defineComponent({
  name: 'RenameSample',
  props: {
    sampleName: {
      type: String as PropType<string>,
      required: true,
    },
    canChangeGithub: {
      type: Boolean as PropType<boolean>,
    },
    hasValidated: {
      type: Boolean as PropType<boolean>,
    },
    syncGithubRepo: {
      type: String as PropType<string>,
      required: false,
    },
  },
  data() {
    return {
      newSampleName: '',
      checkFilename: checkFilename,
    }
  },
  computed: {
    ...mapState(useProjectStore, ['name']), 
    ...mapWritableState(useProjectStore, ['reloadSamples']),
    ...mapWritableState(useGithubStore, ['reloadCommits']),
  },
  methods: {
    renameSample() {
      const data = { newSampleName: this.newSampleName };
      api
        .renameSample(this.name, this.sampleName, data)
        .then(() => {
          notifyMessage({ message: 'The sample name is modified' });
          if (this.canChangeGithub && this.hasValidated && this.syncGithubRepo) {
            const githubRenameData = {
              oldName: this.sampleName,
              newName: this.newSampleName,
            };
            return api
              .githubRenameSample(this.name, githubRenameData)
              .then(() => {
                notifyMessage({ message: 'The samples name was modified on GitHub' });
                this.reloadCommits += 1;
              });
          }
        })
        .then(() => {
          this.reloadSamples = true;
        })
        .catch((error) => {
          notifyError({ error, caller: 'renameSample' });
        });
    },
  }
});

</script>
