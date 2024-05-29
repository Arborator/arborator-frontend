<template>
  <div class="row text-h6">
    {{ $t('projectView.projectOverview') }}
    <span>
      <q-icon name="trending_up"></q-icon>
    </span>
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
            Users
          </q-item-label>
      </q-item-section>
      </q-item>
    </q-card>
    <q-card flat bordered class="col">
      <q-item>
      <q-item-section avatar>
          <q-avatar color="secondary" text-color="white" icon="subject" />
      </q-item-section>
      <q-item-section>
          <q-item-label class="text-h6"> {{ projectStat.samplesNumber }}</q-item-label>
          <q-item-label caption>
            Samples
          </q-item-label>
      </q-item-section>
      </q-item>
    </q-card>
    <q-card flat bordered class="col">
      <q-item>
      <q-item-section avatar>
          <q-avatar color="purple-8" text-color="white" icon="account_tree" />
      </q-item-section>
      <q-item-section>
          <q-item-label class="text-h6">{{ projectStat.treesNumber }}</q-item-label>
          <q-item-label caption>
            Trees
          </q-item-label>
      </q-item-section>
      </q-item>
    </q-card>
    <q-card flat bordered class="col">
      <q-item>
      <q-item-section avatar>
          <q-avatar color="purple-8" text-color="white" icon="group" />
      </q-item-section>
      <q-item-section>
          <q-item-label class="text-h6">{{ projectStat.tokensNumber }}</q-item-label>
          <q-item-label caption>
            Tokens
          </q-item-label>
      </q-item-section>
      </q-item>
    </q-card>
  </div>
  <div class="row text-h6">
    Activity Overview
    <span>
      <q-icon name="trending_up"></q-icon>
    </span>
  </div>
  <div class="row justify-between q-gutter-md">
    <q-card flat bordered class="col">
      <q-item>
      <q-item-section avatar>
        <q-avatar>
          <img :src="projectStat.topUser.userAvatar" alt="avatar" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
          <q-item-label class="text-h6">top contributor</q-item-label>
          <q-item-label caption>
            {{  projectStat.topUser.username }}
          </q-item-label>
      </q-item-section>
      </q-item>
    </q-card>
    <q-card flat bordered class="col">
      <q-item>
      <q-item-section avatar>
          <q-avatar color="primary" text-color="white" icon="group" />
      </q-item-section>
      <q-item-section>
          <q-item-label class="text-h6">Last Access</q-item-label>
          <q-item-label caption>
          </q-item-label>
      </q-item-section>
      </q-item>
    </q-card>
  </div>
  <q-separator />
</template>
<script lang="ts">
import { statProject_t } from 'src/api/backend-types';
import { notifyError } from 'src/utils/notify';
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
      lastRead: { lastRead: 0, lastReadUsername: ''},
      lastWrite: { lastWrite: 0, lastWriteUsername: '' },
    };
    return {
      projectStat,
    }
  },
  props: {
    projectName: {
      type: String as PropType<string>,
      required: true,
    }
  },
  mounted() {
    this.getStatistics();
  },
  methods: {
    getStatistics() {
      api
        .getStats(this.projectName)
        .then((response) => {
          this.projectStat = {...response.data };
        })
        .catch((error) => {
          notifyError({ error: `Error while loading project statistics ${error}` });
        });
    }
  }

})

</script>