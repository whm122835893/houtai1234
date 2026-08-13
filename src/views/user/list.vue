<template>
  <div class="app-page">
    <div class="app-card">
      <div class="search-card">
        <el-input
          v-model="query.keyword"
          placeholder="昵称 / 手机号"
          clearable
          style="width: 220px"
          @keyup.enter="load(1)"
        />
        <el-select v-model="query.status" placeholder="账号状态" clearable style="width: 140px">
          <el-option label="正常" value="1" />
          <el-option label="已冻结" value="0" />
        </el-select>
        <el-button type="primary" @click="load(1)">搜索</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </div>

    <div class="app-card">
      <div class="table-toolbar">
        <span class="table-tip">共 {{ total }} 位用户</span>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="用户" min-width="160">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="32" class="user-avatar">{{ row.nickname.charAt(0) }}</el-avatar>
              <div>
                <div class="nickname">{{ row.nickname }}</div>
                <MaskText :text="row.phone" :mask="maskPhone(row.phone)" />
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="danger" size="small">已冻结</el-tag>
            <el-tag v-else type="success" size="small" effect="light">正常</el-tag>
            <el-tag v-if="row.is_black === 1" type="warning" size="small" effect="dark" class="ml4">黑名单</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="余额" width="110">
          <template #default="{ row }">¥{{ row.balance }}</template>
        </el-table-column>
        <el-table-column prop="asset_count" label="持有藏品" width="100" />
        <el-table-column prop="invite_count" label="邀请人数" width="100" />
        <el-table-column label="注册时间" width="160">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="最近登录" width="160">
          <template #default="{ row }">{{ formatDate(row.last_login_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="router.push(`/user/detail?id=${row.id}`)">详情</el-button>
            <el-button v-permission="['user:freeze']" :type="row.status === 0 ? 'success' : 'warning'" link @click="toggleFreeze(row)">
              {{ row.status === 0 ? '解冻' : '冻结' }}
            </el-button>
            <el-button v-permission="['user:reset_password']" type="warning" link @click="resetPwd(row)">重置密码</el-button>
            <el-button v-permission="['user:force_logout']" type="info" link @click="handleForceLogout(row)">强制登出</el-button>
            <el-button v-permission="['security:blacklist']" :type="row.is_black === 1 ? 'info' : 'danger'" link @click="toggleBlack(row)">
              {{ row.is_black === 1 ? '移出黑名单' : '拉黑' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.page_size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="load()"
          @size-change="load(1)"
        />
      </div>
    </div>

    <!-- 冻结/解冻确认 -->
    <RiskConfirm
      ref="freezeRef"
      :title="freezeTitle"
      :need-reason="true"
      :need-password="true"
      :submit="onFreezeSubmit"
    />

    <!-- 拉黑确认 -->
    <RiskConfirm
      ref="blackRef"
      :title="blackTitle"
      :need-reason="true"
      :need-password="true"
      :submit="onBlackSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import RiskConfirm, { type RiskConfirmPayload } from '@/components/RiskConfirm.vue'
import MaskText from '@/components/MaskText.vue'
import { getUserList, freezeUser, unfreezeUser, resetUserPassword, forceLogout, blacklistUser, unblacklistUser, type UserItem } from '@/api/user'
import { formatDate } from '@/utils/date'
import { maskPhone } from '@/utils/mask'

const router = useRouter()
const list = ref<UserItem[]>([])
const total = ref(0)
const loading = ref(false)

const query = reactive({ page: 1, page_size: 20, keyword: '', status: '' })

const freezeRef = ref<InstanceType<typeof RiskConfirm>>()
const blackRef = ref<InstanceType<typeof RiskConfirm>>()

const freezeTitle = ref('冻结用户')
const blackTitle = ref('拉黑用户')
let currentRow: UserItem | null = null
let freezeAction: 'freeze' | 'unfreeze' = 'freeze'
let blackAction: 'black' | 'unblack' = 'black'

async function load(page = query.page): Promise<void> {
  query.page = page
  loading.value = true
  try {
    const res = await getUserList({ ...query })
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

function toggleFreeze(row: UserItem): void {
  currentRow = row
  freezeAction = row.status === 0 ? 'unfreeze' : 'freeze'
  freezeTitle.value = row.status === 0 ? '解冻用户' : '冻结用户'
  freezeRef.value?.open()
}

async function onFreezeSubmit(payload: RiskConfirmPayload): Promise<void> {
  if (!currentRow) return
  if (freezeAction === 'freeze') {
    await freezeUser(currentRow.id, payload.reason, payload.password)
    ElMessage.success('已冻结该用户')
  } else {
    await unfreezeUser(currentRow.id, payload.reason)
    ElMessage.success('已解冻该用户')
  }
  load()
}

function toggleBlack(row: UserItem): void {
  currentRow = row
  blackAction = row.is_black === 1 ? 'unblack' : 'black'
  blackTitle.value = row.is_black === 1 ? '移出黑名单' : '拉黑用户'
  blackRef.value?.open()
}

async function onBlackSubmit(payload: RiskConfirmPayload): Promise<void> {
  if (!currentRow) return
  if (blackAction === 'black') {
    await blacklistUser(currentRow.id, payload.reason, payload.password)
    ElMessage.success('已加入黑名单')
  } else {
    await unblacklistUser(currentRow.id)
    ElMessage.success('已移出黑名单')
  }
  load()
}

async function resetPwd(row: UserItem): Promise<void> {
  const { value } = await ElMessageBox.prompt('请输入新密码（默认 123456）', `重置 ${row.nickname} 的密码`, {
    inputValue: '123456',
    inputPattern: /^.{6,20}$/,
    inputErrorMessage: '密码长度 6-20 位'
  })
  await resetUserPassword(row.id, value)
  ElMessage.success('密码已重置')
}

async function handleForceLogout(row: UserItem): Promise<void> {
  await ElMessageBox.confirm(`确定强制登出用户「${row.nickname}」吗？`, '强制登出', { type: 'warning' })
  await forceLogout(row.id)
  ElMessage.success('已强制登出')
}

onMounted(() => load())
</script>

<style lang="scss" scoped>
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  background: linear-gradient(135deg, #409eff, #7c3aed);
  color: #fff;
  flex-shrink: 0;
}

.nickname {
  font-size: 13px;
  color: $text-primary;
  font-weight: 500;
}

.table-tip {
  color: $text-secondary;
  font-size: 13px;
}

.ml4 {
  margin-left: 4px;
}
</style>
