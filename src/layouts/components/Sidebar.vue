<template>
  <div class="sidebar">
    <div class="sidebar-logo" @click="router.push('/dashboard')">
      <div class="logo-mark">数</div>
      <span v-if="!appStore.sidebarCollapsed || appStore.mobile" class="logo-title">数和文创运营后台</span>
    </div>

    <el-scrollbar class="sidebar-scroll">
      <el-menu
        :default-active="appStore.activeMenu"
        :collapse="!appStore.mobile && appStore.sidebarCollapsed"
        :collapse-transition="false"
        background-color="#FFFFFF"
        text-color="#606266"
        active-text-color="#409EFF"
        router
        class="sidebar-menu"
      >
        <template v-for="menu in permissionStore.menus" :key="menu.path">
          <SidebarItem :menu="menu" />
        </template>
      </el-menu>
    </el-scrollbar>

    <div v-if="!appStore.mobile" class="sidebar-footer" @click="appStore.toggleSidebar()">
      <el-icon>
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>
      <span v-if="!appStore.sidebarCollapsed">收起菜单</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import SidebarItem from './SidebarItem.vue'
import { useAppStore } from '@/store/app'
import { usePermissionStore } from '@/store/permission'

const router = useRouter()
const appStore = useAppStore()
const permissionStore = usePermissionStore()
</script>

<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  height: $header-height;
  padding: 0 16px;
  cursor: pointer;
  border-bottom: 1px solid $border-color;
  overflow: hidden;
  white-space: nowrap;

  .logo-mark {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    border-radius: 8px;
    background: linear-gradient(135deg, $color-primary, #7c3aed);
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-title {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
  }
}

.sidebar-scroll {
  flex: 1;
}

.sidebar-menu {
  border-right: none;

  &:not(.el-menu--collapse) {
    width: 100%;
  }

  :deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;
    color: $text-regular;

    &:hover {
      background: $bg-page;
    }

    &.is-active {
      color: $color-primary;
      background: $bg-active;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: $color-primary;
      }
    }
  }

  :deep(.el-sub-menu__title) {
    height: 48px;
    line-height: 48px;
    color: $text-regular;

    &:hover {
      background: $bg-page;
    }
  }

  :deep(.el-menu--inline .el-menu-item) {
    height: 40px;
    line-height: 40px;
    padding-left: 48px !important;
  }
}

.sidebar-footer {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-top: 1px solid $border-color;
  color: $text-regular;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    color: $color-primary;
    background: $bg-page;
  }
}
</style>
