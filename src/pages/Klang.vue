<template>
  <q-page class="full-width justify-start items-start content-start">
    &nbsp;
    <div class="q-pa-xl q-gutter-lg">
      <div class="text-h3 text-primary">{{ $t('Klang.projects') }}</div>
    </div>

    <div class="q-pa-lg row items-start q-gutter-lg">
      <q-card style="max-width: 250px; width: 250px" clickable v-for="(f, i) in projects" :key="f" class="text-primary cursor-pointer q-hoverable">
        <span class="q-focus-helper"></span>
        <q-item clickable :to="'/klang/' + f">
          <q-icon name="music_note" size="lg" />
          <q-item-section>
            <q-item-label caption> {{ i + 1 }}. </q-item-label>
            <q-item-label> {{ f }} </q-item-label>
          </q-item-section>
        </q-item>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import Vue from 'vue';
import api from '../boot/backend-api';

export default {
  data() {
    return {
      projects: [],
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
          this.$store.dispatch('notifyError', { error });
        });
    },
  },
};
</script>
