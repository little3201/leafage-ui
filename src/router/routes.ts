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
    ],
  },
]
