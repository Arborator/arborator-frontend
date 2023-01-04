<template>
  <!-- removed: v-show="visible"  -->
  <q-item clickable @click="goTo()">
    <q-tooltip class="bg-purple text-body2" anchor="top middle" :offset="[10, 10]" :delay="100">
      {{ $t('projectHub.tooltipRightClickDelete') }}
    </q-tooltip>
    <q-popup-proxy transition-show="flip-up" transition-hide="flip-down" context-menu>
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
    <q-item-section avatar>
      <q-avatar v-show="imageEmpty()" rounded color="primary" text-color="white" icon="fas fa-tree" />
      <q-avatar v-show="!imageEmpty()" rounded color="primary" text-color="white">
        <img :src="imageCleaned" />
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label lines="1"
        ><span class="text-weight-bold">{{ project.projectName }}</span></q-item-label
      >
      <q-item-label caption lines="2">
        {{ project.description }}
      </q-item-label>
    </q-item-section>
    <q-item-section thumbnail>
      <q-chip v-if="project.lastAccess > project.lastWriteAccess" size="sm" icon="fingerprint" color="info" text-color="white">
        {{ $t('projectHub.lastAccess') }} {{ timeAgo(project.lastAccess) }}
      </q-chip>
      <q-chip size="sm" icon="edit" color="primary" text-color="white">
        {{ $t('projectHub.lastWriteAccess') }} {{ timeAgo(project.lastWriteAccess) }}
      </q-chip>
    </q-item-section>
    <q-item-section v-if="isLoggedIn" v-for="adm in project.admins" :key="adm" side>
      <q-chip v-if="userid == adm" size="sm">
        <q-avatar>
          <img :src="getUserInfos.picture_url || undefined" />
        </q-avatar>
        {{ adm }}
      </q-chip>
      <q-chip v-else icon="account_circle" :label="adm" size="sm" />
    </q-item-section>
    <q-item-section side>
      <q-badge :color="$q.dark.isActive ? 'grey' : 'secondary'">
        {{ project.numberSamples }} {{ project.numberSamples == 1 ? $t('projectHub.sample') : $t('projectHub.samples') }}
      </q-badge>
    </q-item-section>
    <q-item-section side>
      <div class="absolute-bottom text-h6">
        <q-icon v-show="project.visibility === 0" name="lock" color="negative" size="lg"></q-icon>
        <q-icon v-show="project.visibility === 1" name="lock" color="positive" size="lg"></q-icon>
        <q-icon v-show="project.visibility === 2" name="public" color="positive" size="lg"></q-icon>
      </div>
    </q-item-section>

    <q-dialog v-model="confirmActionDial">
      <confirm-action :parent-action="confirmActionCallback" :arg1="confirmActionArg1" :targetName="project.projectName"></confirm-action>
    </q-dialog>
  </q-item>
</template>

<script lang="ts">
import { mapState } from 'pinia';
import ConfirmAction from '../components/ConfirmAction.vue';
import { useUserStore } from 'src/pinia/modules/user';
import { timeAgo } from 'src/utils/timeAgoUtils';

import {defineComponent, PropType} from 'vue';
import {project_extended_t} from "src/api/backend-types";

export default defineComponent({
  components: { ConfirmAction },
  props: {
    project: {
      type: Object as PropType<project_extended_t>,
      required: true,
    },
    parentDeleteProject: {
      type: Function as PropType<(value: string) => void>,
      required: true
    },
    parentProjectSettings: {
      type: Function as PropType<(value: string) => void>,
      required: true
    },
  },
  data() {
    const confirmActionCallback: CallableFunction = () => {
      console.log('FIXME: find better init function');
    };
    return {
      confirmActionDial: false,
      confirmActionCallback,
      confirmActionArg1: '',
    };
  },
  computed: {
    ...mapState(useUserStore, ['isLoggedIn','getUserInfos']),
    ...mapState(useUserStore, { userid: 'id' }),
    imageCleaned() {
      return this.project.image;
    },
  },
  methods: {
    imageEmpty() {
      if (this.project.image === null || this.project.image === "") {
        this.project.image = "b''";
      }
      if (this.project.image === "b''") {
        return true;
      }
      if (this.project.image.length < 1) {
        return true;
      }
      return false;
    },
    timeAgo(secsAgo: number) {
      return timeAgo(secsAgo);
    },
    /**
     * Use the router to push (i.e. got to) a new route
     *
     * @returns void
     */
    goTo() {
      this.$router.push({
        name: 'project',
        params: {
          projectname: this.project.projectName,
          infos: this.project as any,
        },
      });
    },
    /**
     * Use the parent project settings function
     *
     * @returns void
     */
    projectSettings() {
      this.$props.parentProjectSettings(this.project.projectName);
    },
    /**
     * Delete a project using the parent function
     *
     * @returns void
     */
    deleteProject() {
      this.$props.parentDeleteProject(this.project.projectName);
    },
    /**
     * Wrapper to display the confirm dialog prior to executing the method
     *
     * @param {method} method
     * @param {*} arg
     * @returns void
     */
    triggerConfirm(method: CallableFunction) {
      this.confirmActionDial = true;
      this.confirmActionCallback = method;
    },
  },
});
</script>

<style scoped></style>
