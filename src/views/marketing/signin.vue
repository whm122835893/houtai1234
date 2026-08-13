<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">签到活动</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="支持 1-7 天阶梯奖励，每个签到日可配置独立奖励。奖励类型统一为：藏品 / 优先购白名单资格 / 资格购资格 / 抽奖次数。"
      />
      <el-table :data="activities" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="活动名称" min-width="180" />
        <el-table-column label="奖励阶梯" min-width="320">
          <template #default="{ row }">
            <div class="rules">
              <el-tag v-for="rule in row.reward_rules" :key="rule.day" size="small" effect="plain" class="rule-tag">
                第{{ rule.day }}天：{{ rewardText(rule.reward) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">配置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑签到活动 -->
    <el-dialog v-model="dialogVisible" :title="`配置签到活动`" :width="appStore.mobile ? '100%' : '720px'" append-to-body>
      <el-form label-width="90px" v-loading="dialogLoading">
        <el-form-item label="活动名称" required>
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="活动状态">
          <el-radio-group v-model="editForm.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="奖励阶梯">
          <div style="width: 100%">
            <div v-for="(rule, idx) in editForm.reward_rules" :key="idx" class="day-rule">
              <div class="day-head">
                <span>第 {{ rule.day }} 天奖励</span>
                <el-button type="danger" link @click="editForm.reward_rules.splice(idx, 1)">移除</el-button>
              </div>
              <RewardConfigPanel v-model="rule.reward" />
            </div>
            <el-button @click="addDay">
              <el-icon style="margin-right: 4px"><Plus /></el-icon>
              添加签到日奖励
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
import { getSigninActivities, saveSigninActivity, type SigninActivity } from '@/api/marketing'
import type { RewardConfig } from '@/types'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const activities = ref<SigninActivity[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const dialogLoading = ref(false)

const editForm = reactive<{ id: number; name: string; status: 'active' | 'disabled'; reward_rules: Array<{ day: number; reward: RewardConfig }> }>({
  id: 0,
  name: '',
  status: 'active',
  reward_rules: []
})

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    activities.value = await getSigninActivities()
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
      return `资格购资格（${reward.qualification_collectible_name || ''}）×${reward.qualification_count}`
    case 'lottery_times':
      return `抽奖次数 ×${reward.lottery_times}`
    default:
      return '-'
  }
}

function openEdit(row: SigninActivity): void {
  Object.assign(editForm, {
    id: row.id,
    name: row.name,
    status: row.status,
    reward_rules: JSON.parse(JSON.stringify(row.reward_rules))
  })
  dialogVisible.value = true
}

function addDay(): void {
  const maxDay = editForm.reward_rules.reduce((max, r) => Math.max(max, r.day), 0)
  editForm.reward_rules.push({ day: maxDay + 1, reward: { reward_type: 'collectible' } })
}

async function save(): Promise<void> {
  saving.value = true
  try {
    await saveSigninActivity({ ...editForm })
    ElMessage.success('签到活动已保存')
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
