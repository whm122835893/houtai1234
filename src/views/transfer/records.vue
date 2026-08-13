<template>
  <div class="app-page">
    <div class="app-card">
      <div class="search-card">
        <el-select v-model="query.status" placeholder="转赠状态" clearable style="width: 150px">
          <el-option label="待确认" value="pending" />
          <el-option label="已完成" value="completed" />
          <el-option label="已撤销" value="revoked" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-button type="primary" @click="load(1)">搜索</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </div>

    <div class="app-card">
      <div class="card-header">
        <div class="card-title">转赠统计</div>
      </div>
      <el-row :gutter="16">
        <el-col :xs="12" :md="6" v-for="s in statItems" :key="s.label">
          <div class="stat-item">
            <div class="s-value">{{ s.value }}</div>
            <div class="s-label">{{ s.label }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="app-card">
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="transfer_no" label="转赠单号" width="150" />
        <el-table-column prop="collectible_name" label="藏品" min-width="190" show-overflow-tooltip />
        <el-table-column label="转出方" min-width="130">
          <template #default="{ row }">{{ row.from_nickname }}</template>
        </el-table-column>
        <el-table-column label="接收方" min-width="130">
          <template #default="{ row }">{{ row.to_nickname }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag[row.status]" size="small">{{ statusText[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发起时间" width="160">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="完成时间" width="160">
          <template #default="{ row }">{{ formatDate(row.completed_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'completed'" v-permission="['transfer:revoke']" type="danger" link @click="revoke(row)">
              撤销转赠
            </el-button>
          </template>
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

    <!-- 撤销转赠 -->
    <RiskConfirm
      ref="revokeRef"
      title="撤销转赠"
      description="仅「已完成」转赠可撤销，操作前将校验接收方当前是否仍持有该藏品；若已再次转赠/寄售/合成/消耗将被拦截。"
      :need-reason="true"
      :need-password="true"
      :submit="onRevoke"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import RiskConfirm, { type RiskConfirmPayload } from '@/components/RiskConfirm.vue'
import { getTransferList, getTransferStats, revokeTransfer, type TransferRecord, type TransferStats } from '@/api/transfer'
import { formatDate } from '@/utils/date'

const list = ref<TransferRecord[]>([])
const total = ref(0)
const loading = ref(false)
const stats = ref<TransferStats | null>(null)
const query = reactive({ page: 1, page_size: 20, status: '' })

const revokeRef = ref<InstanceType<typeof RiskConfirm>>()
let target: TransferRecord | null = null

const statusText: Record<string, string> = { pending: '待确认', completed: '已完成', cancelled: '已取消', revoked: '已撤销' }
const statusTag: Record<string, 'warning' | 'success' | 'info' | 'danger'> = { pending: 'warning', completed: 'success', cancelled: 'info', revoked: 'danger' }

const statItems = computed(() => [
  { label: '转赠总数', value: stats.value?.total_count ?? '-' },
  { label: '已完成', value: stats.value?.completed_count ?? '-' },
  { label: '今日转赠', value: stats.value?.today_count ?? '-' },
  { label: '今日完成', value: stats.value?.today_completed ?? '-' }
])

async function load(page = query.page): Promise<void> {
  query.page = page
  loading.value = true
  try {
    const res = await getTransferList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function reset(): void {
  query.status = ''
  load(1)
}

function revoke(row: TransferRecord): void {
  target = row
  revokeRef.value?.open()
}

async function onRevoke(payload: RiskConfirmPayload): Promise<void> {
  if (!target) return
  await revokeTransfer(target.id, payload.reason, payload.password)
  ElMessage.success('转赠已撤销，藏品归还转出方')
  load()
}

onMounted(async () => {
  load()
  stats.value = await getTransferStats()
})
</script>

<style lang="scss" scoped>
.stat-item {
  background: $bg-page;
  border-radius: 8px;
  padding: 16px;
  text-align: center;

  .s-value {
    font-size: 22px;
    font-weight: 700;
    color: $text-primary;
  }

  .s-label {
    font-size: 12px;
    color: $text-secondary;
    margin-top: 6px;
  }
}
</style>
