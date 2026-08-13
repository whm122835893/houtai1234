import { defineStore } from 'pinia'
import { getUserPermission } from '@/api/permission'
import { constantRoutes, type AppRouteRecordRaw } from '@/router/routes'
import type { MenuItem } from '@/types'

interface PermissionState {
  menus: MenuItem[]
  permissions: string[]
  dynamicRoutes: AppRouteRecordRaw[]
  isRoutesLoaded: boolean
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    menus: [],
    permissions: [],
    dynamicRoutes: [],
    isRoutesLoaded: false
  }),
  actions: {
    async loadPermission(): Promise<void> {
      const result = await getUserPermission()
      this.menus = result.menus
      this.permissions = result.permissions
      this.isRoutesLoaded = true
    },
    // 常量路由（登录页等）用于 reset
    resetRoutes(): void {
      this.menus = []
      this.permissions = []
      this.dynamicRoutes = []
      this.isRoutesLoaded = false
    },
    has(permission: string): boolean {
      return this.permissions.includes(permission)
    },
    hasAny(list: string[]): boolean {
      return list.some((item) => this.permissions.includes(item))
    }
  }
})

export { constantRoutes }
