<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">资金对账</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="平台资金日对账：核对当日充值、消费、退款、手续费及余额变化，确保资金流水与平台数据一致。对账不平的记录将标记差异并进入人工复核。"
      />
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="date" label="对账日期" width="130" />
        <el-table-column label="充值(元)" width="120" align="right">
          <template #default="{ row }">{{ row.recharge_total }}</template>
        </el-table-column>
        <el-table-column label="消费(元)" width="120" align="right">
          <template #default="{ row }">{{ row.consume_total }}</template>
        </el-table-column>
        <el-table-column label="退款(元)" width="120" align="right">
          <template #default="{ row }">{{ row.refund_total }}</template>
        </el-table-column>
        <el-table-column label="手续费(元)" width="120" align="right">
          <template #default="{ row }">{{ row.fee_total }}</template>
        </el-table-column>
        <el-table-column label="期末余额(元)" width="130" align="right">
          <template #default="{ row }">{{ row.balance_total }}</template>
        </el-table-column>
        <el-table-column label="差异" width="120" align="right">
          <template #default="{ row }">
            <span :class="row.diff !== '0.00' ? 'text-danger' : 'text-success'">{{ row.diff }}</span>
          </template>
        </el-table-column>
        <el-table-column label="对账结果" width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === 'balanced' ? 'success' : 'danger'" size="small">{{ row.status === 'balanced' ? '账实相符' : '对账不平' }}</el-tag>
          </template>
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
import { getFundAudit, type FundAudit } from '@/api/wallet'

const list = ref<FundAudit[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ page: 1, page_size: 20 })

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getFundAudit({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}
</script>
