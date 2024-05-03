<template>
  <q-card flat>
    <q-card-section v-if="isShowLexiconFeatures">
      <div class="text-h6 q-mb-md">{{ $t('lexicon.lexiconTitle') }}</div>
      <div class="row q-gutter-md">
        <div class="col-3">
          <q-select
            v-model="selectedSamples"
            outlined
            multiple
            :options="sampleIds"
            use-chips
            stack-label
            label="Select samples"
          />
        </div>
        <div class="col-3">
          <q-select
            v-model="principalFeatures"
            outlined
            multiple
            :options="principalFeatureOptions"
            use-chips
            stack-label
            :label="$t('lexicon.similarFeatures')"
          />
        </div>
        <div class="col-3">
          <q-select
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
        <div>
          <q-tooltip content-class="bg-white text-primary">{{ $t('lexicon.selectTreeType') }}</q-tooltip>
          <q-btn-dropdown :disable="!principalFeatures.length || !selectedSamples.length" class="float-right" size="md" outline color="primary" label=" get Lexicon">
            <q-list>
              <q-item v-if="canSaveTreeInProject" v-close-popup clickable @click="fetchLexicon_('user')">
                <q-item-section avatar>
                  <q-avatar v-if="isLoggedIn" size="1.2rem">
                    <img :src="avatar"  alt="avatar">
                  </q-avatar>
                  <q-icon v-else name="account_circle" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('lexicon.lexiconOptions[0]') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-close-popup v-if="canSeeOtherUsersTrees && canSaveTreeInProject" clickable @click="fetchLexicon_('user_recent')">
                <q-item-section avatar>
                  <q-avatar v-if="isLoggedIn" size="1.2rem">
                    <img :src="avatar" alt="avatar"/>
                    <q-badge floating transparent color="principal">+</q-badge>
                  </q-avatar>
                  <q-icon v-else name="account_circle" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('lexicon.lexiconOptions[1]') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="canSeeOtherUsersTrees" v-close-popup clickable @click="fetchLexicon_('all')">
                <q-item-section avatar>
                  <q-icon name="groups" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('lexicon.lexiconOptions[2]') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="canSeeOtherUsersTrees" v-close-popup clickable @click="fetchLexicon_('recent')">
                <q-item-section avatar>
                  <q-icon name="schedule" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('lexicon.lexiconOptions[3]') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="canSeeOtherUsersTrees" v-close-popup clickable @click="fetchLexicon_('validated')">
                <q-item-section avatar>
                  <q-icon name="verified" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('lexicon.lexiconOptions[4]') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>
    </q-card-section>
    <q-card-section v-if="isShowLexiconTable" class="q-gutter-md">
      <LexiconModificationDialog :features="features" v-if="lexiconItems.length >= 1" />
      <div v-if="lexiconItemsModified.length >= 1">
        <q-btn outline color="primary" icon="refresh" @click="fetchLexicon_(lexiconType)"> reload</q-btn>
      </div>
      <LexiconTableBase
        v-show="lexiconItemsModified.length >= 1"
        title="Modified Lexicon"
        :compare-with-before="true"
        :passed-lexicon-items="lexiconItemsModified"
        :lexicon-loading="false"
        :features="features"
        :key="lexiconItemsModified.length"
        :lexicon-type="lexiconType"
        :sample-ids="sampleIds"
      ></LexiconTableBase>
      <LexiconTableBase
        title="Lexicon"
        :compare-with-before="false"
        :passed-lexicon-items="lexiconItems"
        :lexicon-loading="lexiconLoading"
        :features="features"
        :key="features.length"
        :lexicon-type="lexiconType"
        :sample-ids="sampleIds"
      >
      </LexiconTableBase>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import LexiconTableBase from './LexiconTableBase.vue';
import LexiconModificationDialog from './LexiconModificationDialog.vue';

import { mapState, mapActions, mapWritableState } from 'pinia';
import { useLexiconStore } from 'src/pinia/modules/lexicon';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'LexiconMain',
  props: {
    sampleIds: {
      type: Object as PropType<string[]>,
      default: [],
    },
  },
  components: {
    LexiconTableBase,
    LexiconModificationDialog,
  },
  data() {
    const features: string[] = [];
    const selectedSamples: string[] = [];
    return {
      lexiconType: '',
      features,
      selectedSamples,
      isShowLexiconTable: false,
      isShowLexiconFeatures: true,
    };
  },
  computed: {
    ...mapState(useProjectStore, ['name', 'annotationFeatures', 'canSeeOtherUsersTrees', 'canSaveTreeInProject']),
    ...mapState(useUserStore, ['isLoggedIn', 'isSuperAdmin', 'avatar']),
    ...mapState(useLexiconStore, ['lexiconItems', 'lexiconLoading', 'lexiconItemsModified', 'principalFeatures', 'secondaryFeatures']),
    ...mapWritableState(useLexiconStore, ['principalFeatures', 'secondaryFeatures']),
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
      let prune: number;

      this.features = this.principalFeatures.concat(this.secondaryFeatures);
      if (this.secondaryFeatures.length != 0) {
        prune = this.principalFeatures.length;
        this.displayMessage();
      } else {
        prune = 0;
      }
      const data = { samplenames: this.selectedSamples, lexiconType: lexiconType, features: this.features, prune: prune };
      this.fetchLexicon(this.name, data);
      this.lexiconType = lexiconType;
      this.isShowLexiconFeatures = false;
      this.isShowLexiconTable = true;
    },
    displayMessage() {
      let message =  'We search all lexicon entries that have the same ';
      this.principalFeatures.forEach((element) => {
        message += `"${element}", `;
      });
      message += 'and different ';
      this.secondaryFeatures.forEach((element) => {
        message += `"${element}", `;
      });
      this.$q.notify({
        message: message,
        color: 'positive',
        position: 'top',
        timeout: 3000,
      });
    },
  },
});
</script>
