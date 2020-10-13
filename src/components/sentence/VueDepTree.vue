<template>
  <div class="sentencebox">
    <svg :id="svgID" />
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
      return `svg-${this.sentenceId}-${this.userId}`.replaceAll(".", "-");
    },
    shownfeatures() {
      return this.$store.getters["config/shownfeatures"];
      // return ["FORM", "UPOS", "LEMMA", "FEATS.Aspect", "MISC.Gloss"];
    },
  },
  watch: {
    conllSavedCounter: function (val) {
      console.log("KK watcher", this.userId)
      this.sentenceSVG.treeJson = conllToJson(this.conll).treeJson;
      this.sentenceSVG.metaJson = conllToJson(this.conll).metaJson;
      this.sentenceSVG.drawTree();
    },
  },
  mounted() {
    console.log("KK this.conll", this.conll)
    const sentenceJson = conllToJson(this.conll);
    console.log("KK step 0 ", sentenceJson)

    const teacherTreeJson = (this.teacherConll && this.userId !== "teacher") ? conllToJson(this.teacherConll).treeJson : "";
    this.sentenceSVG = new SentenceSVG(
      "#" + this.svgID,
      sentenceJson,
      this.usermatches,
      this.shownfeatures,
      teacherTreeJson
    );

    // this.sentenceSVG.showDiffs(teacherTreeJson);

    this.sentenceBus[this.userId] = this.sentenceSVG;

    this.sentenceSVG.addEventListener("svg-click", (e) => {
      this.svgClickHandler(e);
    });

    this.sentenceSVG.addEventListener("svg-drop", (e) => {
      this.svgDropHandler(e);
    });

    this.sentenceBus.$on("tree-update:token", ({ token, userId }) => {
      if (userId == this.userId) {
        this.sentenceSVG.updateToken(token);
        this.sentenceSVG.refresh();
      }
    });

    // this.sentenceBus.$on("saved:tree", () => {
    // console.log(this.conll)
    // this.sentenceSVG.treeJson = conllToJson(this.conll).tree;
    // this.sentenceSVG.META = conllToJson(this.conll).META;
    // this.sentenceSVG.drawTree();
    // this.sentenceSVG.refresh();
    // })
  },
  methods: {
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