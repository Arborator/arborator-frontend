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
      :parent-on-create-draft="createDraftFromCurrentTree"
      :parent-on-delete-draft="deleteCurrentDraft"
      :can-undo="canUndo"
      :can-redo="canRedo"
      :has-github-access="hasGithubAccess"
      :is-synchronized="isSynchronized"
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
          :class="['small-tab', user !== 'validated' && stagedTrees[user]?.status === 'staged' ? 'staged-alert-left' : '']"
          :props="user"
          :name="user"
          :label="`${user}`"
          :alert="getTabAlertColor(user as string)"
          :alert-icon="getTabAlertIcon(user as string)"
          :icon="getTabIcon(user as string)"
          no-caps
          :ripple="false"
          @contextmenu="rightClickHandler($event, user as string)"
          @click="leftClickHandler(user as string)"
        >
          <q-tooltip v-if="hasPendingChanges[user]">{{ $t('sentenceCard.saveModif') }}</q-tooltip>
          <q-tooltip v-else-if="user !== 'validated' && stagedTrees[user]?.status === 'pushed'">
            Pushed by {{ stagedTrees[user]?.pushedBy || 'unknown' }}<br/>
            {{ formatRelativeTime(stagedTrees[user]?.pushedAt) }}
          </q-tooltip>
          <q-tooltip v-else-if="user !== 'validated' && stagedTrees[user]?.status === 'pinned'">
            Pinned to current GitHub tree<br/>
            {{ formatRelativeTime(stagedTrees[user]?.at) }}
          </q-tooltip>
          <q-tooltip v-else-if="user !== 'validated' && stagedTrees[user]">
            Staged by {{ stagedTrees[user]?.by || 'unknown' }}<br/>
            {{ formatRelativeTime(stagedTrees[user]?.at) }}
          </q-tooltip>
          <q-tooltip v-else-if="isTreeEqualToGithub(user as string)">
            Same as GitHub reference
          </q-tooltip>
          <q-tooltip v-else-if="lastModifiedTime[user]">
            <q-icon color="primary" name="schedule" size="14px" class="q-ml-xs" />
            {{ $t('sentenceCard.modified', [lastModifiedTime[user]]) }}
          </q-tooltip>
          <q-tooltip v-else>
            {{ $t('sentenceCard.automaticParsing') }}
          </q-tooltip>
          <q-badge
            v-if="!hasPendingChanges[user] && udValidationStatut[user] !== '' && udValidationStatut[user]"
            :color="udValidationStatut[user]"
            rounded
            floating
            :class="user === openTabUser ? 'clickable' : ''"
            @click.stop="showUdValidation[user] = true"
          >
          </q-badge>
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
                :reactive-sentence="(reactiveSentencesObj[user] as any)"
                :reactive-sentences-obj="(reactiveSentencesObj as any)"
                :diff-mode="showDiffAdmin ? 'DIFF_VALIDATED' : diffMode ? 'DIFF_USER' : 'NO_DIFF'"
                :sentence-bus="sentenceBus"
                :tree-user-id="(user as string)"
                :has-pending-changes="hasPendingChanges"
                :interactive="canEditTree(user as string)"
                :matches="
                  sentence.matches ? (sentence.matches[user] ? sentence.matches[user].map((match) => Object.values(match.nodes)).flat() : []) : []
                "
                :packages="sentence.packages && sentence.packages[user] ? sentence.packages[user] : undefined"
                @statusChanged="handleStatusChange"
                :sample-name="sentence.sample_name"
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
        <div v-if="lastValidator" class="row">
          <div class="text-overline">Last validator: {{ lastValidator }}</div>
        </div>
        <div class="row">
          <div class="text-overline">Tags:</div>
          <div v-for="tag in userTags">
            <q-chip v-if="canEditTree(openTabUser)" removable outline color="primary" size="sm" @remove="removeSentenceTag(tag)">
              {{ tag }}
            </q-chip>
            <q-chip v-else outline color="primary" size="sm">
              {{ tag }}
            </q-chip>
          </div>
        </div>
        <div v-if="githubComparison" class="q-mt-md q-pr-md">
          <div v-if="githubComparison.status === 'missing' && isSynchronized && hasGithubAccess" class="github-status-info github-status-info--missing">
            {{ $t('sentenceCard.outgithub') }}
          </div>
          <div v-else-if="githubComparison.status === 'same'" class="github-status-info github-status-info--same">
            {{ $t('sentenceCard.ingithub') }}
          </div>
          <q-banner
            v-else-if="githubComparison.status === 'diff'"
            class="bg-grey-1 text-grey-10 rounded-borders"
          >
            <div class="row items-center justify-between">
              <div
                class="github-diff-toggle"
                @click="showGithubDiff = !showGithubDiff"
              >
                <q-icon
                  :name="showGithubDiff ? 'expand_less' : 'expand_more'"
                  size="18px"
                />
                <span>
                  {{ $t('sentenceCard.githubDiffclick') }}
                  {{ githubDiffCount }}
                  {{ githubDiffCount === 1
                    ? $t('sentenceCard.githubDiffOne')
                    : $t('sentenceCard.githubDiffMany') }}
                </span>
              </div>
              <q-btn
                v-if="canDiscardGithubDiff"
                dense
                flat
                color="negative"
                icon="undo"
                label="Discard changes"
                @click.stop="discardChangesToGithubReference"
              />
            </div>
            <div
              v-if="showGithubDiff"
              v-html="githubComparison.diff"
              class="github-diff-pre"
            ></div>
          </q-banner>
        </div>
      </div>
    </div>
    <template>
      <RelationDialog :sentence-bus="sentenceBus" />
      <UposDialog :sentence-bus="sentenceBus" :upos-options="annotationFeatures.UPOS"/>
      <XposDialog :sentence-bus="sentenceBus" :xpos-options="annotationFeatures.XPOS" />
      <FeaturesDialog
        :sentence-bus="sentenceBus"
        :reactive-sentences-obj="(reactiveSentencesObj as reactive_sentences_obj_t)"
        @changed:meta-text="changeText()"
        />
      <MetaDialog :sentence-bus="sentenceBus" />
      <ConlluDialog
        :sentence-bus="sentenceBus"
        :reactive-sentences-obj="(reactiveSentencesObj as reactive_sentences_obj_t)"
        :sentence-data="sentenceData"
      />
      <TableConlluDialog
        :sentence-bus="sentenceBus"
        :reactive-sentences-obj="(reactiveSentencesObj as reactive_sentences_obj_t)"
        :sentence-data="sentenceData"
      />
      <ExportSVG
        :sentence-bus="sentenceBus"
        :reactive-sentences-obj="(reactiveSentencesObj as reactive_sentences_obj_t)"
        />

      <MultiEditDialog
        :sentence-bus="sentenceBus"
        :reactive-sentences-obj="(reactiveSentencesObj as reactive_sentences_obj_t)"
        />
      <StatisticsDialog
        :sentence-bus="sentenceBus"
        :conlls="sentenceData.conlls as { [key: string]: string }"
        :reference-user-id="pushedReferenceUserId"
      />
    </template>
    <q-dialog v-model="showUdValidation[openTabUser]">
      <q-card style="width: 800px;max-width: 90vw;">
        <q-card-section>
          <div class="row text-h6">
            {{ $t('sentenceCard.validation') }}
            <span>
              <q-icon name="bug_report" />
            </span>
          </div>
          <div class="row">
            <span v-if="!languageDetected">
              {{ $t('sentenceCard.notDetectedLang[0]') }}
              <a href="https://quest.ms.mff.cuni.cz/udvalidator/cgi-bin/unidep/langspec/specify_feature.pl" target="_blank">
                {{ $t('sentenceCard.notDetectedLang[1]') }}
              </a>
            </span>
          </div>
        </q-card-section>
        <q-card-section v-if="udValidationMsg[openTabUser] !== ''" class="row">
          <pre>{{ udValidationMsg[openTabUser] }}</pre>
        </q-card-section>
        <q-card-section v-else class="row">
          {{ $t('sentenceCard.noValidationIssues') }}
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { ReactiveSentence } from 'dependencytreejs/src/ReactiveSentence';
import { diffLines } from 'diff';
import { constructTextFromTreeJson, sentenceConllToJson } from 'conllup/lib/conll';
import mitt, { Emitter } from 'mitt';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { useTagsStore } from 'src/pinia/modules/tags';
import { useUserStore } from 'src/pinia/modules/user';
import { useGithubStore } from 'src/pinia/modules/github';
import { useTreesStore } from 'src/pinia/modules/trees';
import { grewSearchResultSentence_t, matches_t } from 'src/api/backend-types';
import { reactive_sentences_obj_t, sentence_bus_events_t, sentence_bus_t } from 'src/types/main_types';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

import  api  from 'src/api/backend-api';
import ConlluDialog from './ConlluDialog.vue';
import TableConlluDialog from './TableConlluDialog.vue';
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
    TableConlluDialog,
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
    udValidation: {
      type: Object as PropType<any>,
      required: false,
    },
    hasGithubAccess: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false,
    },
    githubSampleDiff: {
      type: String as PropType<string>,
      required: false,
      default: '',
    },
    githubReferenceConll: {
      type: String as PropType<string>,
      required: false,
      default: '',
    },
    isSynchronized: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false,
    },
  },
  data() {
    const hasPendingChanges: { [key: string]: boolean } = {};
    const reactiveSentencesObj: reactive_sentences_obj_t = {};
    const udValidationPassed: { [key: string]: boolean } = {};
    const udValidationMsg: { [key: string]: string } = {};
    const udValidationStatut: { [key: string]: string } = {};
    const showUdValidation: { [key: string]: boolean } = {};
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
      udValidationPassed,
      udValidationMsg,
      udValidationStatut,
      showUdValidation,
      showGithubDiff: false,
    };
  },
  computed: {
    ...mapWritableState(useProjectStore, ['diffMode', 'diffUserId', 'name']),
    ...mapWritableState(useGithubStore, ['reloadCommits']),
    ...mapWritableState(useTreesStore, ['reloadTrees']),
    ...mapState(useTreesStore, ['reloadValidation']),
    ...mapState(useProjectStore, ['isAdmin', 'blindAnnotationMode', 'shownMeta', 'languageDetected', 'annotationFeatures']),
    ...mapState(useUserStore, ['username']),
    ...mapState(useTagsStore, ['defaultTags']),
    lastModifiedTime() {
      const lastModifiedTime: { [key: string]: string } = {};
      for (const user of Object.keys(this.reactiveSentencesObj)) {
        const { timestamp } = this.reactiveSentencesObj[user].state.metaJson;
        const timestampNumber = parseInt(timestamp as string, 10)
        let timeDifferenceString = '';
        if (timestampNumber > 0) { // timestamp=0 for parser
          const timeDifferenceNumber = (Math.round(Date.now()) - timestampNumber) / 1000;
          if (timeDifferenceNumber / 60 < 1) {
            const seconds = Math.round(timeDifferenceNumber)
            timeDifferenceString = `${seconds} ${this.$t('sentenceCard.second', seconds)}`;
          } else if (timeDifferenceNumber / (60 * 60) < 1) {
            const minutes = Math.round(timeDifferenceNumber / 60);
            timeDifferenceString = `${minutes} ${this.$t('sentenceCard.minute', minutes)}`;
          } else if (timeDifferenceNumber / (60 * 60 * 24) < 1) {
            const hours = Math.round(timeDifferenceNumber / (60 * 60));
            timeDifferenceString = `${hours} ${this.$t('sentenceCard.hour', hours)}`;
          } else if (timeDifferenceNumber / (60 * 60 * 24 * 365) < 1) {
            const days = Math.round(timeDifferenceNumber / (60 * 60 * 24));
            timeDifferenceString = `${days} ${this.$t('sentenceCard.day', days)}`;
          } else {
            const years = Math.round(timeDifferenceNumber / (60 * 60 * 24 * 365));
            timeDifferenceString = `${years} ${this.$t('sentenceCard.year', years)}`;
          }}
          lastModifiedTime[user] = timeDifferenceString;
        }
      return lastModifiedTime;
    },
    showDiffAdmin() {
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
        return Object.fromEntries(Object.entries(filteredConlls).filter(([user]) => user !== 'validated' && user !== 'github'));
      }
      return this.orderConlls(filteredConlls);
    },
    lastValidator() {
      return this.reactiveSentencesObj[this.openTabUser].state.metaJson['validated_by']
    },
    stagedTrees() {
      const githubStore = useGithubStore();
      const stagingMap: {
        [userId: string]: {
          by: string;
          at: string;
          status: 'staged' | 'pushed' | 'pinned';
          pushedBy?: string;
          pushedAt?: string;
        } | undefined;
      } = {};
      for (const userId of Object.keys(this.reactiveSentencesObj)) {
        const stagingInfo = githubStore.getStagingInfo(this.sentence.sent_id, userId);
        stagingMap[userId] = stagingInfo;
      }
      return stagingMap;
    },
    pushedReferenceUserId() {
      const pushedEntry = Object.entries(this.stagedTrees).find(([, info]) => info?.status === 'pushed');
      return pushedEntry ? pushedEntry[0] : '';
    },
    currentDisplayedConll() {
      if (!this.openTabUser || !this.reactiveSentencesObj[this.openTabUser]) {
        return '';
      }

      return this.reactiveSentencesObj[this.openTabUser].exportConll();
    },
    resolvedGithubReferenceConll() {
      return this.githubReferenceConll || (this.sentenceData.conlls.github ?? '');
    },
    hasGithubReferenceForSentence() {
      return !!this.resolvedGithubReferenceConll;
    },
    canDiscardGithubDiff() {
      return (
        !!this.openTabUser
        && this.openTabUser !== 'validated'
        && this.openTabUser !== 'github'
        && this.githubComparison?.status === 'diff'
        && !!this.resolvedGithubReferenceConll
        && !!this.sentenceData.sample_name
      );
    },
    currentTreeStagingInfo() {
      if (!this.openTabUser) {
        return undefined;
      }
      return this.stagedTrees[this.openTabUser];
    },
    githubComparison() {
      if (!this.openTabUser || this.openTabUser === 'validated') {
        return null;
      }

      if (!this.resolvedGithubReferenceConll) {
        return { status: 'missing' };
      }

      if (this.normalizeConllForGithubComparison(this.currentDisplayedConll) === this.normalizeConllForGithubComparison(this.resolvedGithubReferenceConll)) {
        return { status: 'same' };
      }

      return {
        status: 'diff',
        diff: this.buildGithubDiff(this.currentDisplayedConll, this.resolvedGithubReferenceConll),
      };
    },
    githubDiffCount() {
      if (!this.githubComparison || this.githubComparison.status !== 'diff') {
        return 0;
      }

      const diff = diffLines(
        this.normalizeConllForGithubComparison(this.resolvedGithubReferenceConll),
        this.normalizeConllForGithubComparison(this.currentDisplayedConll)
      );

      let count = 0;

      for (let i = 0; i < diff.length; i++) {
        const part = diff[i];

        if (part.removed) {
          const removedLines = part.value
            .split('\n')
            .filter((line) => line !== '').length;

          const nextPart = diff[i + 1];

          if (nextPart?.added) {
            const addedLines = nextPart.value
              .split('\n')
              .filter((line) => line !== '').length;

            count += Math.max(removedLines, addedLines);
            i++;
          } else {
            count += removedLines;
          }
        } else if (part.added) {
          count += part.value
            .split('\n')
            .filter((line) => line !== '').length;
        }
      }

      return count;
    },
  },
  created() {
    const treesStore = useTreesStore();
    for (const [userId, conll] of Object.entries(this.sentence.conlls)) {
      const reactiveSentence = new ReactiveSentence();
      const pendingKey = `${this.sentence.sent_id}_${userId}`;
      const pending = treesStore.pendingModifications.get(pendingKey);
      reactiveSentence.fromSentenceConll(pending ? pending.conll : conll);
      this.reactiveSentencesObj[userId] = reactiveSentence;
      this.hasPendingChanges[userId] = !!pending;
      this.udValidationStatut[userId] = '';
      this.showUdValidation[userId] = false;
    }
    this.diffMode = !!this.diffMode;
  },
  watch: {
    'udValidation': {
      handler: function (newVal) {
        if (this.reloadValidation) {
          for (const user of Object.keys(this.sentence.conlls)) {
            if(newVal[user]) {
              this.udValidationMsg[user] = newVal[user].message;
              this.udValidationStatut[user] = 'negative'
            }
            else {
              this.udValidationMsg[user] = '';
              this.udValidationStatut[user] = 'positive';
            }
          }
        }
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions(useTagsStore, ['removeTag']),
    ...mapActions(useTreesStore, ['removePendingModification']),
    normalizeConllForGithubComparison(conll: string) {
      return conll
        .split('\n')
        .filter((line: string) => !line.startsWith('# user_id =') && !line.startsWith('# timestamp ='))
        .join('\n')
        .trim();
    },
    escapeHtml(text: string) {
      return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    },
    formatRelativeTime(value?: string) {
      if (!value) {
        return 'unknown';
      }

      let date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        const numeric = Number(value);
        if (Number.isFinite(numeric)) {
          const ms = numeric > 1e12 ? numeric : numeric * 1000;
          date = new Date(ms);
        }
      }

      if (Number.isNaN(date.getTime())) {
        return 'unknown';
      }

      const diffMs = Date.now() - date.getTime();
      if (diffMs < 0) {
        return 'a l\'instant';
      }

      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) {
        return `il y a ${diffSec}s`;
      }

      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) {
        return `il y a ${diffMin} min`;
      }

      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) {
        return `il y a ${diffHours} h`;
      }

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 365) {
        return `il y a ${diffDays} j`;
      }

      const diffYears = Math.floor(diffDays / 365);
      return `il y a ${diffYears} an${diffYears > 1 ? 's' : ''}`;
    },
    buildGithubDiff(currentConll: string, githubConll: string) {
      return diffLines(
        this.normalizeConllForGithubComparison(githubConll),
        this.normalizeConllForGithubComparison(currentConll)
      )
        .flatMap((part) => {
          const lines = part.value.split('\n');
          if (lines[lines.length - 1] === '') {
            lines.pop();
          }

          const rowClass = part.added
            ? 'github-diff-line github-diff-line--added'
            : part.removed
            ? 'github-diff-line github-diff-line--removed'
            : 'github-diff-line github-diff-line--same';

          const prefix = part.added ? '+' : part.removed ? '-' : '&nbsp;';

          return lines.map((line) => {
            const escapedLine = this.escapeHtml(line || ' ');
            return `<div class="${rowClass}"><span class="github-diff-prefix">${prefix}</span><span class="github-diff-content">${escapedLine}</span></div>`;
          });
        })
        .join('');
    },
    getTabAlertColor(user: string) {
      if (this.hasPendingChanges[user]) {
        return 'orange';
      }

      if (user !== 'validated' && this.stagedTrees[user]) {
        return this.stagedTrees[user]?.status === 'staged' ? 'warning' : 'positive';
      }

      if (this.isTreeEqualToGithub(user)) {
        return 'positive';
      }

      return '';
    },
    getTabAlertIcon(user: string) {
      if (this.hasPendingChanges[user]) {
        return 'save';
      }

      if (user !== 'validated' && this.stagedTrees[user]) {
        return this.stagedTrees[user]?.status === 'staged' ? 'cloud_upload' : 'cloud_done';
      }

      if (this.isTreeEqualToGithub(user)) {
        return 'cloud_done';
      }

      return '';
    },
    getTabIcon(user: string) {
      if (this.diffMode && user === this.diffUserId) {
        return 'school';
      }

      if (this.isDraftUser(user)) {
        return 'edit_note';
      }

      return this.hasGithubReferenceForSentence ? 'person_add' : 'person';
    },
    isDraftUser(user: string) {
      return !!user && user.includes('_draft');
    },
    isOwnDraftUser(user: string) {
      return !!user && user.startsWith(`${this.username}_draft`);
    },
    isTreeEqualToGithub(user: string) {
      if (!this.resolvedGithubReferenceConll || user === 'validated' || user === 'github') {
        return false;
      }

      const userConll = user === this.openTabUser && this.reactiveSentencesObj[user]
        ? this.reactiveSentencesObj[user].exportConll()
        : (this.sentenceData.conlls[user] ?? '');

      return this.normalizeConllForGithubComparison(userConll)
        === this.normalizeConllForGithubComparison(this.resolvedGithubReferenceConll);
    },
    discardChangesToGithubReference() {
      const openedTreeUser = this.openTabUser;

      if (!openedTreeUser || openedTreeUser === 'validated' || openedTreeUser === 'github') {
        return;
      }

      if (!this.sentenceData.sample_name || !this.resolvedGithubReferenceConll) {
        return;
      }

      const restoredConll = this.resolvedGithubReferenceConll
        .split('\n')
        .map((line: string) => {
          if (line.startsWith('# user_id =')) {
            return `# user_id = ${openedTreeUser}`;
          }
          if (line.startsWith('# timestamp =')) {
            return `# timestamp = ${Math.round(Date.now())}`;
          }
          return line;
        })
        .join('\n');

      api
        .updateTree(this.$route.params.projectname as string, this.sentenceData.sample_name, {
          conll: restoredConll,
          userId: openedTreeUser,
          updateCommit: true,
          sentId: this.sentenceData.sent_id,
        })
        .then((response) => {
          const githubStore = useGithubStore();
          const newConll = response.data?.new_conll ?? restoredConll;

          this.removePendingModification(`${this.sentence.sent_id}_${openedTreeUser}`);
          this.hasPendingChanges[openedTreeUser] = false;
          this.sentenceData.conlls[openedTreeUser] = newConll;
          this.reactiveSentencesObj[openedTreeUser].fromSentenceConll(newConll);
          this.sentenceBus.emit('action:saved', {
            userId: openedTreeUser,
          });

          const clearLocalStagingState = () => {
            githubStore.clearStaging(this.sentenceData.sent_id, openedTreeUser);
            this.reloadCommits += 1;
          };

          if (this.currentTreeStagingInfo?.status === 'staged') {
            api
              .unstageTree(this.$route.params.projectname as string, {
                sample_name: this.sentenceData.sample_name,
                sent_id: this.sentenceData.sent_id,
                tree_user_id: openedTreeUser,
              })
              .then(() => {
                clearLocalStagingState();
              })
              .catch((error) => {
                clearLocalStagingState();
                notifyError({ error, caller: 'SentenceCard.discardChangesToGithubReference.unstageTree' });
              });
          } else {
            clearLocalStagingState();
          }

          this.validateUdTree(newConll);
          notifyMessage({
            position: 'top',
            message: 'Changes discarded and tree restored to GitHub state',
            icon: 'undo',
            type: 'positive',
          });
        })
        .catch((error) => {
          notifyError({ error, caller: 'SentenceCard.discardChangesToGithubReference' });
        });
    },
    createDraftFromCurrentTree() {
      const sourceUser = this.openTabUser;

      if (!sourceUser || sourceUser === 'github' || !this.sentenceData.sample_name) {
        return;
      }

      const sourceConll = this.reactiveSentencesObj[sourceUser]
        ? this.reactiveSentencesObj[sourceUser].exportConll()
        : (this.sentenceData.conlls[sourceUser] ?? '');

      if (!sourceConll) {
        return;
      }

      const draftPrefix = `${this.username}_draft`;
      const existingDraftIndexes = Object.keys(this.sentenceData.conlls)
        .filter((userId) => userId.startsWith(draftPrefix))
        .map((userId) => Number(userId.slice(draftPrefix.length)))
        .filter((n) => Number.isFinite(n));
      const nextDraftIndex = existingDraftIndexes.length ? Math.max(...existingDraftIndexes) + 1 : 1;
      const draftUserId = `${draftPrefix}${nextDraftIndex}`;

      let hasUserId = false;
      let hasTimestamp = false;
      const draftConllLines = sourceConll.split('\n').map((line: string) => {
        if (line.startsWith('# user_id =')) {
          hasUserId = true;
          return `# user_id = ${draftUserId}`;
        }
        if (line.startsWith('# timestamp =')) {
          hasTimestamp = true;
          return `# timestamp = ${Math.round(Date.now())}`;
        }
        return line;
      });
      if (!hasUserId) {
        draftConllLines.unshift(`# user_id = ${draftUserId}`);
      }
      if (!hasTimestamp) {
        draftConllLines.unshift(`# timestamp = ${Math.round(Date.now())}`);
      }
      const draftConll = draftConllLines.join('\n');

      api
        .updateTree(this.$route.params.projectname as string, this.sentenceData.sample_name, {
          conll: draftConll,
          userId: draftUserId,
          updateCommit: true,
          sentId: this.sentenceData.sent_id,
        })
        .then((response) => {
          const newConll = response.data?.new_conll ?? draftConll;
          this.sentenceData.conlls[draftUserId] = newConll;

          const reactiveSentence = new ReactiveSentence();
          reactiveSentence.fromSentenceConll(newConll);
          this.reactiveSentencesObj[draftUserId] = reactiveSentence;

          this.hasPendingChanges[draftUserId] = false;
          this.udValidationStatut[draftUserId] = '';
          this.udValidationMsg[draftUserId] = '';
          this.udValidationPassed[draftUserId] = false;
          this.showUdValidation[draftUserId] = false;

          this.openTabUser = draftUserId;
          this.reloadCommits += 1;
          notifyMessage({
            position: 'top',
            message: `Draft ${draftUserId} created`,
            icon: 'edit_note',
            type: 'positive',
          });
        })
        .catch((error) => {
          notifyError({ error, caller: 'SentenceCard.createDraftFromCurrentTree' });
        });
    },
    deleteCurrentDraft() {
      const draftUserId = this.openTabUser;

      if (!draftUserId || !this.isOwnDraftUser(draftUserId) || !this.sentenceData.sample_name) {
        return;
      }

      api
        .deleteSentenceDraftTree(this.$route.params.projectname as string, this.sentenceData.sample_name, {
          sentId: this.sentenceData.sent_id,
          userId: draftUserId,
        })
        .then(() => {
          const githubStore = useGithubStore();
          this.removePendingModification(`${this.sentence.sent_id}_${draftUserId}`);
          githubStore.clearStaging(this.sentence.sent_id, draftUserId);

          delete this.sentenceData.conlls[draftUserId];
          delete this.reactiveSentencesObj[draftUserId];
          delete this.hasPendingChanges[draftUserId];
          delete this.udValidationStatut[draftUserId];
          delete this.udValidationMsg[draftUserId];
          delete this.udValidationPassed[draftUserId];
          delete this.showUdValidation[draftUserId];

          this.openTabUser = this.username in this.reactiveSentencesObj ? this.username : '';
          this.reloadCommits += 1;
          notifyMessage({
            position: 'top',
            message: `Draft ${draftUserId} deleted`,
            icon: 'delete',
            type: 'positive',
          });
        })
        .catch((error) => {
          notifyError({ error, caller: 'SentenceCard.deleteCurrentDraft' });
        });
    },
    handleStatusChange(event: { canUndo: boolean; canRedo: boolean }) {
      this.canUndo = event.canUndo;
      this.canRedo = event.canRedo;
    },
    removeSentenceTag(tag: string) {
      this.removeTag(this.sentenceData, tag, this.sentenceBus, this.openTabUser);
    },
    save(mode: string, options?: { gitAdd?: boolean }) {
      const gitAdd = options?.gitAdd || false;
      const openedTreeUser = this.openTabUser;
      let changedConllUser = openedTreeUser;
      let updateCommit = true;
      if (mode) changedConllUser = mode;

      if (!mode && !gitAdd && this.reactiveSentencesObj[this.openTabUser].exportConll() === this.sentenceData.conlls[this.openTabUser].trim()) {
        updateCommit = false;
      }

      const metaToReplace = {
        user_id: changedConllUser,
        timestamp: Math.round(Date.now()),
      };

      const exportedConll = this.reactiveSentencesObj[openedTreeUser].exportConllWithModifiedMeta(metaToReplace);

      const data: any = {
        conll: exportedConll,
        userId: changedConllUser,
        updateCommit: updateCommit,
        sentId: this.sentenceData.sent_id,
      };

      if (gitAdd) {
        data.gitAdd = true;
      }

      if (!this.sentence.sample_name) {
        return;
      }
      api
        .updateTree(this.$route.params.projectname as string, this.sentence.sample_name, data)
        .then((response) => {
          if (response.status === 200) {
            const githubStore = useGithubStore();
            this.sentenceBus.emit('action:saved', {
              userId: this.openTabUser,
            });
            const newConll = response.data.new_conll;
            this.removePendingModification(`${this.sentence.sent_id}_${this.openTabUser}`);
            this.reloadCommits += 1;
            if (this.sentenceData.conlls[changedConllUser]) {
              this.hasPendingChanges[changedConllUser] = false;
              this.sentenceData.conlls[changedConllUser] = newConll;
              this.reactiveSentencesObj[changedConllUser].fromSentenceConll(newConll);
            } else {
              this.sentenceData.conlls[changedConllUser] = newConll;
              this.reactiveSentencesObj[changedConllUser] = new ReactiveSentence();
            }

            if (this.openTabUser !== changedConllUser) {
              this.reactiveSentencesObj[this.openTabUser].fromSentenceConll(this.sentenceData.conlls[this.openTabUser]);
              this.sentenceText = this.reactiveSentencesObj[this.openTabUser].state.metaJson.text as string;
              this.openTabUser = changedConllUser;
              this.exportedConll = newConll;
            }
            if (this.sentenceData.sent_id !== sentenceConllToJson(newConll).metaJson.sent_id ) {
              this.reloadTrees = true;
            }

            if (gitAdd && response.data.staged) {
              githubStore.setStagingInfo(
                this.sentence.sent_id,
                changedConllUser,
                response.data.staged_by,
                response.data.staged_at
              );
              notifyMessage({
                position: 'top',
                message: ' Staged for next push',
                icon: 'cloud_upload',
                type: 'positive'
              });
            } else {
              githubStore.clearStaging(this.sentence.sent_id, changedConllUser);
              notifyMessage({ position: 'top', message: 'Saved on the server', icon: 'save' });
            }
            this.validateUdTree(newConll);
          }
        })
        .catch((error) => {
          if (error.response?.status === 409) {
            notifyError({ error, caller: 'SentenceCard.save' });
          } else {
            notifyError({ error, caller: 'SentenceCard.save' });
          }
        });
    },
    validateUdTree(conll: string) {
      const data = { conll: conll };
      api
        .validateTree(this.name, data)
        .then((response) => {
          if (response.data) {
            if (response.data.passed) {
              this.udValidationStatut[this.openTabUser] = response.data.message !== '' ? 'warning' : 'positive';
            }
            else {
              this.udValidationStatut[this.openTabUser] = 'negative';
            }
            this.udValidationMsg[this.openTabUser] = response.data.message;
            this.udValidationPassed[this.openTabUser] = response.data.passed;
          }
        })
        .catch((error) => {
          notifyError({ error, caller: 'validateTree' });
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
      
      this.$nextTick(() => {
        const element = this.$el as HTMLElement;
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
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
    canEditTree(userId: string) {
      return !!userId && (userId === this.username || this.isOwnDraftUser(userId)) && userId !== 'validated' && userId !== 'github';
    },
    orderConlls(filteredConlls: { [key: string]: string }) {
      const userAndTimestamps = [];
      for (const [user, reactiveSentence] of Object.entries(this.reactiveSentencesObj)) {
        userAndTimestamps.push({
          user,
          timestamp: parseInt(reactiveSentence.state.metaJson.timestamp as string, 10),
        });
      }
      const orderedUserAndTimestamps = [...userAndTimestamps].sort((a, b) => b.timestamp - a.timestamp);
      const orderedConlls: { [key: string]: string } = {};
      if (filteredConlls.github) {
        orderedConlls.github = filteredConlls.github;
      }
      if (filteredConlls.validated) {
        orderedConlls.validated = filteredConlls.validated;
      }
      for (const userAndTimestamp of orderedUserAndTimestamps) {
        if (userAndTimestamp.user === 'validated' || userAndTimestamp.user === 'github') {
          continue;
        }
        orderedConlls[userAndTimestamp.user] = filteredConlls[userAndTimestamp.user];
      }
      return orderedConlls;
    },
    leftClickHandler(user: string) {
      if (this.openTabUser === user) {
        this.openTabUser = '';
      } else {
        this.openTabUser = user
        this.$emit('closeCards')
      }
    },
    synchronizeScroll(event: Event) {
      this.horizontalScrollPos = (event.target as HTMLElement).scrollLeft;
    },
    removeUserTag(tag: string) {
      this.removeTag(this.sentenceData, tag, this.sentenceBus, this.openTabUser);
    },
    closeCard(){
      this.openTabUser = ''
    }
  },
});
</script>
<style scoped>
.scrollable {
  overflow-x: auto;
}
.clickable:hover {
  cursor: pointer;
}
.github-diff-pre {
  white-space: normal;
  margin: 0;
  overflow-x: auto;
}
.github-status-info {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 4px;
}
.github-status-info--missing {
  color: #8a4b00;
  background: #ffefcc;
  border: 1px solid #ffd9a1;
}
.github-status-info--same {
  color: #1b5e20;
  background: #e8f5e9;
  border: 1px solid #b7e1bb;
}
:deep(.github-diff-line) {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
  font-size: 12px;
  line-height: 1.5;
  padding: 1px 6px;
  border-radius: 3px;
}
:deep(.github-diff-prefix) {
  text-align: center;
  user-select: none;
  opacity: 0.9;
}
:deep(.github-diff-content) {
  white-space: pre-wrap;
  word-break: break-word;
}
:deep(.github-diff-line--added) {
  color: #1b5e20;
  background: #e8f5e9;
}
:deep(.github-diff-line--removed) {
  color: #b71c1c;
  background: #ffebee;
}
:deep(.github-diff-line--same) {
  color: #455a64;
  background: transparent;
}
.staged-alert-left :deep(.q-tab__alert),
.staged-alert-left :deep(.q-tab__alert-icon) {
  left: 0px !important;
  right: auto !important;
  inset-inline-start: 0px !important;
  inset-inline-end: auto !important;
}
.github-diff-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  user-select: none;
  color: var(--q-primary);
}

.github-diff-toggle:hover {
  background: #e0e0e0;
}
</style>
