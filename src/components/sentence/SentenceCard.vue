<template>
  <div :id="index" class="custom-bottom-border">
    <div>
      <q-bar class="row items-center custom-frame1">
        <span class="text-grey" style="padding-left: 10px">{{ index + 1 }}</span>
        <q-chip class="text-center" :color="$q.dark.isActive ? 'grey' : ''" dense> {{ sentence.sent_id }}
        </q-chip
        >&nbsp;&nbsp;&nbsp;
        <q-input
          v-model="sentenceData.sentence"
          style="width: 65%"
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
        <q-space/>
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

          <q-btn v-if="isTeacher" flat round dense icon="linear_scale" :disable="openTabUser === ''"
                 @click="save('base_tree')">
            <q-tooltip>{{ $t('sentenceCard.saveBaseTree') }}</q-tooltip>
          </q-btn>

          <q-btn v-if="isBernardCaron" flat round dense icon="face" :disable="openTabUser === ''" @click="save(EMMETT)">
            <q-tooltip>Save as Emmett</q-tooltip>
          </q-btn>

          <q-btn v-if="canSaveTreeInProject" flat round dense icon="save"
                 :disable="openTabUser === '' || !canSave" @click="save('')">
            <q-tooltip
            >{{ $t('sentenceCard.saveTree[0]') }} {{ openTabUser }} {{ $t('sentenceCard.saveTree[1]') }} <b>{{
                userId
              }}</b></q-tooltip
            >
          </q-btn>


          <!-- TODO : still display the metadata when the user is not logged in, but hide all the buttons for deleting and saving them -->
          <q-btn v-if="isLoggedIn" flat round dense icon="post_add" :disable="openTabUser === ''"
                 @click="openMetaDialog()">
            <q-tooltip>{{ $t('sentenceCard.editMetadata') }}</q-tooltip>
          </q-btn>

          <q-btn v-if="isLoggedIn && isTeacher" flat round dense icon="filter_9_plus" :disable="openTabUser === ''"
                 @click="openMultiEditDialog">
            <q-tooltip>{{ $t('sentenceCard.multiEditDial') }}</q-tooltip>
          </q-btn>

          <q-btn-dropdown :disable="openTabUser === ''" icon="more_vert" flat dense>
            <!-- <q-tooltip>More</q-tooltip> -->
            <q-list>
              <q-item v-if="!exerciseMode" v-close-popup clickable @click="toggleDiffMode()">
                <q-item-section avatar>
                  <q-avatar icon="ion-git-network" color="primary" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ diffMode ? $t('sentenceCard.diffMode[1]') : $t('sentenceCard.diffMode[0]') }}
                    {{ $t('sentenceCard.diffMode[2]') }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-close-popup clickable @click="getlink()">
                <q-item-section avatar>
                  <q-avatar icon="ion-md-link" color="primary" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('sentenceCard.treeLink') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-close-popup clickable @click="openConllDialog()">
                <q-item-section avatar>
                  <q-avatar icon="format_list_numbered" color="primary" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('sentenceCard.treeConll') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-close-popup clickable @click="exportSVG()">
                <q-item-section avatar>
                  <q-avatar icon="ion-md-color-palette" color="primary" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('sentenceCard.treeSVG') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable @click="addEmptyToken()">
                <q-item-section avatar>
                  <q-avatar icon="add" color="primary" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label> {{ $t('sentenceCard.addToken') }}</q-item-label>
                </q-item-section>
              </q-item>

            </q-list>
          </q-btn-dropdown>
          <q-btn v-if="isLoggedIn" flat round dense icon="undo" :disable="openTabUser === '' || !canUndo"
                 :class="'undo-button'" @click="undo()">
          </q-btn>
          <q-btn v-if="isLoggedIn" flat round dense icon="ion-redo" :disable="openTabUser === '' || !canRedo"
                 :class="'redo-button'" @click="redo()">
          </q-btn>
        </template>
      </q-bar>

      <q-tabs
        class="custom-frame1"
        v-model="openTabUser"
        :class="($q.dark.isActive ? 'text-grey-5' : 'text-grey-8')"
        dense
        :active-color="$q.dark.isActive ? 'primary' : 'purple-7'"
        :active-bg-color="$q.dark.isActive ? '' : 'grey-2'"
        style="transition: unset;"
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
            <q-icon color="primary" name="schedule" size="14px" class="q-ml-xs"/>
            {{ $t('sentenceCard.modified[0]') }} {{ lastModifiedTime[user] }}
            {{ $i18n.locale == 'en' ? $t('sentenceCard.modified[1]') : '' }}
          </q-tooltip>
          <q-tooltip v-else>
            {{ $t('sentenceCard.automaticParsing') }}
          </q-tooltip>
        </q-tab>
      </q-tabs>
      <q-tab-panels
        v-model="openTabUser"
        @transition="transitioned"
        class="custom-frame1"
      >
        <q-tab-panel v-for="(tree, user) in filteredConlls" :key="user" :props="tree" :name="user"
                     style="padding-bottom: 0; padding-top: 0;">
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
          <q-chip dense size="xs" style="margin-left: 0">{{ meta }}
          </q-chip
          >
          {{ reactiveSentencesObj[openTabUser].state.metaJson[meta] }}
        </q-item>
      </q-list>
    </div>

    <!--    ALL DIALOGS-->
    <template>
      <RelationDialog :sentence-bus="sentenceBus"/>
      <UposDialog :sentence-bus="sentenceBus"/>
      <XposDialog :sentence-bus="sentenceBus"/>
      <FeaturesDialog :sentence-bus="sentenceBus"/>
      <MetaDialog :sentence-bus="sentenceBus"/>
      <ConlluDialog :sentence-bus="sentenceBus"/>
      <ExportSVG :sentence-bus="sentenceBus"/>
      <TokensReplaceDialog :sentence-bus="sentenceBus" :reactive-sentences-obj="reactiveSentencesObj"
                           @changed:metaText="changeMetaText"/>
      <MultiEditDialog :sentence-bus="sentenceBus" :reactive-sentences-obj="reactiveSentencesObj"/>
      <StatisticsDialog :sentence-bus="sentenceBus" :conlls="sentenceData.conlls"/>
    </template>

  </div>
</template>

<script lang="ts">
// import Vue from "vue";
import mitt, {Emitter} from 'mitt';

import {ReactiveSentence} from 'dependencytreejs/src/ReactiveSentence';
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
import {reactive_sentences_obj_t, sentence_bus_events_t, sentence_bus_t} from 'src/types/main_types';
import {mapActions, mapState, mapWritableState} from 'pinia';
import {useProjectStore} from 'src/pinia/modules/project';
import {notifyError, notifyMessage} from 'src/utils/notify';
import {useUserStore} from 'src/pinia/modules/user';
import {useGrewSearchStore} from 'src/pinia/modules/grewSearch';
import {PropType} from 'vue';

function sentenceBusFactory(): sentence_bus_t {
  let sentenceBus: Emitter<sentence_bus_events_t> = mitt<sentence_bus_events_t>();
  (sentenceBus as sentence_bus_t).sentenceSVGs = {};
  return sentenceBus as sentence_bus_t;
}

import {defineComponent} from 'vue';
import {grewSearchResultSentence_t, matches_t} from 'src/api/backend-types';

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
  },
  data() {
    const hasPendingChanges: { [key: string]: boolean } = {};
    const reactiveSentencesObj: reactive_sentences_obj_t = {};
    const shownMetanames: string[] = [];
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
      shownMetanames,
      conllSavedCounter: 0,
      shownMetas: {},
      view: null,
      sentenceLink: '',
      canUndo: false,
      canRedo: false,
      canSave: true,
      hasPendingChanges,
      forceRerender: 0,
    };
  },

  computed: {
    ...mapWritableState(useProjectStore, ['diffMode', 'diffUserId']),
    ...mapState(useProjectStore, ['isAdmin', 'isGuest', 'isTeacher', 'guests', 'exerciseMode', 'shownMeta', 'getProjectConfig', 'canSaveTreeInProject']),
    ...mapState(useUserStore, ['isLoggedIn', 'getUserInfos']),
    lastModifiedTime() {
      // this.forceRerender; it was like this when i found it. Should it have = 0 ?
      const lastModifiedTime: { [key: string]: string } = {};
      for (const user of Object.keys(this.reactiveSentencesObj)) {
        const {timestamp} = this.reactiveSentencesObj[user].state.metaJson;
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
    /**
     * Never used ?!
     * Check if the graph is dirty (I.E. modified but not saved) or open to see if it's supposed to be possible to save
     * @returns {Boolean}
     */
    cannotSave() {
      const {dirty} = this.graphInfo;
      return !dirty;
    },
    /**
     * Check the store to see if a user is logged in or not
     * @returns {Boolean}
     */
    filteredConlls() {
      let filteredConlls = this.sentenceData.conlls;
      if (this.exerciseLevel !== 1 && !this.isAdmin && this.exerciseMode) {
        return Object.fromEntries(Object.entries(filteredConlls).filter(([user]) => user !== 'teacher'));
        // const filteredConllsTemp = Object.entries(this.sentenceData.conlls).filter(([user, conll]) => user !== 'teacher');
        // filteredConlls = {};
        // for (const [user, conll] of filteredConllsTemp) {
        //   filteredConlls[user] = conll;
        // }
      }
      return this.orderConlls(filteredConlls);
    },
    userId() {
      return this.getUserInfos.username;
    },
    isBernardCaron() {
      return this.getUserInfos.username === 'bernard.l.caron' || this.getUserInfos.username === 'kirianguiller';
    },
  },
  created() {
    this.shownMetanames = this.getProjectConfig.shownMeta;
    for (const [userId, conll] of Object.entries(this.sentence.conlls)) {
      const reactiveSentence = new ReactiveSentence();
      reactiveSentence.fromSentenceConll(conll as string);
      this.reactiveSentencesObj[userId] = reactiveSentence;
      this.hasPendingChanges[userId] = false;
    }

    this.diffMode = !!this.diffMode;

    this.sentenceBus.on('changed:metaText', ({newMetaText}) => {
      this.changeMetaText(newMetaText);
    });
  },
  methods: {
    ...mapActions(useGrewSearchStore, ['removePendingModification']),
    /**
     * Set the sentence link and copy it after 500 ms
     *
     * @returns void
     */
    getlink() {
      this.sentenceLink = `${window.location.href.split(`/projects/${this.$route.params.projectname}`)[0]}/projects/${
        this.$route.params.projectname
      }/${this.sentence.sample_name}/${this.index + 1}/${this.graphInfo.user}`;
      setTimeout(() => {
        (this.$refs.linkinput as HTMLInputElement).select();
        document.execCommand('copy');
      }, 500);
    },
    openStatisticsDialog() {
      this.sentenceBus.emit('open:statisticsDialog', {
        userId: this.openTabUser,
      });
    },
    /**
     * Show the conll graph
     *
     * @returns void
     */
    openConllDialog() {
      this.sentenceBus.emit('open:conlluDialog', {userId: this.openTabUser});
    },
    openMultiEditDialog() {
      this.sentenceBus.emit('open:openMultiEditDialog', {
        userId: this.openTabUser,
      });
    },
    /**
     * Get the SVG by creating it using snap arborator plugin and then replacing the placeholder in the current DOM
     * @todo instead of this long string, read the actual css file and put it there.
     *
     * @returns void
     */
    exportSVG() {
      // todo: instead of this long string, read the actual css file and put it there.
      this.sentenceBus.emit('export:SVG', {userId: this.openTabUser});
    },
    /**
     * Handle token click event to display the related dialog
     *
     * @param {Event} event
     * @returns void
     */
    editTokens(event: Event) {
      // only if a tab is open
      if (this.openTabUser !== '') {
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
    addEmptyToken() {
      if (this.openTabUser !== '') {
        this.sentenceBus.emit('action:addEmptyToken', {
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
      // this.canSave = event.canSave;
    },
    /**
     * Save the graph to backend after modifying its metadata and changing it into an object
     *
     * @returns void
     */
    save(mode: string) {
      const openedTreeUser = this.openTabUser;

      let changedConllUser = this.getUserInfos.username;
      if (mode) {
        changedConllUser = mode;
      }

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
            notifyMessage({position: 'top', message: 'Saved on the server', icon: 'save'});
            this.forceRerender += 1; // nasty trick to rerender the indication of last time
          }
        })
        .catch((error) => {
          notifyError({error});
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

      const newMetaText = this.reactiveSentencesObj[this.openTabUser].getSentenceText();
      this.sentenceBus.emit('changed:metaText', {newMetaText});
    },
    /**
     * Set the graph infos according to the event payload. This event shoudl be trigerred from the ConllGraph
     *
     * @returns void
     */
    onConllGraphUpdate(payload: any) {
      this.graphInfo = payload;
      if (this.graphInfo.dirty) this.addPendingModification(this.sentence.sent_id);
      else this.removePendingModification(this.sentence.sent_id);
    },
    openMetaDialog() {
      // "this.openTabUser" contains the user name
      this.sentenceBus.emit('open:metaDialog', {userId: this.openTabUser});
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
  },
});
</script>

<style>
.scrollable {
  overflow-x: auto;
}
</style>
