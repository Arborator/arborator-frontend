// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

const source = 'https://arborator-backend:5000';

/* eslint-env node */
const ESLintPlugin = require('eslint-webpack-plugin');

// const source = "https://arboratorgrew.elizia.net:8888";
const { configure } = require('quasar/wrappers');

module.exports = configure((ctx) => ({
  supportTS: true,

  // app boot file (/src/boot)
  // --> boot files are part of "main.js"
  boot: ['i18n', 'axios', 'vue-cookies', 'vue-storage', 'vue-audio-visual', 'pinia', 'matomo'],

  css: ['app.scss'],

  extras: [
    'ionicons-v4',
    // 'mdi-v3',
    'fontawesome-v5',
    // 'eva-icons',
    // 'themify',
    // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

    'roboto-font', // optional, you are not bound to it
    'material-icons', // optional, you are not bound to it
    'material-icons-outlined',
  ],

  framework: {
    // iconSet: 'ionicons-v4',
    // lang: Quasar.lang.getLocale(), // Quasar language

    // all: true, // --- includes everything; for dev only!

    components: [
      'QLayout',
      'QHeader',
      'QFooter',
      'QDrawer',
      'QPageContainer',
      'QPage',
      'QToolbar',
      'QToolbarTitle',
      'QBtn',
      'QBtnDropdown',
      'QBtnGroup',
      'QBtnToggle',
      'QIcon',
      'QList',
      'QItem',
      'QItemSection',
      'QItemLabel',
      'QSpace',
      'QBadge',
      'QTooltip',
      'QAvatar',
      'QCard',
      'QCardSection',
      'QCardActions',
      'QSeparator',
      'QParallax',
      'QInput',
      'QSelect',
      'QField',
      'QForm',
      'QRadio',
      'QAvatar',
      'QChip',
      'QTable',
      'QTr',
      'QTd',
      'QPopupEdit',
      'QMenu',
      'QToggle',
      'QMarkupTable',
      'QBreadcrumbs',
      'QBreadcrumbsEl',
      'QDialog',
      'QUploader',
      'QBar',
      'QBanner',
      'QImg',
      'QTab',
      'QTabs',
      'QTabPanels',
      'QTabPanel',
      'QExpansionItem',
      'QFab',
      'QFabAction',
      'QPageSticky',
      'QScrollArea',
      'QPageScroller',
      'QLinearProgress',
      'QCheckbox',
      'QSpinnerFacebook',
      'QVirtualScroll',
      'QCircularProgress',
      'QCarousel',
      'QCarouselControl',
      'QCarouselSlide',
      'QPopupProxy',
      'QSkeleton',
      'QFile',
      'QResponsive',
      'QOptionGroup',
    ],

    directives: ['Ripple', 'ClosePopup'],

    // Quasar plugins
    plugins: ['Notify', 'LoadingBar', 'Loading', 'AppVisibility', 'AppFullscreen', 'BottomSheet', 'LocalStorage'],
    config: {
      notify: { position: 'top-right', timeout: 2000, color: 'positive' },
      dark: 'auto',
    },
  },

  supportIE: true,
  //     supportIE: false,

  build: {
    env: ctx.dev
      ? {
          // so on dev we'll have
          API: 'https://127.0.0.1:5000',
        }
      : {
          // and on build (production):
          // API: JSON.stringify("https://arboratorgrew.elizia.net:8888"),
          API: 'https://arborator.grew.fr',
        },
    scopeHoisting: true,
    devtool: 'source-map',
    // vueRouterMode: 'history',
    // vueCompiler: true,
    // gzip: true,
    // analyze: true,
    // extractCSS: false,
    // https://quasar.dev/quasar-cli/handling-webpack
    // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
    // chainWebpack(chain) {
    // chain.plugin('eslint-webpack-plugin').use(ESLintPlugin, [{ extensions: ['js', 'vue'] }]);
    // },
  },
  dev: {
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
  },
  devServer: {
    https: true,
    // port: 8080,
    // open: true, // opens browser window automatically
    proxy: {
      '/api': {
        target: source,
        ws: true,
        changeOrigin: false,
        secure: false,
      },
      '/login': {
        target: source,
        ws: true,
        changeOrigin: false,
        secure: false,
      },
      '/logout': {
        target: source,
        ws: true,
        changeOrigin: false,
        secure: false,
      },
      '/media': {
        target: source,
        ws: true,
        changeOrigin: false,
        secure: false,
      },
    },
  },

  // animations: 'all', // --- includes all animations
  animations: [],

  ssr: {
    pwa: false,
  },

  pwa: {
    // workboxPluginMode: 'InjectManifest',
    // workboxOptions: {}, // only for NON InjectManifest
    manifest: {
      // name: 'arborator',
      // short_name: 'arborator',
      // description: 'Frontend for arborator draft',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#ffffff',
      theme_color: '#027be3',
      icons: [
        {
          src: 'icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png',
        },
        {
          src: 'icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'icons/icon-256x256.png',
          sizes: '256x256',
          type: 'image/png',
        },
        {
          src: 'icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png',
        },
        {
          src: 'icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
  },

  cordova: {
    // id: 'ilpga.arborator',
    // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
  },

  electron: {
    // bundler: 'builder', // or 'packager'

    chainWebpackMain(chain) {
      chain.plugin('eslint-webpack-plugin').use(ESLintPlugin, [{ extensions: ['js'] }]);
    },

    // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
    chainWebpackPreload(chain) {
      chain.plugin('eslint-webpack-plugin').use(ESLintPlugin, [{ extensions: ['js'] }]);
    },

    packager: {
      // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
      // OS X / Mac App Store
      // appBundleId: '',
      // appCategoryType: '',
      // osxSign: '',
      // protocol: 'myapp://path',
      // Windows only
      // win32metadata: { ... }
    },

    builder: {
      // https://www.electron.build/configuration/configuration
      // appId: 'arborator-frontend'
    },
  },
}));
