<template>
  <div class="empty-state">
    <div class="empty-icon">
      <svg viewBox="0 0 200 140" width="180" height="126" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="e1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#409EFF" stop-opacity="0.18" />
            <stop offset="1" stop-color="#7c3aed" stop-opacity="0.18" />
          </linearGradient>
        </defs>
        <rect x="45" y="30" width="110" height="80" rx="10" fill="url(#e1)" />
        <rect x="45" y="30" width="110" height="80" rx="10" fill="none" stroke="#c6e2ff" stroke-width="2" stroke-dasharray="6 5" />
        <circle cx="100" cy="70" r="18" fill="#c6e2ff" opacity="0.7" />
        <circle cx="100" cy="70" r="9" fill="#409EFF" opacity="0.5" />
        <line x1="70" y1="88" x2="130" y2="88" stroke="#c0c4cc" stroke-width="3" stroke-linecap="round" />
        <line x1="80" y1="96" x2="120" y2="96" stroke="#e4e7ed" stroke-width="3" stroke-linecap="round" />
      </svg>
    </div>
    <p class="empty-text">{{ text }}</p>
    <el-button v-if="actionText" type="primary" plain @click="$emit('action')">{{ actionText }}</el-button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ text?: string; actionText?: string }>()
defineEmits<{ (e: 'action'): void }>()
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: $text-secondary;
}

.empty-text {
  margin: 4px 0 16px;
  font-size: 14px;
}
</style>
