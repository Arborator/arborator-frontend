<template>
  <q-layout view="hHh Lpr fFf">
    <q-header style="height: 3vw" :class="`${$q.dark.isActive ? 'bg-dark' : 'bg-white'}`"  class="q-pa-md" id="main-header">
      <q-bar :class="$q.dark.isActive ? 'bg-dark' : 'bg-white text-black'" class="row justify-evenly">
        <q-btn flat to="/projects" :ripple="false" type="a">
          <div class="q-btn__content text-center col items-center q-anchor--skip row">
            <img v-if="$q.dark.isActive" alt="Arborator" src="/svg/arborator.grew.white.svg" style="height: 2.3vw" />
            <img v-else alt="Arborator" src="/svg/arborator.grew.svg" style="height: 2.3vw" />
          </div>
        </q-btn>
        <div>
          <q-btn
            no-caps
            flat 
            size="md" 
            label="Projects" 
            color="primary" 
            to="/projects" 
          >
            <q-tooltip content-class="text-white bg-primary">Projects page</q-tooltip>
          </q-btn>
          <q-btn
            no-caps
            flat 
            size="md" 
            label="Documentation" 
            color="primary" 
            href="https://arborator.github.io/arborator-documentation/#/" 
            target="_blank"
          >
            <q-tooltip content-class="text-white bg-primary">{{ $t('documentation') }}</q-tooltip>
          </q-btn>
          <q-btn
            no-caps 
            flat 
            size="md" 
            label="Discussion"
            color="primary"
            ref="https://github.com/Arborator/arborator-frontend/issues" 
            target="_blank"
          >
            <q-tooltip content-class="text-white bg-primary">{{ $t('feedback') }}</q-tooltip>
          </q-btn>
        </div>
        <div class="row justify-start q-gutter-md">
          <q-toggle 
            v-model="darkMode"
            checked-icon="dark_mode"
            unchecked-icon="light_mode"
            @update:model-value="toggleDarkMode()"
          />
          <q-btn-dropdown v-if="!isLoggedIn" rounded unelevated color="secondary" label="Login">
            <q-list>
              <q-item v-close-popup clickable @click="tologin(source + '/login/google')">
                <q-item-section avatar>
                  <q-icon color="primary" name="fab fa-google" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Google</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-close-popup clickable @click="tologin(source + '/login/github')">
                <q-item-section avatar>
                  <q-icon color="primary" name="fab fa-github" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>GitHub</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn v-else outline color="primary">
            <q-icon :name="loggedWithGithub ? 'fab fa-github' : 'fab fa-google'" class="q-mr-md" />
            <q-tooltip> {{ $t('userInformation') }} {{ loggedWithGithub ? ' Github' : 'Gmail' }} </q-tooltip>
            <q-icon v-if="pictureUrl === ''" name="account_circle" />
            <q-avatar v-else :key="avatarKey" color="default" text-color="white" size="xs">
              <img :src="(pictureUrl as string)" alt="avatar" />
            </q-avatar>
            <q-menu transition-show="jump-down" transition-hide="jump-up">
              <div class="row no-wrap q-pa-md">
                <div class="column">
                  <q-list>
                    <q-item v-ripple clickable to="/settings">
                      <q-item-section avatar>
                        <q-icon name="settings" />
                      </q-item-section>
                      <q-item-section> {{ $t('settings') }} </q-item-section>
                    </q-item>
                  </q-list>
                </div>
                <q-separator vertical inset class="q-mx-lg" />
                <div class="column items-center">
                  <q-icon v-if="avatarKey === ''" name="account_circle" />
                  <q-avatar v-else :key="avatarKey" color="default" text-color="white">
                    <img :src="(pictureUrl as string)" alt="avatar" />
                  </q-avatar>
                  <div class="text-subtitle1 q-mt-md q-mb-xs">
                    {{ username }}
                  </div>
                  <q-btn v-close-popup color="negative" label="Logout" size="sm" @click="logout_()" />
                </div>
              </div>
            </q-menu>
          </q-btn>
          <q-select rounded v-model="lang" :options="langOptions" dense outlined options-dense map-options emit-value>
            <q-tooltip> {{ $t('switchLanguage') }} </q-tooltip>
          </q-select>
        </div>
      </q-bar>
    </q-header>
    <q-page-container> <router-view /> </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { setThemeMode as setThemeModeForDepTrees } from 'dependencytreejs/src/StylesheetHandler';
import { mapActions, mapState } from 'pinia';
import { openURL } from 'quasar';
import { useMainStore } from 'src/pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { notifyError } from 'src/utils/notify';
import { defineComponent } from 'vue';
import { useStorage } from 'vue3-storage';

export default defineComponent({
  name: 'AppLayout',
  data() {
    return {
      storage: useStorage(),
      lang: this.$i18n.locale,
      langOptions: [
        { value: 'en', label: 'EN' },
        { value: 'fr', label: 'FR' },
      ],
      darkMode:false,
    };
  },
  computed: {
    ...mapState(useMainStore, ['isProjectAdmin', 'source']),
    ...mapState(useUserStore, [ 'pictureUrl', 'avatarKey', 'isLoggedIn', 'loggedWithGithub', 'superAdmin', 'username']),
    notHome() {
      return this.$route.fullPath !== '/';
    },
  },
  watch: {
    lang(lang) {
      this.$i18n.locale = lang;
      this.storage.setStorageSync('arbolang', lang);
    },
  },
  mounted() {
    this.storage = useStorage();
    this.setStartingLanguage();

    // fetched local storage version of the darkmode ('dm')
    const darkIsActiveLocalStorage = this.storage.getStorageSync('dm') as boolean | undefined;
    // set to dark if dm was set in local storage
    this.setDarkMode(darkIsActiveLocalStorage !== undefined ? darkIsActiveLocalStorage : this.$q.dark.isActive);
  },
  methods: {
    ...mapActions(useUserStore, ['logout']),
    openURL,
    toggleDarkMode() {
      this.setDarkMode(!this.$q.dark.isActive);
    },
    setDarkMode(isActive: boolean) {
      this.$q.dark.set(isActive);
      this.storage.setStorageSync('dm', isActive);
      setThemeModeForDepTrees(isActive ? 'DARK' : 'LIGHT', true);
      this.darkMode = isActive;
    },
    tologin(url: string) {
      window.location.assign(url);
      return this.storage;
    },
    logout_() {
      this.logout()
        .then(() => {
          this.$router.push('/').catch((error) => {
            notifyError({ error });
          });
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
    setStartingLanguage() {
      const defaultLang = navigator.language;
      if (this.storage === null) {
        return;
      }
      const langStorage = this.storage.getStorageSync('arbolang');
      if (langStorage == null) {
        if (defaultLang.includes('fr')) {
          this.lang = 'fr';
        } else {
          this.lang = 'en';
        }
      } else {
        this.lang = langStorage;
      }
    },
  },
});
</script>
<style>
.body--light .custom-frame1 {
  background-color: #f1f1f1;
}
.body--light .custom-frame2 {
  background-color: #f8f8f8;
}

.body--light .custom-top-border {
  border-top: 1px solid #d2d2d2;
}

.body--light .custom-bottom-border {
  border-bottom: 1px solid #d2d2d2;
}

.body--light .custom-right-border {
  border-right: 1px solid #d2d2d2;
}

.body--light .sticky-card-actions {
  position: sticky;
  bottom: 0;
  z-index: 1;
  background-color: white;
}

.body--dark .custom-frame1 {
  background-color: #2b2d30;
}

.body--dark .custom-frame2 {
  background-color: #1e1e1e;
}

.body--dark .custom-top-border {
  border-top: 1px solid #545454;
}

.body--dark .custom-bottom-border {
  border-bottom: 1px solid #545454;
}

.body--dark .custom-right-border {
  border-right: 1px solid #545454;
}

.body--dark .sticky-card-actions {
  position: sticky;
  bottom: 0;
  z-index: 1;
  background-color: #1e1e1e;
}

.small-tab.q-tab {
  min-height: 0;
}

.small-tab .q-icon {
  width: 16px;
  height: 16px;
  font-size: 16px;
}

.small-tab .q-tab__label {
  font-size: 10px;
}

.sticky-bar {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
