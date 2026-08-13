<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">风控告警</div>
      </div>
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        class="mb-16"
        title="系统实时监测设备指纹、IP、交易、登录、充值等维度的异常行为并产生告警。告警需及时处理，处理/忽略操作将计入审计日志。"
      />
      <div class="filter-bar">
        <el-select v-model="query.status" placeholder="处理状态" clearable style="width: 160px" @change="load">
          <el-option label="待处理" value="pending" />
          <el-option label="已处理" value="processed" />
          <el-option label="已忽略" value="ignored" />
        </el-select>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ typeText[row.type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="90">
          <template #default="{ row }">
            <el-tag :type="levelTag[row.level]" size="small">{{ levelText[row.level] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="告警标题" min-width="170" show-overflow-tooltip />
        <el-table-column prop="content" label="告警内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="nickname" label="关联用户" width="120">
          <template #default="{ row }">{{ row.nickname || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag[row.status]" size="small">{{ statusText[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ row.created_at }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button type="success" link @click="handle(row, 'processed')">处理</el-button>
              <el-button type="info" link @click="handle(row, 'ignored')">忽略</el-button>
            </template>
            <span v-else class="text-muted" style="font-size: 12px">已处理</span>
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
import { ElMessage } from 'element-plus'
import { getRiskAlarms, handleAlarm, type RiskAlarm } from '@/api/security'

const list = ref<RiskAlarm[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ page: 1, page_size: 20, status: '' })

const typeText: Record<string, string> = { device: '设备', ip: 'IP', trade: '交易', login: '登录', recharge: '充值' }
const levelText: Record<string, string> = { low: '低危', medium: '中危', high: '高危' }
const levelTag: Record<string, 'info' | 'warning' | 'danger'> = { low: 'info', medium: 'warning', high: 'danger' }
const statusText: Record<string, string> = { pending: '待处理', processed: '已处理', ignored: '已忽略' }
const statusTag: Record<string, 'warning' | 'success' | 'info'> = { pending: 'warning', processed: 'success', ignored: 'info' }

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getRiskAlarms({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function handle(row: RiskAlarm, action: 'processed' | 'ignored'): Promise<void> {
  await handleAlarm(row.id, action)
  ElMessage.success(action === 'processed' ? '已处理' : '已忽略')
  await load()
}
</script>
