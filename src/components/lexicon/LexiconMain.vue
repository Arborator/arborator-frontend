<template>
  <q-card flat bordered>
    <q-card-section v-if="isShowLexiconFeatures">
      <div class="text-h6 q-mb-md">{{ $t('projectView.lexicon[0]') }}</div>
      <div class="row q-gutter-md">
        <div class="col-5">
          <q-select
            style="text-transform: capitalize"
            v-model="principalFeatures"
            filled
            multiple
            :options="principalFeatureOptions"
            :option-label="(feature) => feature.charAt(0).toUpperCase() + feature.slice(1)"
            use-chips
            stack-label
            :label="$t('projectView.lexicon[1]')"
          />
        </div>
        <div class="col-5">
          <q-select
            :disable="principalFeatures.length === 0"
            v-model="secondaryFeatures"
            filled
            multiple
            :options="secondaryFeatureOptions"
            :option-label="(feature) => feature.charAt(0).toUpperCase() + feature.slice(1)"
            use-chips
            stack-label
            :label="$t('projectView.lexicon[2]')"
          />
        </div>
        <div>
          <q-tooltip content-class="bg-white text-primary">{{ $t('projectView.lexicon[7]') }}</q-tooltip>
          <q-btn-dropdown class="float-right" size="md" outline color="primary" label=" get Lexicon">
            <q-list>
              <q-item v-close-popup clickable @click="fetchLexicon_('user')">
                <q-item-section avatar>
                  <q-avatar v-if="isLoggedIn" size="1.2rem">
                    <img :src="avatar" />
                  </q-avatar>
                  <q-icon v-else name="account_circle" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('projectView.lexicon[3]') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-close-popup clickable @click="fetchLexicon_('user_recent')">
                <q-item-section avatar>
                  <q-avatar v-if="isLoggedIn" size="1.2rem">
                    <img :src="avatar" />
                    <q-badge floating transparent color="principal">+</q-badge>
                  </q-avatar>
                  <q-icon v-else name="account_circle" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('projectView.lexicon[4]') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="isAdmin || isSuperAdmin" v-close-popup clickable @click="fetchLexicon_('recent')">
                <q-item-section avatar>
                  <q-icon name="schedule" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('projectView.lexicon[5]') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>
    </q-card-section>
    <q-card-section v-if="isShowLexiconTable">
      <LexiconModificationDialog v-if="lexiconItems.length >= 1" />
      <LexiconTableBase
        v-show="lexiconItemsModified.length >= 1"
        title="Modified Lexicon"
        :compare-with-before="true"
        :passed-lexicon-items="lexiconItemsModified"
        :lexicon-loading="false"
        :features="features"
        :key="features.length"
      ></LexiconTableBase>
      <LexiconTableBase
        title="Lexicon"
        :compare-with-before="false"
        :passed-lexicon-items="lexiconItems"
        :lexicon-loading="lexiconLoading"
        :features="features"
        :key="features.length"
        :lexicon-type="lexiconType"
      >
      </LexiconTableBase>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import LexiconTableBase from './LexiconTableBase.vue';
import LexiconModificationDialog from './LexiconModificationDialog.vue';

import { mapState, mapActions } from 'pinia';
import { useLexiconStore } from 'src/pinia/modules/lexicon';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { sample_t } from 'src/api/backend-types';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'LexiconMain',
  props: {
    sampleId: {
      type: Object as PropType<sample_t[]>,
      default: [],
    },
  },
  components: {
    LexiconTableBase,
    LexiconModificationDialog,
  },
  data() {
    const principalFeatures: string[] = [];
    const secondaryFeatures: string[] = [];
    const features: string[] = [];
    return {
      lexiconType: '',
      principalFeatures,
      secondaryFeatures,
      features,
      isShowLexiconTable: false,
      isShowLexiconFeatures: true,
    };
  },
  computed: {
    ...mapState(useProjectStore, ['annotationFeatures', 'isAdmin']),
    ...mapState(useUserStore, ['isLoggedIn', 'isSuperAdmin', 'avatar']),
    ...mapState(useLexiconStore, ['lexiconItems', 'lexiconLoading', 'lexiconItemsModified']),
    projectName() {
      return this.$route.params.projectname;
    },
    principalFeatureOptions() {
      return ['form', 'lemma', 'upos', 'Gloss'].concat(Object.values(this.annotationFeatures.FEATS).map((value) => value.name));
    },
    secondaryFeatureOptions() {
      return this.principalFeatureOptions.filter((value) => !this.principalFeatures.includes(value));
    },
  },
  methods: {
    ...mapActions(useLexiconStore, ['fetchLexicon']),

    fetchLexicon_(lexiconType: string) {
      const samplenames = [];
      let prune: number;

      for (const sample of this.sampleId) {
        samplenames.push(sample.sample_name);
      }
      this.features = this.principalFeatures.concat(this.secondaryFeatures);
      this.secondaryFeatures.length != 0 ? (prune = this.principalFeatures.length) : (prune = 0);

      const data = { samplenames: samplenames, lexiconType: lexiconType, features: this.features, prune: prune };
      this.fetchLexicon(this.projectName as string, data);
      this.lexiconType = lexiconType
      this.isShowLexiconFeatures = false;
      this.isShowLexiconTable = true;
    },
  },
});
</script>
<style></style>
