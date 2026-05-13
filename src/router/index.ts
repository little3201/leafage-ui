import { useUserStore } from 'src/stores/user'
import { retrievePrivilegeTree } from 'src/api/system/privileges'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocation, RouteRecordRaw } from 'vue-router'
import type {PrivilegeTreeNode} from 'src/types'
import BlankLayout from 'layouts/BlankLayout.vue'
import { constantRouterMap } from './routes'

const modules = import.meta.glob('../pages/**/*.{vue,tsx}')

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRouterMap,
})

router.beforeEach(async (to: RouteLocation, from: RouteLocation) => {
  if (['/login'].includes(to.path)) {
    return true
  }

  const userStore = useUserStore()
  // if (!userStore.accessToken) {
  //   await signIn()
  //   return false
  // }

  // if (!userStore.username) {
  //   try {
  //     const res = await getUserInfo()
  //     userStore.$patch({
  //       username: res.data.sub,
  //       fullName: res.data.name,
  //     })
  //   } catch {
  //     userStore.$reset()
  //     // await signIn()
  //     return false
  //   }
  // }

  if (!userStore.privileges.length) {
    try {
      const privileges = await retrievePrivilegeTree()
      userStore.$patch({ privileges: privileges })
    } catch {
      userStore.$reset()
      // await signIn()
      return false
    }
  }

  // 动态注册路由
  if (!userStore.routesAdded) {
    generateRoutes(userStore.privileges).forEach((route) => {
        router.addRoute('home', route)
      }
    )

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

export default router
