<template>
  <div class="row q-pa-md justify-between q-gutter-md">
    <q-card flat bordered class="col">
      <q-item>
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white" icon="group" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h6">{{ projectStats.users.length }}</q-item-label>
          <q-item-label caption>
            {{ $t('projectStats.users') }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-card>
    <q-card flat bordered class="col">
      <q-item>
        <q-item-section avatar>
          <q-avatar color="secondary" text-color="white" icon="article" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h6"> {{ projectStats.samplesNumber }}</q-item-label>
          <q-item-label caption>
            {{ $t('projectStats.samples') }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-card>
    <q-card flat bordered class="col">
      <q-item>
        <q-item-section avatar>
          <q-avatar color="indigo-8" text-color="white" icon="forest" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h6">{{ projectStats.treesNumber }}</q-item-label>
          <q-item-label caption>
            {{ $t('projectStats.trees') }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-card>
    <q-card flat bordered class="col">
      <q-item>
        <q-item-section avatar>
          <q-avatar color="cyan-8" text-color="white" icon="title" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h6">{{ projectStats.tokensNumber }}</q-item-label>
          <q-item-label caption>
            {{ $t('projectStats.tokens') }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-card>
  </div>
  <div class="row q-pa-md justify-between q-gutter-md">
    <q-card v-if="projectStats.topUser" flat bordered class="col">
      <q-item>
        <q-item-section avatar>
          <q-avatar>
            <img :src="projectStats.topUser.userAvatar" alt="avatar" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h6">{{ $t('projectStats.topContributor') }}</q-item-label>
          <q-item-label caption>
            {{ projectStats.topUser.username }}
          </q-item-label>
        </q-item-section>
        <q-separator /> 
      </q-item>
      <q-separator />
      <q-item>
        <q-item-section class="q-gutter-md">
          <q-item-label class="text-h6">{{ $t('projectStats.annotationProgress') }}</q-item-label>
          <q-linear-progress rounded size="25px" :value="topUserProgress" color="secondary">
            <div class="absolute-full flex flex-center">
              <q-badge color="white" text-color="secondary" :label="topUserProgressLabel" />
            </div>
            <q-tooltip>
              {{ $t('projectStats.progressTooltip') }}
            </q-tooltip>
          </q-linear-progress>
        </q-item-section>
      </q-item>
    </q-card>
    <q-card flat bordered class="col">
      <q-item>
        <q-item-section>
          <q-item-label class="text-h6">{{ $t('projectStats.lastAccess') }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-separator />
      <q-card-section horizontal>
        <q-card-section class="col">
          <div class="text-h6 text-primary"> {{ $t('projectHub.lastWriteAccess') }} {{ timeAgo(projectStats.lastWrite.lastWrite) }}</div>
          <div class="text-caption">{{ $t('projectStats.by') }} {{ projectStats.lastWrite.lastWriteUsername }}</div>
        </q-card-section>
        <q-separator vertical />
        <q-card-section class="col">
          <div class="text-h6 text-primary"> {{ $t('projectHub.lastAccess') }} {{ timeAgo(projectStats.lastRead.lastRead) }}</div>
          <div class="text-caption"> {{ $t('projectStats.by') }} {{ projectStats.lastRead.lastReadUsername }}</div>
        </q-card-section>
      </q-card-section>
    </q-card>
  </div>
  <div class="row justify-between q-gutter-md">
    <q-card v-if="projectTags.length" flat bordered class="col">
      <q-card-section class="q-gutter-md">
        <div class="text-h6">
          {{ $t('projectStats.usedTags') }}
        </div>
        <q-separator />
        <div class="row q-gutter-x-md">
          <q-chip  v-for="tag in projectTags" outline color="primary" size="sm" :label="tag"/>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>
<script lang="ts">
import { sample_t } from 'src/api/backend-types';
import { mapState } from 'pinia';
import { useStatisticStore } from 'src/pinia/modules/stats';

import { timeAgo } from 'src/utils/timeAgoUtils';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'StatisticsProject',
  props: {
    projectName: {
      type: String as PropType<string>,
      required: true,
    },
    samples: {
      type: Array as PropType<sample_t[]>,
      required: true,
    }
  },
  computed: {
    ...mapState(useStatisticStore, ['projectStats', 'topUserProgress', 'topUserProgressLabel']),
    projectTags() {
      return this.samples.map((sample) => Object.keys(sample.tags)).reduce((a: string[], b: string[]) => [...a, ...b], []);
    }
  },
  methods: {
    timeAgo(secsAgo: number) {
      return timeAgo(secsAgo);
    },
  }
});

</script>