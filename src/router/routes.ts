import type { RouteRecordRaw } from 'vue-router'
import MainLayout from 'layouts/MainLayout.vue'

export const constantRouterMap: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'index',
        component: () => import('pages/index.vue'),
      },
      {
        path: 'system',
        name: 'system',
        redirect: 'system/users',
        children: [
          {
            path: 'users',
            name: 'users',
            component: () => import('pages/system/users/index.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/login.vue'),
  },
]
