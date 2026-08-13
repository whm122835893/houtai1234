<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">单品寄售开关</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="每个藏品拥有独立寄售开关，与全局市场开关、转赠开关完全隔离。关闭后该藏品全部在售挂单自动下架，用户无法重新上架该藏品。关闭操作需二次确认 + 管理员密码验证并记录审计日志。"
      />
      <el-table :data="switchList" v-loading="loadingSwitch" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="藏品名称" min-width="200" show-overflow-tooltip />
        <el-table-column label="流通量" width="90" align="center">
          <template #default="{ row }">{{ row.circulation }}</template>
        </el-table-column>
        <el-table-column label="在售挂单" width="100" align="center">
          <template #default="{ row }">{{ row.consign_enabled ? '—' : '已全部下架' }}</template>
        </el-table-column>
        <el-table-column label="寄售开关" width="140">
          <template #default="{ row }">
            <el-switch
              :model-value="row.consign_enabled"
              inline-prompt
              active-text="开"
              inactive-text="关"
              @change="(val: string | number | boolean) => toggleConsign(row, Boolean(val))"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="app-card">
      <div class="card-header">
        <div class="card-title">在售挂单</div>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="order_no" label="挂单号" width="150" />
        <el-table-column prop="collectible_name" label="藏品" min-width="190" show-overflow-tooltip />
        <el-table-column label="卖家" min-width="130">
          <template #default="{ row }">{{ row.seller_nickname }}</template>
        </el-table-column>
        <el-table-column label="价格" width="110" align="right">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column label="上架时间" width="160">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="offOrder(row)">下架</el-button>
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

    <!-- 关闭寄售确认 -->
    <RiskConfirm
      ref="consignRef"
      title="关闭寄售开关"
      description="关闭后该藏品全部在售挂单将自动下架，用户无法重新上架该藏品。"
      :need-reason="true"
      :need-password="true"
      :submit="onToggleConsign"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import RiskConfirm, { type RiskConfirmPayload } from '@/components/RiskConfirm.vue'
import { getOnSaleList, offMarketOrder, type MarketOrder } from '@/api/market'
import { getCollectibleList, updateConsignSwitch, type CollectibleItem } from '@/api/collectible'
import { formatDate } from '@/utils/date'

const switchList = ref<CollectibleItem[]>([])
const loadingSwitch = ref(false)
const list = ref<MarketOrder[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ page: 1, page_size: 20 })

const consignRef = ref<InstanceType<typeof RiskConfirm>>()
let targetCollectible: CollectibleItem | null = null
let targetEnabled = false

onMounted(async () => {
  load()
  loadSwitches()
})

async function loadSwitches(): Promise<void> {
  loadingSwitch.value = true
  try {
    const res = await getCollectibleList({ page: 1, page_size: 200 })
    switchList.value = res.list.filter((c) => c.circulation > 0)
  } finally {
    loadingSwitch.value = false
  }
}

async function load(page = query.page): Promise<void> {
  query.page = page
  loading.value = true
  try {
    const res = await getOnSaleList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function toggleConsign(row: CollectibleItem, val: boolean): void {
  if (val) {
    // 开启寄售无需二次确认
    updateConsignSwitch(row.id, true, '', '开启寄售').then(() => {
      row.consign_enabled = true
      ElMessage.success('寄售开关已开启')
    })
    return
  }
  targetCollectible = row
  targetEnabled = false
  consignRef.value?.open()
}

async function onToggleConsign(payload: RiskConfirmPayload): Promise<void> {
  if (!targetCollectible) return
  const result = await updateConsignSwitch(targetCollectible.id, targetEnabled, payload.password, payload.reason)
  targetCollectible.consign_enabled = false
  ElMessage.success(`寄售已关闭${result.auto_off > 0 ? `，自动下架 ${result.auto_off} 个挂单` : ''}`)
  load()
}

async function offOrder(row: MarketOrder): Promise<void> {
  await ElMessageBox.confirm(`确定下架挂单 ${row.order_no} 吗？`, '下架挂单', { type: 'warning' })
  await offMarketOrder(row.id, '后台手动下架')
  ElMessage.success('挂单已下架')
  load()
}
</script>
