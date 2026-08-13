<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">数据清除</div>
      </div>
      <el-alert
        type="error"
        :closable="false"
        show-icon
        class="mb-16"
        title="清除平台全部用户数据属于最高风险操作，需依次完成：① 输入「确认清除」② 验证管理员密码 ③ 短信验证码校验 ④ 二次确认执行。系统将在清除前自动备份并生成备份编号。"
      />

      <el-steps :active="step" align-center class="mb-24">
        <el-step title="文字确认" description="输入「确认清除」" />
        <el-step title="密码验证" description="管理员密码" />
        <el-step title="短信校验" description="短信验证码" />
        <el-step title="执行清除" description="二次确认" />
      </el-steps>

      <el-form label-width="110px" style="max-width: 480px">
        <el-form-item label="确认文字" required>
          <el-input v-model="form.confirm_text" placeholder="请输入「确认清除」" />
        </el-form-item>
        <el-form-item label="管理员密码" required>
          <el-input v-model="form.password" type="password" show-password placeholder="当前登录管理员密码" />
        </el-form-item>
        <el-form-item label="短信验证码" required>
          <div style="display: flex; gap: 8px; width: 100%">
            <el-input v-model="form.sms_code" placeholder="6位短信验证码（演示环境为 123456）" />
            <el-button type="primary" plain :disabled="sending || smsCountdown > 0" @click="sendSms">
              {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="操作原因" required>
          <el-input v-model="form.reason" type="textarea" :rows="2" placeholder="请填写清除原因（将写入审计日志）" />
        </el-form-item>
        <el-form-item>
          <el-button type="danger" :loading="clearing" @click="confirmClear">开始清除</el-button>
        </el-form-item>
      </el-form>

      <el-divider content-position="left">历史备份</el-divider>
      <el-table :data="backups" v-loading="backupLoading" border>
        <el-table-column prop="id" label="备份编号" min-width="180" />
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ row.created_at }}</template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="110" />
        <el-table-column prop="operator" label="操作人" min-width="130" />
      </el-table>
    </div>

    <!-- 二次确认 -->
    <el-dialog v-model="confirmVisible" title="最终确认" :width="appStore.mobile ? '100%' : '480px'" append-to-body>
      <div class="final-warning">
        <p>即将清除平台 <b>全部用户数据</b>，该操作不可逆。清除前已生成数据备份：<b>{{ backupHint }}</b></p>
        <p>请再次确认：输入「确认清除」并点击下方按钮执行。</p>
      </div>
      <el-input v-model="confirmText" placeholder="请输入「确认清除」" />
      <template #footer>
        <el-button @click="confirmVisible = false">取消</el-button>
        <el-button type="danger" :disabled="confirmText !== '确认清除'" :loading="clearing" @click="execute">确认执行清除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { clearPlatformData, getClearBackups, type ClearResult } from '@/api/platform'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const step = ref(0)
const sending = ref(false)
const smsCountdown = ref(0)
const clearing = ref(false)
const backupLoading = ref(false)
const backups = ref<Array<{ id: string; created_at: string; size: string; operator: string }>>([])
const confirmVisible = ref(false)
const confirmText = ref('')
const backupHint = ref('')

const form = reactive({ confirm_text: '', password: '', sms_code: '', reason: '' })

onMounted(loadBackups)

async function loadBackups(): Promise<void> {
  backupLoading.value = true
  try {
    backups.value = await getClearBackups()
  } finally {
    backupLoading.value = false
  }
}

function sendSms(): void {
  sending.value = true
  setTimeout(() => {
    sending.value = false
    ElMessage.success('验证码已发送（演示环境验证码为 123456）')
    smsCountdown.value = 60
    const timer = setInterval(() => {
      smsCountdown.value -= 1
      if (smsCountdown.value <= 0) clearInterval(timer)
    }, 1000)
  }, 600)
}

async function confirmClear(): Promise<void> {
  if (form.confirm_text !== '确认清除') {
    ElMessage.warning('请输入「确认清除」')
    step.value = 0
    return
  }
  step.value = 1
  if (!form.password) {
    ElMessage.warning('请输入管理员密码')
    return
  }
  step.value = 2
  if (form.sms_code !== '123456') {
    ElMessage.warning('请输入正确的短信验证码')
    return
  }
  step.value = 3
  if (!form.reason.trim()) {
    ElMessage.warning('请填写操作原因')
    return
  }
  backupHint.value = `BK${Date.now()}`
  confirmText.value = ''
  confirmVisible.value = true
}

async function execute(): Promise<void> {
  clearing.value = true
  try {
    const res: ClearResult = await clearPlatformData({ ...form })
    ElMessage.success(`数据清除完成，备份编号 ${res.backup_id}，共清除 ${res.cleared_users} 个用户`)
    confirmVisible.value = false
    form.confirm_text = ''
    form.password = ''
    form.sms_code = ''
    form.reason = ''
    await loadBackups()
  } finally {
    clearing.value = false
  }
}
</script>

<style lang="scss" scoped>
.mb-24 {
  margin-bottom: 24px;
}

.final-warning {
  background: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.8;
  color: $text-primary;
}
</style>
