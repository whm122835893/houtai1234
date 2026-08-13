import http from '@/utils/request'
import type { PageResult, OrderType, OrderStatus } from '@/types'

export interface OrderItem {
  id: number
  order_no: string
  user_id: number
  nickname: string
  phone: string
  collectible_id: number
  collectible_name: string
  image: string
  type: OrderType
  status: OrderStatus
  price: string
  quantity: number
  total_amount: string
  pay_channel: string
  paid_at: string | null
  created_at: string
}

export interface PayLog {
  id: number
  order_no: string
  channel: string
  event: string
  raw: string
  created_at: string
}

export function getOrderList(params: Record<string, unknown>): Promise<PageResult<OrderItem>> {
  return http.get<PageResult<OrderItem>>('/orders', params)
}

export function getOrderDetail(id: number): Promise<OrderItem> {
  return http.get<OrderItem>(`/orders/${id}`)
}

export function getPayLogs(orderId: number): Promise<PayLog[]> {
  return http.get<PayLog[]>(`/orders/${orderId}/pay-logs`)
}
