<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">优先购活动</div>
      </div>
      <el-table :data="activities" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="活动名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="collectible_name" label="关联藏品" min-width="180" show-overflow-tooltip />
        <el-table-column label="开始时间" width="160">
          <template #default="{ row }">{{ formatDate(row.start_at) }}</template>
        </el-table-column>
        <el-table-column label="结束时间" width="160">
          <template #default="{ row }">{{ formatDate(row.end_at) }}</template>
        </el-table-column>
        <el-table-column label="总配额" width="90" align="center">
          <template #default="{ row }">{{ row.total_quota }}</template>
        </el-table-column>
        <el-table-column label="已发放" width="90" align="center">
          <template #default="{ row }">{{ row.issued_count }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="activityTag[row.status]" size="small">{{ activityText[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openWhitelist(row)">白名单管理</el-button>
            <el-button type="danger" link @click="cleanExpired(row)">清理过期</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="app-card">
      <div class="card-header">
        <div class="card-title">创建优先购活动</div>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" style="max-width: 640px">
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="form.name" placeholder="如：龙腾盛世 优先购活动" />
        </el-form-item>
        <el-form-item label="关联藏品" prop="collectible_id">
          <el-select v-model="form.collectible_id" filterable placeholder="选择发售藏品" style="width: 100%">
            <el-option v-for="c in collectibles" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间" prop="dateRange">
          <el-date-picker
            v-model="form.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="资格总量" prop="total_quota">
          <el-input-number v-model="form.total_quota" :min="1" :max="999999" :precision="0" controls-position="right" style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="save">创建活动</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 白名单管理 -->
    <el-dialog v-model="whitelistVisible" :title="`白名单 · ${currentActivity?.name}`" :width="appStore.mobile ? '100%' : '880px'" append-to-body destroy-on-close>
      <div class="whitelist-add">
        <el-input
          v-model="addPhones"
          type="textarea"
          :rows="3"
          placeholder="每行一个手机号，必须是平台已注册用户，未注册拦截提示"
        />
        <div class="add-options">
          <el-input-number v-model="addTimes" :min="1" :max="99" :precision="0" controls-position="right" />
          <span class="text-muted" style="font-size: 13px">可购次数</span>
          <el-date-picker v-model="addValidUntil" type="datetime" placeholder="资格有效期（精确到时分秒）" style="flex: 1" />
          <el-button type="primary" :loading="adding" @click="addWhitelist">导入白名单</el-button>
        </div>
      </div>
      <el-table :data="whitelist" v-loading="whitelistLoading" border height="360">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nickname" label="用户" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="times" label="总次数" width="90" align="center" />
        <el-table-column prop="used_times" label="已用" width="90" align="center" />
        <el-table-column label="剩余" width="90" align="center">
          <template #default="{ row }">{{ row.times - row.used_times }}</template>
        </el-table-column>
        <el-table-column label="有效期至" width="170">
          <template #default="{ row }">{{ formatDate(row.valid_until) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="wlTag[row.status]" size="small">{{ wlText[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="removeWhitelist(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="wlQuery.page"
        v-model:page-size="wlQuery.page_size"
        :total="wlTotal"
        layout="total, prev, pager, next"
        style="justify-content: flex-end; margin-top: 12px"
        @current-change="loadWhitelist()"
      />
    </el-dialog>

    <!-- 清理过期确认 -->
    <RiskConfirm
      ref="cleanRef"
      title="批量清理过期资格"
      description="清理后过期未使用的优先购资格将被移除"
      :need-reason="true"
      :need-password="true"
      :submit="onClean"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import RiskConfirm, { type RiskConfirmPayload } from '@/components/RiskConfirm.vue'
import {
  getPriorityActivityList,
  createPriorityActivity,
  getPriorityWhitelist,
  addPriorityWhitelist,
  deletePriorityWhitelist,
  cleanExpiredPriority,
  type PriorityActivity,
  type PriorityWhitelistItem
} from '@/api/marketing'
import { getCollectibleList, type CollectibleItem } from '@/api/collectible'
import { parsePhoneList } from '@/utils/validate'
import { formatDate } from '@/utils/date'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const activities = ref<PriorityActivity[]>([])
const collectibles = ref<CollectibleItem[]>([])
const loading = ref(false)
const saving = ref(false)

const formRef = ref<FormInstance>()
const form = reactive({ name: '', collectible_id: undefined as number | undefined, dateRange: [] as unknown as [string, string], total_quota: 100 })
const rules: FormRules = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  collectible_id: [{ required: true, message: '请选择关联藏品', trigger: 'change' }],
  dateRange: [{ required: true, message: '请选择活动时间', trigger: 'change' }]
}

const whitelistVisible = ref(false)
const currentActivity = ref<PriorityActivity | null>(null)
const whitelist = ref<PriorityWhitelistItem[]>([])
const whitelistLoading = ref(false)
const wlTotal = ref(0)
const addPhones = ref('')
const addTimes = ref(1)
const addValidUntil = ref<string | undefined>()
const adding = ref(false)
const wlQuery = reactive({ page: 1, page_size: 20 })

const cleanRef = ref<InstanceType<typeof RiskConfirm>>()
let cleanTarget: PriorityActivity | null = null

const activityText: Record<string, string> = { not_started: '未开始', active: '进行中', ended: '已结束' }
const activityTag: Record<string, 'info' | 'success' | 'warning'> = { not_started: 'info', active: 'success', ended: 'warning' }
const wlText: Record<string, string> = { valid: '有效', expired: '已过期', used_up: '已用完' }
const wlTag: Record<string, 'success' | 'info' | 'warning'> = { valid: 'success', expired: 'info', used_up: 'warning' }

onMounted(async () => {
  loading.value = true
  try {
    const [actRes, cbRes] = await Promise.all([
      getPriorityActivityList({ page: 1, page_size: 200 }),
      getCollectibleList({ page: 1, page_size: 200 })
    ])
    activities.value = actRes.list
    collectibles.value = cbRes.list
  } finally {
    loading.value = false
  }
})

async function save(): Promise<void> {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    await createPriorityActivity({
      name: form.name,
      collectible_id: form.collectible_id!,
      start_at: form.dateRange[0],
      end_at: form.dateRange[1],
      total_quota: form.total_quota
    })
    ElMessage.success('活动已创建')
    form.name = ''
    form.collectible_id = undefined
    form.dateRange = [] as unknown as [string, string]
    const res = await getPriorityActivityList({ page: 1, page_size: 200 })
    activities.value = res.list
  } finally {
    saving.value = false
  }
}

function openWhitelist(row: PriorityActivity): void {
  currentActivity.value = row
  whitelistVisible.value = true
  wlQuery.page = 1
  loadWhitelist()
}

async function loadWhitelist(): Promise<void> {
  if (!currentActivity.value) return
  whitelistLoading.value = true
  try {
    const res = await getPriorityWhitelist(currentActivity.value.id, { ...wlQuery })
    whitelist.value = res.list
    wlTotal.value = res.total
  } finally {
    whitelistLoading.value = false
  }
}

async function addWhitelist(): Promise<void> {
  if (!currentActivity.value) return
  const phones = parsePhoneList(addPhones.value)
  if (phones.length === 0) {
    ElMessage.warning('请填写手机号')
    return
  }
  adding.value = true
  try {
    await addPriorityWhitelist(currentActivity.value.id, phones, addTimes.value, addValidUntil.value || '')
    ElMessage.success(`已导入 ${phones.length} 个手机号`)
    addPhones.value = ''
    loadWhitelist()
  } finally {
    adding.value = false
  }
}

async function removeWhitelist(row: PriorityWhitelistItem): Promise<void> {
  await ElMessageBox.confirm('确定删除该白名单记录吗？', '删除白名单', { type: 'warning' })
  await deletePriorityWhitelist(row.id)
  ElMessage.success('已删除')
  loadWhitelist()
}

function cleanExpired(row: PriorityActivity): void {
  cleanTarget = row
  cleanRef.value?.open()
}

async function onClean(payload: RiskConfirmPayload): Promise<void> {
  if (!cleanTarget) return
  const res = await cleanExpiredPriority(cleanTarget.id, payload.password)
  ElMessage.success(`已清理 ${res.cleared} 条过期资格`)
  loadWhitelist()
}
</script>

<style lang="scss" scoped>
.whitelist-add {
  margin-bottom: 16px;
}

.add-options {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}
</style>
