import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { constantRouterMap } from './routes'
import { useUserStore } from 'stores/user-store'
import Cookies from 'universal-cookie'
import { retrievePrivilegeTree } from 'src/api/privileges'
import { signIn, getSub } from 'src/api/authentication'
import { fetchMe } from 'src/api/users'
import type { PrivilegeTreeNode } from 'src/types'
// Lazy load layout
const BlankLayout = () => import('layouts/BlankLayout.vue')


const cookies = new Cookies(null, { path: '/' })
const modules = import.meta.glob('../pages/**/*.{vue,tsx}')

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})


router.beforeEach(async (to, from) => {
  if (['/callback', '/login'].includes(to.path)) return true

  const userStore = useUserStore()
  if (!userStore.accessToken) {
    await signIn()
    return false
  }

  // 加载用户信息
  if (!userStore.username) {
    const [subRes, userRes] = await Promise.all([getSub(), fetchMe()])
    userStore.$patch({
      username: subRes.data.sub,
      avatar: userRes.data.avatar,
    })
  }

  // 加载权限信息
  if (!userStore.privileges.length) {
    const privilegesResp = await retrievePrivilegeTree()
    userStore.$patch({ privileges: privilegesResp.data })
  }

  // 动态注册路由
  if (!to.name || !router.hasRoute(to.name)) {
    const routes = generateRoutes(userStore.privileges)
    routes.forEach((route) => {
      router.addRoute('home', route as RouteRecordRaw)
    })

    router.addRoute({
      path: '/:cacheAll(.*)*',
      name: 'ErrorNotFound',
      component: () => import('pages/ErrorNotFound.vue'),
    })

    const redirectPath = from.query.redirect || to.path
    const redirect = decodeURIComponent(redirectPath as string)
    const nextData = to.path === redirect
      ? { ...to, replace: true }
      : { path: redirect }

    cookies.set('current_page', nextData.path)
    return nextData
  }

  cookies.set('current_page', decodeURIComponent(to.fullPath as string))
  return true
})


/**
 * Generate routes dynamically based on user privileges
 * @param {PrivilegeTreeNode[]} routes - Array of privilege tree nodes
 * @returns {RouteRecordRaw[]} - Array of route records
 */
export const generateRoutes = (routes: PrivilegeTreeNode[]): RouteRecordRaw[] => {
  const res: RouteRecordRaw[] = []
  for (const route of routes) {
    const item: RouteRecordRaw = {
      path: route.meta.path,
      name: route.name,
      redirect: route.meta.redirect as string,
      component: null,
      children: []
    }
    if (route.meta.component) {
      const comModule = modules[`../pages/${route.meta.component}/IndexPage.vue`]
      const component = route.meta.component as string
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
