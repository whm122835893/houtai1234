<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">帮助中心</div>
      </div>
      <div class="table-toolbar">
        <el-button type="primary" @click="openEdit()">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          新增帮助条目
        </el-button>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="140">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
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

    <!-- 编辑帮助条目 -->
    <el-dialog v-model="dialogVisible" :title="`${editForm.id ? '编辑' : '新增'}帮助条目`" :width="appStore.mobile ? '100%' : '760px'" append-to-body destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="标题" required>
          <el-input v-model="editForm.title" placeholder="如：如何购买数字藏品？" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :xs="24" :md="12">
            <el-form-item label="分类" required>
              <el-select v-model="editForm.category" allow-create filterable default-first-option style="width: 100%">
                <el-option label="购买指南" value="购买指南" />
                <el-option label="藏品玩法" value="藏品玩法" />
                <el-option label="账户安全" value="账户安全" />
                <el-option label="交易规则" value="交易规则" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="排序">
              <el-input-number v-model="editForm.sort" :min="0" :max="999" :precision="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="内容" required>
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
import { getHelpList, saveHelp, deleteHelp, type HelpItem } from '@/api/cms'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const list = ref<HelpItem[]>([])
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

const editForm = reactive<{ id: number; title: string; content: string; category: string; sort: number }>({
  id: 0,
  title: '',
  content: '',
  category: '购买指南',
  sort: 0
})

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getHelpList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function openEdit(row?: HelpItem): void {
  if (row) {
    Object.assign(editForm, { id: row.id, title: row.title, content: row.content, category: row.category, sort: row.sort })
  } else {
    Object.assign(editForm, { id: 0, title: '', content: '', category: '购买指南', sort: 0 })
  }
  dialogVisible.value = true
}

async function save(): Promise<void> {
  if (!editForm.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  if (!editForm.content || !editForm.content.trim()) {
    ElMessage.warning('请输入内容')
    return
  }
  saving.value = true
  try {
    await saveHelp({ ...editForm })
    ElMessage.success('帮助条目已保存')
    dialogVisible.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function remove(row: HelpItem): Promise<void> {
  try {
    await ElMessageBox.confirm(`确认删除「${row.title}」？`, '删除确认', { type: 'warning' })
  } catch {
    return
  }
  await deleteHelp(row.id)
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
