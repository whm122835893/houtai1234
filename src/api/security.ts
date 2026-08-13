import http from '@/utils/request'
import type { PageResult } from '@/types'

export interface BlacklistItem {
  id: number
  user_id: number
  nickname: string
  phone: string
  reason: string
  operator: string
  created_at: string
}

export interface RiskAlarm {
  id: number
  type: 'device' | 'ip' | 'trade' | 'login' | 'recharge'
  level: 'low' | 'medium' | 'high'
  title: string
  content: string
  status: 'pending' | 'processed' | 'ignored'
  user_id: number | null
  nickname: string | null
  created_at: string
}

export interface TradeApproval {
  id: number
  order_no: string
  user_id: number
  nickname: string
  collectible_name: string
  amount: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  applied_at: string
  handled_at: string | null
}

export function getBlacklist(params: Record<string, unknown>): Promise<PageResult<BlacklistItem>> {
  return http.get<PageResult<BlacklistItem>>('/security/blacklist', params)
}

export function addBlacklist(data: { phone: string; reason: string; password: string }): Promise<null> {
  return http.post<null>('/security/blacklist', data)
}

export function removeBlacklist(id: number): Promise<null> {
  return http.delete<null>(`/security/blacklist/${id}`)
}

export function getRiskAlarms(params: Record<string, unknown>): Promise<PageResult<RiskAlarm>> {
  return http.get<PageResult<RiskAlarm>>('/security/alarms', params)
}

export function handleAlarm(id: number, action: 'processed' | 'ignored'): Promise<null> {
  return http.post<null>(`/security/alarms/${id}`, { action })
}

export function getTradeApprovals(params: Record<string, unknown>): Promise<PageResult<TradeApproval>> {
  return http.get<PageResult<TradeApproval>>('/security/trade-approvals', params)
}

export function approveTrade(id: number, approve: boolean, password: string): Promise<null> {
  return http.post<null>(`/security/trade-approvals/${id}`, { approve, password })
}
