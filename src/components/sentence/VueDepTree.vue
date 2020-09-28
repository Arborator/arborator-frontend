<template>
  <div class="sentencebox">
    <svg :id="randomId" />
  </div>
</template>

<script>
import { conllToTree } from "../../helpers/Conll";
import { SvgDepTree } from "../../helpers/SnapDepTree";

export default {
  props: ["sentenceId", "conll", "sentenceBus", "userId"],
  data() {
    return {
      depTree: null,
      treeJson: {},
      usermatches: [],
    };
  },
  computed: {
    randomId() {
      return "abc" + Math.floor(Math.random() * 100000001).toString(); // TODO : change ID to put projectID + sentenceID
    },
    shownfeatures() {
      return this.$store.getters["config/shownfeatures"];
    },
  },
  mounted() {
    this.treeJson = conllToTree(this.conll);

    this.depTree = new SvgDepTree(
      "#" + this.randomId,
      this.treeJson,
      this.usermatches,
      this.shownfeatures
    );
    console.log("KK export conll", this.depTree.exportConll())
    this.sentenceBus[this.userId] = this.depTree;

    this.depTree.addEventListener("svg-click", (e) => {
      console.log("KK click e :", e);
      this.svgClickHandler(e);
    });

    this.depTree.addEventListener("svg-drop", (e) => {
      console.log("KK drop :", e);
      this.svgDropHandler(e);
    });

    this.sentenceBus.$on("tree-update:deprel", ({ dep, userId }) => {
      if (userId == this.userId) {
        this.depTree.updateNode(dep);
        this.depTree.refresh();
      }
    });

    this.sentenceBus.$on("tree-update:upos", ({ token, userId }) => {
      if (userId == this.userId) {
        this.depTree.updateNode(token);
        this.depTree.refresh();
      }
    });
  },
  methods: {
    svgClickHandler(e) {
      console.log("KK clicked", e.detail.clicked);
      console.log("KK node", e.detail.treeNode.treeNodeJson);
      console.log("KK targetLabel", e.detail.targetLabel);

      const clickedId = e.detail.clicked;
      const clickedToken = this.depTree.treeJson[clickedId];
      const targetLabel = e.detail.targetLabel;

      if (targetLabel == "DEPREL") {
        const dep = clickedToken;
        const gov = this.depTree.treeJson[dep.HEAD] || {FORM: "ROOT", ID: 0}; // handle if head is root
        this.sentenceBus.$emit("open:relationDialog", {
          gov,
          dep,
          userId: this.userId,
        });

        console.log("KK clickedToken", dep, gov);
      } else {
        this.sentenceBus.$emit(`open:${targetLabel.toLowerCase()}Dialog`, {
          token: clickedToken,
          userId: this.userId,
        });

        console.log("KK emit", `open:${targetLabel.toLowerCase()}Dialog`);
      }
    },
    svgDropHandler(e) {
      console.log("KK detail", e.detail)
      const govId = e.detail.dragged;
      const depId = e.detail.hovered;

      const gov = this.depTree.treeJson[govId];
      const dep = this.depTree.treeJson[depId];

      console.log("KK dragged", gov, dep);
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