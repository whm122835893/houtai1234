import axios, { type AxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, removeToken } from './token'
import { createMockAdapter, isMockEnabled } from './mockAdapter'
import type { ApiResponse } from '@/types'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000
})

if (isMockEnabled()) {
  service.defaults.adapter = createMockAdapter()
}

service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

service.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse
    // 非标准响应（如文件流）直接返回
    if (res === null || typeof res !== 'object' || !('code' in res)) {
      return response.data
    }
    if (res.code === 200) {
      return res.data
    }
    if (res.code === 401) {
      ElMessageBox.confirm('登录状态已过期，请重新登录', '提示', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          removeToken()
          window.location.href = '/login'
        })
        .catch(() => {})
      return Promise.reject(new Error(res.message || '未登录'))
    }
    if (res.code === 403) {
      ElMessage.error(res.message || '无权限执行该操作')
      return Promise.reject(new Error(res.message || '无权限'))
    }
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    const msg = error?.response?.data?.message || error.message || '网络异常，请稍后重试'
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

// 统一请求方法，响应已解包为 data
export function request<T>(config: AxiosRequestConfig): Promise<T> {
  return service.request(config) as Promise<T>
}

export const http = {
  get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return request<T>({ url, method: 'get', params })
  },
  post<T>(url: string, data?: unknown): Promise<T> {
    return request<T>({ url, method: 'post', data })
  },
  put<T>(url: string, data?: unknown): Promise<T> {
    return request<T>({ url, method: 'put', data })
  },
  delete<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return request<T>({ url, method: 'delete', params })
  },
  // 导出文件流
  async download(url: string, params?: Record<string, unknown>, filename?: string): Promise<void> {
    const res = await request<Blob>({ url, method: 'get', params, responseType: 'blob' })
    const blob = res instanceof Blob ? res : new Blob([res as unknown as BlobPart])
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename || 'export.xlsx'
    link.click()
    URL.revokeObjectURL(link.href)
  }
}

export default http
