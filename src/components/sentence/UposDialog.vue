<template>
  <!-------------------- Start uposDialog -------------------->
  <q-dialog v-model="uposDialogOpened" @keyup.enter="onChangeUpos()">
    <q-card style="min-width: 700px">
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">UPOS : {{ $t('attributeTable.category[0]') }} "{{ token.FORM }}"</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section>
        <div class="q-gutter-sm">
          <q-chip
            outline
            v-for="(upos, index) in annotationFeatures.UPOS"
            v-model:selected="selectedUpos[index]"
            :label="upos"
            color="primary"
            @update:selected="unselectOtherUpos(index)"
          />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions>
        <q-btn
          v-close-popup
          outline
          color="primary"
          :label="$t('delete')"
          style="width: 25%; margin-left: auto; margin-right: auto"
          @click="onDeleteUpos()"
        />
        <q-space />
        <q-btn
          id="catselectvalidate"
          v-close-popup
          color="primary"
          label="Ok"
          style="width: 25%; margin-left: auto; margin-right: auto"
          @click="onChangeUpos()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!----------------- End uposDialog ------------------->
</template>

<script lang="ts">
import { PropType } from 'vue';
import { sentence_bus_t } from 'src/types/main_types';
import { useProjectStore } from 'src/pinia/modules/project';
import { mapState } from 'pinia';
import conllup from 'conllup';
const emptyTokenJson = conllup.emptyTokenJson;
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
  },
  data() {
    const token = emptyTokenJson();
    const selectedUpos: boolean[] = [];
    return {
      selectedUpos,
      uposDialogOpened: false,
      token,
      userId: '',
    };
  },
  computed: {
    ...mapState(useProjectStore, ['annotationFeatures']),
  },
  mounted() {
    this.sentenceBus.on('open:uposDialog', ({ token, userId }) => {
      this.token = token;
      this.userId = userId;
      this.selectedUpos = this.annotationFeatures.UPOS.map((upos) => upos === this.token.UPOS)
      this.uposDialogOpened = true;
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:uposDialog');
  },
  methods: {
    unselectOtherUpos(index: any) {
      this.selectedUpos.forEach((upos, i) => {
        if (upos && i != index) {
          this.selectedUpos[i] = false;
        }
      });
    },
    onChangeUpos() {
      if (this.selectedUpos.some((val) => val == true)) {
        this.token.UPOS = this.annotationFeatures.UPOS[this.selectedUpos.indexOf(true)];
      }
      this.uposDialogOpened = false;
      this.sentenceBus.emit('tree-update:token', {
        token: this.token,
        userId: this.userId,
      });
    },
    onDeleteUpos() {
      this.token.UPOS = '_';
      this.sentenceBus.emit('tree-update:token', {
        token: this.token,
        userId: this.userId,
      });
    },
  },
});
</script>
<style></style>
