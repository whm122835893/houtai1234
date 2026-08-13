<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">黑名单管理</div>
      </div>
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        class="mb-16"
        title="加入黑名单的用户将被禁止登录、下单与交易。添加黑名单属于高风险操作，需要填写原因并验证管理员密码；目标手机号必须为已注册用户。"
      />
      <div class="table-toolbar">
        <el-button type="danger" @click="openAdd">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          加入黑名单
        </el-button>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="user_id" label="用户ID" width="90" align="center" />
        <el-table-column prop="nickname" label="用户" min-width="120" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="reason" label="原因" min-width="180" show-overflow-tooltip />
        <el-table-column prop="operator" label="操作人" min-width="110" />
        <el-table-column label="加入时间" width="170">
          <template #default="{ row }">{{ row.created_at }}</template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="remove(row)">移出</el-button>
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

    <!-- 添加黑名单 -->
    <el-dialog v-model="addVisible" title="加入黑名单" :width="appStore.mobile ? '100%' : '520px'" append-to-body destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="手机号" required>
          <el-input v-model="addForm.phone" placeholder="用户注册手机号" />
        </el-form-item>
        <el-form-item label="拉黑原因" required>
          <el-input v-model="addForm.reason" type="textarea" :rows="2" placeholder="请填写拉黑原因（将写入审计日志）" />
        </el-form-item>
        <el-form-item label="管理员密码" required>
          <el-input v-model="addForm.password" type="password" show-password placeholder="操作前验证管理员密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="danger" :loading="adding" @click="add">确认拉黑</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBlacklist, addBlacklist, removeBlacklist, type BlacklistItem } from '@/api/security'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const list = ref<BlacklistItem[]>([])
const total = ref(0)
const loading = ref(false)
const adding = ref(false)
const query = reactive({ page: 1, page_size: 20 })
const addVisible = ref(false)
const addForm = reactive({ phone: '', reason: '', password: '' })

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getBlacklist({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function openAdd(): void {
  Object.assign(addForm, { phone: '', reason: '', password: '' })
  addVisible.value = true
}

async function add(): Promise<void> {
  if (!addForm.phone.trim()) {
    ElMessage.warning('请输入手机号')
    return
  }
  if (!addForm.reason.trim()) {
    ElMessage.warning('请填写拉黑原因')
    return
  }
  if (!addForm.password) {
    ElMessage.warning('请输入管理员密码')
    return
  }
  adding.value = true
  try {
    await addBlacklist({ ...addForm })
    ElMessage.success('已加入黑名单')
    addVisible.value = false
    await load()
  } finally {
    adding.value = false
  }
}

async function remove(row: BlacklistItem): Promise<void> {
  try {
    await ElMessageBox.confirm(`确认将「${row.nickname}」移出黑名单？`, '移出确认', { type: 'warning' })
  } catch {
    return
  }
  await removeBlacklist(row.id)
  ElMessage.success('已移出黑名单')
  await load()
}
</script>
