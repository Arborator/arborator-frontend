<template>
  <q-card
    bordered
    :class="hover ? 'shadow-12' : ''"
    class="my-card grid-style-transition shadow-2"
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    <q-img
      class="clickable"
      :ratio="16 / 9"
      :src="project.image ? project.image : '/images/small.niko-photos-tGTVxeOr_Rs-unsplash.jpg'"
      basic
      @click="goTo()"
    >
    </q-img>
    <q-separator/>
    <q-card-section>
      <div class="row text-h6">
        <div class="col">
          {{ project.projectName }}
        </div> 
        <div v-if="isProjectAdmin">
          <q-btn flat round icon="more_vert">
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
        </div>
      </div>
      <q-card-actions vertical class="clickable" @click="goTo()">
        <div class="text-caption text-grey-9 text-weight-medium" style="text-decoration: underline;">
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
      <div class="row justify-between">
        <div class="col-6 text-caption">
          {{ project.numberSamples }} {{ project.numberSamples === 1 ? $t('projectHub.sample') : $t('projectHub.samples') }}
        </div>
        <div class="col-">
          <q-avatar color="primary" size="1.2rem" text-color="white">
            <img :src="project.ownerAvatarUrl " alt="owner" />
          </q-avatar>
        </div>
      </div>
    </q-card-section>
    <q-dialog v-model="showRenameProjectDial">
      <RenameProjectDialog :project-name="project.projectName" />
    </q-dialog>
    <q-dialog v-model="confirmActionDial">
      <ConfirmAction :parent-action="confirmActionCallback"  :target-name="project.projectName"></ConfirmAction>
    </q-dialog>
  </q-card>
</template>

<script lang="ts">
import ConfirmAction from '../components/ConfirmAction.vue';
import RenameProjectDialog from './RenameProjectDialog.vue';


import { mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { timeAgo } from 'src/utils/timeAgoUtils';
import { project_extended_t } from 'src/api/backend-types';
import { defineComponent, PropType } from 'vue';

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
    const confirmActionCallback = null as unknown as CallableFunction;
    return {
      hover: false,
      confirmActionCallback,
      confirmActionDial: false,
      showRenameProjectDial: false,
    };
  },
  computed: {
    ...mapState(useUserStore, ['username', 'isSuperAdmin']),
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
<style scoped>
.clickable:hover {
  cursor: pointer;
  text-decoration: none;
}
.grid-style-transition {
  transition: transform 0.28s, background-color 0.28s;
}
.my-card {
  width: 100%;
}
</style>
