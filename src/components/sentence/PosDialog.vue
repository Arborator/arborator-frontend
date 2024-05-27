<template>
  <q-dialog v-model="posDialogOpened" @keyup.enter="onChangePos()">
    <q-card style="min-width: 700px">
      <q-bar class="bg-primary text-white sticky-bar">
        <div class="text-weight-bold">{{ title }} : {{ $t('attributeTable.category[0]') }} "{{ token.FORM }}"</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section>
        <div class="q-gutter-sm" ^translate="no">
          <q-chip
            outline
            v-for="(pos, index) in posOptions"
            v-model:selected="selectedPos[index]"
            :label="pos"
            color="primary"
            @update:selected="unselectOtherPos(index)"
          />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions class="sticky-card-actions">
        <q-btn
          v-close-popup
          outline
          color="primary"
          :label="$t('delete')"
          style="width: 25%; margin-left: auto; margin-right: auto"
          @click="onDeletePos()"
        />
        <q-space />
        <q-btn v-close-popup color="primary" label="Ok" style="width: 25%; margin-left: auto; margin-right: auto" @click="onChangePos()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import conllup from 'conllup';
import { sentence_bus_t } from 'src/types/main_types';
import { PropType, defineComponent } from 'vue';

const emptyTokenJson = conllup.emptyTokenJson;

export default defineComponent({
  name: 'PosDialog',
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
    title: {
      type: String as PropType<string>,
      required: true,
    },
    posOptions: {
      type: Object as PropType<string[]>,
      required: true,
    },
    eventName: {
      type: String as PropType<any>,
      required: true,
    },
  },
  data() {
    const token = emptyTokenJson();
    const selectedPos: boolean[] = [];
    return {
      selectedPos,
      posDialogOpened: false,
      token,
      userId: '',
    };
  },
  mounted() {
    this.sentenceBus.on(this.eventName, ({ token, userId }) => {
      this.token = token;
      this.userId = userId;
      this.selectedPos = this.posOptions.map((pos) => pos === this.token[this.title]);
      this.posDialogOpened = true;
    });
  },
  beforeUnmount() {
    this.sentenceBus.off(this.eventName);
  },
  methods: {
    unselectOtherPos(index: any) {
      this.selectedPos.forEach((pos, i) => {
        if (pos && i != index) {
          this.selectedPos[i] = false;
        }
      });
    },
    onChangePos() {
      if (this.selectedPos.some((val) => val)) {
        this.token[this.title] = this.posOptions[this.selectedPos.indexOf(true)];
      } else {
        this.token[this.title] = '_';
      }
      this.posDialogOpened = false;
      this.sentenceBus.emit('tree-update:token', {
        token: this.token,
        userId: this.userId,
      });
    },
    onDeletePos() {
      this.token[this.title] = '_';
      this.sentenceBus.emit('tree-update:token', {
        token: this.token,
        userId: this.userId,
      });
    },
  },
});
</script>
