<template>
  <!----------------- Start TokenDialog ------------------->

  <q-dialog v-model="tokenDialogOpened">
    <q-card style="height: 90vh; width: 90vh">
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">Replacing "{{ currentword }}" by:</div>
        <q-space />
        <q-btn flat dense icon="close" v-close-popup />
      </q-bar>
      <AttributeTable
        :featdata="tokl"
        :columns="featTable.columns"
        :featOptions="['String']"
        openFeatures="true"
        modifiable="true"
        title="Token"
        :numbered="currentword"
      ></AttributeTable>
      <q-separator />
      <q-card-actions align="around">
        <q-btn
          flat
          label="Cancel"
          v-close-popup
          style="width: 45%; margin-left: auto; margin-right: auto"
        />
        <q-btn
          color="primary"
          @click="onTokenDialogOk()"
          label="I know what I'm doing"
          v-close-popup
          style="width: 45%; margin-left: auto; margin-right: auto"
          no-caps
        >
          <q-tooltip
            content-class="bg-negative"
            content-style="font-size: 16px"
            transition-show="rotate"
            transition-hide="rotate"
            >⚠ Changing tokens breaks the comparability of different annotations
            of the same sentence!</q-tooltip
          >
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!----------------- End TokenDialog ------------------->
</template>

<script>
import AttributeTable from "./AttributeTable.vue";

export default {
  components: { AttributeTable },
  props: ["sentenceBus", "reactiveSentencesObj"],
  data() {
    return {
      tokenDialogOpened: false,
      token: {},
      userId: "",
      currentword: "",
      tokl: [],
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
    this.sentenceBus.$on("open:tokenDialog", ({ userId, event }) => {
      this.userId = userId;
      this.startIndex = event.srcElement.selectionStart;
      this.endIndex = event.srcElement.selectionEnd;
      this.selection = event.srcElement.value.substring(
        this.startIndex,
        this.endIndex
      );
      this.openTokenDialog(this.startIndex, this.endIndex, this.selection);
    });
  },
  beforeDestroy() {
    this.sentenceBus.$off("open:tokenDialog");
  },
  methods: {
    openTokenDialog(b, e, t) {
      this.tokenDialogOpened = true;

      // begin index, end index, selected token of text field in sentenceCard
      while (t[t.length - 1] == " ") {
        t = t.substring(0, t.length - 1);
        --e;
      }
      while (t[0] == " ") {
        t = t.substring(1);
        b++;
      }
      const treeJson = this.sentenceBus[this.userId].treeJson;
      var toks = Object.values(treeJson).map(({ FORM }) => FORM);
      var spa = Object.values(treeJson).map(({ MISC }) =>
        "SpaceAfter" in MISC && MISC.SpaceAfter == "No" ? 0 : 1
      );
      var toktok = [];
      var currp = 0;
      var sentence = "";
      for (var i = 0; i < toks.length; ++i) {
        sentence += toks[i] + (spa[i] ? " " : "");
        toktok.push({
          i: i + 1,
          t: toks[i],
          b: currp,
          e: currp + toks[i].length,
        });
        currp += toks[i].length + spa[i];
      }
      var ints = toktok.filter((x) => x.b >= b && x.e <= e);
      var outts = toktok.filter(
        (x) => (x.b >= b && x.b <= e) || (x.e >= b && x.e <= e)
      );
      if (!outts.length) return; // strange, shouldn't happen
      var proposedav = [];
      if (outts[0].b < b)
        proposedav.push(
          { a: 1, v: outts[0].t.substring(0, b - outts[0].b) },
          { a: 2, v: outts[0].t.substring(b - outts[0].b) }
        );
      for (let to of ints)
        proposedav.push({ a: proposedav.length + 1, v: to.t });
      if (e < outts[outts.length - 1].e)
        proposedav.push(
          {
            a: proposedav.length + 1,
            v: outts[outts.length - 1].t.substring(
              0,
              e - outts[outts.length - 1].b
            ),
          },
          {
            a: proposedav.length + 2,
            v: outts[outts.length - 1].t.substring(
              e - outts[outts.length - 1].b
            ),
          }
        );
      this.tokidsequence = outts.map(({ i }) => i);
      if (outts) {
        this.currentword = sentence.substring(
          outts[0].b,
          outts[outts.length - 1].e
        );
        this.tokl = proposedav;
        // this.tokenDialog = !this.tokenDialog;
      }
    },
    onTokenDialogOk() {
      this.tokenDialog = !this.tokenDialog;
      var ttokl = this.tokl
        .map(({ v }) => v)
        .filter((x) => x.trim().length > 0);
      this.reactiveSentencesObj[this.userId].replaceArrayOfTokens(
        this.tokidsequence,
        ttokl.length ? this.tokidsequence[0] : this.tokidsequence[0] - 1,
        ttokl
      );
      this.$emit(
        "changed:metaText",
        this.sentenceBus[this.userId].metaJson.text
      );
    },
  },
};
</script>
<style>
</style>