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

    if (!userStore.username) {
      try {
        const res = await getUserInfo()
        userStore.$patch({
          username: res.data.sub,
          fullName: res.data.name,
        })
      } catch {
        userStore.$reset()
        await signIn()
        return false
      }
    }

    if (!userStore.privileges.length) {
      try {
        const privilegesResp = await retrievePrivilegeTree()
        userStore.$patch({ privileges: privilegesResp.data })
      } catch {
        userStore.$reset()
        await signIn()
        return false
      }
    }

    if (!userStore.routesAdded) {
      generateRoutes(userStore.privileges).forEach((route) => {
        router.addRoute('home', route)
      })

      if (!router.hasRoute('ErrorNotFound')) {
        router.addRoute({
          path: '/:pathMatch(.*)*',
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
