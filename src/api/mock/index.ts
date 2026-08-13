import dayjs from 'dayjs'
import { registerMock, ok, fail, paginate, getPageQuery, qs, type MockContext } from '@/utils/mockAdapter'
import {
  ADMIN_ACCOUNTS,
  ADMIN_PASSWORDS,
  ROLE_MENUS,
  ROLE_PERMISSIONS,
  collectibles,
  users,
  orders,
  transfers,
  marketOrders,
  tickets,
  ticketMessages,
  auditLogs,
  blacklist,
  riskAlarms,
  tradeApprovals,
  recharges,
  walletFlows,
  feeStats,
  fundAudits,
  banners,

  notices,

  helpItems,

  articles,
  adminAccounts,
  priorityActivities,
  priorityWhitelist,
  lotteryActivities,
  lotteryRecords,
  blindBoxes,
  composeRules,
  activityAirdrops,
  airdropRecords,
  registerRewards,
  realnameList,
  signinActivities,
  inviteActivities,
  rewardRecords,
  feeRate,
  recalcStock
} from './db'
import { isValidPhone } from '@/utils/validate'
import type { AdminRole } from '@/types'

let seq = 10000

function nextId(): number {
  seq += 1
  return seq
}

// 从 token 解析当前登录管理员
function currentAdmin(ctx: { token: string }) {
  try {
    const username = atob(ctx.token)
    const account = ADMIN_ACCOUNTS.find((a) => a.username === username)
    return account || ADMIN_ACCOUNTS[0]
  } catch {
    return ADMIN_ACCOUNTS[0]
  }
}

function verifyPassword(ctx: MockContext): boolean {
  const admin = currentAdmin(ctx)
  const pwd = (ctx.body as { password?: string })?.password
  return pwd === ADMIN_PASSWORDS[admin.username]
}

// 生成发放/操作审计记录
function writeAudit(ctx: { token: string }, module: string, action: string, target: string, reason: string): void {
  const admin = currentAdmin(ctx)
  auditLogs.unshift({
    id: nextId(),
    operator: admin.nickname,
    operator_id: admin.id,
    module,
    action,
    target,
    ip: '10.0.0.88',
    reason,
    created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
  })
}

// ---------- 认证与权限 ----------
registerMock('post', '/admin/login', (ctx) => {
  const { username, password } = ctx.body as { username: string; password: string }
  const account = ADMIN_ACCOUNTS.find((a) => a.username === username)
  if (!account || ADMIN_PASSWORDS[username] !== password) {
    return fail('用户名或密码错误', 400)
  }
  if (account.status === 0) {
    return fail('该账号已被禁用', 403)
  }
  return ok({ token: btoa(username), user: account })
})

registerMock('post', '/admin/logout', () => ok(null))

registerMock('get', '/admin/info', (ctx) => {
  const admin = currentAdmin(ctx)
  return ok(admin)
})

registerMock('get', '/admin/permissions', (ctx) => {
  const admin = currentAdmin(ctx)
  const menus = ROLE_MENUS[admin.role] || ROLE_MENUS.operator
  const permissions = ROLE_PERMISSIONS[admin.role] || ROLE_PERMISSIONS.operator
  return ok({ menus, permissions })
})

// ---------- 仪表盘 ----------
registerMock('get', '/dashboard', () => {
  const active = collectibles.filter((c) => c.status === 'on_sale')
  const trend = Array.from({ length: 7 }, (_, i) => ({
    date: dayjs().subtract(6 - i, 'day').format('MM-DD'),
    sales_amount: (Math.random() * 80000 + 12000).toFixed(2),
    orders: Math.floor(Math.random() * 400 + 60)
  }))
  return ok({
    today_new_users: 128,
    today_sales_amount: '36890.50',
    today_orders: 256,
    active_collectibles: active.length,
    on_sale_count: marketOrders.filter((m) => m.status === 'on_sale').length,
    total_recharge: '1582340.00',
    total_fee_income: '46890.32',
    pending_settlement: '126800.00',
    wallet_balance: [
      { name: '待结算', value: 126800 },
      { name: '可用余额', value: 968540 },
      { name: '冻结资金', value: 128600 }
    ],
    stock_warnings: collectibles
      .filter((c) => c.status === 'on_sale' && c.stock_pool < 100)
      .map((c) => ({ type: 'stock', text: `《${c.name}》库存池仅剩 ${c.stock_pool} 份`, level: 'warning' as const })),
    realtime_events: [
      { type: 'order', text: '用户「星河2」下单购买《敦煌飞天·反弹琵琶》×1，金额 ¥29.90', time: dayjs().subtract(2, 'minute').format('HH:mm:ss') },
      { type: 'onsale', text: '用户「月影3」上架《十二生肖·虎》寄售，售价 ¥45.00', time: dayjs().subtract(6, 'minute').format('HH:mm:ss') },
      { type: 'transfer', text: '用户「清风4」向「墨白5」转赠《青花瓷韵》完成', time: dayjs().subtract(9, 'minute').format('HH:mm:ss') },
      { type: 'alarm', text: '风控预警：用户「小鹿6」异地登录，IP归属地异常', time: dayjs().subtract(12, 'minute').format('HH:mm:ss') }
    ],
    trend,
    priority_stats: { total_issued: 860, used: 412, remaining: 448 }
  })
})

// ---------- 用户管理 ----------
registerMock('get', '/users', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const keyword = qs(ctx, 'keyword')
  const status = qs(ctx, 'status')
  let list = users
  if (keyword) {
    list = list.filter((u) => u.nickname.includes(keyword) || u.phone.includes(keyword))
  }
  if (status !== undefined && status !== '') {
    list = list.filter((u) => String(u.status) === status)
  }
  const paged = paginate(list, page, page_size)
  return ok({
    ...paged,
    page,
    page_size,
    list: paged.list.map((u) => ({
      id: u.id,
      nickname: u.nickname,
      avatar: u.avatar,
      phone: u.phone,
      status: u.status,
      is_black: u.is_black,
      balance: u.balance,
      asset_count: u.asset_count,
      invite_count: u.invite_count,
      created_at: u.created_at,
      last_login_at: u.last_login_at
    }))
  })
})

registerMock('get', '/users/:id', (ctx) => {
  const user = users.find((u) => u.id === Number(ctx.params.id))
  if (!user) return fail('用户不存在')
  return ok({
    id: user.id,
    nickname: user.nickname,
    phone: user.phone,
    avatar: user.avatar,
    status: user.status,
    is_black: user.is_black,
    created_at: user.created_at,
    last_login_at: user.last_login_at,
    realname: user.realname,
    wallet: {
      balance: user.balance,
      frozen_balance: '0.00',
      total_recharge: (Number(user.balance) * 1.8).toFixed(2),
      total_withdraw: '0.00'
    },
    collectibles: user.collectibles,
    priority_quotas: user.priority_quotas,
    invite_parent: user.invite_parent,
    invite_children: user.invite_children
  })
})

registerMock('post', '/users/:id/freeze', (ctx) => {
  const user = users.find((u) => u.id === Number(ctx.params.id))
  if (!user) return fail('用户不存在')
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  user.status = 0
  writeAudit(ctx, '用户管理', '冻结用户', `用户ID:${user.id}`, String(ctx.body.reason || ''))
  return ok(null)
})

registerMock('post', '/users/:id/unfreeze', (ctx) => {
  const user = users.find((u) => u.id === Number(ctx.params.id))
  if (!user) return fail('用户不存在')
  user.status = 1
  writeAudit(ctx, '用户管理', '解冻用户', `用户ID:${user.id}`, String(ctx.body.reason || ''))
  return ok(null)
})

registerMock('post', '/users/:id/reset-password', (ctx) => {
  const user = users.find((u) => u.id === Number(ctx.params.id))
  if (!user) return fail('用户不存在')
  user.password = String(ctx.body.password || '123456')
  writeAudit(ctx, '用户管理', '重置密码', `用户ID:${user.id}`, '用户申请重置')
  return ok(null)
})

registerMock('post', '/users/:id/force-logout', () => ok(null))

registerMock('post', '/users/:id/black', (ctx) => {
  const user = users.find((u) => u.id === Number(ctx.params.id))
  if (!user) return fail('用户不存在')
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  user.is_black = 1
  writeAudit(ctx, '风控安全', '拉黑用户', `用户ID:${user.id}`, String(ctx.body.reason || ''))
  return ok(null)
})

registerMock('post', '/users/:id/unblack', (ctx) => {
  const user = users.find((u) => u.id === Number(ctx.params.id))
  if (!user) return fail('用户不存在')
  user.is_black = 0
  return ok(null)
})

// 强制回收：校验二次流转
registerMock('post', '/users/:id/recover', (ctx) => {
  const user = users.find((u) => u.id === Number(ctx.params.id))
  if (!user) return fail('用户不存在')
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  const item = user.collectibles.find((c) => c.id === Number((ctx.body as { collectible_id: number }).collectible_id))
  if (!item) return fail('未找到该用户的此藏品')
  if (item.status !== 'holding') {
    return fail('该藏品已发生二次流转，无法回收')
  }
  user.collectibles = user.collectibles.filter((c) => c.id !== item.id)
  user.asset_count = Math.max(0, user.asset_count - 1)
  const cb = collectibles.find((c) => c.id === item.collectible_id)
  if (cb) {
    cb.sold_sale = Math.max(0, cb.sold_sale - 1)
    recalcStock(cb)
  }
  writeAudit(ctx, '藏品管理', '强制回收', `藏品ID:${item.collectible_id} 用户ID:${user.id}`, String(ctx.body.reason || ''))
  return ok(null)
})

// ---------- 实名认证 ----------
registerMock('get', '/realnames', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const keyword = qs(ctx, 'keyword')
  let list = realnameList
  if (keyword) {
    list = list.filter((r) => r.phone.includes(keyword) || r.name.includes(keyword) || r.nickname.includes(keyword))
  }
  const paged = paginate(list, page, page_size)
  return ok({ ...paged, page, page_size })
})

// 查看完整实名信息需二次密码验证并写审计日志
registerMock('post', '/realnames/:id/full', (ctx) => {
  const item = realnameList.find((r) => r.id === Number(ctx.params.id))
  if (!item) return fail('记录不存在')
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  writeAudit(ctx, '实名认证', '查看完整实名信息', `用户ID:${item.user_id}`, '二次密码验证通过')
  return ok({
    id: item.id,
    user_id: item.user_id,
    name: item.name,
    id_card: item.id_card,
    front_image: '',
    back_image: '',
    phone: item.phone
  })
})

// ---------- 藏品管理 ----------
registerMock('get', '/collectibles', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const keyword = qs(ctx, 'keyword')
  const status = qs(ctx, 'status')
  let list = collectibles.filter((c) => c.status !== 'deleted')
  if (keyword) list = list.filter((c) => c.name.includes(keyword) || c.issuer.includes(keyword))
  if (status !== undefined && status !== '') list = list.filter((c) => c.status === status)
  list.forEach(recalcStock)
  const paged = paginate(list, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('get', '/collectibles/:id', (ctx) => {
  const cb = collectibles.find((c) => c.id === Number(ctx.params.id))
  if (!cb) return fail('藏品不存在')
  recalcStock(cb)
  return ok(cb)
})

registerMock('post', '/collectibles', (ctx) => {
  const body = ctx.body as Partial<(typeof collectibles)[number]>
  if (!body.name || !body.total_supply) return fail('名称与发行总量必填')
  if (Number(body.total_supply) <= 0) return fail('发行总量必须大于0')
  const item = {
    id: nextId(),
    name: body.name,
    category: body.category || '数字艺术',
    image: body.image || '',
    issuer: body.issuer || '数和文创',
    creator: body.creator || '',
    story: body.story || '',
    status: 'draft' as const,
    total_supply: Number(body.total_supply),
    configured_quota: 0,
    sold_sale: 0,
    airdropped: 0,
    destroyed: 0,
    stock_pool: Number(body.total_supply),
    circulation: 0,
    sale_quantity: 0,
    sale_sold: 0,
    sale_remaining: 0,
    price: '0.00',
    sale_start_at: null,
    sale_end_at: null,
    limit_per_user: 1,
    qualification_enabled: false,
    qualification_collectible_ids: [],
    qualification_phones: [],
    transfer_enabled: true,
    consign_enabled: true,
    quotas: [],
    created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  collectibles.unshift(item)
  writeAudit(ctx, '藏品管理', '创建藏品', `藏品:${item.name}`, '创建')
  return ok(item)
})

registerMock('put', '/collectibles/:id', (ctx) => {
  const cb = collectibles.find((c) => c.id === Number(ctx.params.id))
  if (!cb) return fail('藏品不存在')
  if (cb.status !== 'draft') return fail('仅「已创建」状态可编辑基础信息')
  const body = ctx.body as Partial<(typeof collectibles)[number]>
  Object.assign(cb, {
    name: body.name || cb.name,
    category: body.category || cb.category,
    image: body.image ?? cb.image,
    issuer: body.issuer || cb.issuer,
    creator: body.creator || cb.creator,
    story: body.story ?? cb.story
  })
  return ok(cb)
})

// 删除（仅草稿无关联）
registerMock('post', '/collectibles/:id/delete', (ctx) => {
  const cb = collectibles.find((c) => c.id === Number(ctx.params.id))
  if (!cb) return fail('藏品不存在')
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  if (cb.status !== 'draft') return fail('仅「已创建」且无关联状态的藏品可删除')
  cb.status = 'deleted'
  writeAudit(ctx, '藏品管理', '删除藏品', `藏品:${cb.name}`, '草稿删除')
  return ok(null)
})

// 发售配置 / 重新上架
registerMock('post', '/collectibles/:id/sale', (ctx) => {
  const cb = collectibles.find((c) => c.id === Number(ctx.params.id))
  if (!cb) return fail('藏品不存在')
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  const body = ctx.body as {
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
  recalcStock(cb)
  if (Number(body.quantity) <= 0) return fail('发售数量必须大于0')
  if (Number(body.quantity) > cb.stock_pool) {
    return fail(`发售数量不得超过当前库存池，当前库存池为 ${cb.stock_pool}`)
  }
  if (!body.start_at || !body.end_at) return fail('请填写发售时间')
  if (body.end_at <= body.start_at) return fail('结束时间必须晚于开始时间')
  if (body.qualification_enabled) {
    const validCbs = (body.qualification_collectible_ids || []).filter((id) => {
      const target = collectibles.find((c) => c.id === id)
      return target && target.circulation > 0
    })
    if (body.qualification_enabled && validCbs.length === 0) {
      return fail('资格藏品必须为流通量大于0的流通藏品')
    }
    const phones = body.qualification_phones || []
    for (const phone of phones) {
      if (!isValidPhone(phone)) return fail(`手机号 ${phone} 格式不正确`)
      if (!users.some((u) => u.phone === phone)) return fail(`手机号 ${phone} 未注册，无法添加为额外资格用户`)
    }
  }
  cb.price = body.price
  cb.sale_quantity = Number(body.quantity)
  cb.sale_sold = 0
  cb.sale_start_at = body.start_at
  cb.sale_end_at = body.end_at
  cb.limit_per_user = Number(body.limit_per_user)
  cb.qualification_enabled = body.qualification_enabled
  cb.qualification_collectible_ids = body.qualification_collectible_ids || []
  cb.qualification_phones = body.qualification_phones || []
  cb.transfer_enabled = body.transfer_enabled
  cb.consign_enabled = body.consign_enabled
  cb.status = 'on_sale'
  recalcStock(cb)
  writeAudit(ctx, '藏品管理', '配置发售上架', `藏品:${cb.name}`, '发售上架')
  return ok(cb)
})

// 强制售罄（不清零，剩余保留在库存池）
registerMock('post', '/collectibles/:id/force-sell-out', (ctx) => {
  const cb = collectibles.find((c) => c.id === Number(ctx.params.id))
  if (!cb) return fail('藏品不存在')
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  if (cb.status !== 'on_sale') return fail('仅「发售中」状态可强制售罄')
  cb.status = 'sold_out'
  recalcStock(cb)
  writeAudit(ctx, '藏品管理', '强制售罄', `藏品:${cb.name}`, String(ctx.body.reason || ''))
  return ok(null)
})

registerMock('post', '/collectibles/:id/off-shelf', (ctx) => {
  const cb = collectibles.find((c) => c.id === Number(ctx.params.id))
  if (!cb) return fail('藏品不存在')
  cb.status = 'off_shelf'
  writeAudit(ctx, '藏品管理', '手动下架', `藏品:${cb.name}`, String(ctx.body.reason || ''))
  return ok(null)
})

// 配额配置
registerMock('post', '/collectibles/:id/quota', (ctx) => {
  const cb = collectibles.find((c) => c.id === Number(ctx.params.id))
  if (!cb) return fail('藏品不存在')
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  recalcStock(cb)
  const body = ctx.body as { quota_id?: number; type: string; name: string; total: number; used: number; status: string }
  if (body.quota_id) {
    const quota = cb.quotas.find((q) => q.id === body.quota_id)
    if (!quota) return fail('配额不存在')
    const delta = Number(body.total) - quota.total
    if (delta > 0) {
      if (delta > cb.stock_pool) return fail(`库存池不足，当前库存池为 ${cb.stock_pool}`)
      cb.stock_pool -= delta
      cb.configured_quota += delta
    } else if (delta < 0) {
      const used = quota.used
      const minTotal = Math.max(used, 0)
      if (Number(body.total) < minTotal) return fail('已使用的配额不可减少（防止超卖）')
      cb.configured_quota += delta
      cb.stock_pool -= delta
    }
    Object.assign(quota, { name: body.name, total: Number(body.total), status: body.status as 'active' | 'disabled' })
  } else {
    if (Number(body.total) <= 0) return fail('配额数量必须大于0')
    if (Number(body.total) > cb.stock_pool) return fail(`库存池不足，当前库存池为 ${cb.stock_pool}`)
    cb.quotas.push({
      id: nextId(),
      type: body.type as 'priority' | 'activity_airdrop' | 'other',
      type_text: body.type === 'priority' ? '优先购配额' : body.type === 'activity_airdrop' ? '活动空投配额' : '其他活动配额',
      name: body.name,
      total: Number(body.total),
      used: 0,
      status: body.status as 'active' | 'disabled',
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
    })
    cb.configured_quota += Number(body.total)
    cb.stock_pool -= Number(body.total)
  }
  writeAudit(ctx, '藏品管理', '配额配置', `藏品:${cb.name}`, `配额:${body.name}`)
  return ok(null)
})

registerMock('post', '/collectibles/:id/quota/:quotaId/delete', (ctx) => {
  const cb = collectibles.find((c) => c.id === Number(ctx.params.id))
  if (!cb) return fail('藏品不存在')
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  const idx = cb.quotas.findIndex((q) => q.id === Number(ctx.params.quotaId))
  if (idx === -1) return fail('配额不存在')
  const quota = cb.quotas[idx]
  const unused = quota.total - quota.used
  cb.quotas.splice(idx, 1)
  cb.configured_quota -= quota.total
  cb.stock_pool += unused
  writeAudit(ctx, '藏品管理', '停用配额', `藏品:${cb.name}`, `配额:${quota.name}`)
  return ok(null)
})

// 独立空投（不绑定活动，任意阶段可执行）
registerMock('post', '/collectibles/:id/airdrop', (ctx) => {
  const cb = collectibles.find((c) => c.id === Number(ctx.params.id))
  if (!cb) return fail('藏品不存在')
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  recalcStock(cb)
  const body = ctx.body as { quantity: number; phones: string[] }
  const quantity = Number(body.quantity)
  if (quantity <= 0) return fail('空投数量必须大于0')
  if (quantity > cb.stock_pool) return fail(`空投数量不得超过库存池，当前库存池为 ${cb.stock_pool}`)
  if (!body.phones || body.phones.length === 0) return fail('请填写接收手机号')
  const failPhones: string[] = []
  for (const phone of body.phones) {
    if (!isValidPhone(phone) || !users.some((u) => u.phone === phone)) {
      failPhones.push(phone)
    }
  }
  if (failPhones.length > 0) {
    return fail(`以下手机号未注册或格式错误：${failPhones.join('、')}`)
  }
  cb.airdropped += quantity
  cb.stock_pool -= quantity
  recalcStock(cb)
  const taskNo = `AIR${dayjs().format('YYYYMMDDHHmmss')}`
  airdropRecords.unshift({
    id: nextId(),
    task_no: taskNo,
    collectible_id: cb.id,
    collectible_name: cb.name,
    quantity,
    target_users: body.phones.length,
    success_count: body.phones.length,
    fail_count: 0,
    operator: currentAdmin(ctx).nickname,
    created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
  })
  writeAudit(ctx, '藏品管理', '独立空投', `藏品:${cb.name}`, `空投${quantity}份`)
  return ok({ task_no: taskNo, success_count: body.phones.length, fail_count: 0, fail_phones: [] })
})

registerMock('get', '/collectibles/airdrop-records', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const paged = paginate(airdropRecords, page, page_size)
  return ok({ ...paged, page, page_size })
})

// 销毁库存（不可逆，<= 库存池）
registerMock('post', '/collectibles/:id/destroy', (ctx) => {
  const cb = collectibles.find((c) => c.id === Number(ctx.params.id))
  if (!cb) return fail('藏品不存在')
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  recalcStock(cb)
  const quantity = Number((ctx.body as { quantity: number }).quantity)
  if (quantity <= 0) return fail('销毁数量必须大于0')
  if (quantity > cb.stock_pool) return fail(`销毁数量不得超过库存池，当前库存池为 ${cb.stock_pool}`)
  cb.destroyed += quantity
  cb.stock_pool -= quantity
  recalcStock(cb)
  writeAudit(ctx, '藏品管理', '销毁库存', `藏品:${cb.name}`, `销毁${quantity}份`)
  return ok(null)
})

// 寄售/转赠开关
registerMock('post', '/collectibles/:id/consign-switch', (ctx) => {
  const cb = collectibles.find((c) => c.id === Number(ctx.params.id))
  if (!cb) return fail('藏品不存在')
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  const enabled = Boolean((ctx.body as { enabled: boolean }).enabled)
  cb.consign_enabled = enabled
  if (!enabled) {
    const removed = marketOrders.filter((m) => m.collectible_id === cb.id && m.status === 'on_sale')
    removed.forEach((m) => {
      m.status = 'off_shelf'
    })
  }
  writeAudit(ctx, '藏品管理', enabled ? '开启寄售' : '关闭寄售（自动下架挂单）', `藏品:${cb.name}`, String(ctx.body.reason || ''))
  return ok({ auto_off: enabled ? 0 : marketOrders.filter((m) => m.collectible_id === cb.id && m.status === 'off_shelf').length })
})

registerMock('post', '/collectibles/:id/transfer-switch', (ctx) => {
  const cb = collectibles.find((c) => c.id === Number(ctx.params.id))
  if (!cb) return fail('藏品不存在')
  cb.transfer_enabled = Boolean((ctx.body as { enabled: boolean }).enabled)
  return ok(null)
})

// ---------- 订单 ----------
registerMock('get', '/orders', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const keyword = qs(ctx, 'keyword')
  const type = qs(ctx, 'type')
  const status = qs(ctx, 'status')
  let list = orders
  if (keyword) list = list.filter((o) => o.order_no.includes(keyword) || o.nickname.includes(keyword) || o.phone.includes(keyword))
  if (type !== undefined && type !== '') list = list.filter((o) => o.type === type)
  if (status !== undefined && status !== '') list = list.filter((o) => o.status === status)
  const paged = paginate(list, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('get', '/orders/:id', (ctx) => {
  const order = orders.find((o) => o.id === Number(ctx.params.id))
  if (!order) return fail('订单不存在')
  return ok(order)
})

registerMock('get', '/orders/:id/pay-logs', (ctx) => {
  const order = orders.find((o) => o.id === Number(ctx.params.id))
  if (!order) return fail('订单不存在')
  return ok([
    { id: 1, order_no: order.order_no, channel: order.pay_channel, event: '创建支付订单', raw: '{}', created_at: order.created_at },
    { id: 2, order_no: order.order_no, channel: order.pay_channel, event: '支付成功回调', raw: '{}', created_at: order.paid_at || order.created_at }
  ])
})

// ---------- 市场寄售 ----------
registerMock('get', '/market/onsale', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const list = marketOrders.filter((m) => m.status === 'on_sale')
  const paged = paginate(list, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('get', '/market/deals', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const list = marketOrders.filter((m) => m.status === 'dealt')
  const paged = paginate(list, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('get', '/market/fee-rate', () => ok(feeRate))

registerMock('post', '/market/fee-rate', (ctx) => {
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  const rate = String((ctx.body as { rate: string }).rate)
  if (Number(rate) < 0 || Number(rate) > 20) return fail('费率必须在 0 ~ 20% 之间')
  feeRate.fee_rate = rate
  writeAudit(ctx, '市场寄售', '修改手续费率', `费率:${rate}%`, '费率调整')
  return ok(null)
})

registerMock('post', '/market/orders/:id/off', (ctx) => {
  const order = marketOrders.find((m) => m.id === Number(ctx.params.id))
  if (!order) return fail('挂单不存在')
  order.status = 'off_shelf'
  return ok(null)
})

// ---------- 转赠 ----------
registerMock('get', '/transfers', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const status = qs(ctx, 'status')
  let list = transfers
  if (status !== undefined && status !== '') list = list.filter((t) => t.status === status)
  const paged = paginate(list, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('get', '/transfers/stats', () =>
  ok({ total_count: transfers.length, completed_count: transfers.filter((t) => t.status === 'completed').length, today_count: 8, today_completed: 6 })
)

// 撤销转赠：仅已完成，校验接收方仍持有
registerMock('post', '/transfers/:id/revoke', (ctx) => {
  const t = transfers.find((tr) => tr.id === Number(ctx.params.id))
  if (!t) return fail('转赠记录不存在')
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  if (t.status !== 'completed') return fail('仅「已完成」的转赠可撤销')
  // 模拟接收方已二次流转
  if (t.id % 5 === 0) return fail('接收方已对该藏品进行其他操作，无法撤销')
  t.status = 'revoked'
  writeAudit(ctx, '转赠管理', '撤销转赠', `转赠单:${t.transfer_no}`, String(ctx.body.reason || ''))
  return ok(null)
})

// ---------- 钱包 ----------
registerMock('get', '/wallet/recharges', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const status = qs(ctx, 'status')
  let list = recharges
  if (status !== undefined && status !== '') list = list.filter((r) => r.status === status)
  const paged = paginate(list, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('get', '/wallet/flows', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const type = qs(ctx, 'type')
  let list = walletFlows
  if (type !== undefined && type !== '') list = list.filter((f) => f.type === type)
  const paged = paginate(list, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('get', '/wallet/fees', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const paged = paginate(feeStats, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('get', '/wallet/audits', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const paged = paginate(fundAudits, page, page_size)
  return ok({ ...paged, page, page_size })
})

// ---------- CMS ----------
registerMock('get', '/cms/banners', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const paged = paginate(banners, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('post', '/cms/banners', (ctx) => {
  const body = ctx.body as Partial<(typeof banners)[number]>
  if (body.id) {
    const idx = banners.findIndex((b) => b.id === body.id)
    if (idx > -1) Object.assign(banners[idx], body)
  } else {
    banners.unshift({ id: nextId(), title: body.title || '', image: body.image || '', link: body.link || '', sort: body.sort ?? 0, status: body.status ?? 'enabled', created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') })
  }
  return ok(null)
})

registerMock('delete', '/cms/banners/:id', (ctx) => {
  const idx = banners.findIndex((b) => b.id === Number(ctx.params.id))
  if (idx > -1) banners.splice(idx, 1)
  return ok(null)
})

registerMock('get', '/cms/notices', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const paged = paginate(notices, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('post', '/cms/notices', (ctx) => {
  const body = ctx.body as Partial<(typeof notices)[number]>
  if (body.id) {
    const idx = notices.findIndex((n) => n.id === body.id)
    if (idx > -1) Object.assign(notices[idx], body)
  } else {
    notices.unshift({ id: nextId(), title: body.title || '', content: body.content || '', type: body.type ?? 'notice', status: body.status ?? 'draft', published_at: body.status === 'published' ? dayjs().format('YYYY-MM-DD HH:mm:ss') : null, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') } as (typeof notices)[number])
  }
  return ok(null)
})

registerMock('delete', '/cms/notices/:id', (ctx) => {
  const idx = notices.findIndex((n) => n.id === Number(ctx.params.id))
  if (idx > -1) notices.splice(idx, 1)
  return ok(null)
})

registerMock('get', '/cms/help', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const paged = paginate(helpItems, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('post', '/cms/help', (ctx) => {
  const body = ctx.body as Partial<(typeof helpItems)[number]>
  if (body.id) {
    const idx = helpItems.findIndex((h) => h.id === body.id)
    if (idx > -1) Object.assign(helpItems[idx], body)
  } else {
    helpItems.unshift({ id: nextId(), title: body.title || '', content: body.content || '', category: body.category || '帮助指南', sort: body.sort ?? 0, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') })
  }
  return ok(null)
})

registerMock('delete', '/cms/help/:id', (ctx) => {
  const idx = helpItems.findIndex((h) => h.id === Number(ctx.params.id))
  if (idx > -1) helpItems.splice(idx, 1)
  return ok(null)
})

registerMock('get', '/cms/articles', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const paged = paginate(articles, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('post', '/cms/articles', (ctx) => {
  const body = ctx.body as Partial<(typeof articles)[number]>
  if (body.id) {
    const idx = articles.findIndex((a) => a.id === body.id)
    if (idx > -1) Object.assign(articles[idx], body)
  } else {
    const cb = collectibles.find((c) => c.id === Number(body.collectible_id))
    articles.unshift({ id: nextId(), title: body.title || '', content: body.content || '', collectible_id: Number(body.collectible_id), collectible_name: cb?.name || '', status: body.status ?? 'draft', created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') })
  }
  writeAudit(ctx, '内容管理', '保存藏品文案', body.title || '', '文案配置')
  return ok(null)
})

registerMock('delete', '/cms/articles/:id', (ctx) => {
  const idx = articles.findIndex((a) => a.id === Number(ctx.params.id))
  if (idx > -1) articles.splice(idx, 1)
  return ok(null)
})

// ---------- 权限审计 ----------
registerMock('get', '/permission/admins', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const paged = paginate(adminAccounts, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('post', '/permission/admins', (ctx) => {
  const body = ctx.body as { username: string; nickname: string; role: AdminRole; password: string }
  if (!body.username || !body.password) return fail('用户名与密码必填')
  adminAccounts.unshift({ id: nextId(), username: body.username, nickname: body.nickname || body.username, role: body.role, role_name: body.role === 'super_admin' ? '超级管理员' : body.role === 'operator' ? '运营' : body.role === 'finance' ? '财务' : body.role === 'risk' ? '风控' : '客服', phone: '', status: 1, last_login_at: null, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') })
  writeAudit(ctx, '权限审计', '新增管理员', body.username, '新增账号')
  return ok(null)
})

registerMock('post', '/permission/admins/:id/status', (ctx) => {
  const a = adminAccounts.find((x) => x.id === Number(ctx.params.id))
  if (a) a.status = Number((ctx.body as { status: number }).status) as 0 | 1
  return ok(null)
})

registerMock('post', '/permission/admins/:id/delete', (ctx) => {
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  const idx = adminAccounts.findIndex((x) => x.id === Number(ctx.params.id))
  if (idx > -1) adminAccounts.splice(idx, 1)
  return ok(null)
})

registerMock('get', '/permission/roles', () =>
  ok([
    { id: 1, name: '超级管理员', code: 'super_admin', description: '拥有全部权限', permissions: ROLE_PERMISSIONS.super_admin, created_at: '2025-01-01 10:00:00' },
    { id: 2, name: '运营', code: 'operator', description: '藏品/活动/CMS/基础用户管理', permissions: ROLE_PERMISSIONS.operator, created_at: '2025-01-01 10:00:00' },
    { id: 3, name: '财务', code: 'finance', description: '订单/钱包/报表', permissions: ROLE_PERMISSIONS.finance, created_at: '2025-01-01 10:00:00' },
    { id: 4, name: '风控', code: 'risk', description: '黑名单/审批/告警/实名', permissions: ROLE_PERMISSIONS.risk, created_at: '2025-01-01 10:00:00' },
    { id: 5, name: '客服', code: 'service', description: '工单处理/基础用户查询', permissions: ROLE_PERMISSIONS.service, created_at: '2025-01-01 10:00:00' }
  ])
)

registerMock('post', '/permission/roles', (ctx) => {
  const body = ctx.body as { id?: number; name: string; code: string; description: string }
  writeAudit(ctx, '权限审计', '保存角色', body.name, '角色配置')
  return ok({ id: body.id || nextId(), ...body, permissions: [], created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') })
})

registerMock('get', '/audit-logs', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const moduleName = qs(ctx, 'module')
  const keyword = qs(ctx, 'keyword')
  let list = auditLogs
  if (moduleName !== undefined && moduleName !== '') list = list.filter((l) => l.module === moduleName)
  if (keyword) list = list.filter((l) => l.operator.includes(keyword) || l.action.includes(keyword))
  const paged = paginate(list, page, page_size)
  return ok({ ...paged, page, page_size })
})

// ---------- 风控安全 ----------
registerMock('get', '/security/blacklist', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const paged = paginate(blacklist, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('post', '/security/blacklist', (ctx) => {
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  const body = ctx.body as { phone: string; reason: string }
  const user = users.find((u) => u.phone === body.phone)
  if (!user) return fail(`手机号 ${body.phone} 未注册`)
  blacklist.unshift({ id: nextId(), user_id: user.id, nickname: user.nickname, phone: user.phone, reason: body.reason || '', operator: currentAdmin(ctx).nickname, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') })
  writeAudit(ctx, '风控安全', '添加黑名单', body.phone, body.reason)
  return ok(null)
})

registerMock('delete', '/security/blacklist/:id', (ctx) => {
  const idx = blacklist.findIndex((b) => b.id === Number(ctx.params.id))
  if (idx > -1) blacklist.splice(idx, 1)
  return ok(null)
})

registerMock('get', '/security/alarms', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const status = qs(ctx, 'status')
  let list = riskAlarms
  if (status !== undefined && status !== '') list = list.filter((a) => a.status === status)
  const paged = paginate(list, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('post', '/security/alarms/:id', (ctx) => {
  const a = riskAlarms.find((x) => x.id === Number(ctx.params.id))
  if (a) a.status = (ctx.body as { action: 'processed' | 'ignored' }).action
  return ok(null)
})

registerMock('get', '/security/trade-approvals', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const status = qs(ctx, 'status')
  let list = tradeApprovals
  if (status !== undefined && status !== '') list = list.filter((a) => a.status === status)
  const paged = paginate(list, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('post', '/security/trade-approvals/:id', (ctx) => {
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  const a = tradeApprovals.find((x) => x.id === Number(ctx.params.id))
  if (!a) return fail('审批单不存在')
  const approve = Boolean((ctx.body as { approve: boolean }).approve)
  a.status = approve ? 'approved' : 'rejected'
  a.handled_at = dayjs().format('YYYY-MM-DD HH:mm:ss')
  writeAudit(ctx, '风控安全', approve ? '审批通过' : '审批驳回', a.order_no, a.reason)
  return ok(null)
})

// ---------- 客服工单 ----------
registerMock('get', '/tickets', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const status = qs(ctx, 'status')
  let list = tickets
  if (status !== undefined && status !== '') list = list.filter((t) => t.status === status)
  const paged = paginate(list, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('get', '/tickets/:id', (ctx) => {
  const t = tickets.find((x) => x.id === Number(ctx.params.id))
  if (!t) return fail('工单不存在')
  return ok(t)
})

registerMock('get', '/tickets/:id/messages', (ctx) => {
  const list = ticketMessages.filter((m) => m.ticket_id === Number(ctx.params.id))
  return ok(list)
})

registerMock('post', '/tickets/:id/accept', (ctx) => {
  const t = tickets.find((x) => x.id === Number(ctx.params.id))
  if (t) {
    t.status = 'processing'
    t.assignee = currentAdmin(ctx).nickname
  }
  return ok(null)
})

registerMock('post', '/tickets/:id/reply', (ctx) => {
  ticketMessages.push({ id: nextId(), ticket_id: Number(ctx.params.id), sender: currentAdmin(ctx).nickname, content: String((ctx.body as { content: string }).content), created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') })
  const t = tickets.find((x) => x.id === Number(ctx.params.id))
  if (t) t.updated_at = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return ok(null)
})

registerMock('post', '/tickets/:id/transfer', (ctx) => {
  const t = tickets.find((x) => x.id === Number(ctx.params.id))
  if (t) t.assignee = String((ctx.body as { assignee: string }).assignee)
  return ok(null)
})

registerMock('post', '/tickets/:id/close', (ctx) => {
  const t = tickets.find((x) => x.id === Number(ctx.params.id))
  if (t) t.status = 'closed'
  return ok(null)
})

// ---------- 报表 ----------
registerMock('get', '/reports/data', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const rows = Array.from({ length: 60 }, (_, i) => ({
    date: dayjs().subtract(59 - i, 'day').format('YYYY-MM-DD'),
    sales_amount: (Math.random() * 90000 + 8000).toFixed(2),
    sales_count: Math.floor(Math.random() * 900 + 100),
    new_users: Math.floor(Math.random() * 300 + 20),
    active_users: Math.floor(Math.random() * 3000 + 500),
    orders: Math.floor(Math.random() * 500 + 50),
    fee_amount: (Math.random() * 2700 + 240).toFixed(2),
    recharge_amount: (Math.random() * 90000 + 5000).toFixed(2)
  }))
  const paged = paginate(rows, page, page_size)
  return ok({ ...paged, page, page_size })
})

// ---------- 平台运维 ----------
registerMock('get', '/platform/backups', () =>
  ok([
    { id: 'BK20260811001', created_at: '2026-08-11 09:30:00', size: '12.8MB', operator: '超级管理员' },
    { id: 'BK20260801001', created_at: '2026-08-01 02:00:00', size: '11.4MB', operator: '系统自动' }
  ])
)

registerMock('post', '/platform/clear', (ctx) => {
  const body = ctx.body as { confirm_text: string; password: string; sms_code: string; reason: string }
  if (body.confirm_text !== '确认清除') return fail('请输入「确认清除」以确认操作')
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  if (body.sms_code !== '123456') return fail('短信验证码错误')
  writeAudit(ctx, '平台运维', '清除用户数据', '全量用户数据', body.reason)
  return ok({ backup_id: `BK${dayjs().format('YYYYMMDDHHmmss')}`, backup_path: '/backup/20260811', cleared_users: users.length, cleared_at: dayjs().format('YYYY-MM-DD HH:mm:ss') })
})

// ---------- 营销活动 ----------
registerMock('get', '/marketing/priority-activities', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const paged = paginate(priorityActivities as unknown as Array<Record<string, unknown>>, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('post', '/marketing/priority-activities', (ctx) => {
  const body = ctx.body as { name: string; collectible_id: number; start_at: string; end_at: string; total_quota: number }
  if (!body.name || !body.collectible_id || !body.start_at || !body.end_at) return fail('请完善活动信息')
  const cb = collectibles.find((c) => c.id === Number(body.collectible_id))
  if (!cb) return fail('请选择有效的藏品')
  const item = {
    id: nextId(),
    name: body.name,
    collectible_id: cb.id,
    collectible_name: cb.name,
    start_at: body.start_at,
    end_at: body.end_at,
    total_quota: Number(body.total_quota || 0),
    issued_count: 0,
    status: 'not_started',
    created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  ;(priorityActivities as unknown as Array<Record<string, unknown>>).unshift(item as unknown as Record<string, unknown>)
  writeAudit(ctx, '营销活动', '创建优先购活动', body.name, '活动创建')
  return ok(item)
})

registerMock('get', '/marketing/priority-activities/:id/whitelist', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const keyword = qs(ctx, 'keyword')
  let list = priorityWhitelist.filter((w) => w.activity_id === Number(ctx.params.id))
  if (keyword) list = list.filter((w) => w.phone.includes(keyword) || w.nickname.includes(keyword))
  const paged = paginate(list, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('post', '/marketing/priority-activities/:id/whitelist', (ctx) => {
  const body = ctx.body as { phones: string[]; times: number; valid_until: string }
  const invalid: string[] = []
  for (const phone of body.phones) {
    if (!isValidPhone(phone) || !users.some((u) => u.phone === phone)) invalid.push(phone)
  }
  if (invalid.length > 0) return fail(`以下手机号未注册或格式错误：${invalid.join('、')}`)
  for (const phone of body.phones) {
    const u = users.find((x) => x.phone === phone)!
    priorityWhitelist.push({
      id: nextId(),
      activity_id: Number(ctx.params.id),
      user_id: u.id,
      nickname: u.nickname,
      phone,
      times: Number(body.times || 1),
      used_times: 0,
      valid_until: body.valid_until || dayjs().add(30, 'day').format('YYYY-MM-DD HH:mm:ss'),
      status: 'valid',
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
    })
  }
  writeAudit(ctx, '营销活动', '优先购白名单导入', `活动ID:${ctx.params.id}`, `导入${body.phones.length}个手机号`)
  return ok(null)
})

registerMock('delete', '/marketing/whitelist/:id', (ctx) => {
  const idx = priorityWhitelist.findIndex((w) => w.id === Number(ctx.params.id))
  if (idx > -1) priorityWhitelist.splice(idx, 1)
  return ok(null)
})

registerMock('post', '/marketing/priority-activities/:id/clean-expired', (ctx) => {
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  const activityId = Number(ctx.params.id)
  const cleared = priorityWhitelist.filter((w) => w.activity_id === activityId && w.status === 'expired')
  for (let i = priorityWhitelist.length - 1; i >= 0; i -= 1) {
    const w = priorityWhitelist[i]
    if (w.activity_id === activityId && w.status === 'expired') priorityWhitelist.splice(i, 1)
  }
  writeAudit(ctx, '营销活动', '清理过期优先购资格', `活动ID:${activityId}`, `清理${cleared.length}条`)
  return ok({ cleared: cleared.length })
})

registerMock('get', '/marketing/signin-activities', () => ok(signinActivities))
registerMock('post', '/marketing/signin-activities', (ctx) => {
  const body = ctx.body as { id?: number; name: string; status: string; reward_rules: unknown[] }
  if (body.id) {
    const idx = signinActivities.findIndex((s) => s.id === body.id)
    if (idx > -1) Object.assign(signinActivities[idx], body)
  } else {
    signinActivities.push({ id: nextId(), name: body.name, status: body.status as 'active' | 'disabled', reward_rules: body.reward_rules as never, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') })
  }
  writeAudit(ctx, '营销活动', '保存签到活动', body.name, '活动配置')
  return ok(null)
})

registerMock('get', '/marketing/invite-activities', () => ok(inviteActivities))
registerMock('post', '/marketing/invite-activities', (ctx) => {
  const body = ctx.body as { id?: number; name: string; status: string }
  if (body.id) {
    const idx = inviteActivities.findIndex((s) => s.id === body.id)
    if (idx > -1) Object.assign(inviteActivities[idx], body)
  }
  writeAudit(ctx, '营销活动', '保存邀请活动', body.name, '活动配置')
  return ok(null)
})

registerMock('get', '/marketing/lottery-activities', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const paged = paginate(lotteryActivities as unknown as Array<Record<string, unknown>>, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('get', '/marketing/lottery-activities/:id', (ctx) => {
  const a = lotteryActivities.find((x) => x.id === Number(ctx.params.id))
  if (!a) return fail('活动不存在')
  return ok(a)
})

// 保存抽奖活动：概率校验（非空奖概率总和 <= 100%）
registerMock('post', '/marketing/lottery-activities', (ctx) => {
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  const body = ctx.body as { id?: number; name: string; status: string; free_times: number; prizes: Array<{ name: string; prize_type: string; probability: number; total_quantity: number; status: string; reward?: unknown }> }
  if (!body.prizes || body.prizes.length === 0) return fail('请至少配置一个奖项')
  const nonEmpty = body.prizes.filter((p) => p.prize_type !== 'empty')
  const totalProb = nonEmpty.reduce((sum, p) => sum + Number(p.probability || 0), 0)
  if (totalProb > 100.0001) {
    return fail(`中奖概率总和不得超过 100%，当前合计 ${totalProb.toFixed(4)}%`)
  }
  const hasEmpty = body.prizes.some((p) => p.prize_type === 'empty')
  if (!hasEmpty && totalProb < 100) {
    return fail('请配置「空奖」以承接剩余概率')
  }
  if (body.id) {
    const idx = lotteryActivities.findIndex((x) => x.id === body.id)
    if (idx > -1) Object.assign(lotteryActivities[idx], body)
    writeAudit(ctx, '营销活动', '保存抽奖活动', body.name, '奖项池配置')
    return ok(lotteryActivities[idx])
  }
  const item = { id: nextId(), name: body.name, status: body.status, free_times: body.free_times || 0, consume_collectible: false, consume_collectible_ids: [], prizes: body.prizes.map((p, i) => ({ id: i + 1, ...p })), created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') }
  lotteryActivities.push(item as unknown as (typeof lotteryActivities)[number])
  writeAudit(ctx, '营销活动', '创建抽奖活动', body.name, '奖项池配置')
  return ok(item)
})

registerMock('get', '/marketing/lottery-activities/:id/records', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const list = lotteryRecords.filter((r) => r.activity_id === Number(ctx.params.id))
  const paged = paginate(list, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('get', '/marketing/blindboxes', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const paged = paginate(blindBoxes, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('post', '/marketing/blindboxes', (ctx) => {
  const body = ctx.body as { id?: number; name: string; price: string; total_supply: number; prizes: unknown[]; status: string }
  if (body.id) {
    const idx = blindBoxes.findIndex((b) => b.id === body.id)
    if (idx > -1) Object.assign(blindBoxes[idx], body)
  } else {
    blindBoxes.unshift({ id: nextId(), name: body.name, image: '', price: body.price, total_supply: Number(body.total_supply), sold_count: 0, status: body.status as 'active' | 'disabled', prizes: body.prizes as Array<{ collectible_id: number; collectible_name: string; probability: number; quantity: number }>, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') })
  }
  writeAudit(ctx, '营销活动', '保存盲盒', body.name, '盲盒配置')
  return ok(null)
})

registerMock('get', '/marketing/blindboxes/:id/opens', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const rows = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, user_id: i + 1, nickname: '用户', collectible_name: '藏品', serial_no: '10001', created_at: dayjs().subtract(i, 'hour').format('YYYY-MM-DD HH:mm:ss') }))
  const paged = paginate(rows, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('get', '/marketing/compose-rules', () => ok(composeRules))
registerMock('post', '/marketing/compose-rules', (ctx) => {
  const body = ctx.body as { id?: number; name: string; materials: unknown[]; output_collectible_id: number; output_quantity: number; status: string }
  if (body.id) {
    const idx = composeRules.findIndex((c) => c.id === body.id)
    if (idx > -1) Object.assign(composeRules[idx], body)
  } else {
    composeRules.push({ id: nextId(), name: body.name, materials: body.materials as Array<{ collectible_id: number; collectible_name: string; quantity: number }>, output_collectible_id: Number(body.output_collectible_id), output_collectible_name: collectibles.find((c) => c.id === Number(body.output_collectible_id))?.name || '', output_quantity: Number(body.output_quantity || 1), status: body.status as 'active' | 'disabled', created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') })
  }
  writeAudit(ctx, '营销活动', '保存合成规则', body.name, '合成配置')
  return ok(null)
})

registerMock('get', '/marketing/airdrops', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const paged = paginate(activityAirdrops, page, page_size)
  return ok({ ...paged, page, page_size })
})

registerMock('post', '/marketing/airdrops', (ctx) => {
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  const body = ctx.body as { activity_name: string; collectible_id: number; quantity: number; phones: string[] }
  const cb = collectibles.find((c) => c.id === Number(body.collectible_id))
  if (!cb) return fail('藏品不存在')
  const quota = cb.quotas.find((q) => q.type === 'activity_airdrop' && q.status === 'active')
  const available = quota ? quota.total - quota.used : 0
  if (available < Number(body.quantity)) {
    return fail(`活动奖励配额预留不足，当前剩余 ${Math.max(0, available)} 份`)
  }
  for (const phone of body.phones) {
    if (!isValidPhone(phone) || !users.some((u) => u.phone === phone)) return fail(`手机号 ${phone} 未注册或格式错误`)
  }
  if (quota) quota.used += Number(body.quantity)
  activityAirdrops.unshift({ id: nextId(), activity_name: body.activity_name, collectible_id: cb.id, collectible_name: cb.name, quantity: Number(body.quantity), target_users: body.phones.length, success_count: body.phones.length, fail_count: 0, operator: currentAdmin(ctx).nickname, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') })
  writeAudit(ctx, '营销活动', '活动空投', `${body.activity_name}`, `空投${body.quantity}份`)
  return ok({ task_no: `AIR${dayjs().format('YYYYMMDDHHmmss')}`, success_count: body.phones.length, fail_count: 0 })
})

registerMock('get', '/marketing/register-rewards', () => ok(registerRewards))

registerMock('post', '/marketing/register-rewards', (ctx) => {
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  const body = ctx.body as { rewards: unknown[] }
  registerRewards.splice(0, registerRewards.length, ...(body.rewards as Array<{ reward_type: string; collectible_id?: number; collectible_name?: string; quantity?: number }>))
  writeAudit(ctx, '营销活动', '保存注册福利', '注册福利', '奖励配置')
  return ok(null)
})

registerMock('get', '/marketing/reward-records', (ctx) => {
  const { page, page_size } = getPageQuery(ctx)
  const keyword = qs(ctx, 'keyword')
  let list = rewardRecords
  if (keyword) list = list.filter((r) => r.phone.includes(keyword) || r.nickname.includes(keyword))
  const paged = paginate(list, page, page_size)
  return ok({ ...paged, page, page_size })
})

// ---------- 系统配置 ----------
const siteConfig = {
  site_name: '数和文创',
  site_logo: '',
  site_description: '数字藏品一站式平台',
  icp: '京ICP备00000000号',
  customer_service_phone: '400-000-0000',
  recharge_min: '10.00',
  recharge_max: '5000.00',
  register_enabled: true,
  login_enabled: true
}

registerMock('get', '/system/site', () => ok(siteConfig))
registerMock('post', '/system/site', (ctx) => {
  Object.assign(siteConfig, ctx.body)
  return ok(null)
})

const paymentChannels = [
  { id: 1, name: '微信支付', channel: 'wechat', enabled: true, fee_rate: '0.60', config: { mch_id: 'xxxx' }, updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss') },
  { id: 2, name: '支付宝', channel: 'alipay', enabled: true, fee_rate: '0.60', config: { app_id: 'xxxx' }, updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss') },
  { id: 3, name: '余额支付', channel: 'balance', enabled: true, fee_rate: '0.00', config: {}, updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss') }
]

registerMock('get', '/system/payment-channels', () => ok(paymentChannels))
registerMock('post', '/system/payment-channels', (ctx) => {
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  const body = ctx.body as { id: number; name: string; enabled: boolean; fee_rate: string; config: Record<string, string> }
  const ch = paymentChannels.find((c) => c.id === body.id)
  if (ch) {
    ch.enabled = Boolean(body.enabled)
    ch.fee_rate = body.fee_rate
    ch.config = body.config
    ch.updated_at = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  writeAudit(ctx, '系统配置', '修改支付渠道', body.name, '支付渠道配置')
  return ok(null)
})

const thirdParty = {
  oss: { access_key: 'LTAIxxxx', bucket: 'shuhe-media', endpoint: 'oss-cn-beijing.aliyuncs.com' },
  sms: { provider: '阿里云短信', sign_name: '数和文创', enabled: true },
  map: { provider: '高德地图', key: 'xxxx' },
  payment: { provider: '支付宝', merchant_id: '2088xxxx' }
}

registerMock('get', '/system/third-party', () => ok(thirdParty))
registerMock('post', '/system/third-party', (ctx) => {
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  Object.assign(thirdParty, ctx.body)
  writeAudit(ctx, '系统配置', '修改第三方接口配置', '第三方接口', '接口配置')
  return ok(null)
})

const agreements: Record<string, string> = {
  user: '<h3>用户服务协议</h3><p>欢迎使用数和文创数字藏品平台……</p>',
  privacy: '<h3>隐私政策</h3><p>我们非常重视您的隐私……</p>',
  sale: '<h3>发售规则</h3><p>发售规则说明……</p>'
}

registerMock('get', '/system/agreements', () => ok(agreements))
registerMock('post', '/system/agreements', (ctx) => {
  if (!verifyPassword(ctx)) return fail('管理员密码验证失败', 403)
  const body = ctx.body as { key: string; content: string }
  agreements[body.key] = body.content
  writeAudit(ctx, '系统配置', '修改协议', body.key, '协议内容更新')
  return ok(null)
})

// 导出接口（mock：返回空文件）
registerMock('get', '/export/collectibles', () => ok(null))
registerMock('get', '/export/orders', () => ok(null))

export { currentAdmin, verifyPassword, writeAudit }
