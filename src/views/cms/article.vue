<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">藏品文案</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="面向单个藏品的详细介绍文案（背景故事、设计理念、发行信息），展示在藏品详情页。一个藏品可维护多条文案。"
      />
      <div class="table-toolbar">
        <el-button type="primary" @click="openEdit()">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          新增文案
        </el-button>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="collectible_name" label="关联藏品" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">{{ row.status === 'published' ? '已发布' : '草稿' }}</el-tag>
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

    <!-- 编辑文案 -->
    <el-dialog v-model="dialogVisible" :title="`${editForm.id ? '编辑' : '新增'}藏品文案`" :width="appStore.mobile ? '100%' : '760px'" append-to-body destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="标题" required>
          <el-input v-model="editForm.title" placeholder="文案标题" />
        </el-form-item>
        <el-form-item label="关联藏品" required>
          <el-select v-model="editForm.collectible_id" filterable placeholder="选择藏品" style="width: 100%" @change="onCollectibleChange">
            <el-option v-for="c in collectibles" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editForm.status">
            <el-radio value="published">发布</el-radio>
            <el-radio value="draft">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="正文" required>
          <div class="editor-wrap">
            <QuillEditor v-model:content="editForm.content" contentType="html" theme="snow" :toolbar="toolbar" />
          </div>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { QuillEditor } from '@vueup/vue-quill'
import { getArticleList, saveArticle, deleteArticle, type Article } from '@/api/cms'
import { getCollectibleList, type CollectibleItem } from '@/api/collectible'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const list = ref<Article[]>([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const collectibles = ref<CollectibleItem[]>([])
const query = reactive({ page: 1, page_size: 20 })
const dialogVisible = ref(false)
const toolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ header: [1, 2, 3, false] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'image'],
  ['clean']
]

const editForm = reactive<{ id: number; title: string; content: string; collectible_id: number; status: 'published' | 'draft' }>({
  id: 0,
  title: '',
  content: '',
  collectible_id: 0,
  status: 'draft'
})

onMounted(async () => {
  load()
  const res = await getCollectibleList({ page: 1, page_size: 200 })
  collectibles.value = res.list
})

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getArticleList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function openEdit(row?: Article): void {
  if (row) {
    Object.assign(editForm, { id: row.id, title: row.title, content: row.content, collectible_id: row.collectible_id, status: row.status })
  } else {
    Object.assign(editForm, { id: 0, title: '', content: '', collectible_id: 0, status: 'draft' })
  }
  dialogVisible.value = true
}

function onCollectibleChange(id: number): void {
  editForm.collectible_id = id
}

async function save(): Promise<void> {
  if (!editForm.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  if (!editForm.collectible_id) {
    ElMessage.warning('请选择关联藏品')
    return
  }
  if (!editForm.content || !editForm.content.trim()) {
    ElMessage.warning('请输入正文内容')
    return
  }
  saving.value = true
  try {
    await saveArticle({ ...editForm })
    ElMessage.success('文案已保存')
    dialogVisible.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function remove(row: Article): Promise<void> {
  try {
    await ElMessageBox.confirm(`确认删除「${row.title}」？`, '删除确认', { type: 'warning' })
  } catch {
    return
  }
  await deleteArticle(row.id)
  ElMessage.success('已删除')
  await load()
}
</script>

<style lang="scss" scoped>
.editor-wrap {
  width: 100%;

  :deep(.ql-editor) {
    min-height: 200px;
  }
}
</style>
