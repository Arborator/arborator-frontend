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
            <q-item clickable @click="projectSettings()">
              <q-item-section>{{ $t('projectHub.rightClickSettings') }}</q-item-section>
              <q-item-section side>
                <q-icon name="settings" />
              </q-item-section>
            </q-item>
            <q-item clickable @click="triggerConfirm(deleteProject)">
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
      :src=" imageSrc == '' ? '/images/small.niko-photos-tGTVxeOr_Rs-unsplash.jpg' : imageSrc"
      basic
      @click="goTo()"
    >
      <div class="absolute-bottom text-h6">
        <ProjectIcon :visibility="project.visibility" :exercise-mode="project.exerciseMode" />
        {{ project.projectName }}
      </div>
    </q-img>
    <q-card-section>
      <q-item class="justify-around q-px-md" @click="goTo()">
        <q-item-label>{{ project.description }}</q-item-label>
      </q-item>

      <q-card-actions vertical class="q-pa-md clickable" @click="goTo()">
        <q-chip size="md" icon="fas fa-vial" color="secondary" text-color="white">
          {{ project.numberSamples }} {{ project.numberSamples === 1 ? $t('projectHub.sample') : $t('projectHub.samples') }}
        </q-chip>

        <q-space />
        <!-- v-if="project.lastAccess > project.lastWriteAccess" -->
        <q-chip size="sm" icon="fingerprint" :color="project.lastAccess > project.lastWriteAccess ? 'info' : 'blue-grey'" text-color="white">
          {{ $t('projectHub.lastAccess') }} {{ timeAgo(project.lastAccess) }}
        </q-chip>
        <q-chip size="sm" icon="edit" color="primary" text-color="white">
          {{ $t('projectHub.lastWriteAccess') }} {{ timeAgo(project.lastWriteAccess) }}
        </q-chip>
      </q-card-actions>
      <q-card-actions>
        <q-btn v-if="isProjectAdmin" round color="negative" glossy icon="delete_forever" @click="triggerConfirm(deleteProject)">
          <q-tooltip class="bg-purple text-body2" anchor="top middle" :offset="[10, 10]" :delay="100">
            <!-- {{ $t('projectHub.tooltipRightClickDelete') }} -->
            {{ $t('projectHub.rightClickDelete') }}
          </q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card-section>

    <q-dialog v-model="confirmActionDial">
      <ConfirmAction :parent-action="confirmActionCallback" :arg1="confirmActionArg1" :target-name="project.projectName"></ConfirmAction>
    </q-dialog>
  </q-card>
</template>

<script lang="ts">
import ConfirmAction from '../components/ConfirmAction.vue';
import ProjectIcon from 'components/shared/ProjectIcon.vue';

import api from 'src/api/backend-api';
import { notifyError } from 'src/utils/notify';
import { mapState, mapActions } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { timeAgo } from 'src/utils/timeAgoUtils';
import { project_extended_t } from 'src/api/backend-types';
import { defineComponent, PropType } from 'vue';



export default defineComponent({
  components: { ProjectIcon, ConfirmAction },
  props: {
    project: {
      type: Object as PropType<project_extended_t>,
      required: true,
    },
    parentDeleteProject: {
      type: Function as PropType<(value: string) => void>,
      required: true,
    },
    parentProjectSettings: {
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
    };
  },
  computed: {
    ...mapState(useUserStore, ['isLoggedIn', 'username', 'isSuperAdmin']),
    isProjectAdmin() {
      return this.project.admins.includes(this.username) || this.isSuperAdmin;
    },
  },
  mounted(){
    this.getProjectImage();
  },
  methods: {
    ...mapActions(useProjectStore, ['getImage']),
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
    projectSettings() {
      this.parentProjectSettings(this.project.projectName);
    },
    getProjectImage() {
      api.getProjectImage(this.project.projectName)
        .then((response) => {
          if (Object.keys(response.data).length > 0) {
            const imageData = response.data.image_data;
            const imageExt = response.data.image_ext
            this.imageSrc = `data:image/${imageExt};base64,${imageData}`;
          }
          else {
            this.imageSrc = '';
          }
        })
        .catch((error) => {
          notifyError(error)
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
