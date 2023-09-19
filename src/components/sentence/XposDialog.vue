<template>
  <!-------------------- Start xposDialog -------------------->
  <q-dialog v-model="xposDialogOpened" @keyup.enter="onChangeXpos()">
    <!-- @hide="ondialoghide()" -->
    <!-- :maximized="maximizedToggle" -->
    <q-card style="height: 300px">
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">XPOS : {{ $t('attributeTable.category[0]') }} "{{ token.FORM }}"</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section style="height: 200px">
        <q-select
          id="catselect"
          v-model="token.XPOS"
          filled
          :options="annotationFeatures.XPOS"
          :label="$t('attributeTable.category[1]')"
          style="width: 250px"
        />
      </q-card-section>
      <q-separator />
      <q-card-actions>
        <q-btn v-close-popup flat :label="$t('cancel')" style="width: 25%; margin-left: auto; margin-right: auto" />
        <q-space />

        <!-- @click="ondialoghide()" -->
        <q-btn
          v-close-popup
          color="negative"
          :label="$t('delete')"
          style="width: 25%; margin-left: auto; margin-right: auto"
          @click="onDeleteXpos()"
        />
        <q-space />
        <q-btn
          id="catselectvalidate"
          v-close-popup
          color="primary"
          label="Ok"
          style="width: 25%; margin-left: auto; margin-right: auto"
          @click="onChangeXpos()"
        />
        <!-- :disabled="snap.currentcategory === snap.category" -->
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!----------------- End xposDialog ------------------->
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
    return {
      xposDialogOpened: false,
      token,
      userId: '',
    };
  },
  computed: {
    ...mapState(useProjectStore, ['annotationFeatures']),
  },
  mounted() {
    this.sentenceBus.on('open:xposDialog', ({ token, userId }) => {
      this.token = token;
      this.userId = userId;
      this.xposDialogOpened = true;
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:xposDialog');
  },
  methods: {
    onChangeXpos() {
      this.xposDialogOpened = false;
      this.sentenceBus.emit('tree-update:token', {
        token: this.token,
        userId: this.userId,
      });
    },
    onDeleteXpos() {
      this.token.XPOS = '_';
      this.sentenceBus.emit('tree-update:token', {
        token: this.token,
        userId: this.userId,
      });
    },
  },
});
</script>
<style></style>
