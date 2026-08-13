<template>
  <div class="app-page">
    <div class="app-card" style="max-width: 720px">
      <div class="card-header">
        <div class="card-title">第三方接口</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="配置对象存储、短信、地图及支付等第三方接口凭证。修改接口配置属于高风险操作，需要验证管理员密码并写入审计日志。"
      />
      <el-form label-width="110px" v-loading="loading">
        <el-divider content-position="left">对象存储 OSS</el-divider>
        <el-form-item label="AccessKey">
          <el-input v-model="form.oss.access_key" />
        </el-form-item>
        <el-form-item label="Bucket">
          <el-input v-model="form.oss.bucket" />
        </el-form-item>
        <el-form-item label="Endpoint">
          <el-input v-model="form.oss.endpoint" placeholder="oss-cn-beijing.aliyuncs.com" />
        </el-form-item>

        <el-divider content-position="left">短信服务</el-divider>
        <el-form-item label="服务商">
          <el-input v-model="form.sms.provider" />
        </el-form-item>
        <el-form-item label="签名">
          <el-input v-model="form.sms.sign_name" />
        </el-form-item>
        <el-form-item label="启用短信">
          <el-switch v-model="form.sms.enabled" />
        </el-form-item>

        <el-divider content-position="left">地图服务</el-divider>
        <el-form-item label="服务商">
          <el-input v-model="form.map.provider" />
        </el-form-item>
        <el-form-item label="Key">
          <el-input v-model="form.map.key" />
        </el-form-item>

        <el-divider content-position="left">支付接口</el-divider>
        <el-form-item label="服务商">
          <el-input v-model="form.payment.provider" />
        </el-form-item>
        <el-form-item label="商户号">
          <el-input v-model="form.payment.merchant_id" />
        </el-form-item>

        <el-form-item label="管理员密码" required>
          <el-input v-model="password" type="password" show-password placeholder="修改接口配置需验证管理员密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="save">保存配置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getThirdPartyConfig, saveThirdPartyConfig, type ThirdPartyConfig } from '@/api/system'

const loading = ref(false)
const saving = ref(false)
const password = ref('')
const form = reactive<ThirdPartyConfig>({
  oss: { access_key: '', bucket: '', endpoint: '' },
  sms: { provider: '', sign_name: '', enabled: true },
  map: { provider: '', key: '' },
  payment: { provider: '', merchant_id: '' }
})

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const data = await getThirdPartyConfig()
    Object.assign(form, data)
  } finally {
    loading.value = false
  }
}

async function save(): Promise<void> {
  if (!password.value) {
    ElMessage.warning('请输入管理员密码')
    return
  }
  saving.value = true
  try {
    await saveThirdPartyConfig(JSON.parse(JSON.stringify(form)), password.value)
    ElMessage.success('第三方接口配置已保存')
    password.value = ''
  } finally {
    saving.value = false
  }
}
</script>
