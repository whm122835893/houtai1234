<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">管理员账号</div>
      </div>
      <div class="table-toolbar">
        <el-button type="primary" @click="openCreate">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          新增管理员
        </el-button>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" min-width="130" />
        <el-table-column prop="nickname" label="昵称" min-width="130" show-overflow-tooltip />
        <el-table-column label="角色" width="140">
          <template #default="{ row }">
            <el-tag size="small" :type="row.role === 'super_admin' ? 'danger' : 'primary'" effect="light">{{ row.role_name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后登录" width="170">
          <template #default="{ row }">{{ row.last_login_at || '-' }}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ row.created_at }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="toggleStatus(row)">{{ row.status === 1 ? '停用' : '启用' }}</el-button>
            <el-button v-if="row.role !== 'super_admin'" type="danger" link @click="remove(row)">删除</el-button>
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

    <!-- 新增管理员 -->
    <el-dialog v-model="dialogVisible" title="新增管理员" :width="appStore.mobile ? '100%' : '520px'" append-to-body destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="用户名" required>
          <el-input v-model="form.username" placeholder="登录用户名" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="展示昵称，默认同用户名" />
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="form.role" style="width: 100%">
            <el-option v-for="r in roles" :key="r.code" :label="r.name" :value="r.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="初始密码" required>
          <el-input v-model="form.password" type="password" show-password placeholder="初始登录密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="create">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminAccountList, createAdminAccount, updateAdminStatus, deleteAdminAccount, getRoleList, type AdminAccount, type RoleItem } from '@/api/permissionModule'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const list = ref<AdminAccount[]>([])
const roles = ref<RoleItem[]>([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const query = reactive({ page: 1, page_size: 20 })
const dialogVisible = ref(false)
const form = reactive({ username: '', nickname: '', role: 'operator', password: '' })

onMounted(async () => {
  load()
  roles.value = await getRoleList()
})

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getAdminAccountList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function openCreate(): void {
  Object.assign(form, { username: '', nickname: '', role: 'operator', password: '' })
  dialogVisible.value = true
}

async function create(): Promise<void> {
  if (!form.username.trim() || !form.password) {
    ElMessage.warning('用户名与密码必填')
    return
  }
  saving.value = true
  try {
    await createAdminAccount({ ...form })
    ElMessage.success('管理员已创建')
    dialogVisible.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function toggleStatus(row: AdminAccount): Promise<void> {
  const next = row.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(`确认${next === 1 ? '启用' : '停用'}账号「${row.nickname}」？`, '状态变更', { type: 'warning' })
  } catch {
    return
  }
  await updateAdminStatus(row.id, next as 0 | 1)
  ElMessage.success('状态已更新')
  await load()
}

async function remove(row: AdminAccount): Promise<void> {
  const { value: password } = await ElMessageBox.prompt('请输入管理员登录密码', `删除账号「${row.nickname}」`, {
    inputType: 'password',
    inputPlaceholder: '管理员密码',
    inputValidator: (val: string) => (val ? true : '请输入密码')
  })
  await deleteAdminAccount(row.id, password)
  ElMessage.success('已删除')
  await load()
}
</script>
