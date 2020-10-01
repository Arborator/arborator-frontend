<template>
  <!-------------------- Start uposDialog -------------------->
  <q-dialog v-model="statisticsDialogOpened">
    <!-- @hide="ondialoghide()" -->
    <!-- :maximized="maximizedToggle" -->
    <q-card style="height: 300px">
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">
          Stastistics of the current opened tree "{{ userId }}"
        </div>
        <q-space />
        <q-btn flat dense icon="close" v-close-popup />
      </q-bar>
      <q-card-section style="height: 200px">
        <div >
          <p v-for="(tag, index) of ['UPOS', 'DEPREL', 'HEAD']" :key="index">
            {{ tag }} correct : {{ corrects[tag] }}/{{ totals[tag] }} ({{
              (100 * corrects[tag]) / totals[tag]
            }}%)
          </p>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions>
        <q-btn
          id="catselectvalidate"
          color="primary"
          label="Close"
          v-close-popup
          style="width: 30%; margin-left: auto; margin-right: auto"
        />
        <!-- :disabled="snap.currentcategory == snap.category" -->
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!----------------- End uposDialog ------------------->
</template>

<script>
export default {
  props: ["sentenceBus", "conlls"],
  data() {
    return {
      statisticsDialogOpened: false,
      userId: "",
      corrects: {},
      totals: {},
    };
  },
  computed: {
    uposCorrect() {
      return;
    },
  },
  mounted() {
    this.sentenceBus.$on("open:statisticsDialog", ({ userId }) => {
      this.userId = userId;
      const stats = this.sentenceBus[this.userId].getDiffStats(
        this.conlls.teacher
      );


      this.corrects = stats.corrects;
      this.totals = stats.totals;

      this.statisticsDialogOpened = true;
    });
  },
  beforeDestroy() {
    this.sentenceBus.$off("open:statisticsDialog");
  },
  methods: {},
};
</script>
<style>
</style>