import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router';
import { route } from 'quasar/wrappers';

import routes from './routes';
import { useProjectStore } from 'src/pinia/modules/project';
import { useKlangStore } from 'src/pinia/modules/klang';

export default route(() => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE),

    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
  });
  Router.afterEach((to, from) => {
    const configStore = useProjectStore();
    const klangStore = useKlangStore();
    if (to.params.projectname && to.params.projectname !== from.params.projectname) {
      configStore.fetchProjectSettings({ projectname: to.params.projectname } as { projectname: string });
      configStore.reloadSamples = true;
    }
    if (to.params.kprojectname) {
      klangStore.fetchKlangProjectSettings({
        projectname: to.params.kprojectname,
      } as { projectname: string });
    }
  });

  return Router;
});
