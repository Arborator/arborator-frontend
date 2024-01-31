<template>
  <q-btn-dropdown outline color="primary" no-caps icon="fab fa-github" label="Github Options">
    <q-list>
      <q-item :disable="changesNumber == 0" clickable v-close-popup @click="isShowCommitDialog = true">
        <q-item-section avatar>
          <q-avatar icon="commit" />
        </q-item-section>
        <q-item-section>
          <q-item-label>commit</q-item-label>
          <q-item-label v-if="changesNumber > 0" caption>
            {{ $t('github.commitNotif[0]') }} {{ changesNumber }} <span v-if="changesNumber === 1">{{ $t('github.commitNotif[1]') }}</span
            ><span v-else>{{ $t('github.commitNotif[2]') }}</span></q-item-label
          >
          <q-item-label v-else caption> {{ $t('github.commitNotif[3]') }} </q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-badge color="primary" :label="changesNumber" />
        </q-item-section>
      </q-item>
      <q-item clickable>
        <q-item-section avatar>
          <q-avatar icon="ion-md-git-pull-request" />
        </q-item-section>
        <q-item-section v-if="!checkPulls" clickable @click="getPulls()">
          {{ $t('github.pullNotif[0]') }}
          <q-item-label caption> {{ $t('github.pullNotif[1]') }} </q-item-label>
        </q-item-section>
        <q-item-section v-else clickable v-close-popup @click="pullChanges()" class="text-secondary">
          {{ $t('github.pullNotif[2]') }}
          <q-item-label caption>
            {{ $t('github.pullNotif[3]') }}
          </q-item-label>
        </q-item-section>
        <q-item-section v-if="checkPulls" side>
          <q-icon name="info" color="secondary" />
        </q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="isShowPullRequestDialog = true">
        <q-item-section avatar>
          <q-avatar icon="ion-md-git-merge" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Pull Request</q-item-label>
          <q-item-label caption>{{ $t('github.pullRequest') }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="triggerConfirm(deleteSynchronization)">
        <q-item-section avatar>
          <q-avatar icon="cancel_presentation" />
        </q-item-section>
        <q-item-section>
          <q-item-label> {{ $t('github.removeSync[0]') }} </q-item-label>
          <q-item-label caption> {{ $t('github.removeSync[1]') }} {{ repositoryName }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
  <q-dialog v-model="isShowCommitDialog">
    <GithubCommitDialog :projectName="projectName" :repositoryName="repositoryName" @committed="reloadAfterCommit" />
  </q-dialog>
  <q-dialog v-model="isShowPullRequestDialog" persistent>
    <GithubPullRequestDialog :projectName="projectName" :repositoryName="repositoryName" @created="isShowPullRequestDialog = false" />
  </q-dialog>
  <q-dialog v-model="confirmActionDial">
    <ConfirmAction :parent-action="confirmActionCallback" :target-name="projectName" />
  </q-dialog>
</template>
<script lang="ts">
import GithubCommitDialog from './GithubCommitDialog.vue';
import GithubPullRequestDialog from './GithubPullRequestDialog.vue';
import ConfirmAction from 'src/components/ConfirmAction.vue';
import api from '../../api/backend-api';
import { mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { notifyError, notifyMessage } from 'src/utils/notify';

import { defineComponent, PropType } from 'vue';
import { useProjectStore } from 'src/pinia/modules/project';
export default defineComponent({
  components: {
    GithubCommitDialog,
    GithubPullRequestDialog,
    ConfirmAction,
  },
  name: 'GithubOptions',
  emits: ['remove', 'pulled'],
  props: {
    projectName: {
      type: String as PropType<string>,
      required: true,
    },
    repositoryName: {
      type: String as PropType<string>,
      required: true,
    },
  },
  data() {
    const confirmActionCallback = null as unknown as CallableFunction;
    return {
      isShowCommitDialog: false,
      isShowPullRequestDialog: false,
      confirmActionDial: false,
      confirmActionCallback,
      checkPulls: false,
      changesNumber: 0,
    };
  },
  computed: {
    ...mapState(useUserStore, ['username']),
    ...mapState(useProjectStore, ['isOwner']),
  },
  mounted() {
    this.getChanges();
  },
  methods: {
    getChanges() {
      api
        .getChanges(this.projectName)
        .then((response) => {
          this.changesNumber = response.data;
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
    getPulls() {
      api
        .checkPull(this.projectName)
        .then((response) => {
          this.checkPulls = response.data;
          if (!this.checkPulls && this.isOwner) {
            notifyMessage({ message: `You don't have changes to pull` });
          }
        })
        .catch((error) => {
          notifyError({ error: 'Error while checking changes to pull' });
        });
    },
    deleteSynchronization() {
      api
        .deleteSynchronization(this.projectName)
        .then(() => {
          this.$emit('remove');
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
    reloadAfterCommit() {
      this.isShowCommitDialog = false;
      this.getChanges();
    },
    pullChanges() {
      const data = { repositoryName: this.repositoryName };
      api
        .pullChanges(this.projectName)
        .then(() => {
          notifyMessage({ message: `The changes from ${this.repositoryName} are pulled in ${this.projectName}` });
          this.$emit('pulled');
        })
        .catch((error) => {
          notifyError({ error });
        });
    },

    triggerConfirm(method: CallableFunction) {
      this.confirmActionDial = true;
      this.confirmActionCallback = method;
    },
  },
});
</script>

<style lang="stylus">
.clickable:hover {
  cursor: pointer;
  color: blue;
}
</style>
