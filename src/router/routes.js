
const routes = [
  {
    path: '/',
    component: () => import('layouts/AppLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/projects/:projectname', component: () => import('pages/Project.vue'), props: true, name:'project' },
      { path: '/projects/:projectname/:samplename', component: () => import('pages/Sample.vue'), props: true },
      {
        path: 'settings',
        component: () => import('pages/Settings'),
        meta: {
          requiresAuth: true
        }
      },
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
