<template>
  <q-card style="min-height: 80vh" bordered flat>
    <q-card-section>
      <div class="text-h6 q-mb-md">{{ $t('lexicon.lexiconTitle') }}</div>
      <div class="row q-gutter-md">
        <div class="col">
          <q-select
            dense
            v-model="principalFeatures"
            outlined
            multiple
            :options="principalFeatureOptions"
            use-chips
            stack-label
            :label="$t('lexicon.similarFeatures')"
          />
        </div>
        <div class="col">
          <q-select
            dense
            :disable="!principalFeatures.length"
            v-model="secondaryFeatures"
            outlined
            multiple
            :options="secondaryFeatureOptions"
            use-chips
            stack-label
            :label="$t('lexicon.ambiguousFeatures')"
          />
        </div>
        <div class="col-6">
          <TreesTypeSelect grew-option="REWRITE" :samples="samples" @selected-value="getSelectedValues" />
        </div>
        <div class="col">
          <q-btn :disable="!principalFeatures.length" color="primary" label="Generate lexicon" @click="fetchLexicon_"></q-btn>
        </div>
      </div>
    </q-card-section>
    <q-card-section v-if="isShowLexiconTable" class="q-gutter-md">
      <LexiconModificationDialog :features="features" v-if="lexiconItems.length >= 1" />
      <div v-if="lexiconItemsModified.length >= 1">
        <q-btn outline color="primary" icon="refresh" @click="fetchLexicon_()">reload</q-btn>
      </div>
      <LexiconTableBase
        v-show="lexiconItemsModified.length >= 1"
        title="Modified Lexicon"
        :compare-with-before="true"
        :passed-lexicon-items="lexiconItemsModified"
        :lexicon-loading="false"
        :features="features"
        :lexicon-type="data.treeType"
        :sample-ids="sampleNames"
      ></LexiconTableBase>
      <LexiconTableBase
        title="Lexicon"
        :compare-with-before="false"
        :passed-lexicon-items="lexiconItems"
        :lexicon-loading="lexiconLoading"
        :features="features"
        :key="features.length"
        :lexicon-type="data.treeType"
        :sample-ids="sampleNames"
      >
      </LexiconTableBase>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import LexiconModificationDialog from './LexiconModificationDialog.vue';
import LexiconTableBase from './LexiconTableBase.vue';
import TreesTypeSelect from '../shared/TreesTypeSelect.vue';

import { mapActions, mapState, mapWritableState } from 'pinia';
import { useLexiconStore } from 'src/pinia/modules/lexicon';
import { useProjectStore } from 'src/pinia/modules/project';
import { PropType, defineComponent } from 'vue';
import { sample_t } from 'src/api/backend-types';
import { notifyMessage } from 'src/utils/notify';

export default defineComponent({
  name: 'LexiconMain',
  props: {
    samples: {
      type: Object as PropType<sample_t[]>,
      default: [],
    },
  },
  components: {
    LexiconTableBase,
    LexiconModificationDialog,
    TreesTypeSelect,
  },
  data() {
    const features: string[] = [];
    const data: { selectedSamples: string[]; treeType: string; otherUser: string } = { selectedSamples: [], treeType: 'recent', otherUser: '' };
    return {
      features,
      isShowLexiconTable: false,
      data,
    };
  },
  computed: {
    ...mapState(useProjectStore, ['name', 'annotationFeatures']),
    ...mapState(useLexiconStore, ['lexiconItems', 'lexiconLoading', 'lexiconItemsModified', 'principalFeatures', 'secondaryFeatures']),
    ...mapWritableState(useLexiconStore, ['principalFeatures', 'secondaryFeatures']),
    principalFeatureOptions() {
      return ['form', 'lemma', 'upos', 'Gloss'].concat(Object.values(this.annotationFeatures.FEATS).map((value) => value.name));
    },
    secondaryFeatureOptions() {
      return this.principalFeatureOptions.filter((value) => !this.principalFeatures.includes(value));
    },
    sampleNames() {
      return this.samples.map((sample) => sample.sampleName);
    }
  },
  methods: {
    ...mapActions(useLexiconStore, ['fetchLexicon']),
    fetchLexicon_() {
      let prune: number;

      this.features = this.principalFeatures.concat(this.secondaryFeatures);
      if (this.secondaryFeatures.length != 0) {
        prune = this.principalFeatures.length;
        this.displayMessage();
      } else {
        prune = 0;
      }
      const data = { 
        sampleNames: this.data.selectedSamples, 
        lexiconType: this.data.treeType,
        otherUser: this.data.otherUser, 
        features: this.features, 
        prune: prune 
      };
      this.fetchLexicon(this.name, data);
      this.isShowLexiconTable = true;
    },
    getSelectedValues(val: any) {
      this.data = val;
    },
    displayMessage() {
      let message = 'We search all lexicon entries that have the same ';
      this.principalFeatures.forEach((element) => {
        message += `"${element}", `;
      });
      message += 'and different ';
      this.secondaryFeatures.forEach((element) => {
        message += `"${element}", `;
      });
      notifyMessage({ message: message, position: 'top', timeout: 3000, });
    },
  },
});
</script>
