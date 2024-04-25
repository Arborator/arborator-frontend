<template>
  <q-card
    bordered
    :class="hover ? 'shadow-12' : ''"
    class="my-card grid-style-transition shadow-2"
    :style="hover ? 'transform: scale(0.95);' : ''"
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    <q-popup-proxy v-if="isProjectAdmin" transition-show="flip-up" transition-hide="flip-down" context-menu>
      <q-card>
        <q-card-section>
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
        </q-card-section>
      </q-card>
    </q-popup-proxy>
    <q-img
      class="clickable"
      :ratio="16 / 9"
      :src="imageSrc == '' ? '/images/small.niko-photos-tGTVxeOr_Rs-unsplash.jpg' : imageSrc"
      basic
      @click="goTo()"
    >
    </q-img>
    <q-card-section @click="goTo()">
      <div class="row text-h6">
        <div class="col">
          {{ project.projectName }}
        </div> 
        <div>
          <q-btn flat rounded icon="more_vert"></q-btn>
        </div>
      </div>
      <div class="text-subtitle2">{{ project.description }}</div>
    </q-card-section>
    <q-card-section>
      <q-card-actions vertical class="q-pa-md clickable" @click="goTo()">
        <div class="text-caption">
          {{ project.admins[0] }}
        </div>
        <div class="text-caption">
          {{ $t('projectHub.lastAccess') }} {{ timeAgo(project.lastAccess) }}
        </div>
        <div class="text-caption">
          {{ $t('projectHub.lastWriteAccess') }} {{ timeAgo(project.lastWriteAccess) }}
        </div>
      </q-card-actions>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <q-card-actions vertical class="q-pa-md clickable" @click="goTo()">
        <q-chip size="md" icon="fas fa-vial" color="secondary" text-color="white">
          {{ project.numberSamples }} {{ project.numberSamples === 1 ? $t('projectHub.sample') : $t('projectHub.samples') }}
        </q-chip>
      </q-card-actions>
    </q-card-section>
    <q-dialog v-model="showRenameProjectDial">
      <RenameProjectDialog :project-name="project.projectName" />
    </q-dialog>

    <q-dialog v-model="confirmActionDial">
      <ConfirmAction :parent-action="confirmActionCallback" :arg1="confirmActionArg1" :target-name="project.projectName"></ConfirmAction>
    </q-dialog>
  </q-card>
</template>

<script lang="ts">
import ConfirmAction from '../components/ConfirmAction.vue';
import ProjectIcon from 'components/shared/ProjectIcon.vue';
import RenameProjectDialog from './RenameProjectDialog.vue';


import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { timeAgo } from 'src/utils/timeAgoUtils';
import { project_extended_t } from 'src/api/backend-types';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  components: { ProjectIcon, ConfirmAction, RenameProjectDialog },
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
    const confirmActionCallback = null as unknown as CallableFunction;
    return {
      hover: false,
      confirmActionCallback,
      confirmActionDial: false,
      confirmActionArg1: '',
      imageSrc: '',
      showRenameProjectDial: false,
    };
  },
  computed: {
    ...mapState(useUserStore, ['username', 'isSuperAdmin']),
    ...mapState(useProjectStore, ['image']),
    isProjectAdmin() {
      return this.project.admins.includes(this.username) || this.isSuperAdmin;
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

<style scoped lang="stylus">
.clickable:hover {
  cursor: pointer;
}

.grid-style-transition {
  transition: transform 0.28s, background-color 0.28s;
}

.my-card {
  width: 100%;
}
</style>
