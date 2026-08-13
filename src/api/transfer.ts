import http from '@/utils/request'
import type { PageResult } from '@/types'

export interface TransferRecord {
  id: number
  transfer_no: string
  collectible_id: number
  collectible_name: string
  image: string
  from_user_id: number
  from_nickname: string
  to_user_id: number
  to_nickname: string
  status: 'pending' | 'completed' | 'cancelled' | 'revoked'
  created_at: string
  completed_at: string | null
}

export interface TransferStats {
  total_count: number
  completed_count: number
  today_count: number
  today_completed: number
}

export function getTransferList(params: Record<string, unknown>): Promise<PageResult<TransferRecord>> {
  return http.get<PageResult<TransferRecord>>('/transfers', params)
}

export function getTransferStats(): Promise<TransferStats> {
  return http.get<TransferStats>('/transfers/stats')
}

// 撤销转赠：仅已完成可撤销，校验接收方仍持有
export function revokeTransfer(id: number, reason: string, password: string): Promise<null> {
  return http.post<null>(`/transfers/${id}/revoke`, { reason, password })
}
