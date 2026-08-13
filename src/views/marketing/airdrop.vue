<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">活动空投</div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="面向指定用户手机号批量空投藏品。空投数量受藏品「活动奖励配额」预留限制，预留不足时拦截并提示当前剩余份数；目标手机号必须为已注册用户，未注册或格式错误将整体中止。"
      />
      <div class="table-toolbar">
        <el-button type="primary" @click="openRun">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          执行空投
        </el-button>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="activity_name" label="活动名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="collectible_name" label="藏品" min-width="140" show-overflow-tooltip />
        <el-table-column prop="quantity" label="空投数量" width="90" align="right" />
        <el-table-column prop="target_users" label="目标用户" width="90" align="right" />
        <el-table-column label="发放结果" width="130">
          <template #default="{ row }">
            <span class="text-success">成功 {{ row.success_count }}</span>
            <el-tooltip v-if="row.fail_count > 0" content="失败用户可在发放记录台账中查看原因">
              <span class="text-danger"> / 失败 {{ row.fail_count }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="120" show-overflow-tooltip />
        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ row.created_at }}</template>
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

    <!-- 执行空投 -->
    <el-dialog v-model="runVisible" title="执行活动空投" :width="appStore.mobile ? '100%' : '620px'" append-to-body destroy-on-close>
      <el-form label-width="110px">
        <el-form-item label="活动名称" required>
          <el-input v-model="runForm.activity_name" placeholder="如：夏日庆典空投" />
        </el-form-item>
        <el-form-item label="空投藏品" required>
          <el-select v-model="runForm.collectible_id" filterable placeholder="选择藏品" style="width: 100%" @change="onCollectibleChange">
            <el-option v-for="c in collectibles" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="空投数量" required>
          <el-input-number v-model="runForm.quantity" :min="1" :max="999999" :precision="0" controls-position="right" style="width: 100%" />
          <div v-if="selectedStock" class="tip">
            活动奖励配额剩余 {{ selectedStock }} 份
          </div>
        </el-form-item>
        <el-form-item label="目标手机号" required>
          <el-input
            v-model="runForm.phonesText"
            type="textarea"
            :rows="4"
            placeholder="每行一个手机号，多个手机号自动按行拆分"
          />
        </el-form-item>
        <el-form-item label="管理员密码" required>
          <el-input v-model="runForm.password" type="password" show-password placeholder="操作前验证管理员密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="runVisible = false">取消</el-button>
        <el-button type="primary" :loading="running" @click="run">确认空投</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getActivityAirdropList, runActivityAirdrop, type ActivityAirdrop } from '@/api/marketing'
import { getCollectibleList, type CollectibleItem } from '@/api/collectible'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const list = ref<ActivityAirdrop[]>([])
const total = ref(0)
const loading = ref(false)
const running = ref(false)
const collectibles = ref<CollectibleItem[]>([])
const query = reactive({ page: 1, page_size: 20 })

const runVisible = ref(false)
const runForm = reactive({
  activity_name: '',
  collectible_id: 0,
  quantity: 1,
  phonesText: '',
  password: ''
})

const selectedStock = computed(() => {
  const c = collectibles.value.find((x) => x.id === runForm.collectible_id)
  if (!c) return null
  const quota = c.quotas?.find((q) => q.type === 'activity_airdrop' && q.status === 'active')
  if (!quota) return null
  return Math.max(0, quota.total - quota.used)
})

onMounted(async () => {
  load()
  const res = await getCollectibleList({ page: 1, page_size: 200 })
  collectibles.value = res.list
})

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await getActivityAirdropList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function openRun(): void {
  runForm.activity_name = ''
  runForm.collectible_id = 0
  runForm.quantity = 1
  runForm.phonesText = ''
  runForm.password = ''
  runVisible.value = true
}

function onCollectibleChange(id: number): void {
  runForm.collectible_id = id
}

async function run(): Promise<void> {
  if (!runForm.activity_name.trim()) {
    ElMessage.warning('请输入活动名称')
    return
  }
  if (!runForm.collectible_id) {
    ElMessage.warning('请选择空投藏品')
    return
  }
  const phones = runForm.phonesText
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p)
  if (phones.length === 0) {
    ElMessage.warning('请输入至少一个目标手机号')
    return
  }
  if (!runForm.password) {
    ElMessage.warning('请输入管理员密码')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确认向 ${phones.length} 个目标用户空投「${collectibles.value.find((c) => c.id === runForm.collectible_id)?.name}」共 ${runForm.quantity} 份？此操作将写入审计日志。`,
      '高危操作确认',
      { type: 'warning', confirmButtonText: '确认空投', cancelButtonText: '取消' }
    )
  } catch {
    return
  }
  running.value = true
  try {
    const res = await runActivityAirdrop({
      activity_name: runForm.activity_name,
      collectible_id: runForm.collectible_id,
      quantity: runForm.quantity,
      phones,
      password: runForm.password
    })
    ElMessage.success(`空投完成，成功 ${res.success_count} 个，失败 ${res.fail_count} 个`)
    runVisible.value = false
    await load()
  } finally {
    running.value = false
  }
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
