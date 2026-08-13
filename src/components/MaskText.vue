<template>
  <span class="mask-text">
    <template v-if="visible">
      <slot>{{ text }}</slot>
      <el-icon class="eye" @click="toggle"><Hide /></el-icon>
    </template>
    <template v-else>
      {{ mask }}
      <el-icon class="eye" @click="toggle"><View /></el-icon>
    </template>
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    text: string
    mask?: string
    defaultVisible?: boolean
  }>(),
  { defaultVisible: false }
)

const visible = ref(props.defaultVisible)

function toggle(): void {
  visible.value = !visible.value
}
</script>

<style lang="scss" scoped>
.mask-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .eye {
    cursor: pointer;
    color: $text-secondary;
    font-size: 13px;

    &:hover {
      color: $color-primary;
    }
  }
}
</style>
