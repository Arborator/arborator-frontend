<template>
  <!----------------- Start FeaturesDialog ------------------->

  <q-dialog v-model="featuresDialogOpened">
    <!-- :maximized="maximizedToggle" -->
    <!-- @hide="ondialoghide()" @keyup.enter="onFeatureDialogOk()" @keyup.enter="ononefeaturemodified()"-->
    <q-card style="height: 90vh">
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">Features of "{{ token["FORM"] }}"</div>
        <q-space />
        <q-btn flat dense icon="close" v-close-popup />
      </q-bar>
      <AttributeTable
        :featdata="featTable.featl"
        :columns="featTable.columns"
        :featOptions="annotationFeatures.FEATS"
        openFeatures="false"
        modifiable="true"
        title="Universal Features"
        @feature-changed="informFeatureChanged()"
      ></AttributeTable>
      <q-separator />
      <AttributeTable
        :featdata="featTable.miscl"
        :columns="featTable.columns"
        :featOptions="annotationFeatures.MISC ? annotationFeatures.MISC : {}"
        openFeatures="true"
        modifiable="true"
        title="Miscellaneous Features"
        @feature-changed="informFeatureChanged()"
      ></AttributeTable
      ><q-separator />
      <AttributeTable
        :featdata="featTable.lemma"
        :columns="featTable.columns"
        :featOptions="options.lemmaoptions"
        openFeatures="false"
        modifiable="false"
        title="Lemma"
        @feature-changed="informFeatureChanged()"
      ></AttributeTable>
      <q-separator />
      <q-card-actions align="around">
        <q-btn
          flat
          @click="ondialoghide()"
          label="Cancel"
          v-close-popup
          style="width: 45%; margin-left: auto; margin-right: auto"
        />
        <q-btn
          color="primary"
          @click="onFeatureDialogOk()"
          label="Ok"
          v-close-popup
          style="width: 45%; margin-left: auto; margin-right: auto"
        />
        <!-- :disabled="!someFeatureChanged" -->
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!----------------- END FeaturesDialog ------------------->
</template>
<script>
import AttributeTable from "./AttributeTable.vue";

export default {
  components: {
    AttributeTable,
  },
  props: ["sentenceBus"],
  data() {
    return {
      featuresDialogOpened: false,
      token: {},
      userId: "",
      options: { lemmaoptions: [{ name: "Lemma", values: "String" }] },
      featTable: {
        featl: [],
        miscl: [],
        lemma: [],
        columns: [
          {
            name: "a",
            align: "center",
            label: "Attribute",
            field: "a",
            sortable: true,
            style: "width: 33%",
          },
          { name: "v", label: "Value", field: "v", sortable: true },
          {
            name: "actions",
            label: "Actions",
            field: "",
            align: "center",
            style: "width: 8%",
          },
        ],
      },
    };
  },
  computed: {
    annotationFeatures() {
      return this.$store.getters["config/annotationFeatures"];
    },
  },
  mounted() {
    this.sentenceBus.$on("open:featuresDialog", ({ token, userId }) => {
      this.token = token;
      this.userId = userId;
      this.featuresDialogOpened = true;

      this.featTable.featl = [];
      for (let a in token["FEATS"]) {
        this.featTable.featl.push({ a: a, v: token["FEATS"][a] });
      }
      this.featTable.miscl = [];
      for (let a in token["MISC"]) {
        this.featTable.miscl.push({ a: a, v: token["MISC"][a] });
      }
      this.featTable.lemma = [{ a: "Lemma", v: token["LEMMA"] }];
    });
  },
  beforeDestroy() {
    this.sentenceBus.$off("open:featuresDialog");
  },
  methods: {
    informFeatureChanged() {},
    ondialoghide() {},
    onFeatureDialogOk() {
      this.token["LEMMA"] = this.featTable.lemma.reduce(function (obj, r) {
        if (r.v) obj[r.a] = r.v;
        return obj;
      }, {})["Lemma"];
      this.token["FEATS"] = this.featTable.featl.reduce(function (obj, r) {
        if (r.v) obj[r.a] = r.v;
        return obj;
      }, {});
      this.token["MISC"] = this.featTable.miscl.reduce(function (obj, r) {
        if (r.v) obj[r.a] = r.v;
        return obj;
      }, {});
      this.sentenceBus.$emit("tree-update:token", {
        token: this.token,
        userId: this.userId,
      });
    },
    // onChangeUpos() {
    //   this.featuresDialogOpened = false;
    //   this.sentenceBus.$emit("tree-update:upos", {
    //     token: this.token,
    //     userId: this.userId,
    //   });
    // },
  },
};
</script>
<style>
</style>