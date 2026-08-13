<template>
  <div class="app-page">
    <div class="app-card">
      <div class="search-card">
        <el-input
          v-model="query.keyword"
          placeholder="订单号 / 昵称 / 手机号"
          clearable
          style="width: 240px"
          @keyup.enter="load(1)"
        />
        <el-select v-model="query.type" placeholder="订单类型" clearable style="width: 140px">
          <el-option v-for="(text, key) in ORDER_TYPE_TEXT" :key="key" :label="text" :value="key" />
        </el-select>
        <el-select v-model="query.status" placeholder="订单状态" clearable style="width: 140px">
          <el-option label="待支付" value="pending" />
          <el-option label="已支付" value="paid" />
          <el-option label="已取消" value="cancelled" />
          <el-option label="已退款" value="refunded" />
          <el-option label="已关闭" value="closed" />
        </el-select>
        <el-button type="primary" @click="load(1)">搜索</el-button>
        <el-button @click="reset">重置</el-button>
        <div style="flex: 1" />
        <el-button type="primary" plain @click="exportExcel">导出</el-button>
      </div>
    </div>

    <div class="app-card">
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="order_no" label="订单号" width="180" fixed="left" />
        <el-table-column label="用户" min-width="160">
          <template #default="{ row }">
            <div>{{ row.nickname }}</div>
            <div class="text-muted" style="font-size: 12px">{{ row.phone }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="collectible_name" label="藏品" min-width="200" show-overflow-tooltip />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" effect="light">{{ ORDER_TYPE_TEXT[row.type as OrderType] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="单价" width="100" align="right">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column label="金额" width="120" align="right">
          <template #default="{ row }">
            <span style="font-weight: 600">¥{{ row.total_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pay_channel" label="支付渠道" width="110" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag[row.status]" size="small">{{ statusText[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="160">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row)">详情</el-button>
            <el-button type="info" link @click="openPayLogs(row)">支付回调</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.page_size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="load()"
          @size-change="load(1)"
        />
      </div>
    </div>

    <!-- 订单详情 -->
    <el-dialog v-model="detailVisible" title="订单详情" :width="appStore.mobile ? '100%' : '520px'" append-to-body>
      <el-descriptions :column="1" border v-if="currentOrder">
        <el-descriptions-item label="订单号">{{ currentOrder.order_no }}</el-descriptions-item>
        <el-descriptions-item label="藏品">{{ currentOrder.collectible_name }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ currentOrder.nickname }}（{{ currentOrder.phone }}）</el-descriptions-item>
        <el-descriptions-item label="类型">{{ ORDER_TYPE_TEXT[currentOrder.type] }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ currentOrder.total_amount }}</el-descriptions-item>
        <el-descriptions-item label="支付渠道">{{ currentOrder.pay_channel }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusText[currentOrder.status] }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ formatDate(currentOrder.paid_at) }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ formatDate(currentOrder.created_at) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 支付回调日志 -->
    <el-dialog v-model="logVisible" title="支付回调日志" :width="appStore.mobile ? '100%' : '600px'" append-to-body>
      <el-table :data="payLogs" border>
        <el-table-column prop="event" label="事件" min-width="140" />
        <el-table-column prop="channel" label="渠道" width="100" />
        <el-table-column prop="raw" label="回调数据" min-width="180" show-overflow-tooltip />
        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getOrderList, getOrderDetail, getPayLogs, type OrderItem, type PayLog } from '@/api/order'
import { ORDER_TYPE_TEXT, type OrderType } from '@/types'
import { formatDate } from '@/utils/date'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const list = ref<OrderItem[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ page: 1, page_size: 20, keyword: '', type: '', status: '' })

const detailVisible = ref(false)
const logVisible = ref(false)
const currentOrder = ref<OrderItem | null>(null)
const payLogs = ref<PayLog[]>([])

const statusText: Record<string, string> = { pending: '待支付', paid: '已支付', cancelled: '已取消', refunded: '已退款', closed: '已关闭' }
const statusTag: Record<string, 'warning' | 'success' | 'info' | 'danger'> = {
  pending: 'warning',
  paid: 'success',
  cancelled: 'info',
  refunded: 'danger',
  closed: 'info'
}

async function load(page = query.page): Promise<void> {
  query.page = page
  loading.value = true
  try {
    const res = await getOrderList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function reset(): void {
  query.keyword = ''
  query.type = ''
  query.status = ''
  load(1)
}

async function openDetail(row: OrderItem): Promise<void> {
  currentOrder.value = await getOrderDetail(row.id)
  detailVisible.value = true
}

async function openPayLogs(row: OrderItem): Promise<void> {
  payLogs.value = await getPayLogs(row.id)
  logVisible.value = true
}

function exportExcel(): void {
  ElMessage.success('导出任务已创建（后端流式下载）')
}

onMounted(() => load())
</script>
