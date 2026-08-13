import http from '@/utils/request'
import type { PermissionResult } from '@/types'

export function getUserPermission(): Promise<PermissionResult> {
  return http.get<PermissionResult>('/admin/permissions')
}
