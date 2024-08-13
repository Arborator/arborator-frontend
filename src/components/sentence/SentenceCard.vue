<template>
  <div class="custom-bottom-border">
    <SentenceToolBar
      :sentence-bus="sentenceBus"
      :reactive-sentences-obj="(reactiveSentencesObj as reactive_sentences_obj_t)"
      :index="index"
      :blind-annotation-level="blindAnnotationLevel"
      :open-tab-user="openTabUser"
      :sentence-data="sentenceData"
      :parent-on-save="save"
      :can-undo="canUndo"
      :can-redo="canRedo"
    ></SentenceToolBar>
    <div>
      <q-tabs
        v-model="openTabUser"
        class="custom-frame1"
        :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-8'"
        dense
        :active-color="$q.dark.isActive ? 'primary' : 'purple-7'"
        :active-bg-color="$q.dark.isActive ? '' : 'grey-2'"
        style="transition: unset"
      >
        <q-tab
          v-for="(tree, user) in filteredConlls"
          :key="`${reactiveSentencesObj[user].state.metaJson.timestamp}-${user}`"
          class="small-tab"
          :props="user"
          :name="user"
          :label="`${user}`"
          :alert="hasPendingChanges[user] ? 'orange' : ''"
          :alert-icon="hasPendingChanges[user] ? 'save' : ''"
          :icon="diffMode && user === diffUserId ? 'school' : 'person'"
          no-caps
          :ripple="false"
          @contextmenu="rightClickHandler($event, user as string)"
          @click="leftClickHandler(user as string)"
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
      <q-tab-panels v-model="openTabUser" keep-alive class="custom-frame1" @transition="transitioned">
        <q-tab-panel
          v-for="(tree, user) in filteredConlls"
          :key="user"
          tabindex="0"
          :props="tree"
          :name="user"
          style="padding-bottom: 0; padding-top: 0"
        >
          <q-card flat>
            <q-card-section :class="($q.dark.isActive ? '' : '') + ' scrollable'" :id="'tab_' + user" @scroll="synchronizeScroll">
              <VueDepTree
                v-if="reactiveSentencesObj"
                :card-id="index"
                :conll="tree"
                :reactive-sentence="reactiveSentencesObj[user]"
                :reactive-sentences-obj="reactiveSentencesObj"
                :diff-mode="showDiffValidator ? 'DIFF_VALIDATED' : diffMode ? 'DIFF_USER' : 'NO_DIFF'"
                :sentence-bus="sentenceBus"
                :tree-user-id="(user as string)"
                :has-pending-changes="hasPendingChanges"
                :matches="
                  sentence.matches ? (sentence.matches[user] ? sentence.matches[user].map((match) => Object.values(match.nodes)).flat() : []) : []
                "
                :packages="sentence.packages ? (sentence.packages[user] ? sentence.packages[user] : {}) : {}"
                @statusChanged="handleStatusChange"
              >
              </VueDepTree>
            </q-card-section>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
      <div v-if="openTabUser" dense class="custom-frame1" style="padding-left: 15px">
        <q-list dense>
          <q-item v-for="meta in shownMeta" :key="meta" style="min-height: unset; padding-left: 0px">
            <q-chip dense size="xs" style="margin-left: 0">{{ meta }} </q-chip>
            {{ reactiveSentencesObj[openTabUser].state.metaJson[meta] }}
          </q-item>
        </q-list>
        <div class="row">
          <div class="text-overline">Tags:</div>
          <div v-for="tag in userTags">
            <q-chip v-if="openTabUser === username || isValidator" removable outline color="primary" size="sm" @remove="removeSentenceTag(tag)">
              {{ tag }}
            </q-chip>
            <q-chip v-else outline color="primary" size="sm">
              {{ tag }}
            </q-chip>
          </div>
        </div>
      </div>
    </div>
    <template>
      <RelationDialog :sentence-bus="sentenceBus" />
      <UposDialog :sentence-bus="sentenceBus" />
      <XposDialog :sentence-bus="sentenceBus" />
      <FeaturesDialog :sentence-bus="sentenceBus" @changed:meta-text="changeText()" />
      <MetaDialog :sentence-bus="sentenceBus" />
      <ConlluDialog :sentence-bus="sentenceBus" />
      <ExportSVG 
        :sentence-bus="sentenceBus" 
        :reactive-sentences-obj="(reactiveSentencesObj as reactive_sentences_obj_t)" 
        />
      <TokensReplaceDialog 
        :sentence-bus="sentenceBus" 
        :reactive-sentences-obj="(reactiveSentencesObj as reactive_sentences_obj_t)" 
        @changed:meta-text="changeText()" 
        />
      <MultiEditDialog 
        :sentence-bus="sentenceBus" 
        :reactive-sentences-obj="(reactiveSentencesObj as reactive_sentences_obj_t)" 
        />
      <StatisticsDialog :sentence-bus="sentenceBus" :conlls="sentenceData.conlls" />
    </template>
  </div>
</template>

<script lang="ts">
import { ReactiveSentence } from 'dependencytreejs/src/ReactiveSentence';
import { constructTextFromTreeJson } from 'conllup/lib/conll';
import mitt, { Emitter } from 'mitt';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { useTagsStore } from 'src/pinia/modules/tags';
import { useUserStore } from 'src/pinia/modules/user';
import { useGithubStore } from 'src/pinia/modules/github';
import { grewSearchResultSentence_t, matches_t } from 'src/api/backend-types';
import { reactive_sentences_obj_t, sentence_bus_events_t, sentence_bus_t } from 'src/types/main_types';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

import  api  from 'src/api/backend-api';
import ConlluDialog from './ConlluDialog.vue';
import ExportSVG from './ExportSVG.vue';
import FeaturesDialog from './FeaturesDialog.vue';
import MetaDialog from './MetaDialog.vue';
import MultiEditDialog from './MultiEditDialog.vue';
import StatisticsDialog from './StatisticsDialog.vue';
import TokensReplaceDialog from './TokensReplaceDialog.vue';
import UposDialog from './UposDialog.vue';
import VueDepTree from './VueDepTree.vue';
import XposDialog from './XposDialog.vue';
import RelationDialog from './RelationDialog.vue';
import SentenceToolBar from './SentenceToolBar.vue';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';

function sentenceBusFactory(): sentence_bus_t {
  let sentenceBus: Emitter<sentence_bus_events_t> = mitt<sentence_bus_events_t>();
  (sentenceBus as sentence_bus_t).sentenceSVGs = {};
  return sentenceBus as sentence_bus_t;
}

export default defineComponent({
  name: 'SentenceCard',
  components: {
    VueDepTree,
    UposDialog,
    XposDialog,
    FeaturesDialog,
    MetaDialog,
    ConlluDialog,
    ExportSVG,
    TokensReplaceDialog,
    StatisticsDialog,
    MultiEditDialog,
    SentenceToolBar,
    RelationDialog,
  },
  props: {
    index: {
      type: Number as PropType<number>,
      required: true,
    },
    blindAnnotationLevel: {
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
    const horizontalScrollPos: number = 0;
    return {
      sentenceBus: sentenceBusFactory(),
      exportedConll: '',
      reactiveSentencesObj,
      openTabUser: '',
      sentenceData: this.$props.sentence,
      canUndo: false,
      canRedo: false,
      canSave: true,
      hasPendingChanges,
      tags: [],
      horizontalScrollPos,
      sentenceText: '',
    };
  },
  computed: {
    ...mapWritableState(useProjectStore, ['diffMode', 'diffUserId']),
    ...mapWritableState(useGithubStore, ['reloadCommits']),
    ...mapState(useProjectStore, ['isAdmin', 'isValidator', 'blindAnnotationMode', 'shownMeta']),
    ...mapState(useUserStore, ['username']),
    ...mapState(useTagsStore, ['defaultTags']),
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
    showDiffValidator() {
      return this.blindAnnotationMode && this.blindAnnotationLevel <= 2;
    },
    userTags() {
      const existingTagsString = this.reactiveSentencesObj[this.openTabUser].state.metaJson.tags as string;
      if (existingTagsString) {
        return existingTagsString.split(',');
      }
    },
    filteredConlls() {
      let filteredConlls = this.sentenceData.conlls;
      if (this.blindAnnotationLevel !== 1 && !this.isAdmin && this.blindAnnotationMode) {
        return Object.fromEntries(Object.entries(filteredConlls).filter(([user]) => user !== 'validated'));
      }
      return this.orderConlls(filteredConlls);
    },
    
  },
  created() {
    for (const [userId, conll] of Object.entries(this.sentence.conlls)) {
      const reactiveSentence = new ReactiveSentence();
      reactiveSentence.fromSentenceConll(conll);
      this.reactiveSentencesObj[userId] = reactiveSentence;
      this.hasPendingChanges[userId] = false;
    }
    this.diffMode = !!this.diffMode;
  },
  methods: {
    ...mapActions(useTagsStore, ['removeTag']),
    ...mapActions(useGrewSearchStore, ['removePendingModification']),
    handleStatusChange(event: { canUndo: boolean; canRedo: boolean }) {
      this.canUndo = event.canUndo;
      this.canRedo = event.canRedo;
    },
    removeSentenceTag(tag: string) {
      this.removeTag(this.sentenceData, tag, this.sentenceBus, this.openTabUser);
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
            this.removePendingModification(`${this.sentence.sent_id}_${this.openTabUser}`);
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
              this.sentenceText = this.reactiveSentencesObj[this.openTabUser].state.metaJson.text as string;
              this.openTabUser = changedConllUser;
              this.exportedConll = exportedConll;
            }
            notifyMessage({ position: 'top', message: 'Saved on the server', icon: 'save' });
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
        this.sentenceText = constructTextFromTreeJson(this.reactiveSentencesObj[this.openTabUser].state.treeJson);
      }
      else {
        this.sentenceText = this.sentenceData.sentence;
      }
    },
    toggleDiffMode() {
      this.diffMode = !this.diffMode;
      if (!this.diffUserId) {
        this.diffUserId = this.openTabUser;
      }
    },
    rightClickHandler(e: MouseEvent, user: string) {
      e.preventDefault();
      if (!this.diffMode) {
        this.toggleDiffMode();
        this.diffUserId = user;
      } else if (user == this.diffUserId) {
        this.toggleDiffMode();
      } else {
        this.diffUserId = user;
      }
    },
    changeText() {
      this.sentenceData.sentence = this.reactiveSentencesObj[this.openTabUser].getSentenceText();
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
      const orderedUserAndTimestamps = [...userAndTimestamps].sort((a, b) => b.timestamp - a.timestamp);
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
    synchronizeScroll(event: Event) {
      this.horizontalScrollPos = (event.target as HTMLElement).scrollLeft;
    },
    removeUserTag(tag: string) {
      this.removeTag(this.sentenceData, tag, this.sentenceBus, this.openTabUser);
    },
  },
});
</script>
<style>
.scrollable {
  overflow-x: auto;
}
</style>
