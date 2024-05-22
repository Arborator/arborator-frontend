<template>
  <q-item clickable @click.native.prevent="goTo()">
    <q-item-section avatar>
      <q-avatar rounded color="primary" text-color="white">
        <img :src="project.image ? project.image : '/images/small.niko-photos-tGTVxeOr_Rs-unsplash.jpg'" alt="tree" />
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label lines="1">
        <span class="text-weight-bold">{{ project.projectName }}</span>
      </q-item-label>
      <q-item-label class="text-caption text-grey-9 text-weight-medium" style="text-decoration: underline" lines="2">
        {{ project.admins[0] }}
      </q-item-label>
      <q-item-label caption lines="3">
        {{ $t('projectHub.lastAccess') }} {{ timeAgo(project.lastAccess) }}.{{ $t('projectHub.lastWriteAccess') }}
        {{ timeAgo(project.lastWriteAccess) }}
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-item-label lines="1">
        <q-avatar color="primary" size="1.2rem" text-color="white">
          <img :src="project.ownerAvatarUrl" alt="owner" />
        </q-avatar>
      </q-item-label>
      <q-item-label caption lines="2">
        {{ project.numberSamples }} {{ project.numberSamples === 1 ? $t('projectHub.sample') : $t('projectHub.samples') }}
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-btn flat icon="more_vert" @click.native.stop>
        <q-menu>
          <q-list>
            <q-item v-close-popup clickable @click="showRenameProjectDial = true">
              <q-item-section>{{ $t('projectHub.rightClickRename') }}</q-item-section>
              <q-item-section side>
                <q-icon name="edit" />
              </q-item-section>
            </q-item>
            <q-item v-close-popup clickable @click="triggerConfirm(deleteProject)">
              <q-item-section>{{ $t('projectHub.rightClickDelete') }}</q-item-section>
              <q-item-section side>
                <q-icon name="delete_forever" color="negative" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-item-section>
    <q-dialog v-model="showRenameProjectDial">
      <RenameProjectDialog :project-name="project.projectName" />
    </q-dialog>
    <q-dialog v-model="confirmActionDial">
      <confirm-action :parent-action="confirmActionCallback" :arg1="confirmActionArg1" :target-name="project.projectName"></confirm-action>
    </q-dialog>
  </q-item>
  <q-separator />
</template>

<script lang="ts">
import { mapState } from 'pinia';
import { project_extended_t } from 'src/api/backend-types';
import { useUserStore } from 'src/pinia/modules/user';
import { timeAgo } from 'src/utils/timeAgoUtils';
import { PropType, defineComponent } from 'vue';

import ConfirmAction from '../components/ConfirmAction.vue';
import RenameProjectDialog from './RenameProjectDialog.vue';

export default defineComponent({
  components: { ConfirmAction, RenameProjectDialog },
  props: {
    project: {
      type: Object as PropType<project_extended_t>,
      required: true,
    },
    parentDeleteProject: {
      type: Function as PropType<(value: string) => void>,
      required: true,
    },
  },
  data() {
    const confirmActionCallback: CallableFunction = () => {
      console.log('FIXME: find better init function');
    };
    return {
      confirmActionDial: false,
      showListAdmins: false,
      confirmActionCallback,
      confirmActionArg1: '',
      showRenameProjectDial: false,
    };
  },
  computed: {
    ...mapState(useUserStore, ['isSuperAdmin', 'username']),
    isProjectAdmin() {
      return this.project.admins.includes(this.username) || this.isSuperAdmin;
    },
    displayedAdmins() {
      return this.project.admins.slice(0, 2);
    },
    moreAdmins() {
      return this.project.admins.filter((admin) => !this.displayedAdmins.includes(admin));
    },
  },
  methods: {
    timeAgo(secsAgo: number) {
      return timeAgo(secsAgo);
    },
    goTo() {
      this.$router.push({
        name: 'project',
        params: {
          projectname: this.project.projectName,
          infos: this.project as any,
        },
      });
    },
    deleteProject() {
      this.parentDeleteProject(this.project.projectName);
    },
    triggerConfirm(method: CallableFunction) {
      this.confirmActionDial = true;
      this.confirmActionCallback = method;
    },
  },
});
</script>
