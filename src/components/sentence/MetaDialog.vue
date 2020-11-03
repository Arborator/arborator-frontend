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
        :featdata="metal"
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
        <q-btn
          flat
          label="Cancel"
          v-close-popup
          style="width: 45%; margin-left: auto; margin-right: auto"
        />
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
<script >
import AttributeTable from "./AttributeTable";

export default {
  components: { AttributeTable },
  props: ["sentenceBus"],
  data() {
    return {
      metaDialogOpened: false,
      token: {},
      userId: "",
      META: {},
      metal: [],
      featTable: {
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
    someFeatureChanged() {
      return true;
    },
  },
  mounted() {
    this.sentenceBus.$on("open:metaDialog", ({ userId }) => {
      this.userId = userId
      this.META = this.sentenceBus[userId].metaJson
      this.metaDialogOpened = true;
      this.metal = [];
      for (let a in this.META) {
        this.metal.push({ a: a, v: this.META[a] });
      }
      this.$emit("meta-changed", this.META); // so that the sentenceCard can show the meta feature such as text and text_en
    });
  },
  beforeDestroy() {
    this.sentenceBus.$off("open:uposDialog");
  },
  methods: {
    onChangeUpos() {
      this.uposDialogOpened = false;
      this.sentenceBus.$emit("tree-update:token", {
        token: this.token,
        userId: this.userId,
      });
    },
    onMetaDialogOk() {
      this.META = this.metal.reduce(function (obj, r) {
          if (r.v) obj[r.a] = r.v;
          return obj;
        }, {})

        // TODO : implement META changed (if we really want it to change, 
        // ... because some of META properties are immutable (sent_id, user_id, etc...))
    },
    informFeatureChanged() {},
  },
};
</script>
<style>
</style>