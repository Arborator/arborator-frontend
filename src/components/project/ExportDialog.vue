<template>
  <q-card style="width: 100vw">
    <q-bar class="bg-primary text-white">
      <q-space />
      <q-btn v-close-popup dense flat icon="close" />
    </q-bar>
    <q-card-section>
      <div class="text-h6">
        {{ $t('exportSamples.title') }}
      </div>
    </q-card-section>
    <q-card-section class="q-gutter-md">
      <q-list bordered>
        <q-item v-if="canSeeOtherUsersTrees && usersTreesFrom.includes('validated')" tag="label" v-ripple>
          <q-item-section side top>
            <q-checkbox v-model="validated" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('exportSamples.exportValidatedTrees') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="canSaveTreeInProject && usersTreesFrom.includes(username)" tag="label" v-ripple>
          <q-item-section side top>
            <q-checkbox v-model="user" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('exportSamples.exportMyTrees') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="canSeeOtherUsersTrees" tag="label" v-ripple>
          <q-item-section side top>
            <q-checkbox v-model="last" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('exportSamples.exportRecentTrees') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item 
          v-if="otherUsers.length > 0 && canSeeOtherUsersTrees" 
          tag="label" 
          v-ripple
        >
          <q-item-section side top>
            <q-checkbox v-model="other" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('exportSamples.exportTreesOfUsers') }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <div v-if="other">
        <q-select 
          multiple 
          dense 
          outlined 
          use-chips 
          v-model="users" 
          :options="otherUsers" 
          :label="$t('exportSamples.selectOtherUsers')" 
          />
      </div>
    </q-card-section>
    <q-card-actions align="around">
      <q-btn :disable="disableExportBtn" v-close-popup color="primary" :label="$t('exportSamples.export')" @click="exportSamplesZip()"> </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">

import api from '../../api/backend-api';
import { sample_t } from 'src/api/backend-types';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { notifyError } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

export default defineComponent({
  name: 'ExportDialog',
  props: {
    samples: {
      type: Object as PropType<sample_t[]>,
      required: true,
    },
  },
  data() {
    const users: string[] = [];
    return {
      user: false,
      last: false,
      other: false,
      validated: false,
      users,
    };
  },
  computed: {
    ...mapState(useUserStore, ['username']),
    ...mapState(useProjectStore, ['canSaveTreeInProject', 'canSeeOtherUsersTrees']),
    usersTreesFrom() {
      return [...new Set(this.samples.map((sample) => sample.treesFrom).reduce((a: string[], b: string[]) => [...a, ...b], []))];
    },
    otherUsers() {
      return this.usersTreesFrom.filter((user) => user !== this.username && user !== 'validated')
    },
    projectName() {
      return this.$route.params.projectname;
    },
    disableExportBtn() {
      return !this.user && !this.last && !this.validated && (!this.other || this.users.length == 0);
    },
  },
  methods: {
    exportSamplesZip() {
      let usersToExport: string[] = [];
      if (this.user) {
        usersToExport.push(this.username);
      }
      if (this.last) {
        usersToExport.push('last');
      }
      if (this.users.length > 0) {
        usersToExport = usersToExport.concat(this.users);
      }
      if (this.validated) {
        usersToExport.push('validated');
      }
      const data = { sampleNames: this.samples.map(sample => sample.sampleName), users: usersToExport };
      api
        .exportSamplesZip(this.projectName as string, data)
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `dump_${this.projectName}.zip`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return [];
        })
        .catch((error) => {
          notifyError({ error });
          return [];
        });
    },
  },
});
</script>

