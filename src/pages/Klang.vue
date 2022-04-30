<template>
  <q-page class="full-width justify-start items-start content-start">
    &nbsp;
    <div class="q-pa-xl q-gutter-lg">
      <div class="text-h3 text-primary">{{ $t('Klang.projects') }}</div>
    </div>

    <div class="q-pa-lg row items-start q-gutter-lg">
      <q-card v-for="(f, i) in projects" :key="f" style="max-width: 250px; width: 250px" clickable class="text-primary cursor-pointer q-hoverable">
        <span class="q-focus-helper"></span>
        <q-item clickable :to="'/klang/' + f.name">
          <q-icon name="music_note" size="lg" />
          <q-item-section>
            <q-item-label caption> {{ i + 1 }}. </q-item-label>
            <q-item-label> {{ f.name }} </q-item-label>
            <q-item-label caption> {{ f.nrSamples }} sample{{ f.nrSamples == 1 ? '' : 's' }} </q-item-label>
          </q-item-section>
        </q-item>
        <div class="row absolute-bottom-right">
          <q-icon v-if="f.config.private && f.config.private == true" name="lock" size="xs" color="primary" />
          <q-icon v-else name="lock_open" size="xs" color="secondary" />
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { notifyError } from 'src/utils/notify';
import api from '../api/backend-api';
import { KlangProject_t } from 'src/api/backend-types';

import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    const projects: KlangProject_t[] = [];
    return {
      projects,
    };
  },
  mounted() {
    this.getProjects();
    document.title = `Klang`;
  },
  methods: {
    /**
     * Retrieve conll files from backend
     *
     * @returns void
     */
    getProjects() {
      api
        .getKlangProjects()
        .then((response) => {
          this.projects = response.data;
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
  },
});
</script>
