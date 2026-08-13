import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { constantRoutes, type AppRouteRecordRaw, createCatchAllRoute } from './routes'
import { viewModules, pathToName } from './views'
import { useAdminStore } from '@/store/admin'
import { usePermissionStore } from '@/store/permission'
import { useAppStore } from '@/store/app'
import type { MenuItem } from '@/types'

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes as unknown as readonly RouteRecordRaw[],
  scrollBehavior: () => ({ top: 0 })
})

export function buildDynamicRoutes(menus: MenuItem[]): AppRouteRecordRaw[] {
  const Layout = () => import('@/layouts/index.vue')
  const result: AppRouteRecordRaw[] = []

  for (const menu of menus) {
    if (menu.hidden) continue
    const children = menu.children?.filter((child) => !child.hidden) ?? []

    if (children.length > 0) {
      const subRoutes: AppRouteRecordRaw[] = children
        .map((child) => {
          const component = viewModules[child.path]
          if (!component) return null
          return {
            path: child.path,
            name: pathToName(child.path),
            component,
            meta: { title: child.title, icon: child.icon, permission: child.permission }
          } as AppRouteRecordRaw
        })
        .filter((route): route is AppRouteRecordRaw => route !== null)

      if (subRoutes.length === 0) continue
      result.push({
        path: menu.path,
        name: pathToName(menu.path),
        component: Layout,
        redirect: subRoutes[0].path,
        meta: { title: menu.title, icon: menu.icon },
        children: subRoutes
      })
    } else {
      const component = viewModules[menu.path]
      if (!component) continue
      result.push({
        path: menu.path,
        name: pathToName(menu.path),
        component: Layout,
        meta: { title: menu.title, icon: menu.icon },
        children: [
          {
            path: menu.path,
            name: `${pathToName(menu.path)}Index`,
            component,
            meta: { title: menu.title, icon: menu.icon, permission: menu.permission }
          }
        ]
      })
    }
  }
  return result
}

// 根据菜单生成侧边栏展示结构（与路由对应）
export function buildMenus(menus: MenuItem[]): MenuItem[] {
  return menus
    .filter((menu) => !menu.hidden)
    .map((menu) => ({
      ...menu,
      children: menu.children?.filter((child) => !child.hidden)
    }))
}

// 全局路由守卫
router.beforeEach(async (to) => {
  const adminStore = useAdminStore()
  const permissionStore = usePermissionStore()
  const appStore = useAppStore()

  appStore.setActiveMenu(to.path)

  if (!adminStore.isLoggedIn) {
    if (to.path === '/login') return true
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.path === '/login') {
    return { path: '/dashboard' }
  }

  // 首次加载权限后动态注册路由
  if (!permissionStore.isRoutesLoaded) {
    try {
      await permissionStore.loadPermission()
      const dynamicRoutes = buildDynamicRoutes(permissionStore.menus)
      for (const route of dynamicRoutes) {
        router.addRoute(route as unknown as RouteRecordRaw)
      }
      router.addRoute(createCatchAllRoute() as unknown as RouteRecordRaw)
      permissionStore.dynamicRoutes = dynamicRoutes
      return { ...to, replace: true }
    } catch {
      return { path: '/login' }
    }
  }
  return true
})

router.afterEach((to) => {
  const appStore = useAppStore()
  const title = to.meta?.title as string | undefined
  document.title = title ? `${title} · 数和文创运营后台` : '数和文创 · 运营管理后台'
  if (to.path && to.path !== '/login' && to.meta && !to.meta.hidden) {
    appStore.addTab(to)
  }
})

export default router
