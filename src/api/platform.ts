import http from '@/utils/request'

export interface ClearResult {
  backup_id: string
  backup_path: string
  cleared_users: number
  cleared_at: string
}

// 四重安全确认后清空用户数据
export function clearPlatformData(data: {
  confirm_text: string
  password: string
  sms_code: string
  reason: string
}): Promise<ClearResult> {
  return http.post<ClearResult>('/platform/clear', data)
}

// 获取清库备份列表
export function getClearBackups(): Promise<Array<{ id: string; created_at: string; size: string; operator: string }>> {
  return http.get<Array<{ id: string; created_at: string; size: string; operator: string }>>('/platform/backups')
}
