<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">支付渠道</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="配置微信支付、支付宝等支付渠道的启用状态与费率。修改支付渠道属于高风险操作，需要验证管理员密码并写入审计日志。"
      />
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="渠道名称" min-width="140" />
        <el-table-column prop="channel" label="渠道标识" min-width="120" />
        <el-table-column label="费率(%)" width="110" align="right">
          <template #default="{ row }">{{ row.fee_rate }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small">{{ row.enabled ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="170">
          <template #default="{ row }">{{ row.updated_at }}</template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">配置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 配置渠道 -->
    <el-dialog v-model="dialogVisible" :title="`配置支付渠道 · ${editForm.name}`" :width="appStore.mobile ? '100%' : '560px'" append-to-body destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="渠道状态">
          <el-switch v-model="editForm.enabled" active-text="启用" inactive-text="停用" />
        </el-form-item>
        <el-form-item label="手续费率(%)" required>
          <el-input-number v-model="feeRate" :min="0" :max="100" :precision="2" :step="0.1" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item v-for="(_value, key) in editForm.config" :key="key" :label="keyLabel(key)">
          <el-input v-model="editForm.config[key]" :placeholder="`请输入${keyLabel(key)}`" />
        </el-form-item>
        <el-form-item label="管理员密码" required>
          <el-input v-model="password" type="password" show-password placeholder="修改支付渠道需验证管理员密码" />
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
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getPaymentChannels, savePaymentChannel, type PaymentChannel } from '@/api/system'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const list = ref<PaymentChannel[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const password = ref('')

const editForm = reactive<{ id: number; name: string; enabled: boolean; fee_rate: string; config: Record<string, string> }>({
  id: 0,
  name: '',
  enabled: true,
  fee_rate: '0.00',
  config: {}
})

const feeRate = computed({
  get: () => Number(editForm.fee_rate),
  set: (v: number) => {
    editForm.fee_rate = v.toFixed(2)
  }
})

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    list.value = await getPaymentChannels()
  } finally {
    loading.value = false
  }
}

function keyLabel(key: string): string {
  const map: Record<string, string> = {
    mch_id: '商户号',
    app_id: '应用ID',
    private_key: '商户私钥',
    public_key: '平台公钥',
    notify_url: '回调地址'
  }
  return map[key] || key
}

function openEdit(row: PaymentChannel): void {
  Object.assign(editForm, {
    id: row.id,
    name: row.name,
    enabled: row.enabled,
    fee_rate: row.fee_rate,
    config: { ...row.config }
  })
  password.value = ''
  dialogVisible.value = true
}

async function save(): Promise<void> {
  if (!password.value) {
    ElMessage.warning('请输入管理员密码')
    return
  }
  saving.value = true
  try {
    await savePaymentChannel({ ...editForm } as PaymentChannel, password.value)
    ElMessage.success('支付渠道已保存')
    dialogVisible.value = false
    await load()
  } finally {
    saving.value = false
  }
}
</script>
