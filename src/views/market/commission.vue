<template>
  <div class="app-page">
    <div class="app-card" style="max-width: 680px">
      <div class="card-header">
        <div class="card-title">手续费配置</div>
      </div>
      <el-form label-width="110px" v-loading="loading">
        <el-form-item label="寄售手续费率">
          <div class="rate-row">
            <el-input-number v-model="feeRate" :min="0" :max="20" :precision="2" :step="0.5" controls-position="right" style="width: 200px" />
            <span style="margin-left: 8px">%</span>
          </div>
          <div class="form-tip">寄售成交时平台抽取的手续费比例，范围 0% ~ 20%</div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="save">保存配置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFeeRate, updateFeeRate } from '@/api/market'

const feeRate = ref(3)
const loading = ref(false)
const saving = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await getFeeRate()
    feeRate.value = Number(res.fee_rate)
  } finally {
    loading.value = false
  }
})

async function save(): Promise<void> {
  const { value: password } = await ElMessageBox.prompt('请输入管理员登录密码', '确认修改手续费率', {
    inputType: 'password',
    inputPlaceholder: '管理员密码',
    inputValidator: (val: string) => (val ? true : '请输入密码')
  })
  saving.value = true
  try {
    await updateFeeRate(feeRate.value.toFixed(2), password)
    ElMessage.success('手续费率已更新')
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.rate-row {
  display: flex;
  align-items: center;
}

.form-tip {
  width: 100%;
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
}
</style>
