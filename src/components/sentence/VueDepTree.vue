<template>
  <div>
    <div class="sentencebox">
      <svg :id="svgID" />
    </div>
  </div>
</template>

<script>
import { LocalStorage } from 'quasar';
import { conllToJson } from "../../helpers/Conll";
import { SentenceSVG } from "../../helpers/SentenceSVG";

export default {
  props: [
    "sentenceId",
    "conll",
    "sentenceBus",
    "userId",
    "conllSavedCounter",
    "reactiveSentence",
    "teacherReactiveSentence",
    "cardId"
  ],
  watch: {
    conllSavedCounter() {
      this.sentenceSVG.drawTree()
    },
  },
  data() {
    return {
      sentenceSVG: null,
      sentenceJson: {},
      usermatches: [],
      history: [],
      history_index: -1,
      history_end: -1,
      history_saveIndex: -1
    };
  },
  computed: {
    svgID() {
      return `svg-${this.sentenceId}-${this.userId}`.replaceAll(".", "-");
    },
    shownFeatures() {
      return this.$store.getters["config/shownfeatures"];
    },
  },
  mounted() {
    const sentenceJson = conllToJson(this.conll);

    this.sentenceSVG = new SentenceSVG({
      svgID: this.svgID,
      reactiveSentence: this.reactiveSentence,
      usermatches: this.usermatches,
      shownFeatures: this.shownFeatures,
      teacherReactiveSentence: this.teacherReactiveSentence,
    });
    this.sentenceSVG.plugDiffTree(this.teacherReactiveSentence);

    this.sentenceBus[this.userId] = this.sentenceSVG;

    this.sentenceSVG.addEventListener("svg-click", (e) => {
      this.svgClickHandler(e);
    });

    this.sentenceSVG.addEventListener("svg-drop", (e) => {
      this.svgDropHandler(e);
    });

    this.sentenceBus.$on("tree-update:token", ({ token, userId }) => {
      if (userId == this.userId) {
        let prevToken = this.reactiveSentence.getToken(token.ID);

        this.history[++this.history_index] = {
          old: prevToken,
          new: token
        };
        this.history_end = this.history_index;
        this.reactiveSentence.updateToken(token);
        this.statusChangeHadler();
      }
    });
    this.sentenceBus.$on("action:undo", ({ userId }) => {
      if (userId == this.userId && this.history_index != -1) {
        const oldToken = this.history[this.history_index].old;
        this.reactiveSentence.updateToken(oldToken);
        this.history_index --;
        this.statusChangeHadler();
      }
    });
    this.sentenceBus.$on("action:redo", ({ userId }) => {
      if (userId == this.userId && this.history_index != this.history_end) {
        const newToken = this.history[++this.history_index].new;
        this.reactiveSentence.updateToken(newToken);
        this.statusChangeHadler();
      }
    });
    this.sentenceBus.$on("action:saved", ({ userId }) => {
      if (userId == this.userId) {
        this.history_saveIndex = this.history_index;
        this.statusChangeHadler();
      }
    });
    this.statusChangeHadler();
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
    /**
     * Update the undo, redo and save status each time user makes changes.
     */
    statusChangeHadler() {
      const canUndo = (this.history_index != -1);
      const canRedo = (this.history_index != this.history_end);
      const needSave = (this.history_saveIndex != this.history_index);
      const status_str = LocalStorage.getItem("save_status");
      let status_obj = status_str ? JSON.parse(status_str) : {};
      let card = status_obj[ this.cardId ];
      
      this.$emit("statusChanged", {canUndo: canUndo, canRedo: canRedo, canSave: needSave});
      if(!card) 
        card = {};
      card[ this.userId ] = needSave;
      status_obj[ this.cardId ] = card;
      LocalStorage.set("save_status", JSON.stringify(status_obj));
      this.checkSaveStatus();
    },
    checkSaveStatus() {
      const status_str = LocalStorage.getItem("save_status");
      const status_obj = JSON.parse(status_str);
      const card_keys = Object.keys(status_obj);
      for(let i in card_keys) {
        const card = status_obj[ card_keys[i] ];
        const userIds = Object.keys(card);
        for(let j in userIds) {
          if(card[userIds[j]] == true) {
            window.onbeforeunload = function(e) {
              return "aaaa";
            }
            return;
          }
        }
      }
      window.onbeforeunload = function(e) {
        delete e['returnValue'];
      }
    }
  },
};
</script>

<style>
* {
  --depLevelHeight: 30;
}
</style>