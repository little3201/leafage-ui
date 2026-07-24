import type { PrivilegeTreeNode } from '@/types'
import type { RouteRecordRaw } from 'vue-router'
import Cookies from 'universal-cookie'
import { createRouter, createWebHistory } from 'vue-router'
import { getUserInfo, signIn } from '@/api/authentication'
import { retrievePrivilegeTree } from '@/api/system/privileges'
import { useUserStore } from '@/stores/user'
import { routes } from './routes'

// Lazy load layout
const BlankLayout = () => import('@/layouts/BlankLayout.vue')

const modules = import.meta.glob('../pages/**/*.{vue,tsx}')

const cookies = new Cookies(null, { path: '/' })

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

router.beforeEach(async (to, from) => {
  if (['/login'].includes(to.path)) {
    return true
  }

  const userStore = useUserStore()

  // 加载用户信息
  if (!userStore.username) {
    try {
      const res = await getUserInfo()
      if (res && res.data) {
        userStore.setUserinfo(res.data.sub, res.data.name, res.data.email)
      }
    } catch {
      userStore.$reset()
      signIn()
      return false
    }
  }

  // 加载权限信息
  if (userStore.privileges.length === 0) {
    try {
      const res = await retrievePrivilegeTree()
      if (res && res.data) {
        userStore.setPrivileges(res.data)
      }
    } catch {
      userStore.$reset()
      signIn()
      return false
    }
  }

  // 动态注册路由
  if (!userStore.routesAdded) {
    for (const route of generateRoutes(userStore.privileges)) {
      router.addRoute('home', route)
    }

    if (!router.hasRoute('ErrorNotFound')) {
      router.addRoute({
        path: '/:cacheAll(.*)*',
        name: 'ErrorNotFound',
        component: () => import('@/pages/ErrorNotFound.vue'),
      })
    }

    userStore.routesAdded = true
  }

  if (!from.name && to.matched.length === 0) {
    return { path: to.fullPath, replace: true, query: to.query, hash: to.hash }
  }
  return true
})

router.afterEach(to => {
  const pageInfo = {
    path: to.path,
    query: to.fullPath.includes('?')
      ? to.fullPath.slice(Math.max(0, to.fullPath.indexOf('?')))
      : '',
    name: to.name,
    params: to.params,
    meta: to.meta,
  }

  cookies.set('current_page', JSON.stringify(pageInfo))
})

/**
 * Generate routes dynamically based on user privileges
 * @param {PrivilegeTreeNode[]} routes - Array of privilege tree nodes
 * @returns {RouteRecordRaw[]} - Array of route records
 */
export function generateRoutes (routes: PrivilegeTreeNode[]): RouteRecordRaw[] {
  const res: RouteRecordRaw[] = []
  for (const route of routes) {
    const item: RouteRecordRaw = {
      path: route.meta.path || '',
      name: route.name,
      redirect: route.meta.redirect,
      component: null,
      children: [],
    }
    if (route.meta.component) {
      const comModule
        = modules[`../pages/${route.meta.component}/IndexPage.vue`]
      const component = route.meta.component
      if (comModule) {
        item.component = comModule
      } else if (component.includes('#')) {
        item.component = BlankLayout
      }
    }
    if (route.children) {
      item.children = generateRoutes(route.children)
    }
    res.push(item)
  }
  return res
}

export default router
