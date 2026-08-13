import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types'

export interface MockContext {
  params: Record<string, string>
  query: Record<string, unknown>
  body: Record<string, unknown>
  token: string
}

export interface MockResult {
  code: number
  data: unknown
  message: string
}

type MockHandler = (ctx: MockContext) => MockResult | Promise<MockResult>

interface MockRoute {
  method: string
  pattern: string[]
  handler: MockHandler
}

const routes: MockRoute[] = []

export function isMockEnabled(): boolean {
  return import.meta.env.VITE_USE_MOCK === 'true'
}

export function ok(data: unknown, message = 'ok'): MockResult {
  return { code: 200, data, message }
}

export function fail(message: string, code = 500): MockResult {
  return { code, data: null, message }
}

export function registerMock(method: string, urlPattern: string, handler: MockHandler): void {
  const normalized = urlPattern.replace(/^\/api/, '')
  routes.push({ method: method.toLowerCase(), pattern: normalized.split('/').filter(Boolean), handler })
}

export function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const method = (config.method || 'get').toLowerCase()
  const url = (config.url || '').replace(/^\/api/, '')
  const urlSegments = url.split('/').filter(Boolean)

  const candidates: Array<{ route: MockRoute; params: Record<string, string>; paramCount: number }> = []

  for (const route of routes) {
    if (route.method !== method) continue
    if (route.pattern.length !== urlSegments.length) continue
    const params: Record<string, string> = {}
    let matched = true
    let paramCount = 0
    for (let i = 0; i < route.pattern.length; i += 1) {
      const pat = route.pattern[i]
      if (pat.startsWith(':')) {
        paramCount += 1
        params[pat.slice(1)] = decodeURIComponent(urlSegments[i])
      } else if (pat !== urlSegments[i]) {
        matched = false
        break
      }
    }
    if (matched) candidates.push({ route, params, paramCount })
  }

  if (candidates.length === 0) {
    return Promise.reject(new Error(`Mock: no handler for ${method.toUpperCase()} ${url}`))
  }

  candidates.sort((a, b) => a.paramCount - b.paramCount)
  const { route, params } = candidates[0]

  let body: Record<string, unknown> = {}
  if (typeof config.data === 'string') {
    try {
      body = JSON.parse(config.data) as Record<string, unknown>
    } catch {
      body = {}
    }
  } else {
    body = (config.data || {}) as Record<string, unknown>
  }

  const ctx: MockContext = {
    params,
    query: (config.params || {}) as Record<string, unknown>,
    body,
    token: config.headers?.Authorization ? String(config.headers.Authorization).replace('Bearer ', '') : ''
  }
  return new Promise<AxiosResponse>((resolve, reject) => {
    // 模拟网络延迟
    setTimeout(async () => {
      try {
        const result = await route.handler(ctx)
        const apiRes: ApiResponse = { code: result.code, data: result.data, message: result.message }
        const response: AxiosResponse = {
          data: apiRes,
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
        resolve(response)
      } catch (err) {
        reject(err)
      }
    }, 200 + Math.random() * 300)
  })
}

export function createMockAdapter(): AxiosAdapter {
  return mockAdapter
}

// 分页查询辅助
export function paginate<T>(list: T[], page: number, pageSize: number): { list: T[]; total: number } {
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total: list.length }
}

// 从 query 中读取分页参数
export function getPageQuery(ctx: MockContext): { page: number; page_size: number } {
  const page = Number(ctx.query.page || 1)
  const page_size = Number(ctx.query.page_size || 20)
  return { page, page_size }
}

// 从 query 读取 key 对应的筛选值（不存在返回 undefined）
export function qs(ctx: MockContext, key: string): string | undefined {
  const value = ctx.query[key]
  if (value === undefined || value === null || value === '') return undefined
  return String(value)
}
