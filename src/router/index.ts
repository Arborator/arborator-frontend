import { route } from 'quasar/wrappers';
import { useKlangStore } from 'src/pinia/modules/klang';
import { useProjectStore } from 'src/pinia/modules/project';
import { createMemoryHistory, createRouter, createWebHashHistory, createWebHistory } from 'vue-router';

import routes from './routes';

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
      configStore.fetchProjectSettings({ projectName: to.params.projectname } as { projectName: string });
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
