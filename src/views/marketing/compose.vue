<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">合成玩法</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="合成规则：消耗指定藏品数量，产出目标藏品。支持多材料组合；产出藏品需为已发售藏品，产出时校验对应配额预留库存，配额预留不足时拦截合成并提示。"
      />
      <div class="table-toolbar">
        <el-button type="primary" @click="openEdit()">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          新建合成规则
        </el-button>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="规则名称" min-width="160" show-overflow-tooltip />
        <el-table-column label="合成材料" min-width="260">
          <template #default="{ row }">
            <div class="rules">
              <el-tag v-for="(m, i) in row.materials" :key="i" size="small" effect="plain" class="rule-tag">
                {{ m.collectible_name }} ×{{ m.quantity }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="产出" min-width="160">
          <template #default="{ row }">
            <el-tag type="success" size="small" effect="light">{{ row.output_collectible_name }} ×{{ row.output_quantity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">{{ row.status === 'active' ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">配置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 配置合成规则 -->
    <el-dialog v-model="dialogVisible" :title="`${editForm.id ? '配置' : '新建'}合成规则`" :width="appStore.mobile ? '100%' : '760px'" append-to-body destroy-on-close>
      <el-form label-width="110px">
        <el-form-item label="规则名称" required>
          <el-input v-model="editForm.name" placeholder="如：三合一升级" />
        </el-form-item>
        <el-form-item label="合成材料" required>
          <div style="width: 100%">
            <div v-for="(m, idx) in editForm.materials" :key="idx" class="material-row">
              <el-select v-model="m.collectible_id" filterable placeholder="选择消耗藏品" style="width: 220px" @change="(id: number) => onMaterialCollectibleChange(m, id)">
                <el-option v-for="c in collectibles" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
              <span class="material-x">×</span>
              <el-input-number v-model="m.quantity" :min="1" :max="99999" :precision="0" controls-position="right" style="width: 140px" />
              <el-button type="danger" link @click="editForm.materials.splice(idx, 1)">移除</el-button>
            </div>
            <el-button @click="addMaterial">
              <el-icon style="margin-right: 4px"><Plus /></el-icon>
              添加材料
            </el-button>
          </div>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :xs="24" :md="12">
            <el-form-item label="产出藏品" required>
              <el-select v-model="editForm.output_collectible_id" filterable placeholder="选择产出藏品" style="width: 100%" @change="onOutputChange">
                <el-option v-for="c in collectibles" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="产出数量" required>
              <el-input-number v-model="editForm.output_quantity" :min="1" :max="99" :precision="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="规则状态">
          <el-radio-group v-model="editForm.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getComposeList, saveComposeRule, type ComposeRule } from '@/api/marketing'
import { getCollectibleList, type CollectibleItem } from '@/api/collectible'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const list = ref<ComposeRule[]>([])
const loading = ref(false)
const saving = ref(false)
const collectibles = ref<CollectibleItem[]>([])
const dialogVisible = ref(false)

const editForm = reactive<{
  id: number
  name: string
  materials: Array<{ collectible_id: number; collectible_name: string; quantity: number }>
  output_collectible_id: number
  output_quantity: number
  status: 'active' | 'disabled'
}>({
  id: 0,
  name: '',
  materials: [],
  output_collectible_id: 0,
  output_quantity: 1,
  status: 'active'
})

onMounted(async () => {
  load()
  const res = await getCollectibleList({ page: 1, page_size: 200 })
  collectibles.value = res.list
})

async function load(): Promise<void> {
  loading.value = true
  try {
    list.value = await getComposeList()
  } finally {
    loading.value = false
  }
}

function openEdit(row?: ComposeRule): void {
  if (row) {
    Object.assign(editForm, {
      id: row.id,
      name: row.name,
      materials: JSON.parse(JSON.stringify(row.materials)),
      output_collectible_id: row.output_collectible_id,
      output_quantity: row.output_quantity,
      status: row.status
    })
  } else {
    Object.assign(editForm, { id: 0, name: '', materials: [], output_collectible_id: 0, output_quantity: 1, status: 'active' })
  }
  dialogVisible.value = true
}

function addMaterial(): void {
  editForm.materials.push({ collectible_id: 0, collectible_name: '', quantity: 1 })
}

function onMaterialCollectibleChange(m: { collectible_id: number; collectible_name: string }, id: number): void {
  const c = collectibles.value.find((x) => x.id === id)
  m.collectible_name = c ? c.name : ''
}

function onOutputChange(id: number): void {
  editForm.output_collectible_id = id
}

async function save(): Promise<void> {
  if (!editForm.name.trim()) {
    ElMessage.warning('请输入规则名称')
    return
  }
  if (editForm.materials.length === 0) {
    ElMessage.warning('请至少添加一种合成材料')
    return
  }
  if (!editForm.output_collectible_id) {
    ElMessage.warning('请选择产出藏品')
    return
  }
  saving.value = true
  try {
    await saveComposeRule({ ...editForm })
    ElMessage.success('合成规则已保存')
    dialogVisible.value = false
    await load()
  } finally {
    saving.value = false
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

.material-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  .material-x {
    color: $text-secondary;
  }
}
</style>
