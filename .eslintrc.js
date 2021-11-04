module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: true,

  parserOptions: {
    
    parser: '@babel/eslint-parser',
    // parser: 'babel-eslint',
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports
  },
  
  env: {
    browser: true
  },

  // Rules order is important, please avoid shuffling them
  extends: [
    // Base ESLint recommended rules
    // 'plugin:prettier/recommended',
    // Uncomment any of the lines below to choose desired strictness,
    // but leave only one uncommented!
    // See https://eslint.vuejs.org/rules/#available-rules
    // "prettier/prettier",
    // "plugin:prettier/recommended",
    // 'plugin:vue/vue3-strongly-recommended', // Priority B: Strongly Recommended (Improving Readability)
    // 'plugin:vue/vue3-recommended', // Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead)
    
    // "airbnb",
    
    // 'eslint:recommended',
    // "prettier",
    'plugin:vue/vue3-essential', // Priority A: Essential (Error Prevention)
    'airbnb-base',
    // "plugin:vue/essential",
    "plugin:prettier/recommended",
    "eslint:recommended"

  ],

  plugins: [
    // https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-file
    // required to lint *.vue files
    'vue',
    'prettier',
    'import'

  ],

  globals: {
    ga: 'readonly', // Google Analytics
    cordova: 'readonly',
    __statics: 'readonly',
    __QUASAR_SSR__: 'readonly',
    __QUASAR_SSR_SERVER__: 'readonly',
    __QUASAR_SSR_CLIENT__: 'readonly',
    __QUASAR_SSR_PWA__: 'readonly',
    process: 'readonly',
    Capacitor: 'readonly',
    chrome: 'readonly'
  },

  // add your custom rules here
  rules: {
    "prettier/prettier": ["error"],

    'no-param-reassign': 'off',
    'no-void': 'off',
    'no-nested-ternary': 'off',
    'max-classes-per-file': 'off',

    'import/first': 'off',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'prefer-promise-reject-errors': 'off',
    'no-tabs': 'off',
    "max-len": [
      "off",
      {
          "code": 150
      }
    ],
    'vue/no-mutating-props': 'warn',
    'no-restricted-syntax': 'off',
    'object-curly-newline': 'off',
    'no-unused-vars': 'off',
    'operator-linebreak': 'off',
    'vue/require-v-for-key': 'warn',
    'guard-for-in':'warn',
    'no-continue':'warn',
    'new-cap':'warn',
    'no-cond-assign':'warn',
    'no-use-before-define':'warn',
    'import/no-mutable-exports': 'warn',


    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}