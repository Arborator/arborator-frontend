<template>
  <!-------------------- Start uposDialog -------------------->
  <q-dialog v-model="uposDialogOpened" @keyup.enter="onChangeUpos()">
    <!-- @hide="ondialoghide()" -->
    <!-- :maximized="maximizedToggle" -->
    <q-card style="height: 300px">
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">Select a category for "{{ token.FORM }}"</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section style="height: 200px">
        <q-select id="catselect" v-model="token.UPOS" filled :options="annotationFeatures.UPOS" label="Category" style="width: 250px" />
      </q-card-section>
      <q-separator />
      <q-card-actions>
        <q-btn v-close-popup flat label="Cancel" style="width: 25%; margin-left: auto; margin-right: auto" />
        <q-space />

        <!-- @click="ondialoghide()" -->
        <q-btn v-close-popup color="negative" label="Delete" style="width: 25%; margin-left: auto; margin-right: auto" @click="onDeleteUpos()" />
        <q-space />
        <q-btn
          id="catselectvalidate"
          v-close-popup
          color="primary"
          label="Ok"
          style="width: 25%; margin-left: auto; margin-right: auto"
          @click="onChangeUpos()"
        />
        <!-- :disabled="snap.currentcategory === snap.category" -->
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!----------------- End uposDialog ------------------->
</template>

<script lang="ts">
import { PropType } from 'vue';
import { sentence_bus_t } from 'src/types/main_types';
import { emptyTokenJson } from 'conllup/lib/conll';
import { useProjectStore } from 'src/pinia/modules/project';
import { mapState } from 'pinia';

export default {
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
  },
  data() {
    const token = emptyTokenJson();
    return {
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
      this.uposDialogOpened = true;
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:uposDialog');
  },
  methods: {
    onChangeUpos() {
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
};
</script>
<style></style>
