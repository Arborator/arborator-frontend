<template>
  <div :id="index" class="custom-bottom-border">
    <div>
      <q-bar class="row items-center custom-frame1">
        <span class="text-grey" style="padding-left: 10px">{{ index + 1 }}</span>
        <q-chip class="text-center" :color="$q.dark.isActive ? 'grey' : ''" dense>
          {{ sentence.sent_id }} </q-chip
        >&nbsp;&nbsp;&nbsp;
        <q-input
          v-model="sentenceData.sentence"
          :style="openTabUser === '' ? 'width: 100%' : 'width: 65%'"
          class="row items-center justify-center"
          v-bind="$attrs"
          readonly
          borderless
          @select="editTokens"
        >
          <q-tooltip v-if="openTabUser !== ''" anchor="bottom middle" self="center middle" :offset="[10, 10]">
            {{ $t('sentenceCard.selectTooltip') }}
          </q-tooltip>
        </q-input>
        <q-space />
        <template v-if="openTabUser !== ''">
          <q-btn
            v-if="isLoggedIn && exerciseLevel <= 3 && !isTeacher"
            flat
            round
            dense
            icon="assessment"
            :disable="openTabUser === ''"
            @click="openStatisticsDialog"
          >
            <q-tooltip>{{ $t('sentenceCard.annotationErrors') }}</q-tooltip>
          </q-btn>

          <q-btn v-if="isTeacher" flat round dense icon="school" :disable="openTabUser === ''" @click="save('teacher')">
            <q-tooltip>{{ $t('sentenceCard.saveTeacher') }}</q-tooltip>
          </q-btn>

          <q-btn v-if="isTeacher" flat round dense icon="linear_scale" :disable="openTabUser === ''" @click="save('base_tree')">
            <q-tooltip>{{ $t('sentenceCard.saveBaseTree') }}</q-tooltip>
          </q-btn>

          <q-btn v-if="isBernardCaron" flat round dense icon="face" :disable="openTabUser === ''" @click="save(EMMETT)">
            <q-tooltip>Save as Emmett</q-tooltip>
          </q-btn>

          <q-btn v-if="canSaveTreeInProject" flat round dense icon="save" :disable="openTabUser === '' || !canSave" @click="save('')">
            <q-tooltip>
              {{ $t('sentenceCard.saveTree[0]') }} {{ openTabUser }} {{ $t('sentenceCard.saveTree[1]') }}
              <b> {{ username }} </b>
            </q-tooltip>
          </q-btn>

          <q-btn v-if="canSaveTreeInProject" flat round dense icon="post_add" :disable="openTabUser === ''" @click="openMetaDialog()">
            <q-tooltip>{{ $t('sentenceCard.editMetadata') }}</q-tooltip>
          </q-btn>

          <q-btn v-if="isTeacher" flat round dense icon="filter_9_plus" :disable="openTabUser === ''" @click="openMultiEditDialog">
            <q-tooltip>{{ $t('sentenceCard.multiEditDial') }}</q-tooltip>
          </q-btn>

          <q-btn-dropdown :disable="openTabUser === ''" icon="more_vert" flat dense>
            <q-list>
              <q-item v-if="!exerciseMode" v-close-popup clickable @click="toggleDiffMode()">
                <q-item-section avatar>
                  <q-avatar icon="ion-git-network" color="primary" text-color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    >{{ diffMode ? $t('sentenceCard.diffMode[1]') : $t('sentenceCard.diffMode[0]') }}
                    {{ $t('sentenceCard.diffMode[2]') }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-close-popup clickable @click="openConllDialog()">
                <q-item-section avatar>
                  <q-avatar icon="format_list_numbered" color="primary" text-color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('sentenceCard.treeConll') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-close-popup clickable @click="exportSVG()">
                <q-item-section avatar>
                  <q-avatar icon="ion-md-color-palette" color="primary" text-color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('sentenceCard.treeSVG') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-close-popup clickable @click="exportPNG()">
                <q-item-section avatar>
                  <q-avatar icon="ion-md-color-palette" color="primary" text-color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('sentenceCard.treePNG') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn
            v-if="canSaveTreeInProject"
            flat
            round
            dense
            icon="undo"
            :disable="openTabUser === '' || !canUndo"
            :class="'undo-button'"
            @click="undo()"
          >
          </q-btn>
          <q-btn
            v-if="canSaveTreeInProject"
            flat
            round
            dense
            icon="ion-redo"
            :disable="openTabUser === '' || !canRedo"
            :class="'redo-button'"
            @click="redo()"
          >
          </q-btn>
        </template>
      </q-bar>

      <q-tabs
        class="custom-frame1"
        v-model="openTabUser"
        :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-8'"
        dense
        :active-color="$q.dark.isActive ? 'primary' : 'purple-7'"
        :active-bg-color="$q.dark.isActive ? '' : 'grey-2'"
        style="transition: unset"
      >
        <!-- v-for="(tree, user) in filteredConlls" -->
        <q-tab
          class="small-tab"
          v-for="(tree, user) in filteredConlls"
          :key="`${reactiveSentencesObj[user].state.metaJson.timestamp}-${user}`"
          :props="user"
          :name="user"
          :label="`${user}`"
          :alert="hasPendingChanges[user] ? 'orange' : ''"
          :alert-icon="hasPendingChanges[user] ? 'save' : ''"
          :icon="diffMode && user === diffUserId ? 'school' : 'person'"
          no-caps
          :ripple="false"
          @contextmenu="rightClickHandler($event, user)"
          @click="leftClickHandler(user)"
        >
          <q-tooltip v-if="hasPendingChanges[user]">{{ $t('sentenceCard.saveModif') }}</q-tooltip>
          <q-tooltip v-else-if="lastModifiedTime[user]">
            <q-icon color="primary" name="schedule" size="14px" class="q-ml-xs" />
            {{ $t('sentenceCard.modified[0]') }} {{ lastModifiedTime[user] }}
            {{ $i18n.locale == 'en' ? $t('sentenceCard.modified[1]') : '' }}
          </q-tooltip>
          <q-tooltip v-else>
            {{ $t('sentenceCard.automaticParsing') }}
          </q-tooltip>
        </q-tab>
      </q-tabs>
      <q-tab-panels v-model="openTabUser" @transition="transitioned" class="custom-frame1">
        <q-tab-panel tabindex="0" v-for="(tree, user) in filteredConlls" :key="user" :props="tree" :name="user" style="padding-bottom: 0; padding-top: 0" @focus="activateFocus(sentence.sent_id)">
          <q-card flat>
            <q-card-section :class="($q.dark.isActive ? '' : '') + ' scrollable'">
              <VueDepTree
                v-if="reactiveSentencesObj"
                :card-id="index"
                :conll="tree"
                :reactive-sentence="reactiveSentencesObj[user]"
                :reactive-sentences-obj="reactiveSentencesObj"
                :diff-mode="showDiffTeacher ? 'DIFF_TEACHER' : diffMode ? 'DIFF_USER' : 'NO_DIFF'"
                :sentence-id="sentence.sent_id"
                :sentence-bus="sentenceBus"
                :tree-user-id="user"
                :conll-saved-counter="conllSavedCounter"
                :has-pending-changes="hasPendingChanges"
                :matches="
                  sentence.matches ? (sentence.matches[user] ? sentence.matches[user].map((match) => Object.values(match.nodes)).flat() : []) : []
                "
                :packages="sentence.packages ? (sentence.packages[user] ? sentence.packages[user] : {}) : {}"
                @statusChanged="handleStatusChange"
              ></VueDepTree>
            </q-card-section>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
      <q-list v-if="openTabUser" style="padding-bottom: 20px" dense class="custom-frame1">
        <q-item v-for="meta in shownMeta" :key="meta" style="min-height: unset">
          <q-chip dense size="xs" style="margin-left: 0">{{ meta }} </q-chip>
          {{ reactiveSentencesObj[openTabUser].state.metaJson[meta] }}
        </q-item>
      </q-list>
    </div>

    <!--    ALL DIALOGS-->
    <template>
      <RelationDialog :sentence-bus="sentenceBus" />
      <UposDialog :sentence-bus="sentenceBus" />
      <XposDialog :sentence-bus="sentenceBus" />
      <FeaturesDialog :sentence-bus="sentenceBus" />
      <MetaDialog :sentence-bus="sentenceBus" />
      <ConlluDialog :sentence-bus="sentenceBus" />
      <ExportSVG :sentence-bus="sentenceBus" :reactive-sentences-obj="reactiveSentencesObj" />
      <TokensReplaceDialog :sentence-bus="sentenceBus" :reactive-sentences-obj="reactiveSentencesObj" @changed:metaText="changeMetaText" />
      <MultiEditDialog :sentence-bus="sentenceBus" :reactive-sentences-obj="reactiveSentencesObj" />
      <StatisticsDialog :sentence-bus="sentenceBus" :conlls="sentenceData.conlls" />
    </template>
  </div>
</template>

<script lang="ts">
// import Vue from "vue";
import mitt, { Emitter } from 'mitt';

import { ReactiveSentence } from 'dependencytreejs/src/ReactiveSentence';
import api from '../../api/backend-api';

import VueDepTree from './VueDepTree.vue';
import RelationDialog from './RelationDialog.vue';
import UposDialog from './UposDialog.vue';
import XposDialog from './XposDialog.vue';
import FeaturesDialog from './FeaturesDialog.vue';
import MetaDialog from './MetaDialog.vue';
import ConlluDialog from './ConlluDialog.vue';
import ExportSVG from './ExportSVG.vue';
import TokensReplaceDialog from './TokensReplaceDialog.vue';
import StatisticsDialog from './StatisticsDialog.vue';
import MultiEditDialog from './MultiEditDialog.vue';
import { reactive_sentences_obj_t, sentence_bus_events_t, sentence_bus_t } from 'src/types/main_types';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { useUserStore } from 'src/pinia/modules/user';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { useGithubStore } from 'src/pinia/modules/github';
import { PropType } from 'vue';

function sentenceBusFactory(): sentence_bus_t {
  let sentenceBus: Emitter<sentence_bus_events_t> = mitt<sentence_bus_events_t>();
  (sentenceBus as sentence_bus_t).sentenceSVGs = {};
  return sentenceBus as sentence_bus_t;
}

import { defineComponent } from 'vue';
import { grewSearchResultSentence_t, matches_t } from 'src/api/backend-types';

export default defineComponent({
  name: 'SentenceCard',
  components: {
    VueDepTree,
    RelationDialog,
    UposDialog,
    XposDialog,
    FeaturesDialog,
    MetaDialog,
    ConlluDialog,
    ExportSVG,
    TokensReplaceDialog,
    StatisticsDialog,
    MultiEditDialog,
  },
  props: {
    index: {
      type: Number as PropType<number>,
      required: true,
    },
    exerciseLevel: {
      type: Number as PropType<number>,
      required: true,
    },
    sentence: {
      type: Object as PropType<grewSearchResultSentence_t>,
      required: true,
    },
    matches: {
      default: () => [] as matches_t[],
      type: Object as PropType<matches_t>,
    },
    isFocused: {
      type: Boolean as PropType<boolean>,
    }
  },
  data() {
    const hasPendingChanges: { [key: string]: boolean } = {};
    const reactiveSentencesObj: reactive_sentences_obj_t = {};
    const shownMetaNames: string[] = [];
    return {
      sentenceBus: sentenceBusFactory(),
      exportedConll: '',
      reactiveSentencesObj,
      openTabUser: '',
      sentenceData: this.$props.sentence,
      EMMETT: 'emmett.strickland',
      graphInfo: {
        conllGraph: null,
        dirty: false,
        redo: false,
        user: '',
      },
      shownMetaNames,
      conllSavedCounter: 0,
      shownMetas: {},
      view: null,
      canUndo: false,
      canRedo: false,
      canSave: true,
      focused: false,
      hasPendingChanges,
      forceRerender: 0,
    };
  },

  computed: {
    ...mapWritableState(useProjectStore, ['diffMode', 'diffUserId']),
    ...mapWritableState(useGithubStore, ['reloadCommits']),
    ...mapState(useProjectStore, ['isAdmin', 'isTeacher', 'exerciseMode', 'shownMeta', 'getProjectConfig', 'canSaveTreeInProject']),
    ...mapState(useUserStore, ['isLoggedIn', 'username']),
    lastModifiedTime() {
      const lastModifiedTime: { [key: string]: string } = {};
      for (const user of Object.keys(this.reactiveSentencesObj)) {
        const { timestamp } = this.reactiveSentencesObj[user].state.metaJson;
        const timeDifferenceNumber = (Math.round(Date.now()) - parseInt(timestamp as string, 10)) / 1000;
        let timeDifferenceString = '';
        if (timeDifferenceNumber < 10) {
          timeDifferenceString = '< 10s';
        } else if (timeDifferenceNumber / 60 < 1) {
          timeDifferenceString = `${Math.round(timeDifferenceNumber)} ${this.$t('sentenceCard.modifTime[0]')}`;
        } else if (timeDifferenceNumber / (60 * 60) < 1) {
          timeDifferenceString = `${Math.round(timeDifferenceNumber / 60)} ${this.$t('sentenceCard.modifTime[1]')}`;
        } else if (timeDifferenceNumber / (60 * 60 * 24) < 1) {
          timeDifferenceString = `${Math.round(timeDifferenceNumber / (60 * 60))} ${this.$t('sentenceCard.modifTime[2]')}`;
        } else if (timeDifferenceNumber / (60 * 60 * 24 * 365) < 1) {
          timeDifferenceString = `${Math.round(timeDifferenceNumber / (60 * 60 * 24))} ${this.$t('sentenceCard.modifTime[3]')}`;
        }
        lastModifiedTime[user] = timeDifferenceString;
      }
      return lastModifiedTime;
    },
    showDiffTeacher() {
      return this.exerciseMode && this.exerciseLevel <= 2;
    },
    filteredConlls() {
      let filteredConlls = this.sentenceData.conlls;
      if (this.exerciseLevel !== 1 && !this.isAdmin && this.exerciseMode) {
        return Object.fromEntries(Object.entries(filteredConlls).filter(([user]) => user !== 'teacher'));
      }
      return this.orderConlls(filteredConlls);
    },
    isBernardCaron() {
      return this.username === 'bernard.l.caron' || this.username === 'kirianguiller';
    },
  },
  created() {
    this.shownMetaNames = this.getProjectConfig.shownMeta;
    for (const [userId, conll] of Object.entries(this.sentence.conlls)) {
      const reactiveSentence = new ReactiveSentence();
      reactiveSentence.fromSentenceConll(conll as string);
      this.reactiveSentencesObj[userId] = reactiveSentence;
      this.hasPendingChanges[userId] = false;
    }

    this.diffMode = !!this.diffMode;

    this.sentenceBus.on('changed:metaText', ({ newMetaText }) => {
      this.changeMetaText(newMetaText);
    });
  },
  mounted(){
    this.focused = this.isFocused as boolean;
    window.addEventListener('keydown', (event) => {
      this.handleShortcut(event, '')
    });
  },
  methods: {
    ...mapActions(useGrewSearchStore, ['removePendingModification']),
    openStatisticsDialog() {
      this.sentenceBus.emit('open:statisticsDialog', {
        userId: this.openTabUser,
      });
    },
    openConllDialog() {
      this.sentenceBus.emit('open:conlluDialog', { userId: this.openTabUser });
    },
    openMultiEditDialog() {
      this.sentenceBus.emit('open:openMultiEditDialog', {
        userId: this.openTabUser,
      });
    },
    exportSVG() {
      this.sentenceBus.emit('export:SVG', { userId: this.openTabUser });
    },
    exportPNG() {
      this.sentenceBus.emit('export:PNG', { userId: this.openTabUser });
    },
    editTokens(event: Event) {
      if (this.openTabUser !== '' && this.isAdmin) {
        this.sentenceBus.emit('open:tokensReplaceDialog', {
          userId: this.openTabUser,
          event,
        });
      }
    },
    undo() {
      if (this.openTabUser !== '') {
        this.sentenceBus.emit('action:undo', {
          userId: this.openTabUser,
        });
      }
    },
    redo() {
      if (this.openTabUser !== '') {
        this.sentenceBus.emit('action:redo', {
          userId: this.openTabUser,
        });
      }
    },
    /**
     * Receive canUndo, canRedo status from VueDepTree child component and
     * decide whether to disable undo, redo buttons or not
     */
    handleStatusChange(event: { canUndo: boolean; canRedo: boolean }) {
      this.canUndo = event.canUndo;
      this.canRedo = event.canRedo;
    },
    save(mode: string) {
      const openedTreeUser = this.openTabUser;
      let changedConllUser = this.username;
      if (mode) changedConllUser = mode;

      const metaToReplace = {
        user_id: changedConllUser,
        timestamp: Math.round(Date.now()),
      };

      const exportedConll = this.reactiveSentencesObj[openedTreeUser].exportConllWithModifiedMeta(metaToReplace);

      const data = {
        sent_id: this.sentence.sent_id,
        conll: exportedConll,
        user_id: changedConllUser,
      };
      if (!this.sentence.sample_name) {
        return;
      }
      api
        .updateTree(this.$route.params.projectname as string, this.sentence.sample_name, data)
        .then((response) => {
          if (response.status === 200) {
            this.sentenceBus.emit('action:saved', {
              userId: this.openTabUser,
            });
            this.reloadCommits += 1;
            if (this.sentenceData.conlls[changedConllUser]) {
              // the user already had a tree
              this.hasPendingChanges[changedConllUser] = false;
              this.sentenceData.conlls[changedConllUser] = exportedConll;
              this.reactiveSentencesObj[changedConllUser].fromSentenceConll(exportedConll);
            } else {
              // user still don't have a tree for this sentence, creating it.
              this.sentenceData.conlls[changedConllUser] = exportedConll;
              this.reactiveSentencesObj[changedConllUser] = new ReactiveSentence();
            }

            if (this.openTabUser !== changedConllUser) {
              this.reactiveSentencesObj[this.openTabUser].fromSentenceConll(this.sentenceData.conlls[this.openTabUser]);
              this.openTabUser = changedConllUser;
              this.exportedConll = exportedConll;
            }
            this.graphInfo.dirty = false;
            notifyMessage({ position: 'top', message: 'Saved on the server', icon: 'save' });
            this.forceRerender += 1; // nasty trick to rerender the indication of last time
          }
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
    transitioned() {
      if (this.exportedConll) {
        this.reactiveSentencesObj[this.openTabUser].fromSentenceConll(this.exportedConll);
        this.exportedConll = '';
      }

      this.sentenceBus.emit('action:tabSelected', {
        userId: this.openTabUser,
      });
      if (this.openTabUser !== '') {
        const newMetaText = this.reactiveSentencesObj[this.openTabUser].getSentenceText();
        this.sentenceBus.emit('changed:metaText', { newMetaText });
      }
    },
    openMetaDialog() {
      this.sentenceBus.emit('open:metaDialog', { userId: this.openTabUser });
    },
    changeMetaText(newMetaText: string) {
      this.sentenceData.sentence = newMetaText;
    },
    toggleDiffMode() {
      this.diffMode = !this.diffMode;
      if (!this.diffUserId) {
        this.diffUserId = this.openTabUser;
      }
    },
    orderConlls(filteredConlls: { [key: string]: string }) {
      const userAndTimestamps = [];
      for (const [user, reactiveSentence] of Object.entries(this.reactiveSentencesObj)) {
        userAndTimestamps.push({
          user,
          timestamp: parseInt(reactiveSentence.state.metaJson.timestamp as string, 10),
        });
      }
      // sort from newest to oldest
      const orderedUserAndTimestamps = userAndTimestamps.sort((a, b) => b.timestamp - a.timestamp);

      const orderedConlls: { [key: string]: string } = {};
      for (const userAndTimestamp of orderedUserAndTimestamps) {
        orderedConlls[userAndTimestamp.user] = filteredConlls[userAndTimestamp.user];
      }
      return orderedConlls;
    },
    leftClickHandler(user: string) {
      if (this.openTabUser === user) {
        this.openTabUser = '';
      }
    },
    /**
     * When user right click on one of the tabs icon, if diffMode is on, it will change
     * the current diffUser for current session
     * @param e
     * @param user
     */
    rightClickHandler(e: MouseEvent, user: string) {
      e.preventDefault();
      if (this.exerciseMode) return;
      if (!this.diffMode) {
        // if user right click on one of the tab icon while diffMode was
        // disabled, it enable it and set to this tab user the diffUser
        this.toggleDiffMode();
        this.diffUserId = user;
        return;
      } else {
        // we are alrady in diffmode
        if (user == this.diffUserId) {
          // clicked on the current diff user, we enable diffmode
          this.toggleDiffMode();
        } else {
          this.diffUserId = user;
        }
      }
    },
    activateFocus(sentId: string) {
      this.focused = true;
      this.$emit('focused-sent', sentId);
    },
    handleShortcut(event: any, user: string){
      if (this.openTabUser === '') {
        return;
      }
      if (this.focused){
        if (event.key === 's'){
          this.save(user);
        }
        if (event.key === 'z' && this.canUndo){
          this.undo();
        }
        if (event.key === 'y' && this.canRedo){
          this.redo();
        }
    }
    }
  },
});
</script>

<style>
.scrollable {
  overflow-x: auto;
}
</style>
