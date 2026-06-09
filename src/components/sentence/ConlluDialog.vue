<template>
  <q-dialog v-model="conlluDialogOpened" style="backdrop-filter: blur(4px)">
    <q-card flat bordered class="column no-wrap rounded-borders shadow-10" style="width: 95vw; max-width: 1500px; max-height: 98vh; border-radius: 12px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15)">
      <q-card-section class="bg-primary text-white q-pa-sm text-center relative-position">
        <div class="text-h6 text-weight-bold">{{ $t('conllDial.title') }}</div>
        <q-btn v-close-popup icon="close" flat round dense size="md" class="absolute-top-right q-ma-xs" />
      </q-card-section>
      <q-card-section class="q-pa-md col overflow-hidden">
        <div class="conll-editor">
          <Codemirror v-model:value="currentConllContent" :options="cmOption" class="bordered"></Codemirror>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions class="q-pt-md q-pb-md q-px-md row justify-center">
        <q-btn
          v-close-popup
          outline
          color="primary"
          size="md"
          no-caps
          class="q-mx-xl q-px-xl q-py-lg"
          :label="$t('cancel')"
        />
        <q-btn
          v-close-popup
          color="primary"
          size="md"
          no-caps
          class="q-mx-xl q-px-xl q-py-lg"
          :label="$t('conllDial.copyConll')"
          @click="copyConll()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import Codemirror from 'codemirror-editor-vue3';

import { copyToClipboard } from 'quasar';
import { mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { sentence_bus_t, reactive_sentences_obj_t } from 'src/types/main_types';

import { notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';
import { grewSearchResultSentence_t } from 'src/api/backend-types';

export default defineComponent({
  components: { Codemirror },
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
    reactiveSentencesObj: {
      type: Object as PropType<reactive_sentences_obj_t>,
      required: true,
    },
    sentenceData: {
      type: Object as PropType<grewSearchResultSentence_t>,
      required: true,
    }
  },
  data() {
    return {
      userId: '',
      conlluDialogOpened: false,
      currentConllContent: '',
      cmOption: {
        tabSize: 8,
        styleActiveLine: true,
        lineNumbers: false,
        lineWrapping: true,
        line: true,
        mode: 'tsv',
        readOnly: true,
      },
    };
  },
  computed: {
    ...mapState(useUserStore, ['isLoggedIn']),
  },
  mounted() {
    this.sentenceBus.on('open:conlluDialog', ({ userId }) => {
      this.userId = userId;
      this.conlluDialogOpened = true;
      this.currentConllContent = this.sentenceData.conlls[this.userId];
    });
  },
  methods: {
    copyConll() {
      copyToClipboard(this.currentConllContent).then(() => {
        notifyMessage({ message: 'Conll Copied!' });
      });
    },
  },
});
</script>

<style scoped>
.bordered {
  border: 1px solid #999999;
}

.conll-editor {
  height: 310px;
}
</style>
