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
import { mapWritableState, mapState } from 'pinia';
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
    }
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
  },
  methods: {
    renameSample() {
      const data = { newSampleName: this.newSampleName };
      api
        .renameSample(this.name, this.sampleName, data)
        .then(() => {
          notifyMessage({ message: 'The sample name is modified' });
          this.reloadSamples = true;
        })
        .catch((error) => {
          notifyError({ error, caller: 'renameSample' });
        });
    },
  }
});

</script>
