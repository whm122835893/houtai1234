import http from '@/utils/request'
import type { PageResult } from '@/types'

export interface MarketOrder {
  id: number
  order_no: string
  collectible_id: number
  collectible_name: string
  image: string
  seller_id: number
  seller_nickname: string
  buyer_id: number
  buyer_nickname: string
  price: string
  fee_rate: string
  fee_amount: string
  status: 'on_sale' | 'dealt' | 'off_shelf'
  created_at: string
  dealt_at: string | null
}

export function getOnSaleList(params: Record<string, unknown>): Promise<PageResult<MarketOrder>> {
  return http.get<PageResult<MarketOrder>>('/market/onsale', params)
}

export function getDealList(params: Record<string, unknown>): Promise<PageResult<MarketOrder>> {
  return http.get<PageResult<MarketOrder>>('/market/deals', params)
}

export function updateFeeRate(rate: string, password: string): Promise<null> {
  return http.post<null>('/market/fee-rate', { rate, password })
}

export function getFeeRate(): Promise<{ fee_rate: string }> {
  return http.get<{ fee_rate: string }>('/market/fee-rate')
}

// 挂单下架
export function offMarketOrder(id: number, reason: string): Promise<null> {
  return http.post<null>(`/market/orders/${id}/off`, { reason })
}
