<template>
  <div class="app-page">
    <div class="app-card" style="max-width: 720px">
      <div class="card-header">
        <div class="card-title">基础配置</div>
      </div>
      <el-form label-width="130px" v-loading="loading">
        <el-form-item label="站点名称" required>
          <el-input v-model="form.site_name" />
        </el-form-item>
        <el-form-item label="站点Logo">
          <el-input v-model="form.site_logo" placeholder="https://... 图片地址" />
        </el-form-item>
        <el-form-item label="站点描述">
          <el-input v-model="form.site_description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="ICP备案号">
          <el-input v-model="form.icp" placeholder="京ICP备00000000号" />
        </el-form-item>
        <el-form-item label="客服电话">
          <el-input v-model="form.customer_service_phone" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :xs="24" :md="12">
            <el-form-item label="单笔充值下限">
              <el-input-number v-model="rechargeMin" :min="0.01" :precision="2" :step="1" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="单笔充值上限">
              <el-input-number v-model="rechargeMax" :min="1" :precision="2" :step="100" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="开放注册">
          <el-switch v-model="form.register_enabled" />
        </el-form-item>
        <el-form-item label="允许登录">
          <el-switch v-model="form.login_enabled" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="save">保存配置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getSiteConfig, saveSiteConfig } from '@/api/system'

const loading = ref(false)
const saving = ref(false)
const form = reactive({
  site_name: '',
  site_logo: '',
  site_description: '',
  icp: '',
  customer_service_phone: '',
  recharge_min: '10.00',
  recharge_max: '5000.00',
  register_enabled: true,
  login_enabled: true
})

const rechargeMin = computed({
  get: () => Number(form.recharge_min),
  set: (v: number) => {
    form.recharge_min = v.toFixed(2)
  }
})
const rechargeMax = computed({
  get: () => Number(form.recharge_max),
  set: (v: number) => {
    form.recharge_max = v.toFixed(2)
  }
})

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const data = await getSiteConfig()
    Object.assign(form, data)
  } finally {
    loading.value = false
  }
}

async function save(): Promise<void> {
  saving.value = true
  try {
    await saveSiteConfig({ ...form })
    ElMessage.success('基础配置已保存')
  } finally {
    saving.value = false
  }
}
</script>
