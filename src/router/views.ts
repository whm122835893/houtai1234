import type { Component } from 'vue'

// 视图组件注册表：后端菜单 path -> 前端组件
// 新增页面时在此处登记即可实现动态路由加载
export const viewModules: Record<string, () => Promise<{ default: Component }>> = {
  '/dashboard': () => import('@/views/dashboard/index.vue'),

  // 用户
  '/user/list': () => import('@/views/user/list.vue'),
  '/user/detail': () => import('@/views/user/detail.vue'),
  '/realname/list': () => import('@/views/realname/list.vue'),

  // 藏品
  '/collectible/list': () => import('@/views/collectible/list.vue'),
  '/collectible/create': () => import('@/views/collectible/create.vue'),
  '/collectible/sale': () => import('@/views/collectible/sale.vue'),
  '/collectible/quota': () => import('@/views/collectible/quota.vue'),
  '/collectible/airdrop': () => import('@/views/collectible/airdrop.vue'),
  '/collectible/records': () => import('@/views/collectible/records.vue'),

  // 订单
  '/order/list': () => import('@/views/order/list.vue'),

  // 市场寄售
  '/market/onsale': () => import('@/views/market/onsale.vue'),
  '/market/deal': () => import('@/views/market/deal.vue'),
  '/market/commission': () => import('@/views/market/commission.vue'),

  // 转赠
  '/transfer/records': () => import('@/views/transfer/records.vue'),
  '/transfer/switch': () => import('@/views/transfer/switch.vue'),

  // 营销活动
  '/marketing/priority': () => import('@/views/marketing/priority.vue'),
  '/marketing/signin': () => import('@/views/marketing/signin.vue'),
  '/marketing/invite': () => import('@/views/marketing/invite.vue'),
  '/marketing/lottery': () => import('@/views/marketing/lottery.vue'),
  '/marketing/blindbox': () => import('@/views/marketing/blindbox.vue'),
  '/marketing/compose': () => import('@/views/marketing/compose.vue'),
  '/marketing/airdrop': () => import('@/views/marketing/airdrop.vue'),
  '/marketing/register': () => import('@/views/marketing/register.vue'),

  // 钱包财务
  '/wallet/recharge': () => import('@/views/wallet/recharge.vue'),
  '/wallet/flow': () => import('@/views/wallet/flow.vue'),
  '/wallet/fee': () => import('@/views/wallet/fee.vue'),
  '/wallet/audit': () => import('@/views/wallet/audit.vue'),

  // CMS
  '/cms/banner': () => import('@/views/cms/banner.vue'),
  '/cms/notice': () => import('@/views/cms/notice.vue'),
  '/cms/help': () => import('@/views/cms/help.vue'),
  '/cms/article': () => import('@/views/cms/article.vue'),

  // 系统配置
  '/system/site': () => import('@/views/system/site.vue'),
  '/system/payment': () => import('@/views/system/payment.vue'),
  '/system/api': () => import('@/views/system/api.vue'),
  '/system/agreement': () => import('@/views/system/agreement.vue'),

  // 权限审计
  '/permission/admin': () => import('@/views/permission/admin.vue'),
  '/permission/role': () => import('@/views/permission/role.vue'),
  '/permission/audit': () => import('@/views/permission/audit.vue'),

  // 风控安全
  '/security/blacklist': () => import('@/views/security/blacklist.vue'),
  '/security/audit-approval': () => import('@/views/security/audit-approval.vue'),
  '/security/alarm': () => import('@/views/security/alarm.vue'),

  // 客服工单
  '/ticket/list': () => import('@/views/ticket/list.vue'),

  // 数据报表
  '/report/sales': () => import('@/views/report/sales.vue'),
  '/report/user': () => import('@/views/report/user.vue'),
  '/report/collectible': () => import('@/views/report/collectible.vue'),
  '/report/finance': () => import('@/views/report/finance.vue'),

  // 平台运维
  '/platform/clear': () => import('@/views/platform/clear.vue')
}

export function pathToName(path: string): string {
  const cleaned = path.replace(/^\//, '')
  if (!cleaned) return 'Index'
  return cleaned
    .split('/')
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join('')
}

export function getViewComponent(path: string): (() => Promise<{ default: Component }>) | undefined {
  return viewModules[path]
}
