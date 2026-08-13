import http from '@/utils/request'
import type { PageResult } from '@/types'

export interface RealnameItem {
  id: number
  user_id: number
  nickname: string
  phone: string
  name: string
  id_card: string
  status: 'verified' | 'pending' | 'rejected'
  verified_at: string | null
  created_at: string
}

export interface RealnameFull {
  id: number
  user_id: number
  name: string
  id_card: string
  front_image: string
  back_image: string
  phone: string
}

export function getRealnameList(params: Record<string, unknown>): Promise<PageResult<RealnameItem>> {
  return http.get<PageResult<RealnameItem>>('/realnames', params)
}

// 二次密码验证后可查看完整实名信息，每次查看写审计日志
export function getRealnameFull(id: number, password: string): Promise<RealnameFull> {
  return http.post<RealnameFull>(`/realnames/${id}/full`, { password })
}
