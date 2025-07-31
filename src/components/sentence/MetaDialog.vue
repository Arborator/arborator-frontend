<template>
  <q-dialog v-model="metaDialogOpened" persistent>
    <q-card style="width: 110vh">
      <q-bar class="bg-primary text-white sticky-bar">
        <div class="text-weight-bold">{{ $t('attributeTable.metadata') }}</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section class="q-gutter-md">
        <q-input outlined v-model="userId" label="user_id" readonly />
        <q-input outlined v-model="timestamp" label="timestamp" readonly />
        <q-input outlined v-model="text" label="text" readonly />
        <q-input 
          outlined 
          v-model="metaJson.sent_id" 
          label="sent_id" 
          :readonly="!isAdmin"
          :rules="[
            (val) => (val && val.length > 0) || 'sent_id must not be empty',
            (val) => (!sortedSentIds.filter(sentId => sentId !== currentSentId).includes(val)) || 'sent_id exist'
          ]" 
          />
        <q-separator />
      </q-card-section>
      <q-card-section>
        <AttributeTable
          :featActualData="metaList"
          :columns="featTable.columns"
          :featPossibleOptions="metaOptions"
          :isCustomizableFeatures="true"
          :isModifiable="true"
          :title="$t('attributeTable.metadata')"
        ></AttributeTable>
      </q-card-section>
      <q-card-actions class="sticky-card-actions" align="around">
        <q-btn v-close-popup outline color="primary" :label="$t('cancel')"  />
        <q-btn  v-close-popup :disable="disableMetaBtn" color="primary" label="Ok" @click="onMetaDialogOk()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { date } from 'quasar';
import { metaJson_T } from 'conllup/lib/conll';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { useTreesStore } from 'src/pinia/modules/trees';
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
      userId: '',
      timestamp: '',
      text: '',
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
      basicMetadata: ['timestamp', 'user_id', 'sent_id', 'text'],
      currentSentId: '',
    };
  },
  computed: {
    ...mapState(useProjectStore, ['shownMetaChoices', 'isAdmin']),
    ...mapState(useTreesStore, ['sortedSentIds']),
    metaOptions() {
      let metaOptions: { name: string; values: string }[] = [];
      for (const metaOption of this.shownMetaChoices) {
        if (!Object.keys(this.metaJson).includes(metaOption)) {
          metaOptions.push({ name: metaOption, values: 'string' });
        }
      }
      return metaOptions;
    },
    disableMetaBtn() {
      return this.metaJson.sent_id === '' || 
        this.sortedSentIds.filter(sent_id => sent_id !== this.currentSentId).includes(this.metaJson.sent_id as string) || 
        this.metaJson.text === ''
      ; 
    }
  },
  mounted() {
    this.sentenceBus.on('open:metaDialog', ({ userId }: { userId: string }) => {
      this.userId = userId;
      this.metaJson = { ...this.sentenceBus.sentenceSVGs[userId].metaJson };

      this.metaDialogOpened = true;
      this.metaList = [];
      for (const a in this.metaJson) {
        if (!this.basicMetadata.includes(a)) {
          this.metaList.push({ a, v: this.metaJson[a] });
        }
      }
      this.timestamp = this.getTime(this.metaJson.timestamp as string); 
      this.text = this.metaJson.text as string;
      this.currentSentId = this.metaJson.sent_id as string;
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:uposDialog');
  },
  methods: {
    getTime(timestamp: string) {
      const currentDate = Date.now();
      const parsedTimestamp = parseInt(timestamp, 10);
      const diffTime = date.getDateDiff(currentDate, parsedTimestamp, 'days');
      let diffTimestr = '';
      if (diffTime === 0) {
        diffTimestr = `${date.getDateDiff(currentDate, parsedTimestamp, 'hours')} hours ago: `;
      } else if (diffTime > 365) {
        diffTimestr = 'a long time ago: ';
      } else {
        diffTimestr = `${diffTime} days ago: `;
      }
      return diffTimestr + date.formatDate(parsedTimestamp, 'YYYY-MM-DD HH:mm:ss');
    },
    onMetaDialogOk() {
      const newMetaJson: metaJson_T = {};
      if (this.metaList.some((meta) => meta.a === '' || meta.v === '')) {
        notifyError({ error: 'You can not save empty Meta!' });
        return;
      }

      newMetaJson['sent_id'] = this.metaJson.sent_id;
      newMetaJson['timestamp'] = this.metaJson.timestamp;
      newMetaJson['text'] = this.text;
      newMetaJson['user_id'] = this.userId;
      
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

