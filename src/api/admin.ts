import http from '@/utils/request'
import type { AdminUser } from '@/types'

export interface LoginResult {
  token: string
  user: AdminUser
}

export function login(data: { username: string; password: string }): Promise<LoginResult> {
  return http.post<LoginResult>('/admin/login', data)
}

export function logout(): Promise<null> {
  return http.post<null>('/admin/logout')
}

export function getAdminInfo(): Promise<AdminUser> {
  return http.get<AdminUser>('/admin/info')
}
