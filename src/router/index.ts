import { useUserStore } from 'src/stores/user'
import { createRouter, createWebHistory } from 'vue-router'
import { constantRouterMap } from './routes'

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRouterMap,
})

router.beforeEach((to, from) => {
  if (['/login'].includes(to.path)) {
    return true
  }

  const userStore = useUserStore()

  // 动态注册路由
  if (!userStore.routesAdded) {
    if (!router.hasRoute('error')) {
      router.addRoute({
        path: '/:cacheAll(.*)*',
        name: 'error',
        component: () => import('pages/error.vue'),
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
