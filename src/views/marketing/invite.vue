<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">邀请活动</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="支持注册奖励、邀请人奖励及 1-3-6-9 阶梯奖励。奖励类型统一为：藏品 / 优先购白名单资格 / 资格购资格 / 抽奖次数。"
      />
      <el-table :data="activities" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="活动名称" min-width="160" />
        <el-table-column label="注册奖励" min-width="160">
          <template #default="{ row }">{{ row.register_reward ? rewardText(row.register_reward) : '-' }}</template>
        </el-table-column>
        <el-table-column label="邀请人奖励" min-width="160">
          <template #default="{ row }">{{ row.invite_reward ? rewardText(row.invite_reward) : '-' }}</template>
        </el-table-column>
        <el-table-column label="阶梯奖励" min-width="280">
          <template #default="{ row }">
            <div class="rules">
              <el-tag v-for="t in row.tier_rewards" :key="t.tier" size="small" effect="plain" class="rule-tag">
                邀请{{ t.tier }}人：{{ rewardText(t.reward) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">{{ row.status === 'active' ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">配置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑邀请活动 -->
    <el-dialog v-model="dialogVisible" :title="`配置邀请活动`" :width="appStore.mobile ? '100%' : '760px'" append-to-body>
      <el-form label-width="100px">
        <el-form-item label="活动名称" required>
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="活动状态">
          <el-radio-group v-model="editForm.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="注册奖励">
          <div style="width: 100%">
            <RewardConfigPanel v-model="editForm.register_reward" />
          </div>
        </el-form-item>
        <el-form-item label="邀请人奖励">
          <div style="width: 100%">
            <RewardConfigPanel v-model="editForm.invite_reward" />
          </div>
        </el-form-item>
        <el-form-item label="阶梯奖励">
          <div style="width: 100%">
            <div v-for="(tier, idx) in editForm.tier_rewards" :key="idx" class="day-rule">
              <div class="day-head">
                <span>邀请 {{ tier.tier }} 人奖励</span>
                <el-button type="danger" link @click="editForm.tier_rewards.splice(idx, 1)">移除</el-button>
              </div>
              <RewardConfigPanel v-model="tier.reward" />
            </div>
            <el-button @click="addTier">
              <el-icon style="margin-right: 4px"><Plus /></el-icon>
              添加阶梯奖励
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import RewardConfigPanel from '@/components/RewardConfigPanel.vue'
import { getInviteActivities, saveInviteActivity, type InviteActivity } from '@/api/marketing'
import type { RewardConfig } from '@/types'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const activities = ref<InviteActivity[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)

const editForm = reactive<{
  id: number
  name: string
  status: 'active' | 'disabled'
  register_reward: RewardConfig
  invite_reward: RewardConfig
  tier_rewards: Array<{ tier: number; reward: RewardConfig }>
}>({
  id: 0,
  name: '',
  status: 'active',
  register_reward: { reward_type: 'collectible' },
  invite_reward: { reward_type: 'lottery_times', lottery_times: 1 },
  tier_rewards: []
})

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    activities.value = await getInviteActivities()
  } finally {
    loading.value = false
  }
}

function rewardText(reward: RewardConfig): string {
  switch (reward.reward_type) {
    case 'collectible':
      return `藏品 ${reward.collectible_name || ''} ×${reward.quantity}`
    case 'priority':
      return `优先购资格 ×${reward.priority_count}`
    case 'qualification':
      return `资格购资格 ×${reward.qualification_count}`
    case 'lottery_times':
      return `抽奖次数 ×${reward.lottery_times}`
    default:
      return '-'
  }
}

function openEdit(row: InviteActivity): void {
  Object.assign(editForm, {
    id: row.id,
    name: row.name,
    status: row.status,
    register_reward: JSON.parse(JSON.stringify(row.register_reward || { reward_type: 'collectible' })),
    invite_reward: JSON.parse(JSON.stringify(row.invite_reward || { reward_type: 'lottery_times', lottery_times: 1 })),
    tier_rewards: JSON.parse(JSON.stringify(row.tier_rewards || []))
  })
  dialogVisible.value = true
}

function addTier(): void {
  const maxTier = editForm.tier_rewards.reduce((max, t) => Math.max(max, t.tier), 0)
  editForm.tier_rewards.push({ tier: maxTier + 1, reward: { reward_type: 'collectible' } })
}

async function save(): Promise<void> {
  saving.value = true
  try {
    await saveInviteActivity({ ...editForm })
    ElMessage.success('邀请活动已保存')
    dialogVisible.value = false
    await load()
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.rules {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rule-tag {
  font-size: 12px;
}

.day-rule {
  border: 1px solid $border-color;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;

  .day-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
    margin-bottom: 8px;
  }
}
</style>
