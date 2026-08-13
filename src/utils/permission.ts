import { usePermissionStore } from '@/store/permission'

// 权限判断：需满足所有要求，任一缺失返回 false
export function hasPermission(permissions: string[] | string): boolean {
  const store = usePermissionStore()
  const userPerms = store.permissions
  const required = Array.isArray(permissions) ? permissions : [permissions]
  return required.every((item) => userPerms.includes(item))
}

export function hasAnyPermission(permissions: string[]): boolean {
  const store = usePermissionStore()
  const userPerms = store.permissions
  return permissions.some((item) => userPerms.includes(item))
}
