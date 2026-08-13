import dayjs from 'dayjs'
import type {
  AdminUser,
  MenuItem,
  CollectibleStatus,
  OrderType,
  OrderStatus
} from '@/types'

// ---------- 随机工具 ----------
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function daysAgo(days: number, hourOffset = 0): string {
  return dayjs()
    .subtract(days, 'day')
    .subtract(rand(0, 23), 'hour')
    .subtract(rand(0, 59), 'minute')
    .subtract(hourOffset, 'hour')
    .format('YYYY-MM-DD HH:mm:ss')
}

// ---------- 菜单与权限 ----------
const ALL_MENUS: MenuItem[] = [
  { path: '/dashboard', title: '数据大盘', icon: 'Odometer', permission: 'dashboard:view' },
  {
    path: '/user',
    title: '用户管理',
    icon: 'User',
    children: [
      { path: '/user/list', title: '用户列表', permission: 'user:list' },
      { path: '/user/detail', title: '用户详情', hidden: true }
    ]
  },
  { path: '/realname/list', title: '实名认证', icon: 'Postcard', permission: 'realname:view' },
  {
    path: '/collectible',
    title: '藏品管理',
    icon: 'Collection',
    children: [
      { path: '/collectible/list', title: '藏品列表', permission: 'collectible:list' },
      { path: '/collectible/create', title: '创建藏品', permission: 'collectible:create' },
      { path: '/collectible/records', title: '发放记录', permission: 'collectible:airdrop' }
    ]
  },
  {
    path: '/order',
    title: '订单管理',
    icon: 'Tickets',
    children: [{ path: '/order/list', title: '订单列表', permission: 'order:list' }]
  },
  {
    path: '/market',
    title: '市场寄售',
    icon: 'ShoppingCart',
    children: [
      { path: '/market/onsale', title: '在售挂单', permission: 'market:list' },
      { path: '/market/deal', title: '成交记录', permission: 'market:list' },
      { path: '/market/commission', title: '手续费配置', permission: 'market:fee' }
    ]
  },
  {
    path: '/transfer',
    title: '转赠管理',
    icon: 'Share',
    children: [
      { path: '/transfer/records', title: '转赠记录', permission: 'transfer:list' },
      { path: '/transfer/switch', title: '转赠开关', permission: 'transfer:switch' }
    ]
  },
  {
    path: '/marketing',
    title: '营销活动',
    icon: 'Present',
    children: [
      { path: '/marketing/priority', title: '优先购活动', permission: 'marketing:priority' },
      { path: '/marketing/signin', title: '签到活动', permission: 'marketing:signin' },
      { path: '/marketing/invite', title: '邀请活动', permission: 'marketing:invite' },
      { path: '/marketing/lottery', title: '抽奖活动', permission: 'marketing:lottery' },
      { path: '/marketing/blindbox', title: '盲盒管理', permission: 'marketing:blindbox' },
      { path: '/marketing/compose', title: '合成活动', permission: 'marketing:compose' },
      { path: '/marketing/airdrop', title: '活动空投', permission: 'marketing:airdrop' },
      { path: '/marketing/register', title: '注册福利', permission: 'marketing:register' }
    ]
  },
  {
    path: '/wallet',
    title: '钱包财务',
    icon: 'Wallet',
    children: [
      { path: '/wallet/recharge', title: '充值记录', permission: 'wallet:recharge' },
      { path: '/wallet/flow', title: '钱包流水', permission: 'wallet:flow' },
      { path: '/wallet/fee', title: '手续费统计', permission: 'wallet:fee' },
      { path: '/wallet/audit', title: '资金审计', permission: 'wallet:audit' }
    ]
  },
  {
    path: '/cms',
    title: '内容管理',
    icon: 'Files',
    children: [
      { path: '/cms/banner', title: 'Banner管理', permission: 'cms:banner' },
      { path: '/cms/notice', title: '公告管理', permission: 'cms:notice' },
      { path: '/cms/help', title: '帮助中心', permission: 'cms:help' },
      { path: '/cms/article', title: '藏品文案', permission: 'cms:article' }
    ]
  },
  {
    path: '/system',
    title: '系统配置',
    icon: 'Setting',
    children: [
      { path: '/system/site', title: '基础配置', permission: 'system:site' },
      { path: '/system/payment', title: '支付渠道', permission: 'system:payment' },
      { path: '/system/api', title: '第三方接口', permission: 'system:api' },
      { path: '/system/agreement', title: '用户协议', permission: 'system:agreement' }
    ]
  },
  {
    path: '/permission',
    title: '权限审计',
    icon: 'Lock',
    children: [
      { path: '/permission/admin', title: '管理员账号', permission: 'permission:admin' },
      { path: '/permission/role', title: '角色管理', permission: 'permission:role' },
      { path: '/permission/audit', title: '审计日志', permission: 'audit:list' }
    ]
  },
  {
    path: '/security',
    title: '风控安全',
    icon: 'Shield',
    children: [
      { path: '/security/blacklist', title: '黑名单', permission: 'security:blacklist' },
      { path: '/security/audit-approval', title: '异常交易审批', permission: 'security:approval' },
      { path: '/security/alarm', title: '风控告警', permission: 'security:alarm' }
    ]
  },
  {
    path: '/ticket',
    title: '客服工单',
    icon: 'Service',
    children: [{ path: '/ticket/list', title: '工单列表', permission: 'ticket:list' }]
  },
  {
    path: '/report',
    title: '数据报表',
    icon: 'TrendCharts',
    children: [
      { path: '/report/sales', title: '销售报表', permission: 'report:sales' },
      { path: '/report/user', title: '用户报表', permission: 'report:user' },
      { path: '/report/collectible', title: '藏品报表', permission: 'report:collectible' },
      { path: '/report/finance', title: '财务报表', permission: 'report:finance' }
    ]
  },
  {
    path: '/platform',
    title: '平台运维',
    icon: 'Tools',
    children: [{ path: '/platform/clear', title: '数据清除', permission: 'platform:clear' }]
  }
]

export const ROLE_MENUS: Record<string, MenuItem[]> = {
  super_admin: ALL_MENUS,
  operator: [
    { path: '/dashboard', title: '数据大盘', icon: 'Odometer', permission: 'dashboard:view' },
    { path: '/user', title: '用户管理', icon: 'User', children: [{ path: '/user/list', title: '用户列表', permission: 'user:list' }] },
    { path: '/collectible', title: '藏品管理', icon: 'Collection', children: ALL_MENUS[3].children!.filter((c) => !['/collectible/delete'].includes(c.path)) },
    { path: '/order', title: '订单管理', icon: 'Tickets', children: [{ path: '/order/list', title: '订单列表', permission: 'order:list' }] },
    { path: '/market', title: '市场寄售', icon: 'ShoppingCart', children: ALL_MENUS[5].children },
    { path: '/transfer', title: '转赠管理', icon: 'Share', children: ALL_MENUS[6].children },
    { path: '/marketing', title: '营销活动', icon: 'Present', children: ALL_MENUS[7].children },
    { path: '/cms', title: '内容管理', icon: 'Files', children: ALL_MENUS[9].children }
  ],
  finance: [
    { path: '/dashboard', title: '数据大盘', icon: 'Odometer', permission: 'dashboard:view' },
    { path: '/order', title: '订单管理', icon: 'Tickets', children: ALL_MENUS[4].children },
    { path: '/wallet', title: '钱包财务', icon: 'Wallet', children: ALL_MENUS[8].children },
    { path: '/report', title: '数据报表', icon: 'TrendCharts', children: [{ path: '/report/finance', title: '财务报表', permission: 'report:finance' }] }
  ],
  risk: [
    { path: '/dashboard', title: '数据大盘', icon: 'Odometer', permission: 'dashboard:view' },
    { path: '/user', title: '用户管理', icon: 'User', children: [{ path: '/user/list', title: '用户列表', permission: 'user:list' }] },
    { path: '/realname/list', title: '实名认证', icon: 'Postcard', permission: 'realname:view' },
    { path: '/security', title: '风控安全', icon: 'Shield', children: ALL_MENUS[12].children },
    { path: '/permission', title: '权限审计', icon: 'Lock', children: [{ path: '/permission/audit', title: '审计日志', permission: 'audit:list' }] }
  ],
  service: [
    { path: '/dashboard', title: '数据大盘', icon: 'Odometer', permission: 'dashboard:view' },
    { path: '/user', title: '用户管理', icon: 'User', children: [{ path: '/user/list', title: '用户列表', permission: 'user:list' }] },
    { path: '/ticket', title: '客服工单', icon: 'Service', children: ALL_MENUS[13].children }
  ]
}

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ALL_MENUS.flatMap((m) => {
    const perms = m.permission ? [m.permission] : []
    return perms.concat(m.children?.map((c) => c.permission).filter(Boolean) as string[])
  }),
  operator: [
    'dashboard:view', 'user:list', 'user:detail', 'user:freeze', 'user:unfreeze', 'user:reset_password', 'user:force_logout',
    'collectible:list', 'collectible:create', 'collectible:sale', 'collectible:quota', 'collectible:airdrop',
    'collectible:destroy', 'collectible:recover', 'collectible:delete', 'order:list', 'order:detail',
    'market:list', 'market:fee', 'transfer:list', 'transfer:switch', 'transfer:revoke',
    'marketing:priority', 'marketing:signin', 'marketing:invite', 'marketing:lottery', 'marketing:blindbox',
    'marketing:compose', 'marketing:airdrop', 'marketing:register', 'cms:banner', 'cms:notice', 'cms:help', 'cms:article'
  ],
  finance: [
    'dashboard:view', 'order:list', 'order:detail', 'wallet:recharge', 'wallet:flow', 'wallet:fee',
    'wallet:audit', 'report:finance', 'audit:list'
  ],
  risk: [
    'dashboard:view', 'user:list', 'user:detail', 'realname:view', 'realname:full', 'security:blacklist',
    'security:approval', 'security:alarm', 'audit:list'
  ],
  service: ['dashboard:view', 'user:list', 'user:detail', 'ticket:list', 'ticket:reply', 'ticket:transfer']
}

// ---------- 管理员 ----------
export const ADMIN_ACCOUNTS: AdminUser[] = [
  { id: 1, username: 'admin', nickname: '超级管理员', role: 'super_admin', role_name: '超级管理员', phone: '13800000001', avatar: '', last_login_at: daysAgo(0), status: 1, created_at: daysAgo(300) },
  { id: 2, username: 'operator', nickname: '运营小李', role: 'operator', role_name: '运营', phone: '13800000002', avatar: '', last_login_at: daysAgo(1), status: 1, created_at: daysAgo(200) },
  { id: 3, username: 'finance', nickname: '财务小赵', role: 'finance', role_name: '财务', phone: '13800000003', avatar: '', last_login_at: daysAgo(2), status: 1, created_at: daysAgo(150) },
  { id: 4, username: 'risk', nickname: '风控小王', role: 'risk', role_name: '风控', phone: '13800000004', avatar: '', last_login_at: daysAgo(3), status: 1, created_at: daysAgo(100) },
  { id: 5, username: 'service', nickname: '客服小陈', role: 'service', role_name: '客服', phone: '13800000005', avatar: '', last_login_at: daysAgo(0), status: 1, created_at: daysAgo(80) }
]

export const ADMIN_PASSWORDS: Record<string, string> = {
  admin: 'admin123',
  operator: 'operator123',
  finance: 'finance123',
  risk: 'risk123',
  service: 'service123'
}

// ---------- 藏品 ----------
export interface MockCollectible {
  id: number
  name: string
  category: string
  image: string
  issuer: string
  creator: string
  story: string
  status: CollectibleStatus
  total_supply: number
  configured_quota: number
  sold_sale: number
  airdropped: number
  destroyed: number
  stock_pool: number
  circulation: number
  sale_quantity: number
  sale_sold: number
  sale_remaining: number
  price: string
  sale_start_at: string | null
  sale_end_at: string | null
  limit_per_user: number
  qualification_enabled: boolean
  qualification_collectible_ids: number[]
  qualification_phones: string[]
  transfer_enabled: boolean
  consign_enabled: boolean
  quotas: Array<{ id: number; type: 'priority' | 'activity_airdrop' | 'other'; type_text: string; name: string; total: number; used: number; status: 'active' | 'disabled'; created_at: string }>
  created_at: string
}

const CATEGORIES = ['国潮', '数字艺术', '文博', '潮玩', '动漫', '体育']
const ISSUERS = ['数和文创', '国潮文创社', '数字敦煌', '像素艺术工作室']
const CREATORS = ['李思', '王明', '张静', '陈晨', '刘洋', '赵磊']

function createCollectible(id: number, name: string, status: CollectibleStatus, opts: Partial<MockCollectible> = {}): MockCollectible {
  const total = opts.total_supply ?? rand(500, 5000)
  const sold = opts.sold_sale ?? 0
  const airdropped = opts.airdropped ?? 0
  const destroyed = opts.destroyed ?? 0
  const quota = opts.configured_quota ?? 0
  const stock = Math.max(0, total - quota - sold - airdropped - destroyed)
  const saleQty = opts.sale_quantity ?? (status === 'on_sale' || status === 'sold_out' || status === 'off_shelf' ? Math.min(rand(300, total), total) : 0)
  const saleSold = status === 'sold_out' ? saleQty : Math.min(sold, saleQty)
  const remaining = Math.max(0, saleQty - saleSold)
  const circulation = sold + airdropped
  return {
    id,
    name,
    category: pick(CATEGORIES),
    image: '',
    issuer: pick(ISSUERS),
    creator: pick(CREATORS),
    story: '一段关于数字藏品的文化故事，承载着独特的历史记忆与艺术价值。',
    status,
    total_supply: total,
    configured_quota: quota,
    sold_sale: sold,
    airdropped,
    destroyed,
    stock_pool: stock,
    circulation,
    sale_quantity: saleQty,
    sale_sold: saleSold,
    sale_remaining: remaining,
    price: (rand(9, 199) / 10).toFixed(2),
    sale_start_at: status === 'draft' ? null : daysAgo(rand(1, 10)),
    sale_end_at: status === 'on_sale' ? dayjs().add(rand(1, 20), 'day').format('YYYY-MM-DD HH:mm:ss') : status === 'off_shelf' ? daysAgo(rand(0, 5)) : null,
    limit_per_user: pick([1, 2, 3, 5, 10]),
    qualification_enabled: false,
    qualification_collectible_ids: [],
    qualification_phones: [],
    transfer_enabled: true,
    consign_enabled: true,
    quotas: [],
    created_at: daysAgo(rand(15, 90)),
    ...opts
  }
}

export const collectibles: MockCollectible[] = [
  createCollectible(1, '「龙腾盛世」数字藏品', 'sold_out', { total_supply: 2000, sold_sale: 2000, configured_quota: 300, sale_quantity: 1700, price: '19.90' }),
  createCollectible(2, '「敦煌飞天·反弹琵琶」', 'on_sale', { total_supply: 3000, sold_sale: 1320, configured_quota: 500, sale_quantity: 2000, price: '29.90' }),
  createCollectible(3, '「十二生肖·虎」限定款', 'on_sale', { total_supply: 1000, sold_sale: 460, configured_quota: 200, airdropped: 100, sale_quantity: 800, price: '39.90' }),
  createCollectible(4, '「赛博朋克·像素城」', 'off_shelf', { total_supply: 5000, sold_sale: 2100, configured_quota: 800, destroyed: 100, sale_quantity: 4000, price: '9.90' }),
  createCollectible(5, '「青花瓷韵」系列藏品', 'draft', { total_supply: 1500 }),
  createCollectible(6, '「山海经·神兽录」', 'sold_out', { total_supply: 800, sold_sale: 800, configured_quota: 100, sale_quantity: 800, price: '59.90' }),
  createCollectible(7, '「春日樱花」限定盲盒系列', 'on_sale', { total_supply: 2500, sold_sale: 880, configured_quota: 300, airdropped: 200, sale_quantity: 1500, price: '15.90' }),
  createCollectible(8, '「水墨江南」大师手绘', 'draft', { total_supply: 500 })
]

// 重新计算库存池
export function recalcStock(c: MockCollectible): void {
  c.stock_pool = Math.max(0, c.total_supply - c.configured_quota - c.sold_sale - c.airdropped - c.destroyed)
  c.circulation = c.sold_sale + c.airdropped
  c.sale_remaining = Math.max(0, c.sale_quantity - c.sale_sold)
}

// ---------- 用户 ----------
export interface MockUser {
  id: number
  nickname: string
  avatar: string
  phone: string
  status: 0 | 1
  is_black: 0 | 1
  balance: string
  asset_count: number
  invite_count: number
  created_at: string
  last_login_at: string
  password: string
  realname: { name: string; id_card: string; status: 'verified' | 'pending' | 'none' }
  collectibles: Array<{ id: number; collectible_id: number; collectible_name: string; serial_no: string; status: string; obtained_at: string }>
  priority_quotas: Array<{ id: number; activity_name: string; total_times: number; used_times: number; valid_until: string; status: string }>
  invite_parent: { id: number; nickname: string; phone: string } | null
  invite_children: Array<{ id: number; nickname: string; phone: string; created_at: string }>
}

const NICK_PREFIX = ['星河', '月影', '清风', '墨白', '小鹿', '云朵', '山岚', '拾光', '南风', '北巷', '木子', '阿橙']
const NICK_SUFFIX = ['', '丶', '酱', '君', '同学', '先生', '小姐', '', '', '']

const mockUsers: MockUser[] = []

for (let i = 1; i <= 86; i += 1) {
  const ownedCount = i % 5 === 0 ? rand(0, 3) : rand(1, 8)
  const assets = Array.from({ length: ownedCount }, (_, k) => {
    const cb = pick(collectibles)
    return {
      id: i * 100 + k,
      collectible_id: cb.id,
      collectible_name: cb.name,
      serial_no: `${cb.id}${String(rand(0, 9999)).padStart(4, '0')}`,
      status: pick(['holding', 'holding', 'holding', 'on_sale', 'holding']),
      obtained_at: daysAgo(rand(0, 60))
    }
  })
  const verified = i % 3 !== 0
  mockUsers.push({
    id: i,
    nickname: `${pick(NICK_PREFIX)}${i}${pick(NICK_SUFFIX)}`,
    avatar: '',
    phone: `139${String(rand(0, 99999999)).padStart(8, '0')}`,
    status: i % 7 === 0 ? 0 : 1,
    is_black: i % 23 === 0 ? 1 : 0,
    balance: (rand(0, 50000) / 100).toFixed(2),
    asset_count: ownedCount,
    invite_count: rand(0, 30),
    created_at: daysAgo(rand(1, 200)),
    last_login_at: daysAgo(rand(0, 5)),
    password: '123456',
    realname: verified
      ? { name: pick(CREATORS), id_card: `${String(rand(100000, 999999))}${String(rand(0, 99999999)).padStart(8, '0')}${String(rand(0, 999)).padStart(3, '0')}`, status: 'verified' }
      : { name: '', id_card: '', status: pick(['pending', 'none']) },
    collectibles: assets,
    priority_quotas: i % 4 === 0
      ? [{
          id: i,
          activity_name: pick(['「龙腾盛世」优先购', '「敦煌飞天」优先购']),
          total_times: 2,
          used_times: pick([0, 1, 2]),
          valid_until: dayjs().add(rand(1, 30), 'day').format('YYYY-MM-DD HH:mm:ss'),
          status: 'valid'
        }]
      : [],
    invite_parent: i > 1 ? { id: rand(1, i - 1), nickname: '邀请人', phone: '13900000000' } : null,
    invite_children: Array.from({ length: mockUsers.length ? rand(0, 3) : 0 }, () => ({
      id: rand(1, 100),
      nickname: '被邀请人',
      phone: '13900000000',
      created_at: daysAgo(rand(1, 100))
    }))
  })
}

export const users: MockUser[] = mockUsers

// ---------- 订单 ----------
export interface MockOrder {
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

export const orders: MockOrder[] = Array.from({ length: 120 }, (_, i) => {
  const cb = pick(collectibles)
  const u = pick(users)
  const type = pick(['public', 'priority', 'market', 'qualification'] as OrderType[])
  const status = pick(['paid', 'paid', 'paid', 'pending', 'cancelled', 'refunded'] as OrderStatus[])
  const price = cb.price
  const quantity = pick([1, 1, 1, 1, 2, 3])
  return {
    id: i + 1,
    order_no: `DD${dayjs().format('YYYYMMDD')}${String(100000 + i)}`,
    user_id: u.id,
    nickname: u.nickname,
    phone: u.phone,
    collectible_id: cb.id,
    collectible_name: cb.name,
    image: '',
    type,
    status,
    price,
    quantity,
    total_amount: (Number(price) * quantity).toFixed(2),
    pay_channel: pick(['微信支付', '支付宝', '余额支付']),
    paid_at: status === 'paid' ? daysAgo(rand(0, 15)) : null,
    created_at: daysAgo(rand(0, 15))
  }
})

// ---------- 转账/寄售/工单等 ----------
export const transfers = Array.from({ length: 40 }, (_, i) => {
  const cb = pick(collectibles)
  const from = pick(users)
  const to = pick(users)
  const status = pick(['completed', 'completed', 'completed', 'pending', 'cancelled', 'revoked'] as const)
  return {
    id: i + 1,
    transfer_no: `ZZ${String(500000 + i)}`,
    collectible_id: cb.id,
    collectible_name: cb.name,
    image: '',
    from_user_id: from.id,
    from_nickname: from.nickname,
    to_user_id: to.id,
    to_nickname: to.nickname,
    status,
    created_at: daysAgo(rand(0, 20)),
    completed_at: status === 'completed' ? daysAgo(rand(0, 20)) : null
  }
})

export const marketOrders = Array.from({ length: 60 }, (_, i) => {
  const cb = pick(collectibles)
  const seller = pick(users)
  const buyer = pick(users)
  const dealt = i % 2 === 0
  return {
    id: i + 1,
    order_no: `JS${String(700000 + i)}`,
    collectible_id: cb.id,
    collectible_name: cb.name,
    image: '',
    seller_id: seller.id,
    seller_nickname: seller.nickname,
    buyer_id: dealt ? buyer.id : 0,
    buyer_nickname: dealt ? buyer.nickname : '-',
    price: (Number(cb.price) * rand(11, 35) / 10).toFixed(2),
    fee_rate: '3.00',
    fee_amount: '0.00',
    status: dealt ? 'dealt' : pick(['on_sale', 'on_sale', 'off_shelf'] as const),
    created_at: daysAgo(rand(0, 30)),
    dealt_at: dealt ? daysAgo(rand(0, 30)) : null
  }
})

export const tickets = Array.from({ length: 25 }, (_, i) => {
  const u = pick(users)
  const status = pick(['pending', 'processing', 'processing', 'resolved', 'closed'] as const)
  return {
    id: i + 1,
    ticket_no: `GT${String(900000 + i)}`,
    user_id: u.id,
    nickname: u.nickname,
    phone: u.phone,
    category: pick(['充值问题', '购买问题', '转赠问题', '实名认证', '账号安全', '寄售问题']),
    title: pick(['充值未到账', '购买失败扣款', '转赠后藏品消失', '实名认证审核慢', '账号无法登录', '寄售手续费疑问']),
    content: '用户提交的问题描述，请客服人员及时处理。',
    status,
    assignee: status === 'pending' ? '-' : pick(['客服小陈', '客服小周', '客服小林']),
    created_at: daysAgo(rand(0, 10)),
    updated_at: daysAgo(rand(0, 5))
  }
})

export const ticketMessages = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  ticket_id: rand(1, 25),
  sender: i % 2 === 0 ? '用户' : pick(['客服小陈', '客服小周', '客服小林']),
  content: pick(['你好，我的问题还没有解决。', '您好，我们已收到您的问题，正在为您处理。', '请问可以提供订单号吗？', '好的，我已经确认了，麻烦尽快处理。', '已完成处理，请查看。', '感谢您的反馈。']),
  created_at: daysAgo(rand(0, 10))
}))

// 审计日志
export const auditLogs = Array.from({ length: 60 }, (_, i) => {
  const operator = pick(ADMIN_ACCOUNTS)
  return {
    id: i + 1,
    operator: operator.nickname,
    operator_id: operator.id,
    module: pick(['用户管理', '藏品管理', '营销活动', '风控安全', '实名认证', '平台运维']),
    action: pick(['强制回收', '独立空投', '关闭寄售', '配额配置', '强制售罄', '查看实名信息', '冻结用户', '创建活动', '撤销转赠', '销毁库存']),
    target: `ID:${rand(1, 1000)}`,
    ip: `10.0.0.${rand(1, 200)}`,
    reason: pick(['运营需要', '违规处理', '风控处置', '用户申诉', '活动执行']),
    created_at: daysAgo(rand(0, 30))
  }
})

export const blacklist = Array.from({ length: 12 }, (_, i) => {
  const u = pick(users)
  return {
    id: i + 1,
    user_id: u.id,
    nickname: u.nickname,
    phone: u.phone,
    reason: pick(['批量注册', '恶意刷单', '违规交易', '恶意攻击']),
    operator: '超级管理员',
    created_at: daysAgo(rand(0, 60))
  }
})

export const riskAlarms = Array.from({ length: 20 }, (_, i) => {
  const u = pick(users)
  const type = pick(['device', 'ip', 'trade', 'login', 'recharge'] as const)
  return {
    id: i + 1,
    type,
    level: pick(['low', 'medium', 'high'] as const),
    title: pick(['设备指纹异常聚集', '异常IP高频访问', '大额交易触发风控', '异地登录', '充值金额异常']),
    content: '系统检测到异常行为，请及时处理。',
    status: pick(['pending', 'pending', 'processed', 'ignored'] as const),
    user_id: u.id,
    nickname: u.nickname,
    created_at: daysAgo(rand(0, 10))
  }
})

export const tradeApprovals = Array.from({ length: 15 }, (_, i) => {
  const cb = pick(collectibles)
  const u = pick(users)
  return {
    id: i + 1,
    order_no: `DD${String(800000 + i)}`,
    user_id: u.id,
    nickname: u.nickname,
    collectible_name: cb.name,
    amount: (Number(cb.price) * rand(5, 30)).toFixed(2),
    reason: pick(['大额交易', '疑似恶意低价', '频繁交易', '新账号大额交易']),
    status: pick(['pending', 'pending', 'approved', 'rejected'] as const),
    applied_at: daysAgo(rand(0, 5)),
    handled_at: null as string | null
  }
})

export const recharges = Array.from({ length: 80 }, (_, i) => {
  const u = pick(users)
  const status = pick(['success', 'success', 'pending', 'failed'] as const)
  return {
    id: i + 1,
    order_no: `CZ${String(300000 + i)}`,
    user_id: u.id,
    nickname: u.nickname,
    phone: u.phone,
    channel: pick(['微信支付', '支付宝']),
    amount: (rand(100, 500000) / 100).toFixed(2),
    status,
    created_at: daysAgo(rand(0, 30)),
    paid_at: status === 'success' ? daysAgo(rand(0, 30)) : null
  }
})

export const walletFlows = Array.from({ length: 100 }, (_, i) => {
  const u = pick(users)
  const type = pick(['recharge', 'consume', 'refund', 'transfer_in', 'transfer_out', 'fee'] as const)
  const typeText: Record<string, string> = {
    recharge: '充值',
    consume: '购买消费',
    refund: '退款',
    transfer_in: '转入',
    transfer_out: '转出',
    fee: '手续费'
  }
  return {
    id: i + 1,
    user_id: u.id,
    nickname: u.nickname,
    type,
    type_text: typeText[type],
    amount: (rand(1, 9999) / 100).toFixed(2),
    balance_after: (rand(0, 99999) / 100).toFixed(2),
    remark: `${typeText[type]}流水`,
    created_at: daysAgo(rand(0, 30))
  }
})

export const feeStats = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  channel: pick(['微信支付', '支付宝', '余额支付']),
  total_amount: (rand(1000, 900000) / 100).toFixed(2),
  fee_amount: (rand(30, 27000) / 100).toFixed(2),
  order_count: rand(10, 500),
  date: daysAgo(i)
}))

export const fundAudits = Array.from({ length: 30 }, (_, i) => {
  const balanced = i % 4 !== 0
  return {
    id: i + 1,
    date: daysAgo(i),
    recharge_total: (rand(1000, 900000) / 100).toFixed(2),
    consume_total: (rand(800, 800000) / 100).toFixed(2),
    refund_total: (rand(0, 50000) / 100).toFixed(2),
    fee_total: (rand(30, 27000) / 100).toFixed(2),
    balance_total: (rand(1000, 900000) / 100).toFixed(2),
    diff: balanced ? '0.00' : (rand(1, 1000) / 100).toFixed(2),
    status: balanced ? 'balanced' : 'diff'
  }
})

export const banners = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: pick(['新品首发：「龙腾盛世」', '限时活动：签到领藏品', '盲盒上新：春日樱花', '邀请好友赢大礼', '优先购资格限时开放', '平台公告：系统升级']),
  image: '',
  link: '/market',
  sort: rand(0, 10),
  status: pick(['enabled', 'enabled', 'disabled'] as const),
  created_at: daysAgo(rand(0, 60))
}))

export const notices = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: pick(['平台系统升级公告', '关于藏品发售时间调整的通知', '实名认证功能上线', '寄售市场手续费调整', '「赛博朋克」藏品合成活动开启']),
  content: '这是公告的正文内容，详细说明相关事项。',
  type: pick(['notice', 'announcement'] as const),
  status: pick(['published', 'draft'] as const),
  published_at: dayjs().subtract(i, 'day').format('YYYY-MM-DD HH:mm:ss'),
  created_at: daysAgo(i + 5)
}))

export const helpItems = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  title: pick(['如何购买数字藏品？', '如何获得优先购资格？', '藏品如何转赠？', '寄售交易流程说明', '实名认证如何操作？', '忘记密码怎么办？', '充值有哪些方式？', '常见问题汇总']),
  content: '<p>这里是帮助中心的内容，详细说明操作步骤。</p>',
  category: pick(['购买指南', '藏品玩法', '账户安全', '交易规则']),
  sort: i + 1,
  created_at: daysAgo(rand(1, 90))
}))

export const adminAccounts = ADMIN_ACCOUNTS.map((a) => ({
  id: a.id,
  username: a.username,
  nickname: a.nickname,
  role: a.role,
  role_name: a.role_name,
  phone: a.phone,
  status: a.status,
  last_login_at: a.last_login_at,
  created_at: a.created_at
}))

export const priorityActivities = [
  { id: 1, name: '「龙腾盛世」优先购活动', collectible_id: 1, collectible_name: '「龙腾盛世」数字藏品', start_at: daysAgo(5), end_at: dayjs().add(5, 'day').format('YYYY-MM-DD HH:mm:ss'), total_quota: 500, issued_count: 320, status: 'active', created_at: daysAgo(10) },
  { id: 2, name: '「敦煌飞天」优先购活动', collectible_id: 2, collectible_name: '「敦煌飞天·反弹琵琶」', start_at: daysAgo(2), end_at: dayjs().add(10, 'day').format('YYYY-MM-DD HH:mm:ss'), total_quota: 300, issued_count: 180, status: 'active', created_at: daysAgo(7) },
  { id: 3, name: '「春日樱花」优先购活动', collectible_id: 7, collectible_name: '「春日樱花」限定盲盒系列', start_at: daysAgo(20), end_at: daysAgo(5), total_quota: 200, issued_count: 200, status: 'ended', created_at: daysAgo(30) }
] as const

export const priorityWhitelist = Array.from({ length: 40 }, (_, i) => {
  const u = pick(users)
  const status = pick(['valid', 'valid', 'expired', 'used_up'] as const)
  return {
    id: i + 1,
    activity_id: pick([1, 2, 3]),
    user_id: u.id,
    nickname: u.nickname,
    phone: u.phone,
    times: 2,
    used_times: status === 'used_up' ? 2 : pick([0, 1]),
    valid_until: status === 'expired' ? daysAgo(rand(1, 5)) : dayjs().add(rand(1, 30), 'day').format('YYYY-MM-DD HH:mm:ss'),
    status,
    created_at: daysAgo(rand(1, 30))
  }
})

export const lotteryActivities = [
  {
    id: 1,
    name: '「瑞兽迎春」大转盘抽奖',
    status: 'active',
    free_times: 1,
    consume_collectible: false,
    consume_collectible_ids: [],
    prizes: [
      { id: 1, name: '特等奖', prize_type: 'collectible', reward: { reward_type: 'collectible', collectible_id: 2, collectible_name: '「敦煌飞天·反弹琵琶」', quantity: 50 }, probability: 0.1, total_quantity: 50, status: 'enabled' },
      { id: 2, name: '一等奖', prize_type: 'priority', reward: { reward_type: 'priority', priority_activity_id: 1, priority_count: 1 }, probability: 1, total_quantity: 200, status: 'enabled' },
      { id: 3, name: '二等奖', prize_type: 'lottery_times', reward: { reward_type: 'lottery_times', lottery_times: 3 }, probability: 5, total_quantity: 500, status: 'enabled' },
      { id: 4, name: '三等奖', prize_type: 'qualification', reward: { reward_type: 'qualification', qualification_collectible_id: 3, qualification_collectible_name: '「十二生肖·虎」限定款', qualification_count: 1, valid_until: dayjs().add(30, 'day').format('YYYY-MM-DD HH:mm:ss') }, probability: 10, total_quantity: 300, status: 'enabled' },
      { id: 5, name: '空奖', prize_type: 'empty', probability: 83.9, total_quantity: 0, status: 'enabled' }
    ],
    created_at: daysAgo(15)
  },
  {
    id: 2,
    name: '「潮玩狂欢」幸运转盘',
    status: 'ended',
    free_times: 2,
    consume_collectible: true,
    consume_collectible_ids: [1, 3],
    prizes: [
      { id: 1, name: '一等奖', prize_type: 'collectible', reward: { reward_type: 'collectible', collectible_id: 3, collectible_name: '「十二生肖·虎」限定款', quantity: 30 }, probability: 0.5, total_quantity: 30, status: 'enabled' },
      { id: 2, name: '空奖', prize_type: 'empty', probability: 99.5, total_quantity: 0, status: 'enabled' }
    ],
    created_at: daysAgo(40)
  }
]

export const lotteryRecords = Array.from({ length: 60 }, (_, i) => {
  const u = pick(users)
  const activity = pick(lotteryActivities)
  const prize = pick(activity.prizes)
  return {
    id: i + 1,
    activity_id: activity.id,
    user_id: u.id,
    nickname: u.nickname,
    phone: u.phone,
    result: prize.prize_type === 'empty' ? '未中奖' : '中奖',
    prize_name: prize.name,
    status: prize.prize_type === 'empty' ? 'delivered' : pick(['delivered', 'pending', 'failed'] as const),
    created_at: daysAgo(rand(0, 15))
  }
})

export const blindBoxes = [
  { id: 1, name: '「春日樱花」盲盒', image: '', price: '39.90', total_supply: 2000, sold_count: 800, status: 'active', prizes: [{ collectible_id: 2, collectible_name: '「敦煌飞天·反弹琵琶」', probability: 5, quantity: 100 }, { collectible_id: 7, collectible_name: '「春日樱花」限定盲盒系列', probability: 30, quantity: 500 }, { collectible_id: 3, collectible_name: '「十二生肖·虎」限定款', probability: 15, quantity: 200 }], created_at: daysAgo(20) },
  { id: 2, name: '「国潮」主题盲盒', image: '', price: '29.90', total_supply: 3000, sold_count: 1500, status: 'disabled', prizes: [{ collectible_id: 1, collectible_name: '「龙腾盛世」数字藏品', probability: 20, quantity: 300 }], created_at: daysAgo(60) }
]

export const composeRules = [
  { id: 1, name: '合成「水墨江南」', materials: [{ collectible_id: 5, collectible_name: '「青花瓷韵」系列藏品', quantity: 3 }], output_collectible_id: 8, output_collectible_name: '「水墨江南」大师手绘', output_quantity: 1, status: 'active', created_at: daysAgo(10) },
  { id: 2, name: '合成「山海神兽」', materials: [{ collectible_id: 3, collectible_name: '「十二生肖·虎」限定款', quantity: 5 }], output_collectible_id: 6, output_collectible_name: '「山海经·神兽录」', output_quantity: 1, status: 'disabled', created_at: daysAgo(30) }
]

export const activityAirdrops = Array.from({ length: 15 }, (_, i) => {
  const cb = pick(collectibles)
  return {
    id: i + 1,
    activity_name: pick(['签到活动空投', '邀请活动奖励', '注册福利', '抽奖奖品发放']),
    collectible_id: cb.id,
    collectible_name: cb.name,
    quantity: rand(10, 500),
    target_users: rand(5, 200),
    success_count: 0,
    fail_count: 0,
    operator: pick(ADMIN_ACCOUNTS).nickname,
    created_at: daysAgo(rand(0, 30))
  }
})

export const airdropRecords = Array.from({ length: 20 }, (_, i) => {
  const cb = pick(collectibles)
  const success = rand(5, 100)
  return {
    id: i + 1,
    task_no: `AIR${String(100000 + i)}`,
    collectible_id: cb.id,
    collectible_name: cb.name,
    quantity: success + rand(0, 5),
    target_users: success,
    success_count: success,
    fail_count: rand(0, 5),
    operator: pick(ADMIN_ACCOUNTS).nickname,
    created_at: daysAgo(rand(0, 20))
  }
})

export const registerRewards: Array<{ reward_type: string; collectible_id?: number; collectible_name?: string; quantity?: number }> = [
  { reward_type: 'collectible', collectible_id: 5, collectible_name: '「青花瓷韵」系列藏品', quantity: 1 }
]

export const realnameList = users
  .filter((u) => u.realname.status === 'verified')
  .map((u, i) => ({
    id: i + 1,
    user_id: u.id,
    nickname: u.nickname,
    phone: u.phone,
    name: u.realname.name,
    id_card: u.realname.id_card,
    status: 'verified' as const,
    verified_at: daysAgo(rand(1, 180)),
    created_at: daysAgo(rand(1, 190))
  }))

export const signinActivities = [
  { id: 1, name: '连续签到7日领好礼', status: 'active', reward_rules: [
    { day: 1, reward: { reward_type: 'lottery_times', lottery_times: 1 } },
    { day: 3, reward: { reward_type: 'priority', priority_activity_id: 2, priority_count: 1 } },
    { day: 7, reward: { reward_type: 'collectible', collectible_id: 7, collectible_name: '「春日樱花」限定盲盒系列', quantity: 1 } }
  ], created_at: daysAgo(20) }
]

export const inviteActivities = [
  { id: 1, name: '邀请好友赢藏品', status: 'active', register_reward: { reward_type: 'collectible', collectible_id: 5, collectible_name: '「青花瓷韵」系列藏品', quantity: 1 }, invite_reward: { reward_type: 'lottery_times', lottery_times: 2 }, tier_rewards: [
    { tier: 1, reward: { reward_type: 'priority', priority_activity_id: 1, priority_count: 1 } },
    { tier: 3, reward: { reward_type: 'qualification', qualification_collectible_id: 2, qualification_collectible_name: '「敦煌飞天·反弹琵琶」', qualification_count: 1, valid_until: dayjs().add(30, 'day').format('YYYY-MM-DD HH:mm:ss') } },
    { tier: 6, reward: { reward_type: 'collectible', collectible_id: 3, collectible_name: '「十二生肖·虎」限定款', quantity: 1 } },
    { tier: 9, reward: { reward_type: 'collectible', collectible_id: 6, collectible_name: '「山海经·神兽录」', quantity: 1 } }
  ], created_at: daysAgo(30) }
]

export const rewardRecords = Array.from({ length: 40 }, (_, i) => {
  const u = pick(users)
  const source = pick(['签到奖励', '邀请奖励', '注册福利', '抽奖奖品'])
  return {
    id: i + 1,
    user_id: u.id,
    nickname: u.nickname,
    phone: u.phone,
    source,
    reward_type: pick(['collectible', 'priority', 'qualification', 'lottery_times']),
    reward_text: pick(['「青花瓷韵」系列藏品 ×1', '优先购资格 ×1', '资格购资格 ×1', '抽奖次数 ×3']),
    status: pick(['success', 'success', 'failed'] as const),
    created_at: daysAgo(rand(0, 20))
  }
})

export const feeRate = { fee_rate: '3.00' }

export const articles = Array.from({ length: 10 }, (_, i) => {
  const cb = collectibles[i % collectibles.length]
  return {
    id: i + 1,
    title: pick(['藏品介绍：龙腾盛世背后的文化故事', '「敦煌飞天」数字藏品设计手记', '收藏指南：如何挑选值得收藏的数字藏品', '「赛博朋克」系列世界观设定']),
    content: '<h3>藏品介绍</h3><p>这里是对藏品背景、设计理念与发行信息的详细介绍。</p>',
    collectible_id: cb.id,
    collectible_name: cb.name,
    status: pick(['published', 'draft'] as const),
    created_at: daysAgo(rand(0, 60))
  }
})
