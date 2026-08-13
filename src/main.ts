import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

import App from './App.vue'
import router from './router'
import pinia from './store'
import { permission } from './directives/permission'
import '@/assets/styles/index.scss'
// 注册 mock 路由处理器（真实后端联调时移除或关闭 VITE_USE_MOCK）
import '@/api/mock'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.directive('permission', permission)

app.mount('#app')
