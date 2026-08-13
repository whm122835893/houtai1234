<template>
  <div class="login-page">
    <div class="login-left">
      <div class="brand">
        <div class="brand-logo">数</div>
        <div class="brand-title">数和文创 · 运营管理后台</div>
        <div class="brand-sub">数字藏品平台全链路运营中枢</div>
      </div>
      <ul class="brand-features">
        <li>库存闭环 · 发售/配额/空投/销毁全链路管控</li>
        <li>资格购 · 优先购 · 抽奖概率多奖项体系</li>
        <li>五角色权限 · 动态路由 · 全操作审计留痕</li>
        <li>移动端适配 · PWA 可添加到手机桌面</li>
      </ul>
    </div>

    <div class="login-form-wrap">
      <el-card class="login-card" shadow="never">
        <h2 class="login-title">欢迎回来</h2>
        <p class="login-sub">请使用管理员账号登录</p>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
          <el-form-item prop="username" label="用户名">
            <el-input v-model="form.username" placeholder="请输入用户名" size="large" :prefix-icon="User" clearable />
          </el-form-item>
          <el-form-item prop="password" label="密码">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              :prefix-icon="Lock"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </el-form>

        <el-divider>演示账号（Mock）</el-divider>
        <div class="demo-accounts">
          <el-button
            v-for="acc in demoAccounts"
            :key="acc.username"
            size="small"
            @click="fill(acc.username, acc.password)"
          >
            {{ acc.label }}
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAdminStore } from '@/store/admin'
import { usePermissionStore } from '@/store/permission'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()
const permissionStore = usePermissionStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({ username: 'admin', password: '' })

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const demoAccounts = [
  { label: '超级管理员', username: 'admin', password: 'admin123' },
  { label: '运营', username: 'operator', password: 'operator123' },
  { label: '财务', username: 'finance', password: 'finance123' },
  { label: '风控', username: 'risk', password: 'risk123' },
  { label: '客服', username: 'service', password: 'service123' }
]

function fill(username: string, password: string): void {
  form.username = username
  form.password = password
}

async function handleLogin(): Promise<void> {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await adminStore.login(form)
    permissionStore.resetRoutes()
    ElMessage.success('登录成功')
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.replace(redirect)
  } catch {
    // 错误提示由拦截器统一处理
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  height: 100vh;
  min-height: 600px;
}

.login-left {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 72px;
  color: #fff;
  background:
    radial-gradient(1200px 600px at -10% -10%, rgba(124, 58, 237, 0.55), transparent 60%),
    radial-gradient(1000px 500px at 110% 110%, rgba(64, 158, 255, 0.5), transparent 60%),
    linear-gradient(160deg, #3b5bdb 0%, #4c6ef5 45%, #7c3aed 100%);

  @media (max-width: 900px) {
    display: none;
  }
}

.brand {
  .brand-logo {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .brand-title {
    font-size: 28px;
    font-weight: 700;
  }

  .brand-sub {
    margin-top: 8px;
    font-size: 15px;
    opacity: 0.85;
  }
}

.brand-features {
  margin-top: 40px;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    opacity: 0.92;

    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #fff;
    }
  }
}

.login-form-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-page;
}

.login-card {
  width: 400px;
  padding: 8px 16px 16px;
  border-radius: 12px;

  @media (max-width: 480px) {
    width: calc(100vw - 32px);
  }
}

.login-title {
  margin: 8px 0 4px;
  font-size: 22px;
  color: $text-primary;
  text-align: center;
}

.login-sub {
  margin: 0 0 20px;
  text-align: center;
  color: $text-secondary;
  font-size: 13px;
}

.login-btn {
  width: 100%;
}

.demo-accounts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
</style>
