import http from '@/utils/request'
import type { PageResult, AuditLog } from '@/types'

export function getAuditLogs(params: Record<string, unknown>): Promise<PageResult<AuditLog>> {
  return http.get<PageResult<AuditLog>>('/audit-logs', params)
}
