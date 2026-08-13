import http from '@/utils/request'
import type { PageResult, RewardType, RewardConfig } from '@/types'

export type { RewardConfig } from '@/types'

export interface PriorityActivity {
  id: number
  name: string
  collectible_id: number
  collectible_name: string
  start_at: string
  end_at: string
  total_quota: number
  issued_count: number
  status: 'not_started' | 'active' | 'ended'
  created_at: string
}

export interface PriorityWhitelistItem {
  id: number
  activity_id: number
  user_id: number
  nickname: string
  phone: string
  times: number
  used_times: number
  valid_until: string
  status: 'valid' | 'expired' | 'used_up'
  created_at: string
}

export function getPriorityActivityList(params: Record<string, unknown>): Promise<PageResult<PriorityActivity>> {
  return http.get<PageResult<PriorityActivity>>('/marketing/priority-activities', params)
}

export function createPriorityActivity(data: Partial<PriorityActivity>): Promise<PriorityActivity> {
  return http.post<PriorityActivity>('/marketing/priority-activities', data)
}

export function getPriorityWhitelist(activityId: number, params: Record<string, unknown>): Promise<PageResult<PriorityWhitelistItem>> {
  return http.get<PageResult<PriorityWhitelistItem>>(`/marketing/priority-activities/${activityId}/whitelist`, params)
}

export function addPriorityWhitelist(activityId: number, phones: string[], times: number, validUntil: string): Promise<null> {
  return http.post<null>(`/marketing/priority-activities/${activityId}/whitelist`, { phones, times, valid_until: validUntil })
}

export function deletePriorityWhitelist(id: number): Promise<null> {
  return http.delete<null>(`/marketing/whitelist/${id}`)
}

// 批量清理过期资格
export function cleanExpiredPriority(activityId: number, password: string): Promise<{ cleared: number }> {
  return http.post<{ cleared: number }>(`/marketing/priority-activities/${activityId}/clean-expired`, { password })
}

// ---------- 签到活动 ----------
export interface SigninActivity {
  id: number
  name: string
  status: 'active' | 'disabled'
  reward_rules: Array<{ day: number; reward: RewardConfig }>
  created_at: string
}

export function getSigninActivities(): Promise<SigninActivity[]> {
  return http.get<SigninActivity[]>('/marketing/signin-activities')
}

export function saveSigninActivity(data: Partial<SigninActivity>): Promise<SigninActivity> {
  return http.post<SigninActivity>('/marketing/signin-activities', data)
}

// ---------- 邀请活动 ----------
export interface InviteActivity {
  id: number
  name: string
  status: 'active' | 'disabled'
  register_reward: RewardConfig | null
  invite_reward: RewardConfig | null
  tier_rewards: Array<{ tier: number; reward: RewardConfig }>
  created_at: string
}

export function getInviteActivities(): Promise<InviteActivity[]> {
  return http.get<InviteActivity[]>('/marketing/invite-activities')
}

export function saveInviteActivity(data: Partial<InviteActivity>): Promise<InviteActivity> {
  return http.post<InviteActivity>('/marketing/invite-activities', data)
}

// ---------- 抽奖活动 ----------
export type LotteryPrizeType = RewardType | 'empty'

export interface LotteryPrize {
  id: number
  name: string
  prize_type: LotteryPrizeType
  reward?: RewardConfig
  probability: number // 0.0001 ~ 100，小数点后4位
  total_quantity: number // 计划上限
  status: 'enabled' | 'disabled'
}

export interface LotteryActivity {
  id: number
  name: string
  status: 'draft' | 'active' | 'ended'
  free_times: number
  consume_collectible: boolean
  consume_collectible_ids: number[]
  prizes: LotteryPrize[]
  created_at: string
}

export interface LotteryRecord {
  id: number
  activity_id: number
  user_id: number
  nickname: string
  phone: string
  result: string
  prize_name: string
  status: 'delivered' | 'pending' | 'failed'
  created_at: string
}

export function getLotteryActivityList(params: Record<string, unknown>): Promise<PageResult<LotteryActivity>> {
  return http.get<PageResult<LotteryActivity>>('/marketing/lottery-activities', params)
}

export function getLotteryDetail(id: number): Promise<LotteryActivity> {
  return http.get<LotteryActivity>(`/marketing/lottery-activities/${id}`)
}

export function saveLotteryActivity(data: Partial<LotteryActivity>, password: string): Promise<LotteryActivity> {
  return http.post<LotteryActivity>('/marketing/lottery-activities', { ...data, password })
}

export function getLotteryRecords(activityId: number, params: Record<string, unknown>): Promise<PageResult<LotteryRecord>> {
  return http.get<PageResult<LotteryRecord>>(`/marketing/lottery-activities/${activityId}/records`, params)
}

// ---------- 盲盒 ----------
export interface BlindBox {
  id: number
  name: string
  image: string
  price: string
  total_supply: number
  sold_count: number
  status: 'active' | 'disabled'
  prizes: Array<{ collectible_id: number; collectible_name: string; probability: number; quantity: number }>
  created_at: string
}

export function getBlindBoxList(params: Record<string, unknown>): Promise<PageResult<BlindBox>> {
  return http.get<PageResult<BlindBox>>('/marketing/blindboxes', params)
}

export function saveBlindBox(data: Partial<BlindBox>): Promise<BlindBox> {
  return http.post<BlindBox>('/marketing/blindboxes', data)
}

export function getBlindBoxOpenRecords(boxId: number, params: Record<string, unknown>): Promise<PageResult<Record<string, unknown>>> {
  return http.get<PageResult<Record<string, unknown>>>(`/marketing/blindboxes/${boxId}/opens`, params)
}

// ---------- 合成 ----------
export interface ComposeRule {
  id: number
  name: string
  materials: Array<{ collectible_id: number; collectible_name: string; quantity: number }>
  output_collectible_id: number
  output_collectible_name: string
  output_quantity: number
  status: 'active' | 'disabled'
  created_at: string
}

export function getComposeList(): Promise<ComposeRule[]> {
  return http.get<ComposeRule[]>('/marketing/compose-rules')
}

export function saveComposeRule(data: Partial<ComposeRule>): Promise<ComposeRule> {
  return http.post<ComposeRule>('/marketing/compose-rules', data)
}

// ---------- 活动空投 ----------
export interface ActivityAirdrop {
  id: number
  activity_name: string
  collectible_id: number
  collectible_name: string
  quantity: number
  target_users: number
  success_count: number
  fail_count: number
  operator: string
  created_at: string
}

export function getActivityAirdropList(params: Record<string, unknown>): Promise<PageResult<ActivityAirdrop>> {
  return http.get<PageResult<ActivityAirdrop>>('/marketing/airdrops', params)
}

export function runActivityAirdrop(data: {
  activity_name: string
  collectible_id: number
  quantity: number
  phones: string[]
  password: string
}): Promise<{ task_no: string; success_count: number; fail_count: number }> {
  return http.post<{ task_no: string; success_count: number; fail_count: number }>('/marketing/airdrops', data)
}

// ---------- 注册福利 ----------
export function getRegisterRewards(): Promise<RewardConfig[]> {
  return http.get<RewardConfig[]>('/marketing/register-rewards')
}

export function saveRegisterRewards(data: RewardConfig[], password: string): Promise<null> {
  return http.post<null>('/marketing/register-rewards', { rewards: data, password })
}

// 发放记录台账
export function getRewardRecords(params: Record<string, unknown>): Promise<PageResult<Record<string, unknown>>> {
  return http.get<PageResult<Record<string, unknown>>>('/marketing/reward-records', params)
}
