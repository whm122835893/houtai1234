import http from '@/utils/request'
import type { PageResult } from '@/types'

export interface AdminAccount {
  id: number
  username: string
  nickname: string
  role: string
  role_name: string
  phone: string
  status: 0 | 1
  last_login_at: string | null
  created_at: string
}

export interface RoleItem {
  id: number
  name: string
  code: string
  description: string
  permissions: string[]
  created_at: string
}

export function getAdminAccountList(params: Record<string, unknown>): Promise<PageResult<AdminAccount>> {
  return http.get<PageResult<AdminAccount>>('/permission/admins', params)
}

export function createAdminAccount(data: Partial<AdminAccount> & { password: string }): Promise<null> {
  return http.post<null>('/permission/admins', data)
}

export function updateAdminStatus(id: number, status: 0 | 1): Promise<null> {
  return http.post<null>(`/permission/admins/${id}/status`, { status })
}

export function deleteAdminAccount(id: number, password: string): Promise<null> {
  return http.post<null>(`/permission/admins/${id}/delete`, { password })
}

export function getRoleList(): Promise<RoleItem[]> {
  return http.get<RoleItem[]>('/permission/roles')
}

export function saveRole(data: Partial<RoleItem>): Promise<RoleItem> {
  return http.post<RoleItem>('/permission/roles', data)
}
