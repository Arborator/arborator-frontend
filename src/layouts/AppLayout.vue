<template>
  <q-layout view="hHh Lpr fFf">
    <q-header :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'">
      <q-bar :class="$q.dark.isActive ? 'bg-dark' : 'bg-white text-black'">
        <!-- class="bg-white text-black" -->
        <!--   :class="$q.dark.isActive ? 'text-white' : 'text-primary'" -->
        <q-btn flat round icon="menu" @click="drawerLeft = !drawerLeft" />
        <q-btn flat to="/projects" :ripple="false" type="a">
          <div class="q-btn__content text-center col items-center q-anchor--skip row">
            <img v-if="$q.dark.isActive" alt="Arborator" src="/svg/arborator.grew.white.svg" style="height: 2.3vw" />
            <img v-else alt="Arborator" src="/svg/arborator.grew.svg" style="height: 2.3vw" />
          </div>
        </q-btn>
        <q-space />
        <q-breadcrumbs
          :active-color="$q.dark.isActive ? 'white' : 'primary'"
          :class="($q.dark.isActive ? 'text-grey' : 'text-black') + ' mobile-hide native-mobile-hide within-iframe-hide gt-xs'"
          style="max-height: 20px; max-width: 70vh; overflow: y"
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
            <q-tooltip> You are admin of this project </q-tooltip>
          </q-icon>
          <q-select v-model="lang" :options="langOptions" dense borderless options-dense map-options emit-value>
            <template #append>
              <q-avatar>
                <q-icon name="fas fa-globe" />
              </q-avatar>
            </template>
            <q-tooltip> Switch the language of the user interface </q-tooltip>
          </q-select>
          <q-btn flat round :icon="$q.dark.isActive ? 'lightbulb' : 'brightness_2'" @click="toggleDarkMode()">
            <q-tooltip> Toggle dark mode </q-tooltip>
          </q-btn>
          <q-btn-dropdown v-show="!isLoggedIn" color="secondary" outline label="Log In" icon="account_circle">
            <q-list>
              <q-item v-close-popup clickable @click="tologin(source + '/login/google')">
                <q-item-section avatar>
                  <q-icon name="fab fa-google" />
                </q-item-section>
                <q-item-section>
                  <!-- <q-item-label caption>{{$t('loginselector')}}</q-item-label> -->
                  <q-item-label>Google</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-close-popup clickable @click="tologin(source + '/login/github')">
                <q-item-section avatar>
                  <q-icon name="fab fa-github" />
                </q-item-section>
                <q-item-section>
                  <!-- <q-item-label caption>{{$t('loginselector')}}</q-item-label> -->
                  <q-item-label>GitHub</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn v-show="isLoggedIn" round flat dense color="purple">
            <q-tooltip> User information </q-tooltip>
            <q-avatar>
              <q-icon v-if="getUserInfos.picture_url === ''" name="account_circle" />
              <q-avatar v-else :key="getUserInfos.avatarKey" color="default" text-color="white" size="xs">
                <img :src="getUserInfos.picture_url" />
              </q-avatar>
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
    <!-- <q-footer > -->
    <!-- <q-item-label caption class="text-center text-grey-3">
       {{$t('footer')[0]}} <q-icon name="favorite" style="font-size:22px;color: #dd137b;height:18px;vertical-align:text-bottom"/> {{$t('footer')[1]}}        <img aria-hidden="true" role="presentation" src="/svg/paris.svg" class="" style="color: #dd137b;height:18px;">
        {{$t('footer')[2]}}
      <a href="https://team.inria.fr/almanach" target="_blank">
        <img aria-hidden="true" role="presentation" src="/svg/almanachInria.svg" class="" style="height:18px;">
      </a>
       v1.0 beta (20200515)</q-item-label> -->
    <!-- </q-footer>     -->
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
      <q-scroll-area style="height: calc(100% - 0px); margin-top: 0px">
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
import '../assets/css/arborator-draft.css';
import notifyError from 'src/utils/notify';
import { mapActions, mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { useMainStore } from 'src/pinia';

export default defineComponent({
  name: 'TempLayout',
  data() {
    return {
      storage: useStorage(),
      drawerLeft: false, // this.$q.platform.is.mobile?false:true,
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
        // {
        //   icon: 'vpn_key',
        //   label: 'Admin',
        //   separator: false,
        //   public: false,
        //   to: '/adminpanel',
        //   bottom: false
        // }
      ],
      lang: this.$i18n.locale,
      langOptions: [
        { value: 'en-us', label: 'EN', img: '/images/usflag.svg' },
        { value: 'fr-fra', label: 'FR', img: '/images/frenchflag.svg' },
      ],
    };
  },
  computed: {
    ...mapState(useMainStore, ['isProjectAdmin', 'source']),
    ...mapState(useUserStore, ['getUserInfos', 'isLoggedIn']),
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
    console.log('KK avatarKEy', this.getUserInfos.avatarKey);
  },
  methods: {
    ...mapActions(useUserStore, ['logout']),
    openURL,
    toggleDarkMode() {
      this.$q.dark.toggle();
      this.storage.setStorageSync('dm', this.$q.dark.isActive);
    },
    tologin(url: string) {
      window.location.assign(url);
      return this.storage;
      // console.log(this.source + '/login/google'); openURL(this.source + '/login/google');
      // window.location.href = 'https://arboratorgrew.elizia.net/login/google';
      // window.location.assign("https://arboratorgrew.elizia.net/login/google");
      // window.location.assign("https://profiterole-almanach-ui.paris.inria.fr:8888/");
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
      const langStorage = this.storage.setStorageSync('arbolang', this.lang);
      if (langStorage == null) {
        if (defaultLang.includes('fr')) {
          this.lang = 'fr';
          // this.lang = { value: 'fr-fra', label: 'FR', img: '/images/frenchflag.svg' };
        } else {
          this.lang = 'en';
          // this.lang = { value: 'en-us', label: 'EN', img: '/images/usflag.svg' };
        }
      } else {
        this.lang = langStorage;
      }
    },
  },
});
</script>
<style></style>
