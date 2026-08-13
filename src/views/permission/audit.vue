<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">审计日志</div>
      </div>
      <div class="filter-bar">
        <el-select v-model="query.module" placeholder="操作模块" clearable style="width: 180px">
          <el-option v-for="(m, i) in modules" :key="i" :label="m" :value="m" />
        </el-select>
        <el-input v-model="query.keyword" placeholder="操作人 / 操作内容" clearable style="width: 220px" @keyup.enter="search" />
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="operator" label="操作人" min-width="120" />
        <el-table-column prop="module" label="模块" width="110">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.module }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作" min-width="130" show-overflow-tooltip />
        <el-table-column prop="target" label="对象" min-width="160" show-overflow-tooltip />
        <el-table-column prop="reason" label="原因" min-width="140" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ row.created_at }}</template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.page_size"
        :total="total"
        layout="total, prev, pager, next"
        style="justify-content: flex-end; margin-top: 12px"
        @current-change="load"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getAuditLogs } from '@/api/audit'
import type { AuditLog } from '@/types'

const list = ref<AuditLog[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ page: 1, page_size: 20, module: '', keyword: '' })
const modules = ['营销活动', '风控安全', '权限审计', '用户管理', '实名认证', '藏品管理', '订单管理', '寄售市场', '内容管理', '系统配置', '平台运维']

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getAuditLogs({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function search(): void {
  query.page = 1
  load()
}

function reset(): void {
  query.module = ''
  query.keyword = ''
  query.page = 1
  load()
}
</script>
