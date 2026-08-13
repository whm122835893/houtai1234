<template>
  <div class="app-page">
    <div class="app-card">
      <div class="search-card">
        <el-input
          v-model="query.keyword"
          placeholder="藏品名称 / 发行方"
          clearable
          style="width: 220px"
          @keyup.enter="load(1)"
        />
        <el-select v-model="query.status" placeholder="发售状态" clearable style="width: 150px">
          <el-option v-for="(text, key) in statusText" :key="key" :label="text" :value="key" />
        </el-select>
        <el-button type="primary" @click="load(1)">搜索</el-button>
        <el-button @click="reset">重置</el-button>
        <div style="flex: 1" />
        <el-button v-permission="['collectible:create']" type="primary" @click="router.push('/collectible/create')">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          创建藏品
        </el-button>
      </div>
    </div>

    <div class="app-card">
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="藏品名称" min-width="190" fixed="left" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="90" />
        <el-table-column label="发行量" width="90" align="center">
          <template #default="{ row }">{{ row.total_supply }}</template>
        </el-table-column>
        <el-table-column label="流通量" width="90" align="center">
          <template #default="{ row }">{{ row.circulation }}</template>
        </el-table-column>
        <el-table-column label="库存池" width="90" align="center">
          <template #default="{ row }">
            <el-text :type="row.stock_pool === 0 ? 'danger' : row.stock_pool < 100 ? 'warning' : 'success'">
              {{ row.stock_pool }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="已配置配额" width="100" align="center">
          <template #default="{ row }">{{ row.configured_quota }}</template>
        </el-table-column>
        <el-table-column label="发售剩余" width="90" align="center">
          <template #default="{ row }">
            <span v-if="row.sale_quantity > 0">{{ row.sale_remaining }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="90" align="right">
          <template #default="{ row }">{{ row.sale_quantity > 0 ? `¥${row.price}` : '-' }}</template>
        </el-table-column>
        <el-table-column label="发售状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag[row.status as CollectibleStatus]" size="small" effect="light">{{ statusText[row.status as CollectibleStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="资格购" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.qualification_enabled" type="primary" size="small" effect="plain">已开启</el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="转赠" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.transfer_enabled ? 'success' : 'info'" size="small" effect="plain">
              {{ row.transfer_enabled ? '开' : '关' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="寄售" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.consign_enabled ? 'success' : 'info'" size="small" effect="plain">
              {{ row.consign_enabled ? '开' : '关' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="330" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openStock(row)">库存概况</el-button>
            <el-button v-if="row.status === 'draft'" v-permission="['collectible:create']" type="primary" link @click="router.push(`/collectible/create?id=${row.id}`)">编辑</el-button>
            <el-button v-if="canSale(row)" v-permission="['collectible:sale']" type="success" link @click="router.push(`/collectible/sale?id=${row.id}`)">
              {{ row.status === 'on_sale' ? '发售配置' : '配置发售' }}
            </el-button>
            <el-button v-if="row.status === 'on_sale'" v-permission="['collectible:sale']" type="warning" link @click="handleForceSellOut(row)">强制售罄</el-button>
            <el-button v-if="row.status === 'on_sale'" v-permission="['collectible:sale']" type="info" link @click="offShelf(row)">下架</el-button>
            <el-button v-if="row.status === 'draft'" v-permission="['collectible:delete']" type="danger" link @click="removeCollectible(row)">删除</el-button>
            <el-button v-permission="['collectible:destroy']" type="danger" link @click="destroyStock(row)">销毁</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.page_size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="load()"
          @size-change="load(1)"
        />
      </div>
    </div>

    <!-- 库存概况弹窗 -->
    <el-dialog v-model="stockVisible" title="库存概况" :width="appStore.mobile ? '100%' : '560px'" append-to-body>
      <template v-if="currentStock">
        <div class="stock-alert">
          <el-alert type="info" :closable="false" show-icon :title="stockFormula" />
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="发行总量">{{ currentStock.total_supply }}</el-descriptions-item>
          <el-descriptions-item label="流通量">{{ currentStock.circulation }}</el-descriptions-item>
          <el-descriptions-item label="已售出发售">{{ currentStock.sold_sale }}</el-descriptions-item>
          <el-descriptions-item label="已独立空投">{{ currentStock.airdropped }}</el-descriptions-item>
          <el-descriptions-item label="已配置配额">{{ currentStock.configured_quota }}</el-descriptions-item>
          <el-descriptions-item label="已销毁">{{ currentStock.destroyed }}</el-descriptions-item>
          <el-descriptions-item label="发售数量">{{ currentStock.sale_quantity }}</el-descriptions-item>
          <el-descriptions-item label="发售已售">{{ currentStock.sale_sold }}</el-descriptions-item>
          <el-descriptions-item label="发售剩余">{{ currentStock.sale_remaining }}</el-descriptions-item>
          <el-descriptions-item label="库存池（自由库存）">
            <el-text :type="currentStock.stock_pool === 0 ? 'danger' : 'success'" size="large">
              {{ currentStock.stock_pool }}
            </el-text>
          </el-descriptions-item>
        </el-descriptions>
        <el-divider>可执行操作</el-divider>
        <div class="stock-actions">
          <el-button v-permission="['collectible:sale']" @click="goAction(`/collectible/sale?id=${currentStock.id}`)">发售配置 / 重新上架</el-button>
          <el-button v-permission="['collectible:quota']" @click="goAction(`/collectible/quota?id=${currentStock.id}`)">配额配置</el-button>
          <el-button v-permission="['collectible:airdrop']" @click="goAction(`/collectible/airdrop?id=${currentStock.id}`)">独立空投</el-button>
          <el-button v-permission="['collectible:destroy']" type="danger" @click="destroyStock(currentStock)">销毁库存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 强制售罄 / 删除 -->
    <RiskConfirm
      ref="riskRef"
      title="确认执行"
      :need-reason="true"
      :need-password="true"
      :submit="onRisk"
    />

    <!-- 销毁库存 -->
    <RiskConfirm
      ref="destroyRef"
      title="销毁库存"
      description="销毁后库存池扣减、已销毁增加，操作不可逆。仅可销毁库存池（自由库存），不可销毁已配置的配额预留库存。"
      :need-reason="true"
      :need-password="true"
      :need-quantity="true"
      :max-quantity="destroyMax"
      :submit="onDestroy"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import RiskConfirm, { type RiskConfirmPayload } from '@/components/RiskConfirm.vue'
import { getCollectibleList, forceSellOut, takeOffShelf, deleteCollectible, destroyStock as destroyStockApi, type CollectibleItem } from '@/api/collectible'
import { COLLECTIBLE_STATUS_TEXT, type CollectibleStatus } from '@/types'
import { useAppStore } from '@/store/app'

const router = useRouter()
const appStore = useAppStore()
const list = ref<CollectibleItem[]>([])
const total = ref(0)
const loading = ref(false)

const query = reactive({ page: 1, page_size: 20, keyword: '', status: '' })
const statusText = COLLECTIBLE_STATUS_TEXT
const statusTag: Record<CollectibleStatus, 'info' | 'success' | 'danger' | 'warning' | 'primary'> = {
  draft: 'info',
  on_sale: 'success',
  sold_out: 'danger',
  off_shelf: 'warning',
  deleted: 'info'
}

const riskRef = ref<InstanceType<typeof RiskConfirm>>()
const destroyRef = ref<InstanceType<typeof RiskConfirm>>()
let riskAction: 'sellout' | 'delete' = 'sellout'
let currentRow: CollectibleItem | null = null
let destroyTarget: CollectibleItem | null = null
const destroyMax = ref(0)

const stockVisible = ref(false)
const currentStock = ref<CollectibleItem | null>(null)
const stockFormula = ref('')

async function load(page = query.page): Promise<void> {
  query.page = page
  loading.value = true
  try {
    const res = await getCollectibleList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function reset(): void {
  query.keyword = ''
  query.status = ''
  load(1)
}

function canSale(row: CollectibleItem): boolean {
  return row.status === 'draft' || row.status === 'on_sale' || row.status === 'sold_out' || row.status === 'off_shelf'
}

function openStock(row: CollectibleItem): void {
  currentStock.value = row
  stockFormula.value = `库存池 = 发行总量(${row.total_supply}) - 已配置配额(${row.configured_quota}) - 已售出发售(${row.sold_sale}) - 已独立空投(${row.airdropped}) - 已销毁(${row.destroyed})`
  stockVisible.value = true
}

function goAction(path: string): void {
  stockVisible.value = false
  router.push(path)
}

function handleForceSellOut(row: CollectibleItem): void {
  currentRow = row
  riskAction = 'sellout'
  riskRef.value?.open()
}

async function onRisk(payload: RiskConfirmPayload): Promise<void> {
  if (!currentRow) return
  if (riskAction === 'sellout') {
    await forceSellOut(currentRow.id, payload.reason, payload.password)
    ElMessage.success('已强制售罄，未售出剩余保留在库存池')
  } else if (riskAction === 'delete') {
    await deleteCollectible(currentRow.id, payload.password)
    ElMessage.success('藏品已删除')
  }
  load()
}

async function offShelf(row: CollectibleItem): Promise<void> {
  const { value } = await ElMessageBox.prompt('请输入下架原因', '手动下架', { inputPlaceholder: '下架原因' })
  await takeOffShelf(row.id, value)
  ElMessage.success('已下架')
  load()
}

function removeCollectible(row: CollectibleItem): void {
  currentRow = row
  riskAction = 'delete'
  riskRef.value?.open()
}

function destroyStock(row: CollectibleItem): void {
  destroyTarget = row
  destroyMax.value = row.stock_pool
  destroyRef.value?.open()
}

async function onDestroy(payload: RiskConfirmPayload): Promise<void> {
  if (!destroyTarget) return
  await destroyStockApi(destroyTarget.id, payload.quantity, payload.reason, payload.password)
  ElMessage.success(`已销毁 ${payload.quantity} 份库存`)
  stockVisible.value = false
  load()
}

onMounted(() => load())
</script>

<style lang="scss" scoped>
.stock-alert {
  margin-bottom: 16px;
}

.stock-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
