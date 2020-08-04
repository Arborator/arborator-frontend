import Vue from 'vue'
import VueRouter from 'vue-router'
import store from "../store/index.js"

import routes from './routes'
// import { store } from 'quasar/wrappers'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */
export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    // mode: 'history',
    // hash: false,
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE,
    afterEach: to => {
      console.log("KK after each", to.params)

    }
  })

  // Router.onError(error => {
  //   if (/loading chunk \d* failed./i.test(error.message)) {
  //     window.location.reload()
  //   }
  // })

  /*
  * After each routing, check if it lands on a project.
  * if yes, check if it's a different project from the previous one
  * if yes, fetch the config of the project (annotation and display)
  */
  Router.afterEach((to, from) => {
    if (to.params.projectname && to.params.projectname !== from.params.projectname) {
      store.dispatch('config/fetchConfigShown', {projectname: to.params.projectname})
      store.dispatch('config/fetchConfigConllu', {projectname: to.params.projectname})
    } 
  });

  return Router
}
