<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">公告管理</div>
      </div>
      <div class="table-toolbar">
        <el-button type="primary" @click="openEdit()">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          发布公告
        </el-button>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'announcement' ? 'warning' : 'info'" size="small" effect="plain">{{ row.type === 'announcement' ? '公告' : '通知' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">{{ row.status === 'published' ? '已发布' : '草稿' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="170">
          <template #default="{ row }">{{ row.published_at || '-' }}</template>
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

    <!-- 编辑公告 -->
    <el-dialog v-model="dialogVisible" :title="`${editForm.id ? '编辑' : '发布'}公告`" :width="appStore.mobile ? '100%' : '760px'" append-to-body destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="标题" required>
          <el-input v-model="editForm.title" placeholder="公告标题" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :xs="24" :md="12">
            <el-form-item label="类型">
              <el-radio-group v-model="editForm.type">
                <el-radio value="announcement">公告</el-radio>
                <el-radio value="notice">通知</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="状态">
              <el-radio-group v-model="editForm.status">
                <el-radio value="published">发布</el-radio>
                <el-radio value="draft">草稿</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
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
import { getNoticeList, saveNotice, deleteNotice, type Notice } from '@/api/cms'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const list = ref<Notice[]>([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const query = reactive({ page: 1, page_size: 20 })
const dialogVisible = ref(false)
const toolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ header: [1, 2, 3, false] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'image'],
  ['clean']
]

const editForm = reactive<{ id: number; title: string; content: string; type: 'notice' | 'announcement'; status: 'published' | 'draft' }>({
  id: 0,
  title: '',
  content: '',
  type: 'announcement',
  status: 'published'
})

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getNoticeList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function openEdit(row?: Notice): void {
  if (row) {
    Object.assign(editForm, { id: row.id, title: row.title, content: row.content, type: row.type, status: row.status })
  } else {
    Object.assign(editForm, { id: 0, title: '', content: '', type: 'announcement', status: 'published' })
  }
  dialogVisible.value = true
}

async function save(): Promise<void> {
  if (!editForm.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  if (!editForm.content || !editForm.content.trim()) {
    ElMessage.warning('请输入正文内容')
    return
  }
  saving.value = true
  try {
    await saveNotice({ ...editForm })
    ElMessage.success('公告已保存')
    dialogVisible.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function remove(row: Notice): Promise<void> {
  try {
    await ElMessageBox.confirm(`确认删除「${row.title}」？`, '删除确认', { type: 'warning' })
  } catch {
    return
  }
  await deleteNotice(row.id)
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
