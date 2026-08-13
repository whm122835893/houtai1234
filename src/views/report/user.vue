<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">用户报表</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="按日统计新增用户、活跃用户等用户运营核心指标。"
      />
      <div class="filter-bar">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 280px"
        />
        <el-button type="primary" @click="load">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="新增用户" width="110" align="right">
          <template #default="{ row }">{{ row.new_users }}</template>
        </el-table-column>
        <el-table-column label="活跃用户" width="110" align="right">
          <template #default="{ row }">{{ row.active_users }}</template>
        </el-table-column>
        <el-table-column label="下单用户" width="110" align="right">
          <template #default="{ row }">{{ row.orders }}</template>
        </el-table-column>
        <el-table-column label="新增转化率" width="120" align="right">
          <template #default="{ row }">{{ conversion(row) }}</template>
        </el-table-column>
        <el-table-column label="次日活跃率" width="120" align="right">
          <template #default="{ row }">{{ activeRate(row) }}</template>
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
import { getReportData, type ReportRow } from '@/api/report'

const list = ref<ReportRow[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ page: 1, page_size: 20, start: '', end: '' })
const dateRange = ref<[string, string]>()

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    if (dateRange.value) {
      query.start = dateRange.value[0]
      query.end = dateRange.value[1]
    }
    const res = await getReportData({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function reset(): void {
  dateRange.value = undefined
  query.start = ''
  query.end = ''
  query.page = 1
  load()
}

function conversion(row: ReportRow): string {
  if (!row.new_users) return '0.00%'
  return `${((row.orders / row.new_users) * 100).toFixed(2)}%`
}

function activeRate(row: ReportRow): string {
  if (!row.active_users) return '0.00%'
  return `${((row.new_users / row.active_users) * 100).toFixed(2)}%`
}
</script>
