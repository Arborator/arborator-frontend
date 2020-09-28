<template>
  <!-------------------- Start uposDialog -------------------->
  <q-dialog v-model="uposDialogOpened" @keyup.enter="onChangeUpos()">
    <!-- @hide="ondialoghide()" -->
    <!-- :maximized="maximizedToggle" -->
    <q-card style="height: 300px">
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">
          Select a category for "{{ token.FORM }}"
        </div>
        <q-space />
        <q-btn flat dense icon="close" v-close-popup />
      </q-bar>
      <q-card-section style="height: 200px">
        <q-select
          id="catselect"
          filled
          v-model="token.UPOS"
          :options="annotationFeatures.UPOS"
          label="Category"
          style="width: 250px"
        />
      </q-card-section>
      <q-separator />
      <q-card-actions>
        <q-btn
          flat
          label="Cancel"
          v-close-popup
          style="width: 45%; margin-left: auto; margin-right: auto"
        />
        <!-- @click="ondialoghide()" -->
        <q-btn
          id="catselectvalidate"
          color="primary"
          @click="onChangeUpos()"
          label="Ok"
          v-close-popup
          style="width: 45%; margin-left: auto; margin-right: auto"
        />
        <!-- :disabled="snap.currentcategory == snap.category" -->
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!----------------- End uposDialog ------------------->
</template>

<script>
export default {
  props: ["sentenceBus"],
  data() {
    return {
      uposDialogOpened: false,
      token: {},
      userId: "",
    };
  },
  computed: {
    annotationFeatures() {
      return this.$store.getters["config/annotationFeatures"];
    },
  },
  mounted() {
    this.sentenceBus.$on("open:uposDialog", ({ token, userId }) => {
      this.token = token;
      this.userId = userId;
      this.uposDialogOpened = true;
    });
  },
  beforeDestroy() {
    this.sentenceBus.$off("open:uposDialog");
  },
  methods: {
    onChangeUpos() {
      this.uposDialogOpened = false;
      this.sentenceBus.$emit("tree-update:upos", {
        token: this.token,
        userId: this.userId,
      });
    },
  },
};
</script>
<style>
</style>