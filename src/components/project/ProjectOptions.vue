<template>
  <div v-if="selectedSamples.length" class="row rounded-borders items-center custom-frame1">
    <q-btn round flat icon="close" @click="unselectSamples()" />
    <div>
      {{ selectedSamples.length }}
      <span v-if="selectedSamples.length === 1">{{ $t('projectOptions.sample[0]') }}</span>
      <span v-else>{{ $t('projectOptions.sample[1]') }}</span>
    </div>
    <q-btn v-if="isAdmin" flat icon="delete" @click="triggerConfirmAction(deleteSamples)">
      <q-tooltip>
        {{ $t('projectOptions.tooltipDeleteSample') }}
      </q-tooltip>
    </q-btn>
    <q-btn v-if="canExportTrees" flat icon="download" @click="isShowExportDial = true">
      <q-tooltip>
        {{ $t('projectOptions.tooltipExportSample') }}
      </q-tooltip>
    </q-btn>
    <q-btn
      flat
      v-if="isValidator && blindAnnotationMode"
      icon="analytics"
      :disable="(visibility === 0 && isGuest) || selectedSamples.length !== 1"
      @click="exportEvaluation()"
    >
      <q-tooltip>
        {{ $t('projectOptions.tooltipExportEvaluation') }}
      </q-tooltip>
    </q-btn>
    <q-btn v-if="isAdmin" flat icon="more_vert">
      <q-menu>
        <q-list>
          <q-item clickable v-close-popup @click="isShowDeleteUserTreesDial = true">
            <q-item-section label>
              {{ $t('projectOptions.removeUserTrees') }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
  <q-dialog v-model="isShowExportDial">
    <ExportDialog :samples="selectedSamples" />
  </q-dialog>
  <q-dialog v-model="isShowDeleteUserTreesDial">
    <DeleteUserTreesDial :selected-samples="selectedSamples" />
  </q-dialog>
  <q-dialog v-model="confirmActionDial">
    <ConfirmAction :parent-action="confirmActionCallback" :target-name="name" />
  </q-dialog>
</template>
<script lang="ts">
import { mapState } from 'pinia';
import api from 'src/api/backend-api';
import { sample_t } from 'src/api/backend-types';
import { useProjectStore } from 'src/pinia/modules/project';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

import ConfirmAction from '../shared/ConfirmAction.vue';
import DeleteUserTreesDial from '../project/DeleteUserTreesDial.vue';
import ExportDialog from './ExportDialog.vue';

export default defineComponent({
  name: 'ProjectOptions',
  emits: ['unselect', 'reload'],
  components: {
    ExportDialog,
    ConfirmAction,
    DeleteUserTreesDial,
  },
  props: {
    selectedSamples: {
      type: Object as PropType<sample_t[]>,
      required: true,
    },
    canDeleteFromGithub: {
      type: Boolean as PropType<boolean>,
    },
  },
  data() {
    const confirmActionCallback: CallableFunction = () => {};
    return {
      confirmActionCallback,
      confirmActionDial: false,
      isShowExportDial: false,
      isShowDeleteUserTreesDial: false,
    };
  },
  computed: {
    ...mapState(useProjectStore, ['name', 'visibility', 'blindAnnotationMode', 'isAdmin', 'isValidator', 'isGuest', 'canExportTrees']),
  },
  methods: {
    deleteSamples() {
      const data = { sampleIds: this.selectedSamples.map((sample) => sample.sampleName) };
      api
        .deleteSamples(this.name, data)
        .then(() => {
          notifyMessage({ message: 'Delete success' });
          if (this.canDeleteFromGithub) this.deleteSamplesFromGithub();
          this.$emit('reload');
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
    deleteSamplesFromGithub() {
      const data = { sampleNames: this.selectedSamples.map((sample) => sample.sampleName) };
      api
        .deleteFileFromGithub(this.name, data)
        .then(() => {
          notifyMessage({ message: 'Delete from Github' });
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
    triggerConfirmAction(method: CallableFunction) {
      if (this.canDeleteFromGithub) {
        notifyMessage({ message: 'These files will be also deleted from your synchronized Github repository', type: 'warning', position: 'top' });
      }
      this.confirmActionCallback = method;
      this.confirmActionDial = true;
    }, 
    exportEvaluation() {
      const projectName = this.name;
      const sampleName = this.selectedSamples[0].sampleName;
      const fileName = `${sampleName}_evaluations`;
      api
        .exportEvaluation(projectName, sampleName)
        .then((response) => {
          this.downloadFileAttachement(response.data, fileName);
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
    downloadFileAttachement(data: any, fileName: string): void {
      const fileURL = window.URL.createObjectURL(new Blob([data]));
      const fileLink = document.createElement('a');

      fileLink.href = fileURL;
      fileLink.setAttribute('download', `${fileName}.tsv`);
      document.body.appendChild(fileLink);

      fileLink.click();
    },
    unselectSamples() {
      this.$emit('unselect');
    },
  },
});
</script>
