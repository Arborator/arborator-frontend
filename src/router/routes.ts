import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/', component: () => import('src/layouts/AppLayout.vue'),
    children: [
      { path: '', component: () => { return import('src/pages/Index.vue'); }  },
      { path: '/projects', component: () => import('src/pages/ProjectsHub.vue') },
      {
        path: '/projects/:projectname',
        component: () => import('src/pages/Project.vue'),
        props: true,
        name: 'project',
      },
      { path: '/projects/:projectname/:samplename', component: () => import('src/pages/Sample.vue'), props: true },
      { path: '/myprojects', component: () => import('src/pages/MyProjects.vue'), props: true },
      { path: '/settings', component: () => import('src/pages/Settings.vue'), meta: { requiresAuth: true } },
      { path: '/klang', component: () => import('src/pages/Klang.vue') },
      { path: '/klang/:kprojectname', component: () => import('src/pages/KlangProject.vue'), props: true },
      { path: '/klang/:kprojectname/:ksamplename', component: () => import('src/pages/KlangSample.vue'), props: true },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
