<template>
  <q-card
    v-show="visible"
    :class="hover ? 'shadow-12' : ''"
    class="clickable my-card grid-style-transition shadow-2"
    :style="hover ? 'transform: scale(0.95);' : ''"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    @click="goTo()"
  >
    <q-popup-proxy v-if="canSeeSettings" transition-show="flip-up" transition-hide="flip-down" context-menu>
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
    <q-img :ratio="16 / 9" :src="imageEmpty() ? '/images/small.niko-photos-tGTVxeOr_Rs-unsplash.jpg' : imageCleaned" basic>
      <div class="absolute-bottom text-h6">
        <q-icon v-show="project.visibility === 0" name="fas fa-lock" color="negative" size="lg"></q-icon>
        <q-icon v-show="project.visibility === 1" name="fas fa-unlock-alt" color="positive" size="lg"></q-icon>
        <q-icon v-show="project.visibility === 2" name="public" color="positive" size="lg"></q-icon>
        {{ project.project_name }}
      </div>
    </q-img>
    <q-card-section>
      <q-item class="justify-around q-px-md">
        <q-item-label>{{ project.description }}</q-item-label>
      </q-item>

      <q-card-actions vertical class="q-pa-md">
        <q-chip size="md" icon="fas fa-vial" color="secondary" text-color="white">
          {{ project.number_samples }} {{ project.number_samples == 1 ? $t('projectHub.sample') : $t('projectHub.samples') }}
        </q-chip>

        <q-space />
        <!-- v-if="project.last_access > project.last_write_access" -->
        <q-chip size="sm" icon="fingerprint" :color="project.last_access > project.last_write_access ? 'info' : 'white'" text-color="white">
          {{ $t('projectHub.lastAccess') }} {{ timeAgo(project.last_access) }}
        </q-chip>
        <q-chip size="sm" icon="edit" color="primary" text-color="white">
          {{ $t('projectHub.lastWriteAccess') }} {{ timeAgo(project.last_write_access) }}
        </q-chip>
      </q-card-actions>
    </q-card-section>

    <q-dialog v-model="confirmActionDial">
      <confirm-action :parent-action="confirmActionCallback" :arg1="confirmActionArg1"></confirm-action>
    </q-dialog>
  </q-card>
</template>

<script>
import ConfirmAction from '../components/ConfirmAction';

export default {
  components: { ConfirmAction },
  props: ['props', 'parentDeleteProject', 'parentProjectSettings'],
  data() {
    return {
      project: this.props,
      hover: false,
      confirmActionDial: false,
      confirmActionCallback: null,
      confirmActionArg1: '',
    };
  },
  computed: {
    canSeeSettings() {
      if (!this.$store.getters['user/isLoggedIn']) {
        return false;
      }
      if (this.project.admins.includes(this.$store.getters['user/getUserInfos'].id)) {
        return true;
      }
      if (this.$store.getters['user/getUserInfos'].super_admin) {
        return true;
      }
      return false;
    },

    imageCleaned() {
      let clean = this.project.image.replace('b', '');
      clean = clean.replace(/^'/g, '');
      clean = clean.replace(/'$/g, '');
      return `data:image/png;base64, ${clean}`;
    },
    visible() {
      // show all projects regardless of their visibility status
      return true;

      // only show non-private projects
      // if(!this.project.visibility === 0){ return true; }
      // else{
      //     if(this.project.admins.includes(this.$store.getters['user/getUserInfos'].id)){ return true; }
      //     else if(this.project.guests.includes(this.$store.getters['user/getUserInfos'].id)){ return true; }
      //     else if(this.$store.getters['user/getUserInfos'].super_admin) { return true; }
      //     else { return false; }
      // }
    },
    locale() {
      return ({ ...this.$i18n.locale }.value || this.$i18n.locale).substring(0, 2); // TODO: strange bug: this.$i18n.locale is a Promess and on switching locals this.$i18n.locale becomes a string, its value. The value is fr-fra, not accepted by Intl.RelativeTimeFormat -> take the substring
    },
  },
  methods: {
    timeAgo(secsAgo) {
      if (secsAgo < -7 * 3600 * 24 * 365) return this.$t('projectHub.longtime');
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
  },
};
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
