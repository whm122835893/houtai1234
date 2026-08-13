<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">成交记录</div>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="order_no" label="成交单号" width="170" />
        <el-table-column prop="collectible_name" label="藏品" min-width="190" show-overflow-tooltip />
        <el-table-column label="卖家" min-width="130">
          <template #default="{ row }">{{ row.seller_nickname }}</template>
        </el-table-column>
        <el-table-column label="买家" min-width="130">
          <template #default="{ row }">{{ row.buyer_nickname }}</template>
        </el-table-column>
        <el-table-column label="成交价" width="110" align="right">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column label="手续费率" width="90" align="center">
          <template #default="{ row }">{{ row.fee_rate }}%</template>
        </el-table-column>
        <el-table-column label="成交时间" width="160">
          <template #default="{ row }">{{ formatDate(row.dealt_at) }}</template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.page_size"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="load()"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getDealList, type MarketOrder } from '@/api/market'
import { formatDate } from '@/utils/date'

const list = ref<MarketOrder[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ page: 1, page_size: 20 })

async function load(page = query.page): Promise<void> {
  query.page = page
  loading.value = true
  try {
    const res = await getDealList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>
