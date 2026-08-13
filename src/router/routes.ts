import type { RouteMeta, RouteComponent } from 'vue-router'

export interface AppRouteRecordRaw {
  name: string
  path: string
  component?: RouteComponent | (() => Promise<RouteComponent>)
  redirect?: string | { name: string }
  meta?: RouteMeta & { permission?: string }
  children?: AppRouteRecordRaw[]
}

const Layout = () => import('@/layouts/index.vue')

// 常量路由（不依赖权限）
export const constantRoutes: AppRouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/redirect',
    name: 'Redirect',
    component: () => import('@/views/error/redirect.vue'),
    meta: { title: '刷新中', hidden: true }
  },
  {
    path: '/',
    name: 'Root',
    component: Layout,
    redirect: '/dashboard',
    meta: { title: '首页', hidden: true },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据大盘', icon: 'Odometer', affix: true, permission: 'dashboard:view' }
      }
    ]
  }
]

// 404 兜底（在守卫中动态追加）
export function createCatchAllRoute(): AppRouteRecordRaw {
  return {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在', hidden: true }
  }
}
