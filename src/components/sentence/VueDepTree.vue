<template>
  <div>
    <div class="sentencebox">
      <svg ref="svgWrapper" />
    </div>
  </div>
</template>

<script lang="ts">
import { LocalStorage } from 'quasar';
import { SentenceSVG, defaultSentenceSVGOptions } from 'dependencytreejs/src/SentenceSVG';
import { SentenceCaretaker } from 'dependencytreejs/src/ReactiveSentence';
import { PropType } from 'vue';
import { reactive_sentences_obj_t, sentence_bus_events_t, sentence_bus_t } from 'src/types/main_types';
import { ReactiveSentence } from 'dependencytreejs/src/ReactiveSentence';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { emptyTokenJson, emptyTreeJson } from 'conllup/lib/conll';

interface svgClickEvent_t extends Event {
  detail: { clicked: string; targetLabel: 'FORM' | 'FEATS' | 'LEMMA' | 'DEPREL' };
}

interface svgHoveredEvent_t extends Event {
  detail: { dragged: string; hovered: string; isRoot: boolean };
}

import { defineComponent } from 'vue';
import { useUserStore } from 'src/pinia/modules/user';
import { package_t } from 'src/api/backend-types';

export default defineComponent({
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
    reactiveSentencesObj: {
      type: Object as PropType<reactive_sentences_obj_t>,
      required: true,
    },
    reactiveSentence: {
      type: Object as PropType<ReactiveSentence>,
      required: true,
    },
    conll: {
      type: String as PropType<string>,
      required: true,
    },
    diffMode: {
      type: String as PropType<'DIFF_TEACHER' | 'DIFF_USER' | 'NO_DIFF'>,
      required: true,
    },
    sentenceId: {
      type: String as PropType<string>,
      required: true,
    },
    treeUserId: {
      type: String as PropType<string>,
      required: true,
    },
    conllSavedCounter: {
      type: Number as PropType<number>,
      required: true,
    },
    cardId: {
      type: Number as PropType<number>,
      required: true,
    },
    hasPendingChanges: {
      type: Object as PropType<{ [key: string]: boolean }>,
      required: true,
    },
    matches: {
      default: () => {
        return [];
      },
      type: Array as PropType<string[]>,
    },
    packages: {
      default: () => {
        return {};
      },
      type: Object as PropType<package_t>,
    },
  },
  data() {
    const sentenceSVG: SentenceSVG = null as unknown as SentenceSVG; // trick to not have to initialize an empty SentenceSVG
    const sentenceCaretaker: SentenceCaretaker = null as unknown as SentenceCaretaker;
    return {
      sentenceSVG,
      sentenceCaretaker,
      sentenceJson: {},
      usermatches: [],
      history_index: 0,
      history_saveIndex: 0,
    };
  },
  computed: {
    ...mapState(useProjectStore, ['shownfeatures', 'TEACHER', 'isTeacher', 'isStudent']),
    ...mapState(useUserStore, ['username']),
    diffUserId() {
      const value = useProjectStore().diffUserId;
      return value || this.username;
    },
  },
  watch: {
    conllSavedCounter() {
      this.sentenceSVG.drawTree();
    },
    diffMode() {
      // Watching diffmode
      this.handleDiffPlugging();
    },
  },
  mounted() {
    // attach so this vue comp become an observer of the reactive sent
    // each time the reactive sentence will change, it will call the function ".update" of all observers
    this.reactiveSentence.attach(this);
    this.reactiveSentence.fromSentenceConll(this.conll);
    const sentenceSVGOptions = defaultSentenceSVGOptions();
    sentenceSVGOptions.shownFeatures = this.shownfeatures;
    sentenceSVGOptions.interactive = true;
    if (this.isStudent === true && this.treeUserId === this.TEACHER) {
      sentenceSVGOptions.interactive = false;
    }

    if (this.matches.length > 0) {
      sentenceSVGOptions.matches = JSON.parse(JSON.stringify(this.matches));
    }

    if (Object.keys(this.packages).length > 0) {
      sentenceSVGOptions.packages = JSON.parse(JSON.stringify(this.packages));
    }
    const svgWrapper = this.$refs.svgWrapper as SVGElement;
    this.sentenceSVG = new SentenceSVG(svgWrapper, this.reactiveSentence, sentenceSVGOptions);

    this.handleDiffPlugging();

    this.sentenceCaretaker = new SentenceCaretaker(this.reactiveSentence);
    this.sentenceCaretaker.backup();

    this.sentenceBus.sentenceSVGs[this.treeUserId] = this.sentenceSVG;

    this.sentenceSVG.addEventListener('svg-click', (e) => {
      this.svgClickHandler(e as svgClickEvent_t);
    });

    this.sentenceSVG.addEventListener('svg-drop', (e) => {
      this.svgDropHandler(e as svgHoveredEvent_t);
    });
    this.sentenceBus.on('tree-update:token', ({ token, userId }) => {
      if (userId === this.treeUserId) {
        this.history_index += 1;
        this.reactiveSentence.updateToken(token);
        this.sentenceCaretaker.backup();
        this.statusChangeHadler();
      }
    });

    this.sentenceBus.on('tree-update:tree', ({ tree, userId }) => {
      if (userId === this.treeUserId) {
        this.reactiveSentence.updateTree(tree);
        this.sentenceCaretaker.backup();
        this.statusChangeHadler();
      }
    });
    this.sentenceBus.on('tree-update:sentence', ({ sentenceJson, userId }) => {
      if (userId === this.treeUserId) {
        this.reactiveSentence.updateSentence(sentenceJson);
        this.sentenceCaretaker.backup();
        this.statusChangeHadler();
      }
    });
    this.sentenceBus.on('action:undo', ({ userId }) => {
      if (userId === this.treeUserId) {
        this.sentenceCaretaker.undo();
        this.statusChangeHadler();
      }
    });
    this.sentenceBus.on('action:redo', ({ userId }) => {
      if (userId === this.treeUserId) {
        this.sentenceCaretaker.redo();
        this.statusChangeHadler();
      }
    });
    this.sentenceBus.on('action:saved', ({ userId }) => {
      if (userId === this.treeUserId) {
        this.history_saveIndex = this.sentenceCaretaker.currentStateIndex;
        this.statusChangeHadler();
      }
    });

    this.sentenceBus.on('action:tabSelected', ({ userId }) => {
      if (userId === this.treeUserId) {
        this.statusChangeHadler();
      }
    });
    this.sentenceBus.on('action:addEmptyToken', ({ userId }) => {
      if (userId === this.treeUserId) {
        this.reactiveSentence.addEmptyToken();
        this.sentenceCaretaker.backup();
        this.statusChangeHadler();
      }
    });

    this.statusChangeHadler();
  },
  methods: {
    svgClickHandler(e: svgClickEvent_t) {
      const clickedId = e.detail.clicked;
      const clickedToken = { ...this.sentenceSVG.treeJson.nodesJson[clickedId] };
      const targetLabel = e.detail.targetLabel;

      if (targetLabel === 'DEPREL') {
        const dep = clickedToken;
        const gov = { ...this.sentenceSVG.treeJson.nodesJson[dep.HEAD] } || {
          FORM: 'ROOT',
          ID: 0,
        }; // handle if head is root
        this.sentenceBus.emit('open:relationDialog', {
          gov,
          dep,
          userId: this.treeUserId,
        });
      } else if (targetLabel === 'FORM' || ['MISC.', 'FEATS', 'LEMMA'].includes(targetLabel.slice(0, 5))) {
        this.sentenceBus.emit('open:featuresDialog', {
          token: clickedToken,
          userId: this.treeUserId,
        });
      } else {
        this.sentenceBus.emit(`open:${targetLabel.toLowerCase()}Dialog` as keyof sentence_bus_events_t, {
          token: clickedToken,
          userId: this.treeUserId,
        });
      }
    },

    svgDropHandler(e: svgHoveredEvent_t) {
      const draggedId = e.detail.dragged;
      const hoveredId = e.detail.hovered;

      let gov = emptyTokenJson();
      let dep = emptyTokenJson();
      // if the area being hovered is the root (circle on top of the svg), assign the gov object to root
      if (e.detail.isRoot) {
        gov = Object.assign(gov, { ID: '0', FORM: 'ROOT' });
        dep = { ...this.sentenceSVG.treeJson.nodesJson[draggedId] };
      } else {
        gov = { ...this.sentenceSVG.treeJson.nodesJson[draggedId] };
        dep = { ...this.sentenceSVG.treeJson.nodesJson[hoveredId] };
      }
      // emit only if dep is defined. If the token is being dragged on nothing, nothing will happen
      if (dep?.ID) {
        this.sentenceBus.emit('open:relationDialog', {
          gov,
          dep,
          userId: this.treeUserId,
        });
      }
    },
    /**
     * Update the undo, redo and save status each time user makes changes.
     */
    statusChangeHadler() {
      const canUndo = this.sentenceCaretaker.canUndo();
      const canRedo = this.sentenceCaretaker.canRedo();
      const needSave = this.history_saveIndex !== this.sentenceCaretaker.currentStateIndex;
      const statusStr = LocalStorage.getItem('save_status');
      const statusObj = statusStr ? JSON.parse(statusStr as string) : {};
      let card = statusObj[this.cardId];
      this.hasPendingChanges[this.treeUserId] = needSave;

      this.$emit('statusChanged', {
        canUndo,
        canRedo,
        canSave: needSave,
        userId: this.treeUserId,
      });
      if (!card) card = {};
      card[this.treeUserId] = needSave;
      statusObj[this.cardId] = card;
      LocalStorage.set('save_status', JSON.stringify(statusObj));
      this.checkSaveStatus();
    },
    checkSaveStatus() {
      const statusStr = LocalStorage.getItem('save_status');
      const statusObj = JSON.parse(statusStr as string);
      const cardKeys = Object.keys(statusObj);
      for (const i in cardKeys) {
        if (Object.prototype.hasOwnProperty.call(cardKeys, i)) {
          const card = statusObj[cardKeys[i]];
          const userIds = Object.keys(card);
          for (const j in userIds) {
            if (card[userIds[j]] === true) {
              window.onbeforeunload = function () {
                return `You have some unsaved changes left,
               please save them before you leave this page`;
              };
              return;
            }
          }
        }
      }
      window.onbeforeunload = function (e) {
        delete e.returnValue;
      };
    },
    update() {
      const newMetaText = this.reactiveSentence.getSentenceText();
      this.sentenceBus.emit('changed:metaText', { newMetaText });
    },
    handleDiffPlugging() {
      if (this.diffMode === 'DIFF_TEACHER') {
        if (this.treeUserId === this.TEACHER) {
          return;
        }
        this.sentenceSVG.plugDiffTree(this.reactiveSentencesObj[this.TEACHER]);
      }
      if (this.diffMode === 'DIFF_USER') {
        if (this.treeUserId === this.diffUserId) {
          console.log('KK tree of the user, no diff');
          return;
        }
        this.sentenceSVG.plugDiffTree(this.reactiveSentencesObj[this.diffUserId]);
      }
      if (this.diffMode === 'NO_DIFF') {
        this.sentenceSVG.teacherTreeJson = emptyTreeJson();
        this.sentenceSVG.drawTree();
      }
    },
  },
});
</script>

<style>
* {
  --depLevelHeight: 30;
}
</style>
