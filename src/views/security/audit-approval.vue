<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">异常交易审批</div>
      </div>
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        class="mb-16"
        title="命中风控规则（高频交易、异常IP、大额异动等）的交易单进入审批队列。审批通过/驳回属于高风险操作，需要验证管理员密码并写入审计日志。"
      />
      <div class="filter-bar">
        <el-select v-model="query.status" placeholder="审批状态" clearable style="width: 160px" @change="load">
          <el-option label="待审批" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已驳回" value="rejected" />
        </el-select>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="order_no" label="订单号" min-width="140" />
        <el-table-column prop="nickname" label="用户" min-width="110" show-overflow-tooltip />
        <el-table-column prop="collectible_name" label="藏品" min-width="140" show-overflow-tooltip />
        <el-table-column label="金额(元)" width="110" align="right">
          <template #default="{ row }">{{ row.amount }}</template>
        </el-table-column>
        <el-table-column prop="reason" label="风控原因" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag[row.status]" size="small">{{ statusText[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="170">
          <template #default="{ row }">{{ row.applied_at }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button type="success" link @click="handle(row, true)">通过</el-button>
              <el-button type="danger" link @click="handle(row, false)">驳回</el-button>
            </template>
            <span v-else class="text-muted" style="font-size: 12px">{{ row.handled_at }}</span>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTradeApprovals, approveTrade, type TradeApproval } from '@/api/security'

const list = ref<TradeApproval[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ page: 1, page_size: 20, status: '' })

const statusText: Record<string, string> = { pending: '待审批', approved: '已通过', rejected: '已驳回' }
const statusTag: Record<string, 'warning' | 'success' | 'danger'> = { pending: 'warning', approved: 'success', rejected: 'danger' }

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getTradeApprovals({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function handle(row: TradeApproval, approve: boolean): Promise<void> {
  const { value: password } = await ElMessageBox.prompt(
    `请确认${approve ? '通过' : '驳回'}订单 ${row.order_no}，并输入管理员登录密码`,
    approve ? '审批通过' : '审批驳回',
    {
      inputType: 'password',
      inputPlaceholder: '管理员密码',
      inputValidator: (val: string) => (val ? true : '请输入密码')
    }
  )
  await approveTrade(row.id, approve, password)
  ElMessage.success(approve ? '已通过' : '已驳回')
  await load()
}
</script>
