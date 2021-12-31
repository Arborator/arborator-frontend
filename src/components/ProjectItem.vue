<template>
  <!-- removed: v-show="visible"  -->
  <q-item clickable @click="goTo()">
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
        ><span class="text-weight-bold">{{ project.project_name }}</span></q-item-label
      >
      <q-item-label caption lines="2">
        {{ project.description }}
      </q-item-label>
    </q-item-section>
    <q-item-section thumbnail>
      <q-chip v-if="project.last_access > project.last_write_access" size="sm" icon="fingerprint" color="info" text-color="white">
        {{ $t('projectHub.lastAccess') }} {{ timeAgo(project.last_access) }}
      </q-chip>
      <q-chip size="sm" icon="edit" color="primary" text-color="white">
        {{ $t('projectHub.lastWriteAccess') }} {{ timeAgo(project.last_write_access) }}
      </q-chip>
    </q-item-section>
    <q-item-section v-for="adm in project.admins" :key="adm" side>
      <q-chip v-if="userid == adm" size="sm">
        <q-avatar>
          <img :src="store.getters['user/getUserInfos'].picture_url" />
        </q-avatar>
        {{ adm }}
      </q-chip>
      <q-chip v-else icon="account_circle" :label="adm" size="sm" />
    </q-item-section>
    <q-item-section side>
      <q-badge :color="$q.dark.isActive ? 'grey' : 'secondary'">
        {{ project.number_samples }} {{ project.number_samples == 1 ? $t('projectHub.sample') : $t('projectHub.samples') }}
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
      <confirm-action :parent-action="confirmActionCallback" :arg1="confirmActionArg1"></confirm-action>
    </q-dialog>
  </q-item>
</template>

<script>
import ConfirmAction from '../components/ConfirmAction';
import Store from '../store/index';

export default {
  components: { ConfirmAction },
  props: ['props', 'parentDeleteProject', 'parentProjectSettings'],
  data() {
    return {
      store: Store,
      project: this.props,
      confirmActionDial: false,
      confirmActionCallback: null,
      confirmActionArg1: '',
    };
  },
  computed: {
    imageCleaned() {
      let clean = this.project.image.replace('b', '');
      clean = clean.replace(/^'/g, '');
      clean = clean.replace(/'$/g, '');
      return `data:image/png;base64, ${clean}`;
    },
    userid() {
      return this.$store.getters['user/getUserInfos'].id;
    },
    // visible() {
    //   if (!this.project.visibility === 1) {
    //     return true;
    //   }

    //   if (this.project.admins.includes(this.$store.getters['user/getUserInfos'].id)) {
    //     return true;
    //   }
    //   if (this.project.guests.includes(this.$store.getters['user/getUserInfos'].id)) {
    //     return true;
    //   }
    //   if (this.$store.getters['user/getUserInfos'].super_admin) {
    //     return true;
    //   }
    //   return false;
    // },
  },
  methods: {
    imageEmpty() {
      if (this.project.image === null) {
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
    timeAgo(secsAgo) {
      const formatter = new Intl.RelativeTimeFormat(this.locale, { style: 'long' });
      const ranges = {
        years: 3600 * 24 * 365,
        months: 3600 * 24 * 30,
        weeks: 3600 * 24 * 7,
        days: 3600 * 24,
        hours: 3600,
        minutes: 60,
        seconds: 1,
      };
      for (const key in ranges) {
        if (ranges[key] < Math.abs(secsAgo)) {
          const delta = secsAgo / ranges[key];
          return formatter.format(Math.round(delta), key);
        }
      }
      return formatter.format(secsAgo, 'seconds'); // should be useless
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
          projectname: this.project.project_name,
          infos: this.project,
        },
      });
    },
    /**
     * Use the parent project settings function
     *
     * @returns void
     */
    projectSettings() {
      this.$props.parentProjectSettings(this.project.project_name);
    },
    /**
     * Delete a project using the parent function
     *
     * @returns void
     */
    deleteProject() {
      this.$props.parentDeleteProject(this.project.project_name);
    },
    /**
     * Wrapper to display the confirm dialog prior to executing the method
     *
     * @param {method} method
     * @param {*} arg
     * @returns void
     */
    triggerConfirm(method, arg) {
      this.confirmActionDial = true;
      this.confirmActionCallback = method;
      this.confirmActionArg1 = arg;
    },
  },
};
</script>

<style scoped></style>
