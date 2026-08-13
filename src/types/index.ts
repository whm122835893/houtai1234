// 全局共享类型定义

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

export interface PageParams {
  page: number
  page_size: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

// 角色枚举
export type AdminRole = 'super_admin' | 'operator' | 'finance' | 'risk' | 'service'

export interface AdminUser {
  id: number
  username: string
  nickname: string
  role: AdminRole
  role_name: string
  phone: string
  avatar: string
  last_login_at: string | null
  status: 0 | 1
  created_at: string
}

export interface PermissionResult {
  menus: MenuItem[]
  permissions: string[]
}

export interface MenuItem {
  path: string
  title: string
  icon?: string
  hidden?: boolean
  permission?: string
  children?: MenuItem[]
}

export interface RouteMeta {
  title?: string
  icon?: string
  hidden?: boolean
  keepAlive?: boolean
  permission?: string
  affix?: boolean
  activeMenu?: string
}

// 藏品状态
export type CollectibleStatus =
  | 'draft' // 已创建(草稿)
  | 'on_sale' // 发售中
  | 'sold_out' // 已售罄
  | 'off_shelf' // 已下架
  | 'deleted' // 已删除

export const COLLECTIBLE_STATUS_TEXT: Record<CollectibleStatus, string> = {
  draft: '已创建',
  on_sale: '发售中',
  sold_out: '已售罄',
  off_shelf: '已下架',
  deleted: '已删除'
}

// 订单类型
export type OrderType = 'public' | 'priority' | 'market' | 'qualification'
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded' | 'closed'

export const ORDER_TYPE_TEXT: Record<OrderType, string> = {
  public: '公售',
  priority: '优先购',
  market: '市场购买',
  qualification: '资格购'
}

// 奖励类型（全平台统一）
export type RewardType = 'collectible' | 'priority' | 'qualification' | 'lottery_times'

export const REWARD_TYPE_TEXT: Record<RewardType, string> = {
  collectible: '藏品',
  priority: '优先购白名单资格',
  qualification: '资格购资格',
  lottery_times: '抽奖次数'
}

// 全平台统一奖励配置
export interface RewardConfig {
  reward_type: RewardType
  collectible_id?: number
  collectible_name?: string
  quantity?: number
  priority_activity_id?: number
  priority_count?: number
  qualification_collectible_id?: number
  qualification_collectible_name?: string
  qualification_count?: number
  valid_until?: string // 资格购资格有效期，精确到时分秒
  lottery_times?: number
}

// 审核日志
export interface AuditLog {
  id: number
  operator: string
  operator_id: number
  module: string
  action: string
  target: string
  ip: string
  reason: string
  created_at: string
}
