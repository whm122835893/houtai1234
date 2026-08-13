<template>
  <div class="app-page">
    <div class="app-card" style="max-width: 760px; margin: 0 auto">
      <div class="card-header">
        <div class="card-title">{{ isEdit ? '编辑藏品' : '创建藏品' }}</div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" @submit.prevent>
        <el-form-item label="藏品名称" prop="name">
          <el-input v-model="form.name" placeholder="如：龙腾盛世 数字藏品" maxlength="40" show-word-limit />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="选择分类" style="width: 100%">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="发行总量" prop="total_supply">
          <el-input-number v-model="form.total_supply" :min="1" :max="999999" :precision="0" controls-position="right" style="width: 100%" :disabled="isEdit" />
          <div class="form-tip">
            发行总量为全局唯一基准值，创建后不可变更（示例：1000份）
          </div>
        </el-form-item>
        <el-form-item label="发行方" prop="issuer">
          <el-input v-model="form.issuer" placeholder="发行方名称" />
        </el-form-item>
        <el-form-item label="创作者" prop="creator">
          <el-input v-model="form.creator" placeholder="创作者姓名" />
        </el-form-item>
        <el-form-item label="藏品图片">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="onBeforeUpload"
          >
            <img v-if="form.image" :src="form.image" class="avatar" alt="" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="form-tip">支持 JPG/PNG，单张不超过 5MB，OSS 直传</div>
        </el-form-item>
        <el-form-item label="藏品故事" prop="story">
          <el-input v-model="form.story" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="讲述藏品背后的文化故事" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="save">{{ isEdit ? '保存修改' : '创建藏品' }}</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { createCollectible, updateCollectible, getCollectibleDetail } from '@/api/collectible'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const saving = ref(false)

const categories = ['国潮', '数字艺术', '文博', '潮玩', '动漫', '体育']

const form = reactive({
  id: 0,
  name: '',
  category: '数字艺术',
  total_supply: 1000,
  issuer: '数和文创',
  creator: '',
  image: '',
  story: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入藏品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  total_supply: [{ required: true, message: '请输入发行总量', trigger: 'blur' }],
  issuer: [{ required: true, message: '请输入发行方', trigger: 'blur' }]
}

const isEdit = computed(() => Number(route.query.id) > 0)

onMounted(async () => {
  if (isEdit.value) {
    const id = Number(route.query.id)
    const detail = await getCollectibleDetail(id)
    Object.assign(form, {
      id: detail.id,
      name: detail.name,
      category: detail.category,
      total_supply: detail.total_supply,
      issuer: detail.issuer,
      creator: detail.creator,
      image: detail.image,
      story: detail.story
    })
  }
})

function onBeforeUpload(file: File): boolean {
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片不能超过 5MB')
    return false
  }
  form.image = URL.createObjectURL(file)
  ElMessage.success('图片已选择（联调后走 OSS 直传）')
  return false
}

async function save(): Promise<void> {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (isEdit.value) {
      await updateCollectible(form.id, { ...form })
      ElMessage.success('保存成功')
    } else {
      await createCollectible({ ...form })
      ElMessage.success('藏品已创建，可前往发售配置')
    }
    router.push('/collectible/list')
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.form-tip {
  width: 100%;
  font-size: 12px;
  color: $text-secondary;
  line-height: 1.6;
}

.avatar-uploader :deep(.el-upload) {
  width: 120px;
  height: 120px;
  border: 1px dashed $border-light;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-page;
}

.avatar {
  width: 120px;
  height: 120px;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 26px;
  color: $text-secondary;
}
</style>
