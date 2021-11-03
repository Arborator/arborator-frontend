<template>
  <!----------------- Start MetaDialog ------------------->

  <q-dialog v-model="metaDialogOpened">
    <q-card style="height: 110vh; width: 110vh">
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">Metadata of this sentence</div>
        <q-space />
        <q-btn flat dense icon="close" v-close-popup />
      </q-bar>
      <AttributeTable
        :featdata="metalist"
        :columns="featTable.columns"
        :featOptions="['String']"
        openFeatures="true"
        modifiable="true"
        title="Meta Sentence Features"
        @feature-changed="informFeatureChanged()"
      ></AttributeTable>
      <q-separator />
      <!-- todo: adapt informFeatureChanged also to metadata -->
      <q-card-actions align="around">
        <q-btn flat label="Cancel" v-close-popup style="width: 45%; margin-left: auto; margin-right: auto" />
        <q-btn
          color="primary"
          @click="onMetaDialogOk()"
          label="Ok"
          v-close-popup
          style="width: 45%; margin-left: auto; margin-right: auto"
          :disabled="!someFeatureChanged"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!----------------- End MetaDialog ------------------->
</template>
<script>
import AttributeTable from './AttributeTable';

export default {
  components: { AttributeTable },
  props: ['sentenceBus'],
  data() {
    return {
      metaDialogOpened: false,
      token: {},
      userId: '',
      metaJson: {},
      metalist: [],
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
    annotationFeatures() {
      return this.$store.getters['config/annotationFeatures'];
    },
    someFeatureChanged() {
      return true;
    },
  },
  mounted() {
    this.sentenceBus.on('open:metaDialog', ({ userId }) => {
      this.userId = userId;
      this.metaJson = { ...this.sentenceBus[userId].metaJson };
      this.metaDialogOpened = true;
      this.metalist = [];
      for (const a in this.metaJson) {
        this.metalist.push({ a, v: this.metaJson[a] });
      }
      this.$emit('meta-changed', this.metaJson); // so that the sentenceCard can show the meta feature such as text and text_en
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:uposDialog');
  },
  methods: {
    onMetaDialogOk() {
      const newMetaJson = this.metalist.reduce((obj, r) => {
        if (r.v) obj[r.a] = r.v;
        return obj;
      }, {});
      let isMetaChanged = 0;
      for (const newMetaKey of Object.keys(newMetaJson)) {
        const newMetaValue = newMetaJson[newMetaKey];
        if (newMetaValue !== this.metaJson[newMetaKey]) {
          if (['timestamp', 'user_id', 'sent_id', 'text'].includes(newMetaKey)) {
            isMetaChanged = 1;
          }
        }
      }
      if (!isMetaChanged) {
        this.sentenceBus.emit('tree-update:sentence', {
          sentenceJson: {
            metaJson: newMetaJson,
            treeJson: this.sentenceBus[this.userId].treeJson,
          },
          userId: this.userId,
        });
        this.$q.notify({
          message: 'Conllu changed',
        });
      } else {
        this.$store.dispatch('notifyError', {
          error: 'Changing timestamp, user_id, sent_id or text is not allowed !',
        });
      }
    },
  },
};
</script>
<style></style>
