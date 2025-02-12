<template>
  <q-bar class="row items-center custom-frame1">
    <span class="text-grey" style="padding-left: 10px">{{ index + 1 }}</span>
    <q-chip class="text-center" :color="$q.dark.isActive ? 'grey' : ''" dense> {{ sentenceData.sent_id }} </q-chip>&nbsp;&nbsp;&nbsp;
    <q-input
      v-model="recentTreeText"
      :style="openTabUser === '' ? 'width: 100%' : 'width: 65%'"
      class="row items-center justify-center"
      v-bind="$attrs"
      readonly
      borderless
    >
      <q-tooltip v-if="openTabUser !== ''" anchor="bottom middle" self="center middle" :offset="[10, 10]">
        {{ $t('sentenceCard.selectTooltip') }}
      </q-tooltip>
    </q-input>
    <q-space />

    <template v-if="openTabUser !== ''">
      <q-btn
        v-if="isLoggedIn && blindAnnotationLevel <= 3 && !isValidator"
        flat
        round
        dense
        icon="assessment"
        :disable="openTabUser === ''"
        @click="openStatisticsDialog"
      >
        <q-tooltip>{{ $t('sentenceCard.annotationErrors') }}</q-tooltip>
      </q-btn>

      <q-btn v-if="isValidator" flat round dense icon="verified" :disable="openTabUser === ''" @click="saveTree('validated')">
        <q-tooltip>{{ $t('sentenceCard.validateTree') }}</q-tooltip>
      </q-btn>

      <q-btn
        v-if="isValidator && blindAnnotationMode"
        flat
        round
        dense
        icon="linear_scale"
        :disable="openTabUser === ''"
        @click="saveTree('base_tree')"
      >
        <q-tooltip>{{ $t('sentenceCard.saveBaseTree') }}</q-tooltip>
      </q-btn>

      <q-btn v-if="isBernardCaron" flat round dense icon="face" :disable="openTabUser === ''" @click="saveTree(EMMETT)">
        <q-tooltip>Save as Emmett</q-tooltip>
      </q-btn>

      <q-btn v-if="canSaveTreeInProject && collaborativeMode" flat round dense icon="save" :disable="openTabUser === ''" @click="saveTree('')">
        <q-tooltip>
          {{ $t('sentenceCard.saveTree[0]') }} {{ openTabUser }} {{ $t('sentenceCard.saveTree[1]') }}
          <b> {{ username }} </b>
        </q-tooltip>
      </q-btn>

      <q-btn
        v-if="canSaveTreeInProject && (openTabUser === username || isValidator)"
        flat
        round
        dense
        icon="bookmark"
        :disable="openTabUser === ''"
      >
        <TagsMenu
          :sampleName="(sentenceData.sample_name as string)"
          :reactive-sentences-obj="reactiveSentencesObj"
          :sentence-bus="sentenceBus"
          :open-tab-user="openTabUser"
          :sentence="sentenceData"
        />
        <q-tooltip>{{ $t('sentenceCard.addTag') }}</q-tooltip>
      </q-btn>

      <q-btn
        v-if="isValidator && blindAnnotationMode"
        flat
        round
        dense
        icon="filter_9_plus"
        :disable="openTabUser === ''"
        @click="openMultiEditDialog"
      >
        <q-tooltip>{{ $t('sentenceCard.multiEditDial') }}</q-tooltip>
      </q-btn>

      <q-btn-dropdown :disable="openTabUser === ''" icon="more_vert" flat dense>
        <q-list>
          <q-item v-if="canSaveTreeInProject" v-close-popup clickable @click="openMetaDialog()">
            <q-item-section avatar>
              <q-avatar icon="edit" color="primary" text-color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ $t('sentenceCard.editMetadata') }}
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

          <q-item v-if="!blindAnnotationMode" v-close-popup clickable @click="toggleDiffMode()">
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
          <q-item v-if="canChangeSegmentation && !isFirstSentence" v-close-popup clickable @click="chooseSegmentationOption('MERGE_BEFORE')">
            <q-item-section avatar>
              <q-avatar icon="arrow_back" color="primary" text-color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label> Merge before </q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="canChangeSegmentation && !isLastSentence" v-close-popup clickable @click="chooseSegmentationOption('MERGE_AFTER')">
            <q-item-section avatar>
              <q-avatar icon="arrow_forward" color="primary" text-color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label> Merge After </q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="canChangeSegmentation" v-close-popup clickable @click="chooseSegmentationOption('SPLIT')">
            <q-item-section avatar>
              <q-avatar icon="content_cut" color="primary" text-color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label> Split sentence </q-item-label>
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
              <q-avatar icon="image" color="primary" text-color="white" />
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
  <template>
    <SentenceSegmentation
      v-if="showSentSegmentationDial"
      :sentence-bus="sentenceBus"
      :reactive-sentences-obj="reactiveSentencesObj"
      :user-id="openTabUser"
      :sample-name="(sentenceData.sample_name as string)"
      :segmentation-option="sentenceSegmentationOption"
      @closed="showSentSegmentationDial = false"
    />
  </template>
</template>

<script lang="ts">
import TagsMenu from './TagsMenu.vue';
import SentenceSegmentation from './SentenceSegmentation.vue';

import  { sentenceConllToJson } from 'conllup/lib/conll';

import { mapState, mapWritableState, mapActions } from 'pinia';
import { grewSearchResultSentence_t } from 'src/api/backend-types';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { useGithubStore } from 'src/pinia/modules/github';
import { useTreesStore } from 'src/pinia/modules/trees';

import { reactive_sentences_obj_t, sentence_bus_t } from 'src/types/main_types';
import { defineComponent, PropType } from 'vue';


export default defineComponent({
  name: 'sentenceToolBar',
  components: {
    TagsMenu,
    SentenceSegmentation,
  },
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
    reactiveSentencesObj: {
      type: Object as PropType<reactive_sentences_obj_t>,
      required: true,
    },
    index: {
      type: Number as PropType<number>,
      required: true,
    }, 
    blindAnnotationLevel: {
      type: Number as PropType<number>,
      required: true,
    },
    openTabUser: {
      type: String as PropType<string>,
      required: true,
    },
    sentenceData: {
      type: Object as PropType<grewSearchResultSentence_t>,
      required: true,
    },
    parentOnSave: {
      type: Function as PropType<CallableFunction>,
      required: true,
    },
    canUndo: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    canRedo: {
      type: Boolean as PropType<boolean>,
      required: true,
    }
  },
  data() {
    return {
      EMMETT: 'emmett.strickland',
      showSentSegmentationDial: false,
      sentenceSegmentationOption: '',
    }
  },
  computed: {
    ...mapWritableState(useGithubStore, ['reloadCommits']),
    ...mapState(useProjectStore, [
      'isAdmin',
      'isValidator', 
      'blindAnnotationMode', 
      'canSaveTreeInProject', 
      'diffMode',
      'diffUserId',
      'collaborativeMode'
    ]),
    ...mapState(useUserStore, ['username', 'isLoggedIn']),
    ...mapState(useTreesStore, ['sortedSentIds']),
    isBernardCaron() {
      return this.username === 'bernard.l.caron' || this.username === 'kirianguiller';
    },
    sampleName() {
      return this.$route.params.samplename as string;
    },
    recentTreeText() {
      if (this.openTabUser === '') {
        return this.sentenceData.sentence;
      }
      else {
        const sentenceJson = sentenceConllToJson(this.reactiveSentencesObj[this.openTabUser].exportConll());
        return this.generateNewMetaText(sentenceJson).text;
      }
    },
    canChangeSegmentation() {
      return this.isValidator && this.$route.params.samplename !== undefined // sentence segmentation option is available only in the sample view and only for validator
    },
    isFirstSentence() {
      return this.sortedSentIds[0] === this.sentenceData.sent_id;
    },
    isLastSentence() {
      return this.sortedSentIds[this.sortedSentIds.length - 1] === this.sentenceData.sent_id;
    }
  }, 
  methods: {
    ...mapActions(useTreesStore, ['generateNewMetaText']),
    openStatisticsDialog() {
      this.sentenceBus.emit('open:statisticsDialog', {
        userId: this.openTabUser,
      });
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
    openConllDialog() {
      this.sentenceBus.emit('open:conlluDialog', { userId: this.openTabUser });
    },
    openMetaDialog() {
      this.sentenceBus.emit('open:metaDialog', { userId: this.openTabUser });
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
    toggleDiffMode() {
      this.diffMode = !this.diffMode;
      if (!this.diffUserId) {
        this.diffUserId = this.openTabUser;
      }
    },
    saveTree(mode: string) {
      this.parentOnSave(mode);
    },
    chooseSegmentationOption(option: string) {
      this.showSentSegmentationDial = true;
      this.sentenceSegmentationOption = option;
    }
  }
});
</script>