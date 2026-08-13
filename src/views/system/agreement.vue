<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">用户协议</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="管理《用户服务协议》《隐私政策》《发售规则》。协议内容变更属于高风险操作，需要验证管理员密码并写入审计日志。"
      />
      <el-row :gutter="16">
        <el-col :xs="24" :md="6">
          <div class="agreement-nav">
            <div
              v-for="item in tabs"
              :key="item.key"
              class="nav-item"
              :class="{ active: activeKey === item.key }"
              @click="switchTab(item.key)"
            >
              {{ item.label }}
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :md="18">
          <div class="app-card" v-loading="loading">
            <div class="editor-wrap">
              <QuillEditor v-model:content="content" contentType="html" theme="snow" :toolbar="toolbar" />
            </div>
            <div class="save-bar">
              <el-input v-model="password" type="password" show-password placeholder="管理员密码" style="width: 240px" />
              <el-button type="primary" :loading="saving" @click="save">保存协议</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { QuillEditor } from '@vueup/vue-quill'
import { getAgreements, saveAgreement } from '@/api/system'

const tabs = [
  { key: 'user', label: '用户服务协议' },
  { key: 'privacy', label: '隐私政策' },
  { key: 'sale', label: '发售规则' }
]
const activeKey = ref('user')
const content = ref('')
const password = ref('')
const loading = ref(false)
const saving = ref(false)
const toolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ header: [1, 2, 3, false] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'image'],
  ['clean']
]

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const data = await getAgreements()
    content.value = data[activeKey.value] || ''
  } finally {
    loading.value = false
  }
}

async function switchTab(key: string): Promise<void> {
  activeKey.value = key
  await load()
}

async function save(): Promise<void> {
  if (!password.value) {
    ElMessage.warning('请输入管理员密码')
    return
  }
  saving.value = true
  try {
    await saveAgreement(activeKey.value, content.value, password.value)
    ElMessage.success('协议已保存')
    password.value = ''
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.agreement-nav {
  border: 1px solid $border-color;
  border-radius: 8px;
  overflow: hidden;

  .nav-item {
    padding: 12px 16px;
    font-size: 14px;
    color: $text-primary;
    cursor: pointer;
    border-bottom: 1px solid $border-color;
    transition: all 0.2s;

    &:last-child {
      border-bottom: none;
    }

    &.active {
      background: $color-primary;
      color: #fff;
    }
  }
}

.editor-wrap {
  :deep(.ql-editor) {
    min-height: 320px;
  }
}

.save-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}
</style>
