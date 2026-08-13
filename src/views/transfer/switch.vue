<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">单品转赠开关</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="每个藏品拥有独立转赠开关，与寄售开关互不干扰。关闭后用户端该藏品「转赠」按钮隐藏/置灰，但已发起待确认的转赠不受影响，无需处理已有转赠记录。"
      />
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="藏品名称" min-width="200" show-overflow-tooltip />
        <el-table-column label="流通量" width="100" align="center">
          <template #default="{ row }">{{ row.circulation }}</template>
        </el-table-column>
        <el-table-column label="转赠开关" width="140">
          <template #default="{ row }">
            <el-switch
              :model-value="row.transfer_enabled"
              inline-prompt
              active-text="开"
              inactive-text="关"
              @change="(val: string | number | boolean) => toggle(row, Boolean(val))"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getCollectibleList, updateTransferSwitch, type CollectibleItem } from '@/api/collectible'

const list = ref<CollectibleItem[]>([])
const loading = ref(false)

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getCollectibleList({ page: 1, page_size: 200 })
    list.value = res.list.filter((c) => c.circulation > 0)
  } finally {
    loading.value = false
  }
}

async function toggle(row: CollectibleItem, val: boolean): Promise<void> {
  await updateTransferSwitch(row.id, val)
  row.transfer_enabled = val
  ElMessage.success(val ? '转赠开关已开启' : '转赠开关已关闭，用户端转赠按钮已隐藏/置灰')
}
</script>
