import { defineBoot } from '#q-app/wrappers'
import { useUserStore } from 'stores/user-store'
import { retrievePrivilegeTree } from 'src/api/privileges'
import { signIn, getUserInfo } from 'src/api/authentication'
import type { RouteRecordRaw } from 'vue-router'
import type { PrivilegeTreeNode } from 'src/types'


const BlankLayout = () => import('src/layouts/BlankLayout.vue')

const modules = import.meta.glob('../pages/**/*.{vue,tsx}')

export default defineBoot(({ router, store }) => {
  router.beforeEach(async (to, from) => {
    if (['/callback', '/login'].includes(to.path)) return true

    const userStore = useUserStore(store)
    if (!userStore.accessToken) {
      await signIn()
      return false
    }

    // 加载用户信息
    if (!userStore.username) {
      const res = await getUserInfo()
      userStore.$patch({
        username: res.data.sub,
        fullName: res.data.name,
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
        router.addRoute('home', route)
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

      return nextData
    }
    return true
  })
})

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
      const component = route.meta.component
      if (comModule) {
        // 动态加载路由文件
        item.component = comModule
      } else if (component.includes('#')) {
        item.component = BlankLayout
      }
    }
    // recursive child routes
    if (route.children) {
      item.children = generateRoutes(route.children)
    }
    res.push(item)
  }
  return res
}
