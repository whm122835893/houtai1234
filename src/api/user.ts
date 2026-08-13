import http from '@/utils/request'
import type { PageResult } from '@/types'

export interface UserItem {
  id: number
  nickname: string
  avatar: string
  phone: string
  status: 0 | 1 // 0 冻结 1 正常
  is_black: 0 | 1
  balance: string
  asset_count: number
  invite_count: number
  created_at: string
  last_login_at: string
}

export interface WalletAsset {
  balance: string
  frozen_balance: string
  total_recharge: string
  total_withdraw: string
}

export interface UserCollectible {
  id: number
  collectible_id: number
  collectible_name: string
  image: string
  serial_no: string
  status: 'holding' | 'on_sale' | 'transferred' | 'composed' | 'destroyed'
  obtained_at: string
}

export interface PriorityQuotaItem {
  id: number
  activity_name: string
  total_times: number
  used_times: number
  valid_until: string
  status: 'valid' | 'expired' | 'used_up'
}

export interface UserDetail {
  id: number
  nickname: string
  phone: string
  avatar: string
  status: 0 | 1
  is_black: 0 | 1
  created_at: string
  last_login_at: string
  realname: { name: string; id_card: string; status: 'verified' | 'pending' | 'none' }
  wallet: WalletAsset
  collectibles: UserCollectible[]
  priority_quotas: PriorityQuotaItem[]
  invite_parent: { id: number; nickname: string; phone: string } | null
  invite_children: Array<{ id: number; nickname: string; phone: string; created_at: string }>
}

export function getUserList(params: Record<string, unknown>): Promise<PageResult<UserItem>> {
  return http.get<PageResult<UserItem>>('/users', params)
}

export function getUserDetail(id: number): Promise<UserDetail> {
  return http.get<UserDetail>(`/users/${id}`)
}

export function freezeUser(id: number, reason: string, password: string): Promise<null> {
  return http.post<null>(`/users/${id}/freeze`, { reason, password })
}

export function unfreezeUser(id: number, reason: string): Promise<null> {
  return http.post<null>(`/users/${id}/unfreeze`, { reason })
}

export function resetUserPassword(id: number, password: string): Promise<null> {
  return http.post<null>(`/users/${id}/reset-password`, { password })
}

export function forceLogout(id: number): Promise<null> {
  return http.post<null>(`/users/${id}/force-logout`)
}

export function blacklistUser(id: number, reason: string, password: string): Promise<null> {
  return http.post<null>(`/users/${id}/black`, { reason, password })
}

export function unblacklistUser(id: number): Promise<null> {
  return http.post<null>(`/users/${id}/unblack`)
}

export function forceRecover(id: number, collectibleId: number, reason: string, password: string): Promise<null> {
  return http.post<null>(`/users/${id}/recover`, { collectible_id: collectibleId, reason, password })
}
