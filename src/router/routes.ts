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
        component: () => import('pages/IndexPage.vue')
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('pages/profile/IndexPage.vue')
      },
      {
        path: '/faq',
        name: 'faq',
        component: () => import('pages/faq/IndexPage.vue')
      }
    ]
  },
  {
    path: '/callback',
    name: 'callback',
    component: () => import('pages/CallbackPage.vue')
  }
]
