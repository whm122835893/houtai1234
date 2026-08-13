<template>
  <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
    <template #title>
      <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
      <span>{{ menu.title }}</span>
    </template>
    <SidebarItem v-for="child in menu.children" :key="child.path" :menu="child" />
  </el-sub-menu>
  <el-menu-item v-else :index="menu.path">
    <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
    <template #title>{{ menu.title }}</template>
  </el-menu-item>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/types'

defineProps<{ menu: MenuItem }>()
</script>
