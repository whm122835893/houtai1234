<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">配额配置</div>
      </div>

      <div class="stock-bar">
        <div class="stock-item"><span>发行总量</span><b>{{ detail?.total_supply }}</b></div>
        <div class="stock-item"><span>已配置配额</span><b>{{ detail?.configured_quota }}</b></div>
        <div class="stock-item"><span>库存池</span><b class="stock-pool">{{ detail?.stock_pool }}</b></div>
        <div class="stock-item"><span>流通量</span><b>{{ detail?.circulation }}</b></div>
      </div>

      <el-alert
        class="mb-16"
        type="info"
        :closable="false"
        show-icon
        title="配额类型全部可选，可不配/单配/多配；配置时从库存池冻结预留。新增配额不得超过当前库存池，超发将被拦截。已使用配额不可减少，未使用配额可减少或停用（释放回库存池）。"
      />

      <div class="table-toolbar">
        <el-button type="primary" :disabled="(detail?.stock_pool || 0) <= 0" @click="openAdd">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          新增配额
        </el-button>
        <span v-if="(detail?.stock_pool || 0) <= 0" class="text-muted" style="font-size: 13px">库存池为0，无法新增配额</span>
      </div>

      <el-table :data="detail?.quotas || []" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="配额类型" width="150">
          <template #default="{ row }">
            <el-tag type="primary" size="small" effect="light">{{ row.type_text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="配额名称" min-width="180" />
        <el-table-column prop="total" label="总数" width="90" align="center" />
        <el-table-column prop="used" label="已使用" width="90" align="center" />
        <el-table-column label="未使用" width="90" align="center">
          <template #default="{ row }">{{ row.total - row.used }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">{{ row.status === 'active' ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">修改</el-button>
            <el-button type="danger" link @click="removeQuota(row)">停用</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/修改配额 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" :width="appStore.mobile ? '100%' : '520px'" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="配额类型" prop="type">
          <el-select v-model="form.type" style="width: 100%" :disabled="isEdit">
            <el-option label="优先购配额" value="priority" />
            <el-option label="活动空投配额" value="activity_airdrop" />
            <el-option label="其他活动配额" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="配额名称" prop="name">
          <el-input v-model="form.name" placeholder="如：签到活动空投预留" />
        </el-form-item>
        <el-form-item label="配额数量" prop="total">
          <el-input-number v-model="form.total" :min="1" :max="maxTotal" :precision="0" controls-position="right" style="width: 100%" />
          <div v-if="!isEdit" class="form-tip">新增配额不得超过当前库存池 {{ detail?.stock_pool }}</div>
          <div v-if="isEdit" class="form-tip">已使用的配额不可减少（防止超卖），修改后未使用部分为 {{ editUnused }}</div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <RiskConfirm
      ref="riskRef"
      title="停用配额"
      description="停用后未使用配额将释放回库存池"
      :need-reason="true"
      :need-password="true"
      :submit="onRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import RiskConfirm, { type RiskConfirmPayload } from '@/components/RiskConfirm.vue'
import { getCollectibleDetail, saveQuota, deleteQuota, type CollectibleItem, type QuotaItem, type QuotaType } from '@/api/collectible'
import { formatDate } from '@/utils/date'
import { useAppStore } from '@/store/app'

const route = useRoute()
const appStore = useAppStore()
const detail = ref<CollectibleItem | null>(null)
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)

const formRef = ref<FormInstance>()
const form = reactive({ id: 0, type: 'priority' as QuotaType, name: '', total: 10, status: 'active' as 'active' | 'disabled' })

const riskRef = ref<InstanceType<typeof RiskConfirm>>()
let removeTarget: QuotaItem | null = null

const maxTotal = computed(() => (isEdit.value ? 999999 : (detail.value?.stock_pool || 0)))
const editUnused = computed(() => {
  const target = detail.value?.quotas.find((q) => q.id === form.id)
  return target ? Math.max(0, form.total - target.used) : 0
})

const rules: FormRules = {
  type: [{ required: true, message: '请选择配额类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入配额名称', trigger: 'blur' }],
  total: [{ required: true, message: '请输入配额数量', trigger: 'blur' }]
}

const dialogTitle = computed(() => (isEdit.value ? '修改配额' : '新增配额'))

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    detail.value = await getCollectibleDetail(Number(route.query.id))
  } finally {
    loading.value = false
  }
}

function openAdd(): void {
  isEdit.value = false
  Object.assign(form, { id: 0, type: 'priority', name: '', total: 10, status: 'active' })
  dialogVisible.value = true
}

function openEdit(row: QuotaItem): void {
  isEdit.value = true
  Object.assign(form, { id: row.id, type: row.type, name: row.name, total: row.total, status: row.status })
  dialogVisible.value = true
}

async function save(): Promise<void> {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  if (!isEdit.value && form.total > (detail.value?.stock_pool || 0)) {
    ElMessage.error(`库存池不足，当前库存池为 ${detail.value?.stock_pool}`)
    return
  }
  if (isEdit.value) {
    const target = detail.value?.quotas.find((q) => q.id === form.id)
    if (target && form.total < target.used) {
      ElMessage.error(`已使用的配额不可减少（防止超卖），当前已使用 ${target.used}`)
      return
    }
  }
  const { value: password } = await ElMessageBox.prompt('请输入管理员登录密码', '确认保存配额', {
    inputType: 'password',
    inputPlaceholder: '管理员密码',
    inputValidator: (val: string) => (val ? true : '请输入密码')
  })
  saving.value = true
  try {
    await saveQuota(detail.value!.id, { ...form }, password)
    ElMessage.success('配额已保存')
    dialogVisible.value = false
    await load()
  } finally {
    saving.value = false
  }
}

function removeQuota(row: QuotaItem): void {
  removeTarget = row
  riskRef.value?.open()
}

async function onRemove(payload: RiskConfirmPayload): Promise<void> {
  if (!detail.value || !removeTarget) return
  await deleteQuota(detail.value.id, removeTarget.id, payload.password)
  ElMessage.success('配额已停用，未使用部分已释放回库存池')
  await load()
}
</script>

<style lang="scss" scoped>
.stock-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  background: $bg-page;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  .stock-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    span {
      font-size: 12px;
      color: $text-secondary;
    }

    b {
      font-size: 20px;
      color: $text-primary;
    }

    .stock-pool {
      color: $color-primary;
      font-size: 24px;
    }
  }
}

.form-tip {
  width: 100%;
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
}
</style>
