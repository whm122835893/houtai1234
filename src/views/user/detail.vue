<template>
  <div class="app-page" v-loading="loading">
    <div class="app-card mb-16">
      <div class="flex-between">
        <div class="user-head">
          <el-avatar :size="56" class="head-avatar">{{ detail?.nickname.charAt(0) }}</el-avatar>
          <div>
            <div class="head-name">
              {{ detail?.nickname }}
              <el-tag v-if="detail?.status === 0" type="danger" size="small">已冻结</el-tag>
              <el-tag v-if="detail?.is_black === 1" type="warning" size="small" effect="dark">黑名单</el-tag>
            </div>
            <div class="head-phone">手机号：{{ maskPhone(detail?.phone) }}</div>
          </div>
        </div>
        <el-button @click="router.back()">返回列表</el-button>
      </div>
    </div>

    <div class="app-card">
      <el-tabs v-model="activeTab">
        <!-- 基础信息 -->
        <el-tab-pane label="基础信息" name="base">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户ID">{{ detail?.id }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ detail?.nickname }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ maskPhone(detail?.phone) }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ formatDate(detail?.created_at) }}</el-descriptions-item>
            <el-descriptions-item label="最近登录">{{ formatDate(detail?.last_login_at) }}</el-descriptions-item>
            <el-descriptions-item label="实名状态">
              <el-tag :type="realnameTag" size="small">{{ realnameText }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="持有藏品数">{{ detail?.collectibles.length }}</el-descriptions-item>
            <el-descriptions-item label="优先购资格数">{{ detail?.priority_quotas.length }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 钱包资产 -->
        <el-tab-pane label="钱包资产" name="wallet">
          <el-row :gutter="16">
            <el-col :xs="12" :md="6" v-for="w in walletItems" :key="w.label">
              <div class="wallet-item">
                <div class="w-label">{{ w.label }}</div>
                <div class="w-value">¥{{ w.value }}</div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 用户仓库 -->
        <el-tab-pane label="用户仓库" name="warehouse">
          <div class="table-toolbar">
            <span class="text-muted">共 {{ detail?.collectibles.length }} 件藏品</span>
            <el-alert
              type="warning"
              :closable="false"
              show-icon
              title="强制回收前将校验藏品是否发生二次流转，已流转藏品无法回收"
            />
          </div>
          <el-table :data="detail?.collectibles" border>
            <el-table-column prop="id" label="实例ID" width="90" />
            <el-table-column prop="collectible_name" label="藏品名称" min-width="200" />
            <el-table-column prop="serial_no" label="编号" width="120" />
            <el-table-column label="状态" width="110">
              <template #default="{ row }">
                <el-tag :type="assetTag(row.status)" size="small">{{ assetText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="获取时间" width="160">
              <template #default="{ row }">{{ formatDate(row.obtained_at) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="110" fixed="right">
              <template #default="{ row }">
                <el-button v-if="row.status === 'holding'" v-permission="['collectible:recover']" type="danger" link @click="recover(row)">
                  强制回收
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 优先购资格台账 -->
        <el-tab-pane label="优先购资格台账" name="priority">
          <el-table :data="detail?.priority_quotas" border>
            <el-table-column prop="activity_name" label="活动名称" min-width="200" />
            <el-table-column prop="total_times" label="总次数" width="100" />
            <el-table-column prop="used_times" label="已用次数" width="100" />
            <el-table-column label="剩余" width="100">
              <template #default="{ row }">{{ row.total_times - row.used_times }}</template>
            </el-table-column>
            <el-table-column label="有效期至" width="180">
              <template #default="{ row }">{{ formatDate(row.valid_until) }}</template>
            </el-table-column>
            <el-table-column label="状态" width="110">
              <template #default="{ row }">
                <el-tag :type="quotaTag(row.status)" size="small">{{ quotaText(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 邀请关系链 -->
        <el-tab-pane label="邀请关系链" name="invite">
          <el-descriptions :column="1" border class="mb-16">
            <el-descriptions-item label="上级邀请人">
              <template v-if="detail?.invite_parent">
                {{ detail.invite_parent.nickname }}（{{ maskPhone(detail.invite_parent.phone) }}）
              </template>
              <span v-else class="text-muted">无上级邀请人</span>
            </el-descriptions-item>
          </el-descriptions>
          <div class="text-muted mb-16">直接邀请（{{ detail?.invite_children.length }} 人）</div>
          <el-table :data="detail?.invite_children" border>
            <el-table-column prop="nickname" label="昵称" min-width="140" />
            <el-table-column label="手机号" min-width="140">
              <template #default="{ row }">{{ maskPhone(row.phone) }}</template>
            </el-table-column>
            <el-table-column label="注册时间" min-width="180">
              <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 实名审核 -->
        <el-tab-pane label="实名审核" name="realname">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="实名状态">
              <el-tag :type="realnameTag" size="small">{{ realnameText }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="姓名">{{ detail?.realname.name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="身份证号">
              <template v-if="detail?.realname.id_card">
                <MaskText :text="detail.realname.id_card" :mask="maskIdCard(detail.realname.id_card)" />
              </template>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="说明">
              <span class="text-muted">实名认证管理为只读模块，完整信息查看需二次密码验证</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 强制回收 -->
    <RiskConfirm
      ref="recoverRef"
      title="强制回收藏品"
      description="回收后藏品将从用户仓库移除并归还至库存池，流通量 -1"
      :need-reason="true"
      :need-password="true"
      :submit="onRecover"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import RiskConfirm, { type RiskConfirmPayload } from '@/components/RiskConfirm.vue'
import MaskText from '@/components/MaskText.vue'
import { getUserDetail, forceRecover, type UserDetail, type UserCollectible } from '@/api/user'
import { formatDate } from '@/utils/date'
import { maskPhone, maskIdCard } from '@/utils/mask'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const activeTab = ref('base')
const detail = ref<UserDetail | null>(null)
const recoverRef = ref<InstanceType<typeof RiskConfirm>>()

let currentAsset: UserCollectible | null = null

onMounted(async () => {
  const id = Number(route.query.id)
  if (!id) {
    ElMessage.error('缺少用户ID')
    return
  }
  loading.value = true
  try {
    detail.value = await getUserDetail(id)
  } finally {
    loading.value = false
  }
})

const realnameText = computed(() => {
  const s = detail.value?.realname.status
  if (s === 'verified') return '已认证'
  if (s === 'pending') return '审核中'
  return '未认证'
})

const realnameTag = computed(() => {
  const s = detail.value?.realname.status
  if (s === 'verified') return 'success'
  if (s === 'pending') return 'warning'
  return 'info'
})

const walletItems = computed(() => {
  const w = detail.value?.wallet
  return [
    { label: '账户余额', value: w?.balance ?? '0.00' },
    { label: '冻结余额', value: w?.frozen_balance ?? '0.00' },
    { label: '累计充值', value: w?.total_recharge ?? '0.00' },
    { label: '累计提现', value: w?.total_withdraw ?? '0.00' }
  ]
})

function assetText(status: string): string {
  const map: Record<string, string> = { holding: '持有中', on_sale: '寄售中', transferred: '已转赠', composed: '已合成消耗', destroyed: '已销毁' }
  return map[status] || status
}

function assetTag(status: string): 'primary' | 'warning' | 'info' | 'success' | 'danger' {
  const map: Record<string, 'primary' | 'warning' | 'info' | 'success' | 'danger'> = { holding: 'success', on_sale: 'warning', transferred: 'info', composed: 'info', destroyed: 'danger' }
  return map[status] || 'info'
}

function quotaText(status: string): string {
  const map: Record<string, string> = { valid: '有效', expired: '已过期', used_up: '已用完' }
  return map[status] || status
}

function quotaTag(status: string): 'success' | 'info' | 'warning' {
  const map: Record<string, 'success' | 'info' | 'warning'> = { valid: 'success', expired: 'info', used_up: 'warning' }
  return map[status] || 'info'
}

function recover(row: UserCollectible): void {
  currentAsset = row
  recoverRef.value?.open()
}

async function onRecover(payload: RiskConfirmPayload): Promise<void> {
  if (!detail.value || !currentAsset) return
  await forceRecover(detail.value.id, currentAsset.collectible_id, payload.reason, payload.password)
  ElMessage.success('已强制回收，藏品归还至库存池')
  detail.value = await getUserDetail(detail.value.id)
}
</script>

<style lang="scss" scoped>
.user-head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.head-avatar {
  background: linear-gradient(135deg, #409eff, #7c3aed);
  color: #fff;
  font-size: 22px;
}

.head-name {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.head-phone {
  margin-top: 4px;
  color: $text-secondary;
  font-size: 13px;
}

.wallet-item {
  background: $bg-page;
  border-radius: 8px;
  padding: 18px 16px;

  .w-label {
    font-size: 12px;
    color: $text-secondary;
  }

  .w-value {
    font-size: 22px;
    font-weight: 700;
    margin-top: 8px;
    color: $text-primary;
  }
}
</style>
