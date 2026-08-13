<template>
  <div class="layout-header">
    <div class="header-left">
      <el-button text class="collapse-btn" @click="appStore.toggleSidebar()">
        <el-icon :size="18">
          <Fold v-if="!appStore.mobile" />
          <Expand v-else />
        </el-icon>
      </el-button>
      <el-breadcrumb separator="/" class="header-breadcrumb">
        <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
          {{ item }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <el-input
        v-model="globalSearch"
        placeholder="全局搜索：用户/订单/藏品"
        clearable
        class="header-search"
        @keyup.enter="doSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-tooltip content="全屏" placement="bottom">
        <el-button text @click="toggleFullscreen">
          <el-icon :size="18"><FullScreen /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="主题切换" placement="bottom">
        <el-button text @click="appStore.toggleTheme()">
          <el-icon :size="18"><Sunny v-if="appStore.theme === 'light'" /><Moon v-else /></el-icon>
        </el-button>
      </el-tooltip>

      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="30" class="user-avatar">
            {{ adminStore.nickname.charAt(0) }}
          </el-avatar>
          <span class="user-name">{{ adminStore.nickname }}</span>
          <el-tag size="small" type="info" effect="light">{{ adminStore.user?.role_name }}</el-tag>
          <el-icon class="caret"><CaretBottom /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled>角色：{{ adminStore.user?.role_name }}</el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/store/app'
import { useAdminStore } from '@/store/admin'
import { usePermissionStore } from '@/store/permission'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const adminStore = useAdminStore()
const permissionStore = usePermissionStore()

const globalSearch = ref('')

const breadcrumbs = computed<string[]>(() => {
  const matched = route.matched
  const crumbs: string[] = []
  for (const record of matched) {
    const title = record.meta?.title as string | undefined
    if (title && title !== '首页') crumbs.push(title)
  }
  return crumbs
})

function doSearch(): void {
  if (!globalSearch.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  ElMessage.info(`全局搜索功能已就绪（后端联调后生效），关键词：${globalSearch.value}`)
}

function toggleFullscreen(): void {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

async function handleCommand(command: string): Promise<void> {
  if (command === 'logout') {
    await adminStore.logout()
    permissionStore.resetRoutes()
    router.replace('/login')
  }
}
</script>

<style lang="scss" scoped>
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $header-height;
  padding: 0 16px;
  background: $bg-white;
}

.header-left {
  display: flex;
  align-items: center;
  min-width: 0;
}

.collapse-btn {
  margin-right: 8px;
}

.header-breadcrumb {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-search {
  width: 220px;
  margin-right: 8px;

  @media (max-width: 768px) {
    display: none;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: $bg-page;
  }
}

.user-avatar {
  background: linear-gradient(135deg, $color-primary, #7c3aed);
  color: #fff;
  font-weight: 600;
}

.user-name {
  font-size: 13px;
  color: $text-primary;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.caret {
  color: $text-secondary;
  font-size: 12px;
}
</style>
