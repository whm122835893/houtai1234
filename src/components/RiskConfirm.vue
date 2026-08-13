<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="appStore.mobile ? '100%' : '500px'"
    append-to-body
    destroy-on-close
  >
    <div class="risk-tip">
      <el-icon class="risk-icon"><WarningFilled /></el-icon>
      <span>该操作属于高风险操作，执行前将进行二次确认，并记录审计日志。</span>
    </div>

    <div v-if="description" class="risk-desc">{{ description }}</div>

    <el-form label-width="96px" @submit.prevent>
      <el-form-item v-if="needQuantity" label="操作数量" required>
        <el-input-number
          v-model="form.quantity"
          :min="1"
          :max="maxQuantity || undefined"
          :precision="0"
          controls-position="right"
          style="width: 100%"
        />
        <div v-if="maxQuantity !== undefined && maxQuantity > 0" class="quantity-tip">
          当前可用上限：{{ maxQuantity }}
        </div>
      </el-form-item>

      <el-form-item v-if="needReason" label="操作原因" required>
        <el-input
          v-model="form.reason"
          type="textarea"
          :rows="2"
          maxlength="100"
          show-word-limit
          placeholder="请填写操作原因（必填，用于审计）"
        />
      </el-form-item>

      <el-form-item v-if="needPassword" label="管理员密码" required>
        <el-input
          v-model="form.password"
          type="password"
          show-password
          placeholder="请输入当前管理员登录密码"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="danger" :loading="loading" :disabled="!canSubmit" @click="handleConfirm">
        确认执行
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useAppStore } from '@/store/app'

export interface RiskConfirmPayload {
  reason: string
  password: string
  quantity: number
}

const props = defineProps<{
  title: string
  description?: string
  needReason?: boolean
  needPassword?: boolean
  needQuantity?: boolean
  maxQuantity?: number
  submit?: (payload: RiskConfirmPayload) => Promise<void>
}>()

const appStore = useAppStore()
const visible = ref(false)
const loading = ref(false)

const form = reactive<RiskConfirmPayload>({
  reason: '',
  password: '',
  quantity: 1
})

const canSubmit = computed(() => {
  if (props.needReason && !form.reason.trim()) return false
  if (props.needPassword && !form.password) return false
  if (props.needQuantity && !form.quantity) return false
  return true
})

function open(): void {
  form.reason = ''
  form.password = ''
  form.quantity = 1
  visible.value = true
}

async function handleConfirm(): Promise<void> {
  if (!props.submit) return
  loading.value = true
  try {
    await props.submit({ ...form })
    visible.value = false
  } catch {
    // 失败时保留弹窗以便重试
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<style lang="scss" scoped>
.risk-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 6px;
  padding: 10px 12px;
  color: $color-danger;
  font-size: 13px;
  margin-bottom: 16px;

  .risk-icon {
    margin-top: 2px;
  }
}

.risk-desc {
  background: $bg-page;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 13px;
  color: $text-regular;
  margin-bottom: 16px;
  word-break: break-all;
}

.quantity-tip {
  width: 100%;
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
}
</style>
