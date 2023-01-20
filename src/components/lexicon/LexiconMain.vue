<template>
    <q-card flat bordered>
        <q-card-section>
            <div  v-if="isShowFeatures" class="text-h6 q-mb-md"> {{ $t('projectView.lexicon[0]') }}</div>
            <div  v-if="isShowFeatures" class="row q-gutter-md">
                <div class="col-8 ">
                    <q-select
                    v-model="features"
                    filled
                    multiple
                    :options="featureOptions"
                    use-chips
                    stack-label
                    :label="$t('projectView.lexicon[1]')"
                    />
                </div>
                <div class="col-3">
                    <q-tooltip content-class="bg-white text-primary">{{ $t('projectView.lexicon[6]') }}</q-tooltip>
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
                                    <q-item-label>{{ $t('projectView.lexicon[2]') }}</q-item-label>
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
                                    <q-item-label>{{ $t('projectView.lexicon[3]') }}</q-item-label>
                                </q-item-section>
                            </q-item>

                            <q-item v-if="isAdmin || isSuperAdmin" v-close-popup clickable @click="fetchLexicon_('recent')">
                                <q-item-section avatar>
                                    <q-icon name="schedule" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label>{{ $t('projectView.lexicon[4]') }}</q-item-label>
                                </q-item-section>
                            </q-item>

                            <q-item v-if="isAdmin || isSuperAdmin" v-close-popup clickable @click="fetchLexicon_('all')">
                                <q-item-section avatar>
                                    <q-icon name="ion-md-globe" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label> {{ $t('projectView.lexicon[5]') }}</q-item-label>
                                </q-item-section>
                            </q-item>

                        </q-list>
                    </q-btn-dropdown>
                </div>
            </div>
            <div v-if="!isShowFeatures" class="row">
                <div class="col-lg-4 col-sm-4 col-xs-4 col-md-4 q-mb-sm">
                    <q-btn v-if="prune != '' " flat icon="arrow_back" @click="fetchLexicon_(lexiconType), prune = ''">
                        <q-tooltip content-class="bg-white text-primary">{{ $t('projectView.lexicon[7]') }}</q-tooltip>
                    </q-btn>
                </div>
                <div class="col-lg-8 col-sm-8 col-xs-8 col-md-8 q-mb-sm">
                    <q-space/>
                    <q-select
                        v-model="prune"
                        dense
                        outlined
                        style="min-width: 230px"
                        :options="features"
                        label="Select feature"
                        @update:model-value="getAmbiguousLexicon()"
                        class="float-right"
                    >
                        <q-tooltip content-class="bg-white text-primary">{{ $t('projectView.lexicon[8]') }}</q-tooltip>
                    </q-select>
                </div>
            </div>
        </q-card-section>
    </q-card>
    <LexiconPanel v-if="isShowLexiconPanel" :features="features"></LexiconPanel>

</template>

<script lang="ts">
import LexiconPanel from './LexiconPanel.vue';

import { mapState, mapActions } from 'pinia';
import { useLexiconStore } from 'src/pinia/modules/lexicon';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { sample_t } from 'src/api/backend-types'
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'LexiconMain',
  props: {
    sampleId: {
      type: Object as PropType<sample_t[]>,
      default: [],
    },
  },
  components:{
    LexiconPanel
  },
  data() {
    return {
      prune:'',
      lexiconType:'',
      features:[],
      isShowLexiconPanel:false,
      isShowFeatures:true,
    };
  },
  computed: {
    ...mapState(useProjectStore,['annotationFeatures', 'isAdmin']),
    ...mapState(useUserStore, ['isLoggedIn', 'isSuperAdmin', 'avatar']),
    projectName() {
        return this.$route.params.projectname;
    },
    featureOptions(): String[]{
        return Object.values(this.annotationFeatures.FEATS).map((value)=>value.name);
    },
  },
  methods: {

    ...mapActions(useLexiconStore, ['fetchLexicon']),

    getAmbiguousLexicon(){
        const pruneIndex = Object.keys(this.features).find(key => this.features[key as any ] === this.prune) as string;
        this.fetchLexicon_(this.lexiconType, parseInt(pruneIndex)+4)
    },

    fetchLexicon_(lexiconType: string, prune: number) {
        this.isShowLexiconPanel = false;
        const samplenames = [];
        for (const sample of this.sampleId) {
            samplenames.push(sample.sample_name);
        }
        this.lexiconType = lexiconType
        const data={samplenames: samplenames, features: this.features, lexiconType: this.lexiconType, prune: prune}
        this.fetchLexicon(this.projectName as string, data);
        this.isShowLexiconPanel = true;
        this.isShowFeatures = false; 
    },
    
    },
  },
);


</script>