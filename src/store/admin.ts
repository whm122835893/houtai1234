import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, getAdminInfo } from '@/api/admin'
import { getToken, setToken, removeToken, getStoredUser, setStoredUser } from '@/utils/token'
import type { AdminUser, AdminRole } from '@/types'

interface LoginPayload {
  username: string
  password: string
}

interface AdminState {
  token: string
  user: AdminUser | null
  isLoaded: boolean
}

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    token: getToken(),
    user: getStoredUser<AdminUser>(),
    isLoaded: false
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    role: (state): AdminRole | '' => state.user?.role || '',
    isSuperAdmin: (state) => state.user?.role === 'super_admin',
    nickname: (state) => state.user?.nickname || state.user?.username || ''
  },
  actions: {
    async login(payload: LoginPayload): Promise<void> {
      const data = await loginApi(payload)
      this.token = data.token
      setToken(data.token)
      this.user = data.user
      setStoredUser(data.user)
    },
    async fetchUserInfo(): Promise<void> {
      const user = await getAdminInfo()
      this.user = user
      this.isLoaded = true
      setStoredUser(user)
    },
    async logout(): Promise<void> {
      try {
        await logoutApi()
      } catch {
        // 忽略登出接口异常
      }
      this.token = ''
      this.user = null
      this.isLoaded = false
      removeToken()
    }
  }
})
