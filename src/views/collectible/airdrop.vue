<template>
  <div class="app-page">
    <div class="app-card" style="max-width: 720px; margin: 0 auto">
      <div class="card-header">
        <div class="card-title">独立空投</div>
      </div>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-16"
        title="独立空投不绑定任何营销活动，属纯粹的藏品发放功能，可在任意阶段执行（未发售前、发售中、售罄后），只要库存池大于0即可。"
      />

      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" v-loading="loading">
        <el-form-item label="空投藏品">
          <el-select v-model="form.collectible_id" filterable placeholder="请选择藏品" style="width: 100%" @change="onSelectCollectible">
            <el-option
              v-for="c in collectibleOptions"
              :key="c.id"
              :label="`${c.name}（库存池 ${c.stock_pool}）`"
              :value="c.id"
              :disabled="c.stock_pool <= 0"
            />
          </el-select>
        </el-form-item>

        <template v-if="selectedCollectible">
          <div class="stock-summary">
            <span>藏品名称：<b>{{ selectedCollectible.name }}</b></span>
            <span>发行总量：<b>{{ selectedCollectible.total_supply }}</b></span>
            <span>库存池：<b class="pool">{{ selectedCollectible.stock_pool }}</b></span>
            <span>流通量：<b>{{ selectedCollectible.circulation }}</b></span>
          </div>

          <el-form-item label="空投数量" prop="quantity">
            <el-input-number v-model="form.quantity" :min="1" :max="selectedCollectible.stock_pool || 1" :precision="0" controls-position="right" style="width: 100%" />
            <div class="form-tip">空投数量不得超过库存池，当前库存池 {{ selectedCollectible.stock_pool }}</div>
          </el-form-item>

          <el-form-item label="接收手机号" prop="phones_text">
            <el-input
              v-model="form.phones_text"
              type="textarea"
              :rows="6"
              placeholder="每行一个手机号，批量导入，换行分隔"
            />
            <div class="form-tip">
              已输入 {{ phoneList.length }} 个手机号，系统将校验手机号格式及是否平台已注册用户，未注册直接拦截提示
            </div>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="submit">下一步：二次确认</el-button>
          </el-form-item>
        </template>
      </el-form>
    </div>

    <!-- 二次确认 -->
    <el-dialog v-model="confirmVisible" title="二次确认 · 独立空投" :width="appStore.mobile ? '100%' : '520px'" append-to-body>
      <div class="confirm-summary">
        <div class="c-row"><span>藏品名称</span><b>{{ selectedCollectible?.name }}</b></div>
        <div class="c-row"><span>空投数量</span><b>{{ form.quantity }} 份</b></div>
        <div class="c-row"><span>接收用户数</span><b>{{ phoneList.length }} 人</b></div>
        <div class="c-row"><span>预计扣减库存池</span><b class="danger">{{ form.quantity }}</b></div>
      </div>
      <el-form label-width="100px">
        <el-form-item label="管理员密码" required>
          <el-input v-model="password" type="password" show-password placeholder="请输入管理员登录密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="confirmVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmSubmit">确认空投</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { getCollectibleList, independentAirdrop, type CollectibleItem } from '@/api/collectible'
import { parsePhoneList } from '@/utils/validate'
import { useAppStore } from '@/store/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const confirmVisible = ref(false)
const password = ref('')

const allCollectibles = ref<CollectibleItem[]>([])
const form = reactive({ collectible_id: 0, quantity: 1, phones_text: '' })

const collectibleOptions = computed(() => allCollectibles.value.filter((c) => c.status !== 'draft' || c.stock_pool > 0))

const selectedCollectible = computed(() => allCollectibles.value.find((c) => c.id === form.collectible_id))

const phoneList = computed(() => parsePhoneList(form.phones_text))

const rules: FormRules = {
  quantity: [{ required: true, message: '请输入空投数量', trigger: 'blur' }],
  phones_text: [
    { required: true, message: '请填写接收手机号', trigger: 'blur' },
    {
      validator: (_rule: unknown, _value: string, callback: (err?: Error) => void) => {
        if (phoneList.value.length === 0) callback(new Error('请至少填写一个手机号'))
        else callback()
      },
      trigger: 'blur'
    }
  ]
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await getCollectibleList({ page: 1, page_size: 200 })
    allCollectibles.value = res.list
    const preset = Number(route.query.id)
    if (preset) form.collectible_id = preset
  } finally {
    loading.value = false
  }
})

function onSelectCollectible(): void {
  const c = selectedCollectible.value
  if (c) form.quantity = 1
}

async function submit(): Promise<void> {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  if (form.quantity > (selectedCollectible.value?.stock_pool || 0)) {
    ElMessage.error(`空投数量不得超过库存池，当前库存池为 ${selectedCollectible.value?.stock_pool}`)
    return
  }
  password.value = ''
  confirmVisible.value = true
}

async function confirmSubmit(): Promise<void> {
  if (!password.value) {
    ElMessage.warning('请输入管理员密码')
    return
  }
  submitting.value = true
  try {
    const result = await independentAirdrop(form.collectible_id, {
      quantity: form.quantity,
      phones: phoneList.value,
      password: password.value
    })
    ElMessage.success(`空投完成，任务号 ${result.task_no}，成功 ${result.success_count} 人`)
    confirmVisible.value = false
    router.push('/collectible/records')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.stock-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: $bg-page;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 16px;
  font-size: 13px;
  color: $text-regular;

  b {
    color: $text-primary;
  }

  .pool {
    color: $color-primary;
    font-size: 18px;
  }
}

.form-tip {
  width: 100%;
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
}

.confirm-summary {
  background: $bg-page;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;

  .c-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px dashed $border-color;
    font-size: 14px;

    &:last-child {
      border-bottom: none;
    }

    span {
      color: $text-secondary;
    }

    .danger {
      color: $color-danger;
    }
  }
}
</style>
