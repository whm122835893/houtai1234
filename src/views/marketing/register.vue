<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">注册福利</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="用户完成注册后自动发放的奖励列表，可配置多条。奖励类型统一为：藏品 / 优先购白名单资格 / 资格购资格 / 抽奖次数；资格购资格需设置有效期。"
      />
      <div class="table-toolbar">
        <el-button type="primary" :loading="saving" @click="save">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          保存注册福利
        </el-button>
      </div>
      <el-table :data="rewards" v-loading="loading" border>
        <el-table-column label="奖励类型" width="150">
          <template #default="{ row }">
            <el-tag type="primary" size="small" effect="light">{{ REWARD_TYPE_TEXT[row.reward_type as RewardType] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="奖励内容" min-width="260">
          <template #default="{ row }">{{ rewardText(row) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="removeReward(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-toolbar mt-16">
        <el-button @click="addReward">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          添加奖励
        </el-button>
      </div>
    </div>

    <!-- 编辑奖励 -->
    <el-dialog v-model="dialogVisible" title="配置注册奖励" :width="appStore.mobile ? '100%' : '620px'" append-to-body destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="奖励配置">
          <div style="width: 100%">
            <RewardConfigPanel v-model="editReward" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import RewardConfigPanel from '@/components/RewardConfigPanel.vue'
import { getRegisterRewards, saveRegisterRewards } from '@/api/marketing'
import { REWARD_TYPE_TEXT, type RewardType, type RewardConfig } from '@/types'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const rewards = ref<RewardConfig[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editReward = ref<RewardConfig>({ reward_type: 'collectible' })
let editIndex = -1

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    rewards.value = await getRegisterRewards()
  } finally {
    loading.value = false
  }
}

function rewardText(row: RewardConfig): string {
  switch (row.reward_type) {
    case 'collectible':
      return `${row.collectible_name || '藏品'} ×${row.quantity}`
    case 'priority':
      return `优先购资格 ×${row.priority_count}`
    case 'qualification':
      return `资格购资格（${row.qualification_collectible_name || ''}）×${row.qualification_count}，有效期至 ${row.valid_until || '-'}`
    case 'lottery_times':
      return `抽奖次数 ×${row.lottery_times}`
    default:
      return '-'
  }
}

function openEdit(row: RewardConfig): void {
  editIndex = rewards.value.indexOf(row)
  editReward.value = JSON.parse(JSON.stringify(row))
  dialogVisible.value = true
}

function confirmEdit(): void {
  rewards.value[editIndex] = { ...editReward.value }
  dialogVisible.value = false
}

function addReward(): void {
  rewards.value.push({ reward_type: 'collectible' })
}

async function removeReward(row: RewardConfig): Promise<void> {
  try {
    await ElMessageBox.confirm('确认删除该注册奖励？', '删除确认', { type: 'warning' })
  } catch {
    return
  }
  rewards.value.splice(rewards.value.indexOf(row), 1)
}

async function save(): Promise<void> {
  const { value: password } = await ElMessageBox.prompt('请输入管理员登录密码', '保存注册福利', {
    inputType: 'password',
    inputPlaceholder: '管理员密码',
    inputValidator: (val: string) => (val ? true : '请输入密码')
  })
  saving.value = true
  try {
    await saveRegisterRewards(rewards.value, password)
    ElMessage.success('注册福利已保存')
  } finally {
    saving.value = false
  }
}
</script>
