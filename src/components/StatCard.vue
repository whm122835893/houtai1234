<template>
  <div class="stat-card" :style="{ background: `linear-gradient(135deg, ${start}, ${end})` }">
    <div class="stat-icon">
      <el-icon :size="42"><component :is="icon" /></el-icon>
    </div>
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value">{{ value }}</div>
    <div v-if="extra" class="stat-extra">{{ extra }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon: string
  start: string
  end: string
  extra?: string
}>()
</script>
