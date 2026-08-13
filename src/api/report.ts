import http from '@/utils/request'
import type { PageResult } from '@/types'

export interface ReportRow {
  date: string
  sales_amount: string
  sales_count: number
  new_users: number
  active_users: number
  orders: number
  fee_amount: string
  recharge_amount: string
}

export function getReportData(params: Record<string, unknown>): Promise<PageResult<ReportRow>> {
  return http.get<PageResult<ReportRow>>('/reports/data', params)
}
