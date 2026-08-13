<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">平台手续费</div>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="channel" label="渠道" min-width="120" />
        <el-table-column prop="date" label="日期" min-width="130" />
        <el-table-column label="交易总额(元)" width="140" align="right">
          <template #default="{ row }">{{ row.total_amount }}</template>
        </el-table-column>
        <el-table-column label="手续费(元)" width="140" align="right">
          <template #default="{ row }">
            <span class="text-danger">{{ row.fee_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="手续费占比" width="110" align="right">
          <template #default="{ row }">{{ feeRate(row) }}</template>
        </el-table-column>
        <el-table-column prop="order_count" label="订单数" width="100" align="right" />
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
import { getFeeStats, type FeeStat } from '@/api/wallet'

const list = ref<FeeStat[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ page: 1, page_size: 20 })

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getFeeStats({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function feeRate(row: FeeStat): string {
  const total = Number(row.total_amount)
  if (!total) return '0.00%'
  return `${((Number(row.fee_amount) / total) * 100).toFixed(2)}%`
}
</script>
