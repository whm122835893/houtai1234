import http from '@/utils/request'
import type { PageResult } from '@/types'

export interface RechargeRecord {
  id: number
  order_no: string
  user_id: number
  nickname: string
  phone: string
  channel: string
  amount: string
  status: 'pending' | 'success' | 'failed'
  created_at: string
  paid_at: string | null
}

export interface WalletFlow {
  id: number
  user_id: number
  nickname: string
  type: 'recharge' | 'consume' | 'refund' | 'transfer_in' | 'transfer_out' | 'fee' | 'withdraw'
  type_text: string
  amount: string
  balance_after: string
  remark: string
  created_at: string
}

export interface FeeStat {
  channel: string
  total_amount: string
  fee_amount: string
  order_count: number
  date: string
}

export function getRechargeList(params: Record<string, unknown>): Promise<PageResult<RechargeRecord>> {
  return http.get<PageResult<RechargeRecord>>('/wallet/recharges', params)
}

export function getWalletFlowList(params: Record<string, unknown>): Promise<PageResult<WalletFlow>> {
  return http.get<PageResult<WalletFlow>>('/wallet/flows', params)
}

export function getFeeStats(params: Record<string, unknown>): Promise<PageResult<FeeStat>> {
  return http.get<PageResult<FeeStat>>('/wallet/fees', params)
}

export interface FundAudit {
  id: number
  date: string
  recharge_total: string
  consume_total: string
  refund_total: string
  fee_total: string
  balance_total: string
  diff: string
  status: 'balanced' | 'diff'
}

export function getFundAudit(params: Record<string, unknown>): Promise<PageResult<FundAudit>> {
  return http.get<PageResult<FundAudit>>('/wallet/audits', params)
}
