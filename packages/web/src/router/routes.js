
const routes = [
  {
    path: '/',
    component: () => import('layouts/GuestLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Login.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { auth: true },
    children: [
      { path: '/urls', component: () => import('pages/urls/urls-list.vue') },
      { path: '/alerts', component: () => import('pages/alerts/alerts-list.vue') }
    ]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
