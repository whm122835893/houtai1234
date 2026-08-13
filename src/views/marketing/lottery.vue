<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">抽奖活动</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="奖项池支持多个奖项，每个奖项独立配置名称/奖品类型/奖品内容/中奖概率/奖项数量/状态。所有非空奖概率之和必须 ≤ 100%，超出拦截；空奖概率 = 100% - 非空奖概率总和。实际抽奖采用预生成随机数 + 奖品库存实时校验双保险，库存不足自动降级为空奖并记录异常日志，禁止超发。"
      />
      <el-table :data="activities" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="活动名称" min-width="200" show-overflow-tooltip />
        <el-table-column label="免费次数" width="90" align="center">
          <template #default="{ row }">{{ row.free_times }}</template>
        </el-table-column>
        <el-table-column label="奖项数" width="80" align="center">
          <template #default="{ row }">{{ row.prizes.length }}</template>
        </el-table-column>
        <el-table-column label="概率构成" min-width="260">
          <template #default="{ row }">
            <div class="rules">
              <el-tag v-for="p in row.prizes" :key="p.id" size="small" :type="p.prize_type === 'empty' ? 'info' : 'primary'" effect="plain" class="rule-tag">
                {{ p.name }} {{ p.probability }}%
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="activityTag[row.status]" size="small">{{ activityText[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">配置</el-button>
            <el-button type="info" link @click="openRecords(row)">抽奖记录</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-toolbar mt-16">
        <el-button type="primary" @click="openEdit()">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          创建抽奖活动
        </el-button>
      </div>
    </div>

    <!-- 配置抽奖活动 -->
    <el-dialog v-model="dialogVisible" :title="`${editForm.id ? '配置' : '创建'}抽奖活动`" :width="appStore.mobile ? '100%' : '860px'" append-to-body destroy-on-close>
      <el-form label-width="110px">
        <el-form-item label="活动名称" required>
          <el-input v-model="editForm.name" placeholder="如：瑞兽迎春 大转盘抽奖" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :xs="24" :md="8">
            <el-form-item label="活动状态">
              <el-select v-model="editForm.status" style="width: 100%">
                <el-option label="草稿" value="draft" />
                <el-option label="进行中" value="active" />
                <el-option label="已结束" value="ended" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="8">
            <el-form-item label="免费抽奖次数">
              <el-input-number v-model="editForm.free_times" :min="0" :max="99" :precision="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="8">
            <el-form-item label="消耗藏品兑换">
              <el-switch v-model="editForm.consume_collectible" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="editForm.consume_collectible" label="兑换消耗藏品">
          <el-select v-model="editForm.consume_collectible_ids" multiple filterable placeholder="消耗指定藏品兑换抽奖次数" style="width: 100%">
            <el-option v-for="c in collectibles" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">奖项池（概率总和校验）</el-divider>
        <el-table :data="editForm.prizes" border>
          <el-table-column label="奖项名称" min-width="110">
            <template #default="{ row }">{{ row.name || '未命名' }}</template>
          </el-table-column>
          <el-table-column label="奖品类型" width="130">
            <template #default="{ row }">
              <el-tag v-if="row.prize_type === 'empty'" type="info" size="small">空奖</el-tag>
              <el-tag v-else type="primary" size="small" effect="light">{{ REWARD_TYPE_TEXT[row.prize_type as RewardType] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="奖品内容" min-width="180">
            <template #default="{ row }">{{ prizeContent(row) }}</template>
          </el-table-column>
          <el-table-column label="概率(%)" width="90" align="center">
            <template #default="{ row }">{{ row.prize_type === 'empty' ? '剩余' : row.probability }}</template>
          </el-table-column>
          <el-table-column label="计划上限" width="90" align="center">
            <template #default="{ row }">{{ row.total_quantity || '-' }}</template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">{{ row.status === 'enabled' ? '启用' : '停用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openPrize(row)">编辑</el-button>
              <el-button type="danger" link @click="editForm.prizes.splice(editForm.prizes.indexOf(row), 1)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="prob-summary mt-8">
          <el-tag :type="probabilityStatus.type" size="small">
            {{ probabilityStatus.text }}
          </el-tag>
          <span class="text-muted" style="font-size: 12px; margin-left: 8px">空奖概率 = 100% - 非空奖概率总和</span>
        </div>
        <div class="table-toolbar mt-8">
          <el-button @click="addPrize">
            <el-icon style="margin-right: 4px"><Plus /></el-icon>
            添加奖项
          </el-button>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存活动</el-button>
      </template>
    </el-dialog>

    <!-- 奖项编辑 -->
    <el-dialog v-model="prizeVisible" title="配置奖项" :width="appStore.mobile ? '100%' : '560px'" append-to-body destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="奖项名称" required>
          <el-input v-model="prizeForm.name" placeholder="如：特等奖 / 一等奖 / 空奖" />
        </el-form-item>
        <el-form-item label="奖品类型" required>
          <el-select v-model="prizeForm.prize_type" style="width: 100%" @change="onPrizeTypeChange">
            <el-option label="藏品" value="collectible" />
            <el-option label="优先购白名单资格" value="priority" />
            <el-option label="资格购资格" value="qualification" />
            <el-option label="抽奖次数" value="lottery_times" />
            <el-option label="空奖（未中奖）" value="empty" />
          </el-select>
        </el-form-item>
        <template v-if="prizeForm.prize_type !== 'empty'">
          <RewardConfigPanel v-model="prizeForm.reward" />
        </template>
        <el-form-item v-if="prizeForm.prize_type !== 'empty'" label="中奖概率(%)" required>
          <el-input-number v-model="prizeForm.probability" :min="0.0001" :max="100" :precision="4" :step="0.1" controls-position="right" style="width: 100%" />
          <div class="tip">支持 0.0001 ~ 100，小数点后4位</div>
        </el-form-item>
        <el-form-item v-if="prizeForm.prize_type !== 'empty'" label="奖项数量">
          <el-input-number v-model="prizeForm.total_quantity" :min="1" :max="999999" :precision="0" controls-position="right" style="width: 100%" />
          <div class="tip">奖项数量为计划发放上限，实际发放时动态校验奖品配额预留库存，先到先得</div>
        </el-form-item>
        <el-form-item label="奖项状态">
          <el-radio-group v-model="prizeForm.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="prizeVisible = false">取消</el-button>
        <el-button type="primary" @click="savePrize">确定</el-button>
      </template>
    </el-dialog>

    <!-- 抽奖记录 -->
    <el-dialog v-model="recordsVisible" :title="`抽奖记录 · ${recordsActivity?.name}`" :width="appStore.mobile ? '100%' : '860px'" append-to-body>
      <el-table :data="records" v-loading="recordsLoading" border height="420">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nickname" label="用户" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="result" label="结果" width="90">
          <template #default="{ row }">
            <el-tag :type="row.result === '中奖' ? 'success' : 'info'" size="small">{{ row.result }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="prize_name" label="奖项" min-width="110" />
        <el-table-column label="发放状态" width="110">
          <template #default="{ row }">
            <el-tag :type="deliveryTag[row.status]" size="small">{{ deliveryText[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="recordQuery.page"
        v-model:page-size="recordQuery.page_size"
        :total="recordTotal"
        layout="total, prev, pager, next"
        style="justify-content: flex-end; margin-top: 12px"
        @current-change="loadRecords()"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import RewardConfigPanel from '@/components/RewardConfigPanel.vue'
import {
  getLotteryActivityList,
  getLotteryDetail,
  saveLotteryActivity,
  getLotteryRecords,
  type LotteryActivity,
  type LotteryPrize,
  type LotteryRecord
} from '@/api/marketing'
import { getCollectibleList, type CollectibleItem } from '@/api/collectible'
import { REWARD_TYPE_TEXT, type RewardType, type RewardConfig } from '@/types'
import { formatDate } from '@/utils/date'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const activities = ref<LotteryActivity[]>([])
const collectibles = ref<CollectibleItem[]>([])
const loading = ref(false)
const saving = ref(false)

const dialogVisible = ref(false)
const prizeVisible = ref(false)

const emptyPrize = (): LotteryPrize => ({
  id: Date.now(),
  name: '',
  prize_type: 'collectible',
  reward: { reward_type: 'collectible' },
  probability: 1,
  total_quantity: 1,
  status: 'enabled'
})

const editForm = reactive<{
  id: number
  name: string
  status: 'draft' | 'active' | 'ended'
  free_times: number
  consume_collectible: boolean
  consume_collectible_ids: number[]
  prizes: LotteryPrize[]
}>({
  id: 0,
  name: '',
  status: 'draft',
  free_times: 1,
  consume_collectible: false,
  consume_collectible_ids: [],
  prizes: []
})

const prizeForm = reactive<LotteryPrize>(emptyPrize())
let prizeIndex = -1

const recordsVisible = ref(false)
const recordsActivity = ref<LotteryActivity | null>(null)
const records = ref<LotteryRecord[]>([])
const recordsLoading = ref(false)
const recordTotal = ref(0)
const recordQuery = reactive({ page: 1, page_size: 20 })

const activityText: Record<string, string> = { draft: '草稿', active: '进行中', ended: '已结束' }
const activityTag: Record<string, 'info' | 'success' | 'warning'> = { draft: 'info', active: 'success', ended: 'warning' }
const deliveryText: Record<string, string> = { delivered: '已发放', pending: '待领取', failed: '发放失败' }
const deliveryTag: Record<string, 'success' | 'warning' | 'danger'> = { delivered: 'success', pending: 'warning', failed: 'danger' }

const probabilityStatus = computed(() => {
  const nonEmpty = editForm.prizes.filter((p) => p.prize_type !== 'empty' && p.status === 'enabled')
  const sum = nonEmpty.reduce((acc, p) => acc + Number(p.probability || 0), 0)
  if (sum > 100.0001) {
    return { type: 'danger' as const, text: `非空奖概率合计 ${sum.toFixed(4)}%，超过100%，请调整` }
  }
  return { type: 'success' as const, text: `非空奖概率合计 ${sum.toFixed(4)}%，空奖概率 ${Math.max(0, 100 - sum).toFixed(4)}%` }
})

onMounted(async () => {
  loading.value = true
  try {
    const res = await getLotteryActivityList({ page: 1, page_size: 200 })
    activities.value = res.list
    const cb = await getCollectibleList({ page: 1, page_size: 200 })
    collectibles.value = cb.list
  } finally {
    loading.value = false
  }
})

async function openEdit(row?: LotteryActivity): Promise<void> {
  if (row) {
    const detail = await getLotteryDetail(row.id)
    Object.assign(editForm, {
      id: detail.id,
      name: detail.name,
      status: detail.status,
      free_times: detail.free_times,
      consume_collectible: detail.consume_collectible,
      consume_collectible_ids: [...detail.consume_collectible_ids],
      prizes: JSON.parse(JSON.stringify(detail.prizes))
    })
  } else {
    Object.assign(editForm, { id: 0, name: '', status: 'draft', free_times: 1, consume_collectible: false, consume_collectible_ids: [], prizes: [] })
  }
  dialogVisible.value = true
}

function addPrize(): void {
  editForm.prizes.push(emptyPrize())
}

function openPrize(row: LotteryPrize): void {
  prizeIndex = editForm.prizes.indexOf(row)
  Object.assign(prizeForm, JSON.parse(JSON.stringify(row)))
  prizeVisible.value = true
}

function onPrizeTypeChange(): void {
  prizeForm.reward = { reward_type: prizeForm.prize_type as RewardConfig['reward_type'] }
  prizeForm.probability = 1
  prizeForm.total_quantity = 1
}

function prizeContent(row: LotteryPrize): string {
  if (row.prize_type === 'empty') return '未中奖'
  const r = row.reward
  if (!r) return '-'
  switch (r.reward_type) {
    case 'collectible':
      return `${r.collectible_name || '藏品'} ×${r.quantity}`
    case 'priority':
      return `优先购资格 ×${r.priority_count}`
    case 'qualification':
      return `资格购资格（${r.qualification_collectible_name || ''}）×${r.qualification_count}`
    case 'lottery_times':
      return `抽奖次数 ×${r.lottery_times}`
    default:
      return '-'
  }
}

function savePrize(): void {
  if (!prizeForm.name.trim()) {
    ElMessage.warning('请输入奖项名称')
    return
  }
  if (prizeForm.prize_type !== 'empty') {
    const prob = Number(prizeForm.probability)
    if (prob < 0.0001 || prob > 100) {
      ElMessage.warning('中奖概率必须在 0.0001 ~ 100 之间')
      return
    }
  }
  editForm.prizes[prizeIndex] = { ...prizeForm }
  prizeVisible.value = false
}

async function save(): Promise<void> {
  if (!editForm.name.trim()) {
    ElMessage.warning('请输入活动名称')
    return
  }
  if (editForm.prizes.length === 0) {
    ElMessage.warning('请至少配置一个奖项')
    return
  }
  const nonEmpty = editForm.prizes.filter((p) => p.prize_type !== 'empty')
  const totalProb = nonEmpty.reduce((acc, p) => acc + Number(p.probability || 0), 0)
  if (totalProb > 100.0001) {
    ElMessage.error(`中奖概率总和不得超过 100%，当前合计 ${totalProb.toFixed(4)}%`)
    return
  }
  const hasEmpty = editForm.prizes.some((p) => p.prize_type === 'empty')
  if (!hasEmpty && totalProb < 100) {
    ElMessage.warning('请配置「空奖」以承接剩余概率')
    return
  }
  const { value: password } = await ElMessageBox.prompt('请输入管理员登录密码', '确认保存抽奖活动', {
    inputType: 'password',
    inputPlaceholder: '管理员密码',
    inputValidator: (val: string) => (val ? true : '请输入密码')
  })
  saving.value = true
  try {
    await saveLotteryActivity({ ...editForm }, password)
    ElMessage.success('抽奖活动已保存')
    dialogVisible.value = false
    const res = await getLotteryActivityList({ page: 1, page_size: 200 })
    activities.value = res.list
  } finally {
    saving.value = false
  }
}

async function openRecords(row: LotteryActivity): Promise<void> {
  recordsActivity.value = row
  recordsVisible.value = true
  recordQuery.page = 1
  loadRecords()
}

async function loadRecords(): Promise<void> {
  if (!recordsActivity.value) return
  recordsLoading.value = true
  try {
    const res = await getLotteryRecords(recordsActivity.value.id, { ...recordQuery })
    records.value = res.list
    recordTotal.value = res.total
  } finally {
    recordsLoading.value = false
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

.tip {
  width: 100%;
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
}

.prob-summary {
  display: flex;
  align-items: center;
}
</style>
