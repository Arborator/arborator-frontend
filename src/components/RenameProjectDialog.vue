<template>
  <q-card style="min-width: 50vw">
    <q-bar class="bg-primary text-white">
      <q-space />
      <q-btn v-close-popup flat dense icon="close" />
    </q-bar>
    <q-card-section>
      <div class="text-h6 text-left">{{ $t('renameProject.title') }}</div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <q-input
        outlined
        v-model="newProjectName"
        :label="$t('renameProject.inputLabel')"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || $t('renameProject.inputError')]"
      />
      <div class="flex flex-center">
        <q-btn v-close-popup :disable="newProjectName === ''" color="primary" :label="$t('renameProject.renameBtn')" @click="renameProject()" />
      </div>
    </q-card-section>
  </q-card>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { mapActions } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';

export default defineComponent({
  name: 'RenameProjectDialog',
  props: {
    projectName: {
      type: String as PropType<string>,
      required: true,
    },
  },
  data() {
    return {
      newProjectName: this.projectName,
    };
  },
  methods: {
    ...mapActions(useProjectStore, ['updateProjectSettings']),
    renameProject() {
      this.updateProjectSettings(this.projectName, { projectName: this.newProjectName });
    },
  },
});
</script>
