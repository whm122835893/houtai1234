<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">Banner管理</div>
      </div>
      <div class="table-toolbar">
        <el-button type="primary" @click="openEdit()">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          新增Banner
        </el-button>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="图片" width="160">
          <template #default="{ row }">
            <el-image v-if="row.image" :src="row.image" :preview-src-list="[row.image]" preview-teleported fit="cover" style="width: 100px; height: 44px; border-radius: 4px" />
            <span v-else class="text-muted" style="font-size: 12px">未上传</span>
          </template>
        </el-table-column>
        <el-table-column prop="link" label="跳转链接" min-width="140" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">{{ row.status === 'enabled' ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ row.created_at }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="remove(row)">删除</el-button>
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

    <!-- 编辑Banner -->
    <el-dialog v-model="dialogVisible" :title="`${editForm.id ? '编辑' : '新增'}Banner`" :width="appStore.mobile ? '100%' : '560px'" append-to-body destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="editForm.title" placeholder="如：新品首发「龙腾盛世」" />
        </el-form-item>
        <el-form-item label="图片地址">
          <el-input v-model="editForm.image" placeholder="https://... （建议 750×360）" />
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="editForm.link" placeholder="/market" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :xs="24" :md="12">
            <el-form-item label="排序">
              <el-input-number v-model="editForm.sort" :min="0" :max="999" :precision="0" controls-position="right" style="width: 100%" />
              <div class="tip">数字越大越靠前</div>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="状态">
              <el-radio-group v-model="editForm.status">
                <el-radio value="enabled">启用</el-radio>
                <el-radio value="disabled">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBannerList, saveBanner, deleteBanner, type Banner } from '@/api/cms'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const list = ref<Banner[]>([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const query = reactive({ page: 1, page_size: 20 })
const dialogVisible = ref(false)

const editForm = reactive<{ id: number; title: string; image: string; link: string; sort: number; status: 'enabled' | 'disabled' }>({
  id: 0,
  title: '',
  image: '',
  link: '',
  sort: 0,
  status: 'enabled'
})

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getBannerList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function openEdit(row?: Banner): void {
  if (row) {
    Object.assign(editForm, { id: row.id, title: row.title, image: row.image, link: row.link, sort: row.sort, status: row.status })
  } else {
    Object.assign(editForm, { id: 0, title: '', image: '', link: '', sort: 0, status: 'enabled' })
  }
  dialogVisible.value = true
}

async function save(): Promise<void> {
  if (!editForm.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  saving.value = true
  try {
    await saveBanner({ ...editForm })
    ElMessage.success('Banner已保存')
    dialogVisible.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function remove(row: Banner): Promise<void> {
  try {
    await ElMessageBox.confirm(`确认删除「${row.title}」？`, '删除确认', { type: 'warning' })
  } catch {
    return
  }
  await deleteBanner(row.id)
  ElMessage.success('已删除')
  await load()
}
</script>

<style lang="scss" scoped>
.tip {
  width: 100%;
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
}
</style>
