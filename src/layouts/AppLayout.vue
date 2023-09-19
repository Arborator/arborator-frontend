<template>
  <q-layout view="hHh Lpr fFf">
    <q-header :class="`${$q.dark.isActive ? 'bg-dark' : 'bg-white'} custom-bottom-border`" id="main-header">
      <q-bar :class="$q.dark.isActive ? 'bg-dark' : 'bg-white text-black'">
        <!-- class="bg-white text-black" -->
        <!--   :class="$q.dark.isActive ? 'text-white' : 'text-primary'" -->
        <q-btn flat round icon="menu" @click="drawerLeft = !drawerLeft" />
        <q-btn flat to="/" :ripple="false" type="a">
          <div class="q-btn__content text-center col items-center q-anchor--skip row">
            <img v-if="$q.dark.isActive" alt="Arborator" src="/svg/arborator.grew.white.svg" style="height: 2.3vw" />
            <img v-else alt="Arborator" src="/svg/arborator.grew.svg" style="height: 2.3vw" />
          </div>
        </q-btn>
        <q-space />
        <q-breadcrumbs
          :active-color="$q.dark.isActive ? 'white' : 'primary'"
          :class="
            ($q.dark.isActive ? 'text-grey' : 'text-black') + ' mobile-hide native-mobile-hide within-iframe-hide gt-xs overflow-auto text-no-wrap'
          "
          style="max-height: 25px; max-width: 70vh; overflow: y"
        >
          <q-breadcrumbs-el v-if="notHome" icon="home" to="/" />
          <q-breadcrumbs-el v-if="$route.path.startsWith('/projects')" icon="view_module" to="/projects" />
          <q-breadcrumbs-el
            v-if="$route.params.projectname"
            :label="$route.params.projectname"
            icon="fas fa-tree"
            :to="'/projects/' + $route.params.projectname"
          />
          <q-breadcrumbs-el
            v-if="$route.params.samplename && $route.params.projectname"
            :label="$route.params.samplename"
            icon="assignment"
            :to="'/projects/' + $route.params.projectname + '/' + $route.params.samplename"
          />
          <q-breadcrumbs-el v-if="$route.path.startsWith('/klang')" icon="music_note" :to="'/klang'" />
          <q-breadcrumbs-el
            v-if="$route.params.kprojectname"
            :label="$route.params.kprojectname"
            :to="'/klang/' + $route.params.kprojectname"
            icon="view_module"
          />
          <q-breadcrumbs-el v-if="$route.params.ksamplename" :label="$route.params.ksamplename" />
        </q-breadcrumbs>
        <q-space />
        <div class="q-gutter-sm row items-center no-wrap" size="4rem">
          <q-icon v-show="isProjectAdmin" name="admin_panel_settings">
            <q-tooltip> {{ $t('projectAdmin') }} </q-tooltip>
          </q-icon>
          <q-select v-model="lang" :options="langOptions" dense borderless options-dense map-options emit-value>
            <template #append>
              <q-avatar>
                <q-icon name="fas fa-globe" />
              </q-avatar>
            </template>
            <q-tooltip> {{ $t('switchLanguage') }} </q-tooltip>
          </q-select>
          <q-btn flat round :icon="$q.dark.isActive ? 'sunny' : 'brightness_2'" @click="toggleDarkMode()">
            <q-tooltip> {{ $t('darkMode') }} </q-tooltip>
          </q-btn>
          <q-btn flat round icon="question_mark" href="https://arborator.github.io/arborator-documentation/#/" target="_blank">
            <q-tooltip content-class="text-white bg-primary">{{ $t('documentation') }}</q-tooltip>
          </q-btn>
          <q-btn flat round icon="feedback" href="https://github.com/Arborator/arborator-frontend/issues" target="_blank">
            <q-tooltip content-class="text-white bg-primary">{{ $t('feedback') }}</q-tooltip>
          </q-btn>
          <q-btn-dropdown v-show="!isLoggedIn" color="secondary" outline label="Log In" icon="account_circle">
            <q-list>
              <q-item v-close-popup clickable @click="tologin(source + '/login/google')">
                <q-item-section avatar>
                  <q-icon name="fab fa-google" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Google</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-close-popup clickable @click="tologin(source + '/login/github')">
                <q-item-section avatar>
                  <q-icon name="fab fa-github" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>GitHub</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn v-show="isLoggedIn" outline color="primary" size="10px">
            <q-icon :name="loggedWithGithub ? 'fab fa-github' : 'fab fa-google'" class="q-mr-md" />
            <q-tooltip> {{ $t('userInformation') }} {{ loggedWithGithub ? ' Github' : 'Gmail' }} </q-tooltip>
            <q-icon v-if="getUserInfos.picture_url === ''" name="account_circle" />
            <q-avatar v-else :key="getUserInfos.avatarKey" color="default" text-color="white" size="xs">
              <img :src="getUserInfos.picture_url" />
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
                    <q-item v-show="getUserInfos.super_admin" v-ripple clickable to="/admin">
                      <q-item-section avatar>
                        <q-icon name="vpn_key" />
                      </q-item-section>
                      <q-item-section> {{ $t('admin') }} </q-item-section>
                    </q-item>
                  </q-list>
                </div>
                <q-separator vertical inset class="q-mx-lg" />
                <div class="column items-center">
                  <q-icon v-if="getUserInfos.avatarKey === ''" name="account_circle" />
                  <q-avatar v-else :key="getUserInfos.avatarKey" color="default" text-color="white">
                    <img :src="getUserInfos.picture_url" />
                  </q-avatar>
                  <div class="text-subtitle1 q-mt-md q-mb-xs">
                    {{ getUserInfos.username }}
                  </div>
                  <q-btn v-close-popup color="negative" label="Logout" size="sm" @click="logout_()" />
                </div>
              </div>
            </q-menu>
          </q-btn>
          <q-btn
            flat
            dense
            :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
            :label="$q.fullscreen.isActive ? '' : ''"
            @click="$q.fullscreen.toggle()"
          >
            <q-tooltip :delay="300" content-class="bg-white text-primary">{{ $t('fullscreen') }}</q-tooltip>
          </q-btn>
        </div>
      </q-bar>
    </q-header>
    <q-page-container> <router-view /> </q-page-container>
    <q-drawer
      v-model="drawerLeft"
      :width="200"
      :breakpoint="400"
      :content-class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
      :mini="miniState"
      mini-to-overlay
      bordered
      @mouseover="miniState = false"
      @mouseout="miniState = true"
    >
      <q-scroll-area style="height: calc(100% - 0px); margin-top: 0">
        <q-list padding>
          <div v-for="(menuItem, index) in menuList" :key="index">
            <q-item v-show="isLoggedIn || menuItem.public" v-ripple :to="menuItem.to" clickable :active="menuItem.label === $route.path">
              <q-item-section avatar>
                <q-icon :name="menuItem.icon" />
              </q-item-section>
              <q-item-section>
                {{ menuItem.label }}
              </q-item-section>
            </q-item>
            <q-separator v-if="menuItem.separator" spaced />
          </div>
        </q-list>
      </q-scroll-area>
    </q-drawer>
  </q-layout>
</template>

<script lang="ts">
import { openURL } from 'quasar';
import { useStorage } from 'vue3-storage';
import { defineComponent } from 'vue';

import '../assets/css/tags-style.css';
import { notifyError } from 'src/utils/notify';
import { mapActions, mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { useMainStore } from 'src/pinia';
import { setThemeMode as setThemeModeForDepTrees } from 'dependencytreejs/src/StylesheetHandler';

export default defineComponent({
  name: 'TempLayout',
  data() {
    return {
      storage: useStorage(),
      drawerLeft: false,
      miniState: true,
      isAdmin: false,
      search: '',
      menuList: [
        {
          icon: 'house',
          label: this.$t('navhome'),
          separator: false,
          public: true,
          to: '/#',
          bottom: false,
        },
        {
          icon: 'library_books',
          label: this.$t('navprojects'),
          separator: true,
          public: true,
          to: '/projects',
          bottom: false,
        },
        {
          icon: 'settings',
          label: this.$t('navsettings'),
          separator: false,
          public: false,
          to: '/settings',
          bottom: true,
        },
        {
          icon: 'music_note',
          label: this.$t('navklang'),
          separator: false,
          public: true,
          to: '/klang',
          bottom: false,
        },
      ],
      lang: this.$i18n.locale,
      langOptions: [
        { value: 'en', label: 'EN', img: '/images/usflag.svg' },
        { value: 'fr', label: 'FR', img: '/images/frenchflag.svg' },
      ],
    };
  },
  computed: {
    ...mapState(useMainStore, ['isProjectAdmin', 'source']),
    ...mapState(useUserStore, ['getUserInfos', 'isLoggedIn', 'loggedWithGithub']),
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
    this.isProjectAdmin;
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
