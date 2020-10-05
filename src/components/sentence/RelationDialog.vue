<template>
  <q-dialog v-model="relationDialogOpened">
    <q-card>
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">
          Select a relation going from "{{ gov.FORM }}" to "{{ dep.FORM }}"
        </div>
        <q-space />
        <q-btn flat dense icon="close" v-close-popup />
      </q-bar>
      <AttributeTable
        :featdata="options.relav"
        :columns="featTable.columns"
        :featOptions="options.currentoptions"
        openFeatures="false"
        modifiable="false"
        title="Dependency relation"
        prepend="true"
      ></AttributeTable>
      <!-- @feature-changed="informFeatureChanged()" -->
      <q-space />
      

      <q-card-actions>
        <q-btn
          flat
          label="Cancel"
          v-close-popup
          style="width: 25%; margin-left: auto; margin-right: auto"
        />
        <!-- @click="ondialoghide()" -->
        <q-space />
                      <q-btn
          color="negative"
          @click="onDeleteRelation()"
          label="Delete"
          v-close-popup
          style="width: 25%; margin-left: auto"
        />
      <q-space />
        <q-btn
          color="primary"
          @click="onChangeRelation(options.extendedrel)"
          label="Ok"
          v-close-popup
          style="width: 25%; margin-left: auto; margin-right: auto"
        />

      </q-card-actions>
      <!-- :disabled="!someFeatureChanged" -->
    </q-card>
  </q-dialog>
</template>

<script>
import AttributeTable from "./AttributeTable.vue";

export default {
  components: { AttributeTable },
  props: ["sentenceBus"],
  data() {
    return {
      relationDialogOpened: false,
      dep: {},
      gov: {},
      userId: "",
      options: {
        // attribute table dialog specific stuff
        annof: [], // = annotationFeatures from conf!!!
        annofFEATS: {}, // obj version (instead of list)
        annofMISC: {}, // obj version (instead of list)
        splitregex: "",
        relav: [],
        currentoptions: [],
        extendedrel: false,
        lemmaoptions: [{ name: "Lemma", values: "String" }],
      },
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
  created() {
    this.options.annof = this.$store.getters["config/annotationFeatures"];
    this.options.shownfeatures = this.$store.getters["config/shownfeatures"];
    this.options.shownmeta = this.$store.getters["config/shownmeta"];
    // precompute to check for changes quickly:
    this.options.annofFEATS = this.options.annof.FEATS.reduce(function (
      obj,
      r
    ) {
      if (r.values) obj[r.name] = r.values;
      return obj;
    },
    {});
    this.options.annofMISC = this.options.annof.MISC.reduce(function (obj, r) {
      if (r.values) obj[r.name] = r.values;
      return obj;
    }, {});
    this.options.splitregex = new RegExp(
      "[" + this.options.annof.DEPREL.map(({ join }) => join).join("") + "]",
      "g"
    ); // = /[:@]/g
  },
  mounted() {
    this.sentenceBus.$on("open:relationDialog", ({ dep, gov, userId }) => {
      this.dep = dep;
      this.gov = gov;
      this.userId = userId;
      this.depDeprel = dep.DEPREL;
      this.depDeprelSplitted = dep.DEPREL.split(this.options.splitregex);

      ////// TODO TO REFACTOR //////
      const depr = this.options.annof.DEPREL;
      this.options.currentoptions = depr;

      this.options.relav = depr.map((sr) => ({
        a: sr.name,
        v: "",
        join: sr.join,
      }));

      for (var i = 0; i < this.depDeprelSplitted.length; ++i) {
        for (var ii = i; ii < depr.length; ++ii) {
          if (
            this.depDeprel.includes(depr[ii].join + this.depDeprelSplitted[i])
          ) {
            this.options.relav[ii] = {
              a: depr[ii].name,
              v: this.depDeprelSplitted[i],
              join: depr[ii].join,
            };
            break;
          }
        }
      }
      this.relationDialogOpened = true;

      /////// END TODO //////
    });
  },
  beforeDestroy() {
    this.sentenceBus.$off("open:relationDialog");
  },
  methods: {
    onChangeRelation() {
      this.relationDialogOpened = false;
      const newDeprel = this.options.relav.reduce(
        (tot, cur, i) =>
          (tot += this.options.relav[i].v
            ? this.options.annof.DEPREL[i].join + cur.v
            : ""),
        ""
      );
      this.dep.DEPREL = newDeprel;
      this.dep.HEAD = this.gov.ID;
      this.sentenceBus.$emit("tree-update:token", {
        token: this.dep,
        // gov: this.gov,
        userId: this.userId
      });
    },
    onDeleteRelation() {
      this.dep.DEPREL = "";
      this.dep.HEAD = null;
      this.sentenceBus.$emit("tree-update:token", {
        token: this.dep,
        // gov: this.gov,
        userId: this.userId
      });
    }
  },
};
</script>

<style>
</style>