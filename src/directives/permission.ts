import type { Directive, DirectiveBinding } from 'vue'
import { usePermissionStore } from '@/store/permission'

// 按钮权限指令 v-permission="['xxx']"
export const permission: Directive<HTMLElement, string[] | string> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string[] | string>) {
    const store = usePermissionStore()
    const required = Array.isArray(binding.value) ? binding.value : [binding.value]
    const has = required.every((item) => store.permissions.includes(item))
    if (!has) {
      el.parentNode?.removeChild(el)
    }
  }
}
