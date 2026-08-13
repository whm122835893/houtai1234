<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">工单列表</div>
      </div>
      <div class="filter-bar">
        <el-select v-model="query.status" placeholder="工单状态" clearable style="width: 160px" @change="load">
          <el-option label="待处理" value="pending" />
          <el-option label="处理中" value="processing" />
          <el-option label="已解决" value="resolved" />
          <el-option label="已关闭" value="closed" />
        </el-select>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="ticket_no" label="工单号" min-width="140" />
        <el-table-column prop="nickname" label="用户" min-width="110" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="110">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag[row.status]" size="small">{{ statusText[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assignee" label="处理人" width="110" />
        <el-table-column label="更新时间" width="170">
          <template #default="{ row }">{{ row.updated_at }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row)">处理</el-button>
            <el-button v-if="row.status === 'processing'" type="danger" link @click="close(row)">关闭</el-button>
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

    <!-- 工单详情 / 回复 -->
    <el-drawer v-model="drawerVisible" :title="`工单 ${current?.ticket_no}`" size="480px">
      <div v-if="current" class="ticket-content">
        <div class="ticket-info">
          <p><b>用户：</b>{{ current.nickname }}（{{ current.phone }}）</p>
          <p><b>分类：</b>{{ current.category }}</p>
          <p><b>标题：</b>{{ current.title }}</p>
          <p><b>状态：</b><el-tag :type="statusTag[current.status]" size="small">{{ statusText[current.status] }}</el-tag></p>
        </div>
        <div class="ticket-desc">{{ current.content }}</div>
      </div>

      <el-divider content-position="left">沟通记录</el-divider>
      <div class="msg-list" v-loading="msgLoading">
        <div v-for="m in messages" :key="m.id" class="msg-item">
          <div class="msg-head">
            <el-tag size="small" :type="m.sender === current?.assignee ? 'primary' : 'info'" effect="plain">{{ m.sender }}</el-tag>
            <span class="msg-time">{{ m.created_at }}</span>
          </div>
          <div class="msg-body">{{ m.content }}</div>
        </div>
        <el-empty v-if="!msgLoading && messages.length === 0" description="暂无沟通记录" :image-size="60" />
      </div>

      <div class="action-bar">
        <el-button v-if="current?.status === 'pending'" type="primary" @click="accept">接单</el-button>
        <el-button v-if="current?.status !== 'closed'" @click="transferVisible = true">转派</el-button>
        <el-button v-if="current?.status !== 'closed'" type="warning" @click="close(current!)">关闭工单</el-button>
        <el-button v-if="current?.status !== 'closed'" type="success" @click="resolve">标记解决</el-button>
      </div>
      <div v-if="current?.status !== 'closed'" class="reply-bar">
        <el-input v-model="replyText" type="textarea" :rows="2" placeholder="回复用户…" />
        <el-button type="primary" :disabled="!replyText.trim()" @click="reply">发送回复</el-button>
      </div>
    </el-drawer>

    <!-- 转派 -->
    <el-dialog v-model="transferVisible" title="转派工单" :width="appStore.mobile ? '100%' : '420px'" append-to-body destroy-on-close>
      <el-input v-model="assignee" placeholder="输入处理人昵称（如：客服小明）" />
      <template #footer>
        <el-button @click="transferVisible = false">取消</el-button>
        <el-button type="primary" @click="transfer">确定转派</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTicketList, getTicketDetail, getTicketMessages, acceptTicket, replyTicket, transferTicket, closeTicket, type TicketItem, type TicketMessage } from '@/api/ticket'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const list = ref<TicketItem[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ page: 1, page_size: 20, status: '' })

const drawerVisible = ref(false)
const current = ref<TicketItem | null>(null)
const messages = ref<TicketMessage[]>([])
const msgLoading = ref(false)
const replyText = ref('')
const transferVisible = ref(false)
const assignee = ref('')

const statusText: Record<string, string> = { pending: '待处理', processing: '处理中', resolved: '已解决', closed: '已关闭' }
const statusTag: Record<string, 'warning' | 'primary' | 'success' | 'info'> = { pending: 'warning', processing: 'primary', resolved: 'success', closed: 'info' }

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getTicketList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function openDetail(row: TicketItem): Promise<void> {
  current.value = await getTicketDetail(row.id)
  drawerVisible.value = true
  await loadMessages()
}

async function loadMessages(): Promise<void> {
  if (!current.value) return
  msgLoading.value = true
  try {
    messages.value = await getTicketMessages(current.value.id)
  } finally {
    msgLoading.value = false
  }
}

async function accept(): Promise<void> {
  if (!current.value) return
  await acceptTicket(current.value.id)
  ElMessage.success('已接单')
  await openDetail(current.value)
}

async function reply(): Promise<void> {
  if (!current.value || !replyText.value.trim()) return
  await replyTicket(current.value.id, replyText.value.trim())
  replyText.value = ''
  await loadMessages()
}

async function transfer(): Promise<void> {
  if (!current.value) return
  if (!assignee.value.trim()) {
    ElMessage.warning('请输入处理人')
    return
  }
  await transferTicket(current.value.id, assignee.value.trim())
  ElMessage.success('已转派')
  transferVisible.value = false
  await openDetail(current.value)
}

async function resolve(): Promise<void> {
  if (!current.value) return
  await closeTicket(current.value.id)
  ElMessage.success('已标记解决')
  await openDetail(current.value)
}

async function close(row: TicketItem): Promise<void> {
  try {
    await ElMessageBox.confirm('确认关闭该工单？', '关闭工单', { type: 'warning' })
  } catch {
    return
  }
  await closeTicket(row.id)
  ElMessage.success('已关闭')
  drawerVisible.value = false
  await load()
}
</script>

<style lang="scss" scoped>
.ticket-content {
  .ticket-info {
    background: $bg-page;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 12px;
    font-size: 13px;
    line-height: 1.9;
  }

  .ticket-desc {
    font-size: 13px;
    color: $text-secondary;
    background: $bg-page;
    border-radius: 8px;
    padding: 12px 16px;
    white-space: pre-wrap;
  }
}

.msg-list {
  max-height: 320px;
  overflow-y: auto;
  margin-bottom: 12px;

  .msg-item {
    margin-bottom: 12px;
    padding: 8px 12px;
    background: $bg-page;
    border-radius: 8px;

    .msg-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;

      .msg-time {
        font-size: 12px;
        color: $text-secondary;
      }
    }

    .msg-body {
      font-size: 13px;
      line-height: 1.6;
    }
  }
}

.action-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.reply-bar {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
</style>
