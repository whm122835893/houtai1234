<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">盲盒活动</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="盲盒按份销售，开启后从奖品池按概率随机产出藏品。各藏品概率总和必须 ≤ 100%，超出拦截；开盒采用预生成随机数 + 藏品库存实时校验双保险，库存不足自动降级为空盒并记录异常日志。"
      />
      <div class="table-toolbar">
        <el-button type="primary" @click="openEdit()">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          创建盲盒
        </el-button>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="盲盒名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="售价(元)" width="110" align="right">
          <template #default="{ row }">{{ row.price }}</template>
        </el-table-column>
        <el-table-column label="发行总量" width="90" align="right">
          <template #default="{ row }">{{ row.total_supply }}</template>
        </el-table-column>
        <el-table-column label="已售" width="80" align="right">
          <template #default="{ row }">{{ row.sold_count }}</template>
        </el-table-column>
        <el-table-column label="奖品池" min-width="240">
          <template #default="{ row }">
            <div class="rules">
              <el-tag v-for="(p, i) in row.prizes" :key="i" size="small" effect="plain" class="rule-tag">
                {{ p.collectible_name }} {{ p.probability }}%
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">{{ row.status === 'active' ? '在售' : '停售' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">配置</el-button>
            <el-button type="info" link @click="openRecords(row)">开盒记录</el-button>
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

    <!-- 配置盲盒 -->
    <el-dialog v-model="dialogVisible" :title="`${editForm.id ? '配置' : '创建'}盲盒`" :width="appStore.mobile ? '100%' : '760px'" append-to-body destroy-on-close>
      <el-form label-width="110px">
        <el-form-item label="盲盒名称" required>
          <el-input v-model="editForm.name" placeholder="如：幸运福袋盲盒" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :xs="24" :md="8">
            <el-form-item label="售价(元)" required>
              <el-input-number v-model="editForm.price" :min="0.01" :precision="2" :step="1" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="8">
            <el-form-item label="发行总量" required>
              <el-input-number v-model="editForm.total_supply" :min="1" :max="999999" :precision="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="8">
            <el-form-item label="盲盒状态">
              <el-radio-group v-model="editForm.status">
                <el-radio value="active">在售</el-radio>
                <el-radio value="disabled">停售</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">奖品池（概率总和校验）</el-divider>
        <el-table :data="editForm.prizes" border>
          <el-table-column label="藏品" min-width="160">
            <template #default="{ row }">
              <el-select v-model="row.collectible_id" filterable placeholder="选择藏品" style="width: 100%" @change="(id: number) => onCollectibleChange(row, id)">
                <el-option v-for="c in collectibles" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="概率(%)" width="190">
            <template #default="{ row }">
              <el-input-number v-model="row.probability" :min="0.0001" :max="100" :precision="4" :step="0.1" controls-position="right" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="投放数量" width="150">
            <template #default="{ row }">
              <el-input-number v-model="row.quantity" :min="1" :max="99999" :precision="0" controls-position="right" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-button type="danger" link @click="editForm.prizes.splice(editForm.prizes.indexOf(row), 1)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="prob-summary mt-8">
          <el-tag :type="probabilityStatus.type" size="small">{{ probabilityStatus.text }}</el-tag>
        </div>
        <div class="table-toolbar mt-8">
          <el-button @click="addPrize">
            <el-icon style="margin-right: 4px"><Plus /></el-icon>
            添加奖品
          </el-button>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <!-- 开盒记录 -->
    <el-dialog v-model="recordsVisible" :title="`开盒记录 · ${recordsBox?.name}`" :width="appStore.mobile ? '100%' : '760px'" append-to-body>
      <el-table :data="records" v-loading="recordsLoading" border height="420">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="user_id" label="用户ID" width="100" />
        <el-table-column prop="nickname" label="用户" min-width="140" />
        <el-table-column prop="collectible_name" label="产出藏品" min-width="180" />
        <el-table-column prop="serial_no" label="编号" min-width="110" />
        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ row.created_at }}</template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="recordQuery.page"
        v-model:page-size="recordQuery.page_size"
        :total="recordTotal"
        layout="total, prev, pager, next"
        style="justify-content: flex-end; margin-top: 12px"
        @current-change="loadRecords"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getBlindBoxList, saveBlindBox, getBlindBoxOpenRecords, type BlindBox } from '@/api/marketing'
import { getCollectibleList, type CollectibleItem } from '@/api/collectible'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const list = ref<BlindBox[]>([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const collectibles = ref<CollectibleItem[]>([])
const query = reactive({ page: 1, page_size: 20 })

const dialogVisible = ref(false)
const recordsVisible = ref(false)
const recordsBox = ref<BlindBox | null>(null)
const records = ref<Array<Record<string, unknown>>>([])
const recordsLoading = ref(false)
const recordTotal = ref(0)
const recordQuery = reactive({ page: 1, page_size: 20 })

const emptyPrize = () => ({ collectible_id: 0, collectible_name: '', probability: 1, quantity: 1 })

const editForm = reactive<{
  id: number
  name: string
  price: number
  total_supply: number
  status: 'active' | 'disabled'
  prizes: Array<{ collectible_id: number; collectible_name: string; probability: number; quantity: number }>
}>({
  id: 0,
  name: '',
  price: 19.9,
  total_supply: 100,
  status: 'active',
  prizes: []
})

const probabilityStatus = computed(() => {
  const sum = editForm.prizes.reduce((acc, p) => acc + Number(p.probability || 0), 0)
  if (sum > 100.0001) {
    return { type: 'danger' as const, text: `奖品概率合计 ${sum.toFixed(4)}%，超过100%，请调整` }
  }
  return { type: 'success' as const, text: `奖品概率合计 ${sum.toFixed(4)}%` }
})

onMounted(async () => {
  load()
  const res = await getCollectibleList({ page: 1, page_size: 200 })
  collectibles.value = res.list
})

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getBlindBoxList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function openEdit(row?: BlindBox): void {
  if (row) {
    Object.assign(editForm, {
      id: row.id,
      name: row.name,
      price: Number(row.price),
      total_supply: row.total_supply,
      status: row.status,
      prizes: JSON.parse(JSON.stringify(row.prizes))
    })
  } else {
    Object.assign(editForm, { id: 0, name: '', price: 19.9, total_supply: 100, status: 'active', prizes: [] })
  }
  dialogVisible.value = true
}

function onCollectibleChange(row: { collectible_id: number; collectible_name: string }, id: number): void {
  const c = collectibles.value.find((x) => x.id === id)
  row.collectible_name = c ? c.name : ''
}

function addPrize(): void {
  editForm.prizes.push(emptyPrize())
}

async function save(): Promise<void> {
  if (!editForm.name.trim()) {
    ElMessage.warning('请输入盲盒名称')
    return
  }
  if (editForm.prizes.length === 0) {
    ElMessage.warning('请至少配置一个奖品')
    return
  }
  const sum = editForm.prizes.reduce((acc, p) => acc + Number(p.probability || 0), 0)
  if (sum > 100.0001) {
    ElMessage.error(`奖品概率总和不得超过 100%，当前合计 ${sum.toFixed(4)}%`)
    return
  }
  saving.value = true
  try {
    await saveBlindBox({ ...editForm, price: String(editForm.price) })
    ElMessage.success('盲盒已保存')
    dialogVisible.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function openRecords(row: BlindBox): Promise<void> {
  recordsBox.value = row
  recordsVisible.value = true
  recordQuery.page = 1
  await loadRecords()
}

async function loadRecords(): Promise<void> {
  if (!recordsBox.value) return
  recordsLoading.value = true
  try {
    const res = await getBlindBoxOpenRecords(recordsBox.value.id, { ...recordQuery })
    records.value = res.list
    recordTotal.value = res.total
  } finally {
    recordsLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.rules {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rule-tag {
  font-size: 12px;
}

.prob-summary {
  display: flex;
  align-items: center;
}
</style>
