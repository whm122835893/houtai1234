import http from '@/utils/request'

export interface DashboardData {
  today_new_users: number
  today_sales_amount: string
  today_orders: number
  active_collectibles: number
  on_sale_count: number
  total_recharge: string
  total_fee_income: string
  pending_settlement: string
  wallet_balance: Array<{ name: string; value: number }>
  stock_warnings: Array<{ type: string; text: string; level: 'warning' | 'danger' }>
  realtime_events: Array<{ type: string; text: string; time: string }>
  trend: Array<{ date: string; sales_amount: string; orders: number }>
  priority_stats: { total_issued: number; used: number; remaining: number }
}

export function getDashboardData(): Promise<DashboardData> {
  return http.get<DashboardData>('/dashboard')
}
