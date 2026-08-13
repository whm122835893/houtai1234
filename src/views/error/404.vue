<template>
  <div class="error-page">
    <div class="code">404</div>
    <p class="desc">抱歉，您访问的页面不存在或没有权限</p>
    <el-button type="primary" @click="router.push('/dashboard')">返回首页</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style lang="scss" scoped>
.error-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: $bg-page;

  .code {
    font-size: 120px;
    font-weight: 800;
    background: linear-gradient(135deg, $color-primary, #7c3aed);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    line-height: 1.2;
  }

  .desc {
    color: $text-secondary;
    margin: 16px 0 24px;
  }
}
</style>
