<template>
  <div>
    <q-btn flat round dense icon="refresh" @click="dummyfct"
      ><q-tooltip>See your annotation errors</q-tooltip>
    </q-btn>
    <div class="sentencebox">
      <svg :id="svgID" />
    </div>
  </div>
</template>

<script>
import { conllToJson } from "../../helpers/Conll";
import { SentenceSVG } from "../../helpers/SentenceSVG";

export default {
  props: [
    "sentenceId",
    "conll",
    "sentenceBus",
    "userId",
    "conllSavedCounter",
    "teacherConll",
    "reactiveSentence",
    "teacherReactiveSentence",
  ],
  data() {
    return {
      sentenceSVG: null,
      sentenceJson: {},
      usermatches: [],
    };
  },
  computed: {
    svgID() {
      return `svg-${this.sentenceId}-${this.userId}`.replaceAll(".","-");
    },
    shownFeatures() {
      return this.$store.getters["config/shownfeatures"];
    },
  },
  // watch: {
    // conllSavedCounter: function (val) {
      // console.log("KK 3 after ++", Math.round(Date.now()), this.userId);

      // this.sentenceSVG.treeJson = conllToJson(this.conll).treeJson;
      // this.sentenceSVG.metaJson = conllToJson(this.conll).metaJson;
      // this.sentenceSVG.drawTree();
    // },
  // },
  mounted() {
    const sentenceJson = conllToJson(this.conll);

    this.sentenceSVG = new SentenceSVG({
      svgID: this.svgID,
      reactiveSentence: this.reactiveSentence,
      usermatches: this.usermatches,
      shownFeatures: this.shownFeatures,
      teacherReactiveSentence: this.teacherReactiveSentence,
    });

    this.sentenceBus[this.userId] = this.sentenceSVG;

    this.sentenceSVG.addEventListener("svg-click", (e) => {
      this.svgClickHandler(e);
    });

    this.sentenceSVG.addEventListener("svg-drop", (e) => {
      this.svgDropHandler(e);
    });

    this.sentenceBus.$on("tree-update:token", ({ token, userId }) => {
      if (userId == this.userId) {
        this.reactiveSentence.updateToken(token);
      }
    });
  },
  methods: {
    dummyfct() {
      console.log("KK", this.sentenceSVG);
      this.sentenceSVG.refresh();
    },
    svgClickHandler(e) {
      const clickedId = e.detail.clicked;
      const clickedToken = this.sentenceSVG.treeJson[clickedId];
      const targetLabel = e.detail.targetLabel;

      if (targetLabel == "DEPREL") {
        const dep = clickedToken;
        const gov = this.sentenceSVG.treeJson[dep.HEAD] || {
          FORM: "ROOT",
          ID: 0,
        }; // handle if head is root
        this.sentenceBus.$emit("open:relationDialog", {
          gov,
          dep,
          userId: this.userId,
        });
      } else if (
        targetLabel == "FORM" ||
        ["MISC.", "FEATS", "LEMMA"].includes(targetLabel.slice(0, 5))
      ) {
        this.sentenceBus.$emit(`open:featuresDialog`, {
          token: clickedToken,
          userId: this.userId,
        });
      } else {
        this.sentenceBus.$emit(`open:${targetLabel.toLowerCase()}Dialog`, {
          token: clickedToken,
          userId: this.userId,
        });
      }
    },

    svgDropHandler(e) {
      const draggedId = e.detail.dragged;
      const hoveredId = e.detail.hovered;

      var gov = {};
      var dep = {};
      // if the area being hovered is the root (circle on top of the svg), assign the gov object to root
      if (e.detail.isRoot) {
        gov = { ID: 0, FORM: "ROOT" };
        dep = this.sentenceSVG.treeJson[draggedId];
      } else {
        gov = this.sentenceSVG.treeJson[draggedId];
        dep = this.sentenceSVG.treeJson[hoveredId];
      }

      // emit only if dep is defined. If the token is being dragged on nothing, nothing will happen
      if (dep) {
        this.sentenceBus.$emit("open:relationDialog", {
          gov,
          dep,
          userId: this.userId,
        });
      }
    },
  },
};
</script>

<style>
* {
  --depLevelHeight: 30;
}
</style>