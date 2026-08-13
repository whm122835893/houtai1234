<template>
  <div class="app-page">
    <div class="app-card">
      <div class="search-card">
        <el-input
          v-model="query.keyword"
          placeholder="手机号 / 姓名 / 昵称"
          clearable
          style="width: 220px"
          @keyup.enter="load(1)"
        />
        <el-button type="primary" @click="load(1)">搜索</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </div>

    <div class="app-card">
      <div class="table-toolbar">
        <span class="table-tip">
          实名认证管理为只读模块，列表中默认脱敏展示，查看完整信息需二次密码验证并记录审计日志
        </span>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="用户" min-width="150">
          <template #default="{ row }">{{ row.nickname }}（{{ row.user_id }}）</template>
        </el-table-column>
        <el-table-column label="手机号" min-width="140">
          <template #default="{ row }">
            <MaskText :text="row.phone" :mask="maskPhone(row.phone)" />
          </template>
        </el-table-column>
        <el-table-column label="姓名" min-width="100">
          <template #default="{ row }">
            <MaskText :text="row.name" :mask="maskName(row.name)" />
          </template>
        </el-table-column>
        <el-table-column label="身份证号" min-width="220">
          <template #default="{ row }">
            <MaskText :text="row.id_card" :mask="maskIdCard(row.id_card)" />
          </template>
        </el-table-column>
        <el-table-column label="认证状态" width="110">
          <template #default>
            <el-tag type="success" size="small" effect="light">已认证</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="认证时间" width="160">
          <template #default="{ row }">{{ formatDate(row.verified_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="['realname:full']" type="primary" link @click="viewFull(row)">
              查看完整信息
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.page_size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="load()"
          @size-change="load(1)"
        />
      </div>
    </div>

    <!-- 查看完整实名信息：二次密码验证 -->
    <el-dialog v-model="pwdVisible" title="验证管理员密码" :width="appStore.mobile ? '100%' : '420px'" append-to-body>
      <el-alert type="warning" :closable="false" show-icon title="查看完整实名信息将写入审计日志" class="mb-16" />
      <el-form label-width="90px" @submit.prevent>
        <el-form-item label="管理员密码" required>
          <el-input v-model="password" type="password" show-password placeholder="请输入当前管理员登录密码" @keyup.enter="confirmView" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdVisible = false">取消</el-button>
        <el-button type="primary" :loading="loadingFull" @click="confirmView">验证并查看</el-button>
      </template>
    </el-dialog>

    <!-- 完整实名信息展示 -->
    <el-dialog v-model="fullVisible" title="完整实名信息" :width="appStore.mobile ? '100%' : '480px'" append-to-body>
      <el-descriptions :column="1" border v-if="fullInfo">
        <el-descriptions-item label="姓名">{{ fullInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ fullInfo.id_card }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ fullInfo.phone }}</el-descriptions-item>
        <el-descriptions-item label="身份证人像面">
          <el-image v-if="fullInfo.front_image" :src="fullInfo.front_image" style="width: 200px; height: 130px" fit="cover" />
          <span v-else class="text-muted">无上传图片（Mock）</span>
        </el-descriptions-item>
        <el-descriptions-item label="身份证国徽面">
          <el-image v-if="fullInfo.back_image" :src="fullInfo.back_image" style="width: 200px; height: 130px" fit="cover" />
          <span v-else class="text-muted">无上传图片（Mock）</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import MaskText from '@/components/MaskText.vue'
import { getRealnameList, getRealnameFull, type RealnameItem, type RealnameFull } from '@/api/realname'
import { formatDate } from '@/utils/date'
import { maskPhone, maskName, maskIdCard } from '@/utils/mask'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const list = ref<RealnameItem[]>([])
const total = ref(0)
const loading = ref(false)

const query = reactive({ page: 1, page_size: 20, keyword: '' })

const pwdVisible = ref(false)
const fullVisible = ref(false)
const password = ref('')
const loadingFull = ref(false)
const fullInfo = ref<RealnameFull | null>(null)
let currentRow: RealnameItem | null = null

async function load(page = query.page): Promise<void> {
  query.page = page
  loading.value = true
  try {
    const res = await getRealnameList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function reset(): void {
  query.keyword = ''
  load(1)
}

function viewFull(row: RealnameItem): void {
  currentRow = row
  password.value = ''
  pwdVisible.value = true
}

async function confirmView(): Promise<void> {
  if (!currentRow) return
  if (!password.value) {
    ElMessage.warning('请输入管理员密码')
    return
  }
  loadingFull.value = true
  try {
    fullInfo.value = await getRealnameFull(currentRow.id, password.value)
    pwdVisible.value = false
    fullVisible.value = true
    ElMessage.success('已查看完整实名信息，操作已记录审计日志')
  } finally {
    loadingFull.value = false
  }
}

onMounted(() => load())
</script>

<style lang="scss" scoped>
.table-tip {
  color: $text-secondary;
  font-size: 13px;
}
</style>
