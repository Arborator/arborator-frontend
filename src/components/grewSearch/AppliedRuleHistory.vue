<template>
  <q-dialog v-model="isShowHistoryDial" full-width>
    <q-card style="height: 50%; width: 70vw;">
      <q-bar class="bg-primary text-white sticky-bar">
        {{ $t('appliedRulesHist.title') }} `{{ projectName }}`
        <q-space />
        <q-btn v-close-popup flat dense icon="close" @click="closeDial()"/>
      </q-bar>
      <q-card-section>
        <div v-if="getAppliedRules?.length > 0">
          <q-list bordered separator v-for="rule in getAppliedRules" class="custom-frame2">
            <q-item>
              <q-item-section top avatar>
                {{ rule.name }}
              </q-item-section>
              <q-item-section>
                <GrewCodeMirror v-model:value="rule.query" :disabled="true" :line-numbers="false"></GrewCodeMirror>
              </q-item-section>
              <q-item-section side top>
                <q-btn size="sm" flat icon="content_copy" color="primary" @click="copyQuery(rule.query)">
                  <q-tooltip>
                    {{ $t('appliedRulesHist.copyRuletooltip') }}
                  </q-tooltip>
                </q-btn>
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
    return {
      isShowHistoryDial: true,
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
  },
  methods: {
    copyQuery(query: string) {
      copyToClipboard(query).then(()=> {
        notifyMessage({ message: 'Rule Copied' });
      }).catch((error) => {
        notifyError({error});
      });
    },
    closeDial() {
      this.$emit('closed');
    }
  }
})
</script>