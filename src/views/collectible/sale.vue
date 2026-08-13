<template>
  <div class="app-page">
    <div class="app-card">
      <div class="card-header">
        <div class="card-title">{{ pageTitle }}</div>
      </div>

      <!-- 库存概况 -->
      <div class="stock-bar">
        <div class="stock-item"><span>发行总量</span><b>{{ detail?.total_supply }}</b></div>
        <div class="stock-item"><span>已售出发售</span><b>{{ detail?.sold_sale }}</b></div>
        <div class="stock-item"><span>已配置配额</span><b>{{ detail?.configured_quota }}</b></div>
        <div class="stock-item"><span>库存池</span><b class="stock-pool">{{ detail?.stock_pool }}</b></div>
        <div class="stock-item"><span>流通量</span><b>{{ detail?.circulation }}</b></div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" v-loading="loading" @submit.prevent>
        <el-form-item label="发售数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" :max="detail?.stock_pool || 999999" :precision="0" controls-position="right" style="width: 240px" />
          <span class="stock-limit">不得大于当前库存池 {{ detail?.stock_pool }}</span>
        </el-form-item>
        <el-form-item label="发售价格(元)" prop="price">
          <el-input-number v-model="form.price" :min="0.01" :precision="2" :step="0.1" controls-position="right" style="width: 240px" />
        </el-form-item>
        <el-form-item label="发售时间" prop="dateRange">
          <el-date-picker
            v-model="form.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%; max-width: 460px"
            :default-time="[new Date(2000, 1, 1, 10, 0, 0), new Date(2000, 1, 1, 22, 0, 0)]"
          />
        </el-form-item>
        <el-form-item label="每人限购" prop="limit_per_user">
          <el-input-number v-model="form.limit_per_user" :min="1" :max="99" :precision="0" controls-position="right" style="width: 240px" />
        </el-form-item>

        <!-- 资格购 -->
        <el-form-item label="资格购">
          <div style="width: 100%">
            <el-switch v-model="form.qualification_enabled" active-text="开启资格购" />
            <el-alert
              v-if="form.qualification_enabled"
              type="info"
              :closable="false"
              class="mt-8"
              title="资格购仅作为购买条件限制，不占独立配额、不冻结库存。持有优先购资格的用户可直接购买（优先购权限覆盖资格购限制）。"
            />
          </div>
        </el-form-item>

        <template v-if="form.qualification_enabled">
          <el-form-item label="资格藏品" required>
            <div style="width: 100%">
              <el-select
                v-model="form.qualification_collectible_ids"
                multiple
                filterable
                placeholder="仅可选择流通量大于0的流通藏品"
                style="width: 100%; max-width: 460px"
              >
                <el-option
                  v-for="c in qualifiedCollectibles"
                  :key="c.id"
                  :label="`${c.name}（流通量 ${c.circulation}）`"
                  :value="c.id"
                  :disabled="!c.qualification_enabled"
                />
              </el-select>
              <div class="form-tip">资格藏品必须为已有用户持有的流通藏品，包括已发售、合成产出、抽奖获得、二级市场流通的藏品</div>
            </div>
          </el-form-item>
          <el-form-item label="额外资格手机号">
            <div style="width: 100%">
              <el-input
                v-model="form.qualification_phones_text"
                type="textarea"
                :rows="4"
                placeholder="每行一个手机号，换行分隔。这些用户无需持有资格藏品即可购买，必须是平台已注册用户"
              />
              <div class="form-tip">未注册用户将被拦截提示，每行一个手机号</div>
            </div>
          </el-form-item>
        </template>

        <el-form-item label="转赠开关">
          <el-switch v-model="form.transfer_enabled" active-text="开启" inactive-text="关闭" />
          <span class="form-tip-inline">关闭后用户端转赠按钮隐藏/置灰，已发起待确认转赠不受影响</span>
        </el-form-item>
        <el-form-item label="寄售开关">
          <el-switch v-model="form.consign_enabled" active-text="开启" inactive-text="关闭" />
          <span class="form-tip-inline">关闭后该藏品全部在售挂单自动下架</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="save">{{ submitText }}</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getCollectibleDetail, configureSale, getCollectibleList, type CollectibleItem } from '@/api/collectible'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const saving = ref(false)
const detail = ref<CollectibleItem | null>(null)
const allCollectibles = ref<CollectibleItem[]>([])

const form = reactive({
  id: 0,
  quantity: 100,
  price: 19.9,
  dateRange: [] as unknown as [string, string],
  limit_per_user: 1,
  qualification_enabled: false,
  qualification_collectible_ids: [] as number[],
  qualification_phones_text: '',
  transfer_enabled: true,
  consign_enabled: true
})

const rules: FormRules = {
  quantity: [{ required: true, message: '请输入发售数量', trigger: 'blur' }],
  price: [{ required: true, message: '请输入发售价格', trigger: 'blur' }],
  dateRange: [{ required: true, message: '请选择发售时间', trigger: 'change' }]
}

const qualifiedCollectibles = computed(() =>
  allCollectibles.value.filter((c) => c.id !== detail.value?.id && c.circulation > 0)
)

const pageTitle = computed(() => {
  if (!detail.value) return '发售配置'
  if (detail.value.status === 'on_sale') return '发售配置'
  if (detail.value.status === 'sold_out' || detail.value.status === 'off_shelf') return '重新上架'
  return '配置发售上架'
})

const submitText = computed(() => (detail.value?.status === 'on_sale' ? '保存发售配置' : '确认上架'))

onMounted(async () => {
  loading.value = true
  try {
    const id = Number(route.query.id)
    detail.value = await getCollectibleDetail(id)
    form.id = detail.value.id
    if (detail.value.sale_quantity > 0) {
      form.quantity = detail.value.sale_quantity
      form.price = Number(detail.value.price)
      if (detail.value.sale_start_at) {
        form.dateRange = [detail.value.sale_start_at, detail.value.sale_end_at || detail.value.sale_start_at]
      }
      form.limit_per_user = detail.value.limit_per_user
      form.qualification_enabled = detail.value.qualification_enabled
      form.qualification_collectible_ids = [...detail.value.qualification_collectible_ids]
      form.qualification_phones_text = detail.value.qualification_phones.join('\n')
      form.transfer_enabled = detail.value.transfer_enabled
      form.consign_enabled = detail.value.consign_enabled
    }
    const res = await getCollectibleList({ page: 1, page_size: 200 })
    allCollectibles.value = res.list
  } finally {
    loading.value = false
  }
})

async function save(): Promise<void> {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  if (form.quantity > (detail.value?.stock_pool ?? 0)) {
    ElMessage.error(`发售数量不得超过当前库存池，当前库存池为 ${detail.value?.stock_pool}`)
    return
  }
  const phones = form.qualification_phones_text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  const { value: password } = await ElMessageBox.prompt('请输入管理员登录密码', '确认执行发售配置', {
    inputType: 'password',
    inputPlaceholder: '管理员密码',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputValidator: (val: string) => {
      if (!val) return '请输入密码'
      return true
    }
  })
  saving.value = true
  try {
    await configureSale(
      form.id,
      {
        price: form.price.toFixed(2),
        quantity: form.quantity,
        start_at: form.dateRange[0],
        end_at: form.dateRange[1],
        limit_per_user: form.limit_per_user,
        qualification_enabled: form.qualification_enabled,
        qualification_collectible_ids: form.qualification_enabled ? form.qualification_collectible_ids : [],
        qualification_phones: phones,
        transfer_enabled: form.transfer_enabled,
        consign_enabled: form.consign_enabled
      },
      password
    )
    ElMessage.success('发售配置成功，藏品已上架')
    router.push('/collectible/list')
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.stock-bar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  background: $bg-page;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  .stock-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    span {
      font-size: 12px;
      color: $text-secondary;
    }

    b {
      font-size: 20px;
      color: $text-primary;
    }

    .stock-pool {
      color: $color-primary;
      font-size: 24px;
    }
  }
}

.stock-limit {
  margin-left: 12px;
  font-size: 12px;
  color: $text-secondary;
}

.form-tip {
  width: 100%;
  font-size: 12px;
  color: $text-secondary;
  line-height: 1.6;
  margin-top: 4px;
}

.form-tip-inline {
  margin-left: 12px;
  font-size: 12px;
  color: $text-secondary;
}
</style>
