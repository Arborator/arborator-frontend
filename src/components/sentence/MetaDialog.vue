<template>
  <q-dialog v-model="metaDialogOpened">
    <q-card style="width: 110vh">
      <q-bar class="bg-primary text-white sticky-bar">
        <div class="text-weight-bold">{{ $t('attributeTable.metadata') }}</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <AttributeTable
        :featActualData="metaList"
        :columns="featTable.columns"
        :featPossibleOptions="metaOptions"
        :isCustomizableFeatures="true"
        :isModifiable="true"
        :title="$t('attributeTable.metadata')"
      ></AttributeTable>
      <q-card-actions align="around">
        <q-btn 
          v-close-popup 
          outline
          color="primary" 
          :label="$t('cancel')" 
          style="width: 45%; margin-left: auto; margin-right: auto" 
        />
        <q-btn
          v-close-popup
          color="primary"
          label="Ok"
          style="width: 45%; margin-left: auto; margin-right: auto"
          @click="onMetaDialogOk()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { metaJson_T } from 'conllup/lib/conll';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { sentence_bus_t } from 'src/types/main_types';
import { notifyError, notifyMessage } from 'src/utils/notify';

import { PropType, defineComponent } from 'vue';
import AttributeTable from './AttributeTable.vue';


export default defineComponent({
  components: { AttributeTable },
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
  },
  data() {
    const metaList: { a: string; v: string | number }[] = [];
    const metaJson: metaJson_T = {};
    return {
      metaDialogOpened: false,
      token: {},
      userId: '',
      metaList,
      metaJson,
      featTable: {
        columns: [
          {
            name: 'a',
            align: 'center',
            label: 'Attribute',
            field: 'a',
            sortable: true,
            style: 'width: 33%',
          },
          {
            name: 'v',
            label: 'Value',
            field: 'v',
            sortable: true,
          },
          {
            name: 'actions',
            label: 'Actions',
            field: '',
            align: 'center',
            style: 'width: 8%',
          },
        ],
      },
    };
  },
  computed: {
    ...mapState(useProjectStore, ['shownMetaChoices']),
    metaOptions() {
      let metaOptions: { name: string; values: string }[] = [];
      for (const metaOption of this.shownMetaChoices) {
        if (!Object.keys(this.metaJson).includes(metaOption)) {
          metaOptions.push({ name: metaOption, values: 'string' });
        }
      }
      return metaOptions;
    },
  },
  mounted() {
    this.sentenceBus.on('open:metaDialog', ({ userId }: { userId: string }) => {
      this.userId = userId;
      this.metaJson = { ...this.sentenceBus.sentenceSVGs[userId].metaJson };
      this.metaDialogOpened = true;
      this.metaList = [];
      for (const a in this.metaJson) {
        this.metaList.push({ a, v: this.metaJson[a] });
      }
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:uposDialog');
  },
  methods: {
    onMetaDialogOk() {
      const newMetaJson: metaJson_T = {};
      if (this.metaList.some((meta) => meta.a === '' || meta.v === '')) {
        notifyError({ error: 'You can not save empty Meta !' });
        return;
      }
      this.metaList.forEach((meta) => {
        newMetaJson[meta.a] = meta.v;
      });
      this.sentenceBus.emit('tree-update:sentence', {
        sentenceJson: {
          metaJson: newMetaJson,
          treeJson: this.sentenceBus.sentenceSVGs[this.userId].treeJson,
        },
        userId: this.userId,
      });
      notifyMessage({
        message: "Meta changed locally, don't forget to save !",
        type: 'warning',
        icon: 'warning',
      });
    },
  },
});
</script>
<style></style>
