<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">角色管理</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="平台内置五大角色：超级管理员、运营、财务、风控、客服。角色权限决定可访问菜单与可执行操作，权限矩阵见 README。"
      />
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="角色名称" min-width="140" />
        <el-table-column prop="code" label="角色标识" min-width="140" />
        <el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip />
        <el-table-column label="权限数" width="100" align="center">
          <template #default="{ row }">{{ row.permissions.length }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row)">查看权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 权限详情 -->
    <el-dialog v-model="dialogVisible" :title="`角色权限 · ${current?.name}`" :width="appStore.mobile ? '100%' : '680px'" append-to-body>
      <div class="perm-grid" v-loading="permLoading">
        <el-tag v-for="p in current?.permissions" :key="p" size="small" effect="plain" class="perm-tag">{{ p }}</el-tag>
        <el-empty v-if="current?.permissions.length === 0" description="该角色暂无权限" :image-size="60" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getRoleList, type RoleItem } from '@/api/permissionModule'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const list = ref<RoleItem[]>([])
const loading = ref(false)
const permLoading = ref(false)
const dialogVisible = ref(false)
const current = ref<RoleItem | null>(null)

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    list.value = await getRoleList()
  } finally {
    loading.value = false
  }
}

function openDetail(row: RoleItem): void {
  current.value = row
  dialogVisible.value = true
}
</script>

<style lang="scss" scoped>
.perm-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 80px;

  .perm-tag {
    font-size: 12px;
  }
}
</style>
