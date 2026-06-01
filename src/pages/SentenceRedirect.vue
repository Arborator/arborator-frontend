<template>
  <q-page class="column items-center justify-center q-pa-lg">
    <q-spinner-gears size="50px" color="primary" />
    <div class="q-mt-md text-subtitle1">Resolving sentence link...</div>
  </q-page>
</template>

<script lang="ts">
import api from 'src/api/backend-api';
import { project_extended_t, sample_t } from 'src/api/backend-types';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SentenceRedirect',
  async mounted() {
    const sentId = this.$route.params.sentId as string | undefined;
    if (!sentId) {
      await this.$router.replace('/projects');
      return;
    }

    try {
      const match = await this.findSentence(sentId);
      if (!match) {
        this.$q.notify({ type: 'warning', message: `Sentence not found for sent_id: ${sentId}` });
        await this.$router.replace('/projects');
        return;
      }

      await this.$router.replace({
        path: `/projects/${match.projectName}/${match.sampleName}`,
        query: { sent: sentId },
      });
    } catch (error) {
      this.$q.notify({ type: 'negative', message: 'Unable to resolve sentence link.' });
      await this.$router.replace('/projects');
    }
  },
  methods: {
    async findSentence(sentId: string): Promise<{ projectName: string; sampleName: string } | null> {
      const projectsResponse = await api.getUserProjects();
      const projects = projectsResponse.data as project_extended_t[];

      for (const project of projects) {
        const projectName = project.projectName;
        const samplesResponse = await api.getProjectSamples(projectName);
        const samples = samplesResponse.data as sample_t[];

        for (const sample of samples) {
          const treesResponse = await api.getSampleTrees(projectName, sample.sampleName);
          const sampleTrees = treesResponse.data?.sample_trees || {};
          if (sampleTrees[sentId]) {
            return { projectName, sampleName: sample.sampleName };
          }
        }
      }

      return null;
    },
  },
});
</script>
