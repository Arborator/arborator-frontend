<template>
  <div class="row text-h6">
    {{ $t('projectView.projectOverview') }}
  </div>
  <div class="row justify-between q-gutter-md">
    <q-card flat bordered class="col">
      <q-item>
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white" icon="group" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h6">{{ projectStat.users.length }}</q-item-label>
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
          <q-item-label class="text-h6"> {{ projectStat.samplesNumber }}</q-item-label>
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
          <q-item-label class="text-h6">{{ projectStat.treesNumber }}</q-item-label>
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
          <q-item-label class="text-h6">{{ projectStat.tokensNumber }}</q-item-label>
          <q-item-label caption>
            {{ $t('projectStats.tokens') }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-card>
  </div>
  <div class="row text-h6">
    {{ $t('projectStats.activityOverview') }}
  </div>
  <div class="row justify-between q-gutter-md">
    <q-card v-if="projectStat.topUser" flat bordered class="col">
      <q-item>
        <q-item-section avatar>
          <q-avatar>
            <img :src="projectStat.topUser.userAvatar" alt="avatar" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h6">{{ $t('projectStats.topContributor') }}</q-item-label>
          <q-item-label caption>
            {{ projectStat.topUser.username }}
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
          <div class="text-h6 text-primary"> {{ $t('projectHub.lastWriteAccess') }} {{ timeAgo(projectStat.lastWrite.lastWrite) }}</div>
          <div class="text-caption">{{ $t('projectStats.by') }} {{ projectStat.lastWrite.lastWriteUsername }}</div>
        </q-card-section>
        <q-separator vertical />
        <q-card-section class="col">
          <div class="text-h6 text-primary"> {{ $t('projectHub.lastAccess') }} {{ timeAgo(projectStat.lastRead.lastRead) }}</div>
          <div class="text-caption"> {{ $t('projectStats.by') }} {{ projectStat.lastRead.lastReadUsername }}</div>
        </q-card-section>
      </q-card-section>
    </q-card>
  </div>
  <div class="row justify-between q-gutter-md">
    <q-card v-if="projectUsedTags.length" flat bordered class="col">
      <q-card-section class="q-gutter-md">
        <div class="text-h6">
          {{ $t('projectStats.usedTags') }}
        </div>
        <q-separator />
        <div class="row q-gutter-x-md">
          <q-chip  v-for="tag in projectUsedTags" outline color="primary" size="sm" :label="tag"/>
        </div>
      </q-card-section>
    </q-card>
  </div>
  <q-separator />
</template>
<script lang="ts">
import { statProject_t } from 'src/api/backend-types';
import { notifyError } from 'src/utils/notify';
import { timeAgo } from 'src/utils/timeAgoUtils';
import { defineComponent, PropType } from 'vue';
import api from 'src/api/backend-api';

export default defineComponent({
  name: 'StatisticsProject',
  data() {
    const projectStat: statProject_t = {
      users: [],
      samplesNumber: 0,
      treesNumber: 0,
      tokensNumber: 0,
      topUser: { username: '', treesNumber: 0, userAvatar: '' },
      lastRead: { lastRead: 0, lastReadUsername: '' },
      lastWrite: { lastWrite: 0, lastWriteUsername: '' },
    };
    const topUserProgress: number = 0;
    const topUserProgressLabel: string = '';
    const projectUsedTags: string[] = [];
    return {
      projectStat,
      projectUsedTags,
      topUserProgress,
      topUserProgressLabel,
    }
  },
  props: {
    projectName: {
      type: String as PropType<string>,
      required: true,
    },
    sampleNames: {
      type: Array as PropType<string[]>,
      required: true,
    }
  },
  mounted() {
    this.getStatistics();
    this.getProjectTags();
  },
  methods: {
    timeAgo(secsAgo: number) {
      return timeAgo(secsAgo);
    },
    getStatistics() {
      api
        .getStats(this.projectName)
        .then((response) => {
          this.projectStat = { ...response.data };
          if (this.projectStat.topUser) {
            this.topUserProgress = this.projectStat.topUser.treesNumber / this.projectStat.treesNumber;
            this.topUserProgressLabel =  `${(this.projectStat.topUser.treesNumber / this.projectStat.treesNumber * 100).toFixed(2)} %`;
          }
        })
        .catch((error) => {
          notifyError({ error: `Error while loading project statistics ${error}` });
        });
    },
    getProjectTags() {
      const data = { sampleNames: this.sampleNames}
      api
        .getProjectTags(this.projectName, data)
        .then((response) => {
          this.projectUsedTags = response.data;
        })
        .catch((error) => {
          notifyError({ error: `Error happened while loading project tags: ${error}` });
        })
    }
  }

})

</script>