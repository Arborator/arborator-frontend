<template>
  <q-dialog v-model="isShowHistoryDial" full-width persistent>
    <q-card style="height: 80%; width: 70vw;">
      <q-bar class="bg-primary text-white sticky-bar">
        {{ $t('appliedRulesHist.title') }} `{{ projectName }}`
        <q-space />
        <q-btn v-close-popup flat dense icon="close" @click="closeDial()"/>
      </q-bar>
      <q-card-section class="q-gutter-md">
        <div v-if="selectedPatternNumber > 0" class="q-pa-sm row justify-between custom-frame2">
          <div>
            <q-btn flat icon="close" size="sm" color="primary" @click="unselectAllRules" />
              {{ selectedPatternNumber }}  {{ $t('appliedRulesHist.selectedRules[0]') }}
              <span v-if="selectedPatternNumber == 1">
                {{ $t('appliedRulesHist.selectedRules[1]') }}
              </span>
              <span v-else>
                {{ $t('appliedRulesHist.selectedRules[2]') }}
              </span>
          </div>
          <div class="q-gutter-md">
            <q-btn outline color="primary" label="Copy" @click="copySelectedRules()" />
          </div>
        </div>
        <div v-if="getAppliedRules?.length > 0">
          <q-list bordered separator v-for="(rule, index) in getAppliedRules" class="custom-frame2">
            <q-item>
              <q-item-section top avatar>
                <q-checkbox v-model="selectedPatterns[index]" />
              </q-item-section>
              <q-item-section>
                <GrewCodeMirror v-model:value="rule.query" :disabled="true" :line-numbers="false"></GrewCodeMirror>
              </q-item-section>
              <q-item-section side top>
                <q-item-label caption>{{ rule.results }} {{ $t('appliedRulesHist.modifiedSentences') }}</q-item-label>
                <q-item-label>{{ rule.date }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div v-else class="text">
          {{ $t('appliedRulesHist.noHistory') }}
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import GrewCodeMirror from 'components/codemirrors/GrewCodeMirror.vue';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { LocalStorage, copyToClipboard } from 'quasar';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppliedRuleHistory',
  components: { GrewCodeMirror },
  data() {
    const selectedPatterns: Boolean[] = [];
    return {
      isShowHistoryDial: true,
      selectedPatterns,
    }  
  },
  computed: {
    projectName(): string {
      return this.$route.params.projectname as string;
    },
    getAppliedRules(): any[] {
      const appliedRules = LocalStorage.getItem(this.projectName) as any[] || [];
      return appliedRules.reverse();
    },
    selectedPatternNumber(): number {
      return this.selectedPatterns.filter(val => val === true).length;
    }  
  },
  mounted() {
    this.selectedPatterns = Array(this.getAppliedRules.length).fill(false);
  },
  methods: {
    unselectAllRules() {
      this.selectedPatterns.fill(false);
    },
    copyQuery(query: string) {
      copyToClipboard(query).then(()=> {
        notifyMessage({ message: 'Rule Copied' });
      }).catch((error) => {
        notifyError({error});
      });
    },
    copySelectedRules() {
      let pattern = '';
      for(const i in this.selectedPatterns) {
        if (this.selectedPatterns[i]) {
          pattern += this.getAppliedRules[i].query + '\n\n';
        }
      }
      this.$emit('copied-pattern', pattern);
      this.$emit('closed');
    },
    closeDial() {
      this.$emit('closed');
    }
  }
})
</script>
<style scoped >

</style>