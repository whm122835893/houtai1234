import http from '@/utils/request'
import type { PageResult, CollectibleStatus } from '@/types'

export type QuotaType = 'priority' | 'activity_airdrop' | 'other'

export interface QuotaItem {
  id: number
  type: QuotaType
  type_text: string
  name: string
  total: number
  used: number
  status: 'active' | 'disabled'
  created_at: string
}

export interface SaleConfig {
  price: string
  quantity: number
  start_at: string
  end_at: string
  limit_per_user: number
  qualification_enabled: boolean
  qualification_collectible_ids: number[]
  qualification_phones: string[]
  transfer_enabled: boolean
  consign_enabled: boolean
}

export interface CollectibleItem {
  id: number
  name: string
  category: string
  image: string
  issuer: string
  creator: string
  story: string
  status: CollectibleStatus
  total_supply: number // 发行总量
  configured_quota: number // 已配置配额（冻结预留）
  sold_sale: number // 已售出发售
  airdropped: number // 已独立空投
  destroyed: number // 已销毁
  stock_pool: number // 库存池（自由库存，实时计算）
  circulation: number // 流通量
  sale_quantity: number // 发售数量
  sale_sold: number // 发售已售
  sale_remaining: number // 发售剩余
  price: string
  sale_start_at: string | null
  sale_end_at: string | null
  limit_per_user: number
  qualification_enabled: boolean
  qualification_collectible_ids: number[]
  qualification_phones: string[]
  transfer_enabled: boolean
  consign_enabled: boolean
  quotas: QuotaItem[]
  created_at: string
}

export interface AirdropRecord {
  id: number
  task_no: string
  collectible_id: number
  collectible_name: string
  quantity: number
  target_users: number
  success_count: number
  fail_count: number
  operator: string
  created_at: string
}

export function getCollectibleList(params: Record<string, unknown>): Promise<PageResult<CollectibleItem>> {
  return http.get<PageResult<CollectibleItem>>('/collectibles', params)
}

export function getCollectibleDetail(id: number): Promise<CollectibleItem> {
  return http.get<CollectibleItem>(`/collectibles/${id}`)
}

export function createCollectible(data: Partial<CollectibleItem>): Promise<CollectibleItem> {
  return http.post<CollectibleItem>('/collectibles', data)
}

export function updateCollectible(id: number, data: Partial<CollectibleItem>): Promise<CollectibleItem> {
  return http.put<CollectibleItem>(`/collectibles/${id}`, data)
}

export function deleteCollectible(id: number, password: string): Promise<null> {
  return http.post<null>(`/collectibles/${id}/delete`, { password })
}

// 发售配置 / 上架 / 重新上架
export function configureSale(id: number, data: SaleConfig, password: string): Promise<CollectibleItem> {
  return http.post<CollectibleItem>(`/collectibles/${id}/sale`, { ...data, password })
}

// 强制售罄
export function forceSellOut(id: number, reason: string, password: string): Promise<null> {
  return http.post<null>(`/collectibles/${id}/force-sell-out`, { reason, password })
}

// 手动下架
export function takeOffShelf(id: number, reason: string): Promise<null> {
  return http.post<null>(`/collectibles/${id}/off-shelf`, { reason })
}

// 配额配置（新增/修改/停用）
export function saveQuota(id: number, data: Partial<QuotaItem>, password: string): Promise<null> {
  return http.post<null>(`/collectibles/${id}/quota`, { ...data, password })
}

export function deleteQuota(id: number, quotaId: number, password: string): Promise<null> {
  return http.post<null>(`/collectibles/${id}/quota/${quotaId}/delete`, { password })
}

// 独立空投（不绑定活动，任意阶段可执行）
export function independentAirdrop(
  id: number,
  data: { quantity: number; phones: string[]; password: string }
): Promise<{ task_no: string; success_count: number; fail_count: number; fail_phones: string[] }> {
  return http.post<{ task_no: string; success_count: number; fail_count: number; fail_phones: string[] }>(
    `/collectibles/${id}/airdrop`,
    data
  )
}

export function getAirdropRecords(params: Record<string, unknown>): Promise<PageResult<AirdropRecord>> {
  return http.get<PageResult<AirdropRecord>>('/collectibles/airdrop-records', params)
}

// 销毁库存
export function destroyStock(id: number, quantity: number, reason: string, password: string): Promise<null> {
  return http.post<null>(`/collectibles/${id}/destroy`, { quantity, reason, password })
}

// 寄售 / 转赠开关
export function updateConsignSwitch(
  id: number,
  enabled: boolean,
  password: string,
  reason: string
): Promise<{ auto_off: number }> {
  return http.post<{ auto_off: number }>(`/collectibles/${id}/consign-switch`, { enabled, password, reason })
}

export function updateTransferSwitch(id: number, enabled: boolean): Promise<null> {
  return http.post<null>(`/collectibles/${id}/transfer-switch`, { enabled })
}
