<template>
  <div class="tabs-bar">
    <el-scrollbar ref="scrollbarRef">
      <div class="tabs-inner">
        <div
          v-for="tab in appStore.tabs"
          :key="tab.path"
          class="tab-item"
          :class="{ active: tab.path === appStore.activeMenu }"
          @click="go(tab.path)"
          @contextmenu.prevent="openContextMenu($event, tab)"
        >
          <span class="tab-title">{{ tab.title }}</span>
          <el-icon v-if="!tab.affix" class="tab-close" @click.stop="close(tab.path)">
            <Close />
          </el-icon>
        </div>
      </div>
    </el-scrollbar>

    <!-- 右键菜单 -->
    <div
      v-show="contextMenu.visible"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <div class="context-item" @click="closeOthers(contextMenu.tab.path)">
        <el-icon><Close /></el-icon>
        关闭其他
      </div>
      <div class="context-item" @click="closeAll">
        <el-icon><CircleClose /></el-icon>
        关闭全部
      </div>
      <div class="context-item" @click="refreshTab">
        <el-icon><Refresh /></el-icon>
        刷新当前
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore, type TabItem } from '@/store/app'

const router = useRouter()
const appStore = useAppStore()
const scrollbarRef = ref()

const contextMenu = reactive<{ visible: boolean; x: number; y: number; tab: TabItem }>({
  visible: false,
  x: 0,
  y: 0,
  tab: { path: '', title: '', name: '', affix: false }
})

function go(path: string): void {
  router.push(path)
}

function close(path: string): void {
  const next = appStore.removeTab(path)
  if (next) router.push(next)
}

function closeOthers(path: string): void {
  appStore.closeOthers(path)
  contextMenu.visible = false
  if (appStore.activeMenu !== path) router.push(path)
}

function closeAll(): void {
  appStore.closeAll()
  contextMenu.visible = false
  router.push('/dashboard')
}

function refreshTab(): void {
  contextMenu.visible = false
  const current = appStore.activeMenu
  router.replace({ path: '/redirect', query: { to: current } }).catch(() => {
    // 兜底：直接重进
    router.replace(current)
  })
}

function openContextMenu(e: MouseEvent, tab: TabItem): void {
  const docWidth = document.documentElement.clientWidth
  const x = Math.min(e.clientX, docWidth - 140)
  contextMenu.x = x
  contextMenu.y = e.clientY
  contextMenu.tab = tab
  contextMenu.visible = true
}

// 点击空白处关闭右键菜单
document.addEventListener('click', () => {
  contextMenu.visible = false
})
</script>

<style lang="scss" scoped>
.tabs-bar {
  position: relative;
  height: $tabs-height;
  background: $bg-white;
  border-top: 1px solid $border-color;
  user-select: none;
}

.tabs-inner {
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: $tabs-height;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 10px;
  margin-right: 6px;
  font-size: 13px;
  color: $text-regular;
  background: $bg-page;
  border: 1px solid $border-color;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    color: $color-primary;
  }

  &.active {
    color: $color-primary;
    background: $bg-active;
    border-color: $color-primary-light;
    border-bottom: 2px solid $color-primary;
  }

  .tab-close {
    font-size: 12px;
    border-radius: 50%;

    &:hover {
      background: #d3dce6;
      color: $text-primary;
    }
  }
}

.context-menu {
  position: fixed;
  z-index: 3000;
  min-width: 130px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 6px 0;

  .context-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    font-size: 13px;
    color: $text-primary;
    cursor: pointer;

    &:hover {
      background: $bg-page;
      color: $color-primary;
    }
  }
}
</style>
