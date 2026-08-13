<template>
  <div class="reward-panel">
    <el-form-item label="奖励类型" required>
      <el-select v-model="local.reward_type" style="width: 100%" placeholder="请选择奖励类型" @change="onTypeChange">
        <el-option v-for="(text, key) in REWARD_TYPE_TEXT" :key="key" :label="text" :value="key" />
      </el-select>
    </el-form-item>

    <!-- 藏品 -->
    <template v-if="local.reward_type === 'collectible'">
      <el-form-item label="目标藏品" required>
        <el-select v-model="local.collectible_id" filterable style="width: 100%" placeholder="选择已创建藏品">
          <el-option v-for="c in collectibles" :key="c.id" :label="`${c.name}（库存池 ${c.stock_pool}）`" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="数量(计划上限)">
        <el-input-number v-model="local.quantity" :min="1" :max="999999" :precision="0" controls-position="right" style="width: 100%" />
        <div class="tip">配置数量为「计划上限」，实际发放时动态校验该藏品配额预留库存，先到先得，不足时拦截提示</div>
      </el-form-item>
    </template>

    <!-- 优先购白名单资格 -->
    <template v-if="local.reward_type === 'priority'">
      <el-form-item label="优先购活动" required>
        <el-select v-model="local.priority_activity_id" style="width: 100%" placeholder="选择优先购活动">
          <el-option v-for="a in priorityActivities" :key="a.id" :label="a.name" :value="a.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="资格数量">
        <el-input-number v-model="local.priority_count" :min="1" :max="99" :precision="0" controls-position="right" style="width: 100%" />
      </el-form-item>
    </template>

    <!-- 资格购资格 -->
    <template v-if="local.reward_type === 'qualification'">
      <el-form-item label="目标藏品" required>
        <el-select v-model="local.qualification_collectible_id" filterable style="width: 100%" placeholder="选择目标藏品（用户获得该藏品的购买资格）">
          <el-option v-for="c in collectibles" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="资格数量">
        <el-input-number v-model="local.qualification_count" :min="1" :max="99" :precision="0" controls-position="right" style="width: 100%" />
      </el-form-item>
      <el-form-item label="有效期" required>
        <el-date-picker
          v-model="local.valid_until"
          type="datetime"
          placeholder="精确到时分秒"
          style="width: 100%"
        />
      </el-form-item>
    </template>

    <!-- 抽奖次数 -->
    <template v-if="local.reward_type === 'lottery_times'">
      <el-form-item label="抽奖次数">
        <el-input-number v-model="local.lottery_times" :min="1" :max="999" :precision="0" controls-position="right" style="width: 100%" />
      </el-form-item>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import type { RewardConfig } from '@/types'
import { REWARD_TYPE_TEXT } from '@/types'
import { getCollectibleList, type CollectibleItem } from '@/api/collectible'
import { getPriorityActivityList, type PriorityActivity } from '@/api/marketing'

const props = defineProps<{ modelValue: RewardConfig | null | undefined }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: RewardConfig): void }>()

const collectibles = ref<CollectibleItem[]>([])
const priorityActivities = ref<PriorityActivity[]>([])

const local = reactive<RewardConfig>({
  reward_type: 'collectible',
  collectible_id: undefined,
  quantity: 1,
  priority_activity_id: undefined,
  priority_count: 1,
  qualification_collectible_id: undefined,
  qualification_count: 1,
  valid_until: undefined,
  lottery_times: 1
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) Object.assign(local, val)
  },
  { immediate: true, deep: true }
)

watch(local, (val) => {
  emit('update:modelValue', { ...val })
}, { deep: true })

function onTypeChange(): void {
  local.collectible_id = undefined
  local.quantity = 1
  local.priority_activity_id = undefined
  local.priority_count = 1
  local.qualification_collectible_id = undefined
  local.qualification_count = 1
  local.valid_until = undefined
  local.lottery_times = 1
}

onMounted(() => {
  getCollectibleList({ page: 1, page_size: 200 }).then((res) => (collectibles.value = res.list))
  getPriorityActivityList({ page: 1, page_size: 200 }).then((res) => (priorityActivities.value = res.list))
})
</script>

<style lang="scss" scoped>
.tip {
  width: 100%;
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
  line-height: 1.6;
}
</style>
