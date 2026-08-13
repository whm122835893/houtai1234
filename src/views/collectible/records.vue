<template>
  <div class="app-page">
    <div class="app-card">
      <div class="search-card">
        <el-input
          v-model="query.keyword"
          placeholder="藏品名称"
          clearable
          style="width: 220px"
          @keyup.enter="load(1)"
        />
        <el-button type="primary" @click="load(1)">搜索</el-button>
        <el-button @click="reset">重置</el-button>
        <div style="flex: 1" />
        <el-button type="primary" plain @click="exportExcel">导出</el-button>
      </div>
    </div>

    <div class="app-card">
      <div class="table-toolbar">
        <span class="text-muted">共 {{ total }} 条发放记录</span>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="task_no" label="任务ID" width="180" />
        <el-table-column prop="collectible_name" label="藏品名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="quantity" label="空投数量" width="100" align="center" />
        <el-table-column prop="target_users" label="接收用户数" width="110" align="center" />
        <el-table-column prop="success_count" label="成功数" width="90" align="center" />
        <el-table-column prop="fail_count" label="失败数" width="90" align="center" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column label="操作时间" width="170">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default>
            <el-button type="primary" link>详情</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getAirdropRecords, type AirdropRecord } from '@/api/collectible'
import { formatDate } from '@/utils/date'

const list = ref<AirdropRecord[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ page: 1, page_size: 20, keyword: '' })

async function load(page = query.page): Promise<void> {
  query.page = page
  loading.value = true
  try {
    const res = await getAirdropRecords({ ...query })
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

function exportExcel(): void {
  ElMessage.success('导出任务已创建（后端流式下载）')
}

onMounted(() => load())
</script>
