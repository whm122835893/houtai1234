<template>
  <div class="app-layout" :class="{ 'is-mobile': appStore.mobile }">
    <!-- 桌面端侧边栏 -->
    <aside
      v-if="!appStore.mobile"
      class="layout-sidebar"
      :class="{ collapsed: appStore.sidebarCollapsed }"
    >
      <Sidebar />
    </aside>

    <!-- 移动端抽屉侧边栏 -->
    <el-drawer
      v-if="appStore.mobile"
      v-model="appStore.mobileDrawer"
      direction="ltr"
      :with-header="false"
      :size="232"
      class="mobile-drawer"
    >
      <Sidebar />
    </el-drawer>

    <div class="layout-main">
      <div class="layout-header-wrap">
        <Header />
        <TabsBar />
      </div>
      <main class="layout-content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-slide" mode="out-in">
            <keep-alive :max="10">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import TabsBar from './components/TabsBar.vue'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()

function onResize(): void {
  const isMobile = window.innerWidth <= 768
  appStore.setMobile(isMobile)
  if (!isMobile) appStore.setMobileDrawer(false)
}

onMounted(() => {
  onResize()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: $bg-page;
}

.layout-sidebar {
  flex-shrink: 0;
  width: $sidebar-width;
  height: 100%;
  background: $bg-white;
  border-right: 1px solid $border-color;
  transition: width 0.25s;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }
}

.layout-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.layout-header-wrap {
  flex-shrink: 0;
  background: $bg-white;
  z-index: 10;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.layout-content {
  flex: 1;
  overflow-y: auto;
  background: $bg-page;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
