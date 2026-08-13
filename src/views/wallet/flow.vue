<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">钱包流水</div>
      </div>
      <div class="filter-bar">
        <el-select v-model="query.type" placeholder="流水类型" clearable style="width: 180px">
          <el-option v-for="(text, key) in typeText" :key="key" :label="text" :value="key" />
        </el-select>
        <el-button type="primary" @click="load">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="nickname" label="用户" min-width="120" show-overflow-tooltip />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="typeTag[row.type]" size="small">{{ row.type_text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额(元)" width="120" align="right">
          <template #default="{ row }">
            <span :class="row.type === 'consume' || row.type === 'transfer_out' || row.type === 'fee' ? 'text-danger' : 'text-success'">
              {{ row.type === 'consume' || row.type === 'transfer_out' || row.type === 'fee' ? '-' : '+' }}{{ row.amount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="变动后余额" width="120" align="right">
          <template #default="{ row }">{{ row.balance_after }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
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
import { getWalletFlowList, type WalletFlow } from '@/api/wallet'

const list = ref<WalletFlow[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ page: 1, page_size: 20, type: '' })

const typeText: Record<string, string> = {
  recharge: '充值',
  consume: '购买消费',
  refund: '退款',
  transfer_in: '转入',
  transfer_out: '转出',
  fee: '手续费',
  withdraw: '提现'
}
const typeTag: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'primary'> = {
  recharge: 'success',
  consume: 'danger',
  refund: 'warning',
  transfer_in: 'success',
  transfer_out: 'danger',
  fee: 'info',
  withdraw: 'primary'
}

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getWalletFlowList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function reset(): void {
  query.type = ''
  query.page = 1
  load()
}
</script>
