<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">充值记录</div>
      </div>
      <div class="filter-bar">
        <el-select v-model="query.status" placeholder="充值状态" clearable style="width: 160px">
          <el-option label="待支付" value="pending" />
          <el-option label="充值成功" value="success" />
          <el-option label="充值失败" value="failed" />
        </el-select>
        <el-button type="primary" @click="load">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="order_no" label="充值单号" min-width="150" />
        <el-table-column prop="nickname" label="用户" min-width="120" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="channel" label="渠道" width="110" />
        <el-table-column label="金额(元)" width="110" align="right">
          <template #default="{ row }">{{ row.amount }}</template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTag[row.status]" size="small">{{ statusText[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ row.created_at }}</template>
        </el-table-column>
        <el-table-column label="支付时间" width="170">
          <template #default="{ row }">{{ row.paid_at || '-' }}</template>
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
import { getRechargeList, type RechargeRecord } from '@/api/wallet'

const list = ref<RechargeRecord[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ page: 1, page_size: 20, status: '' })

const statusText: Record<string, string> = { pending: '待支付', success: '充值成功', failed: '充值失败' }
const statusTag: Record<string, 'warning' | 'success' | 'danger'> = { pending: 'warning', success: 'success', failed: 'danger' }

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getRechargeList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function reset(): void {
  query.status = ''
  query.page = 1
  load()
}
</script>
