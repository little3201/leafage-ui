import { useUserStore } from 'stores/user-store'
import { createRouter, createWebHistory } from 'vue-router'
import { constantRouterMap } from './routes'

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes: constantRouterMap,
  scrollBehavior: () => ({ left: 0, top: 0 })
})


router.beforeEach((to, from) => {
  if (['/login'].includes(to.path)) return true

  const userStore = useUserStore()

  // 动态注册路由
  if (!userStore.routesAdded) {
    if (!router.hasRoute('ErrorNotFound')) {
      router.addRoute({
        path: '/:cacheAll(.*)*',
        name: 'ErrorNotFound',
        component: () => import('pages/ErrorNotFound.vue'),
      })
    }

    userStore.routesAdded = true
  }

  if (!from.name && to.matched.length === 0) {
    return { path: to.fullPath, replace: true, query: to.query, hash: to.hash }
  }
  return true
})

export default router