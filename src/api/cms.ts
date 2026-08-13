import http from '@/utils/request'
import type { PageResult } from '@/types'

export interface Banner {
  id: number
  title: string
  image: string
  link: string
  sort: number
  status: 'enabled' | 'disabled'
  created_at: string
}

export interface Notice {
  id: number
  title: string
  content: string
  type: 'notice' | 'announcement'
  status: 'published' | 'draft'
  published_at: string | null
  created_at: string
}

export interface HelpItem {
  id: number
  title: string
  content: string
  category: string
  sort: number
  created_at: string
}

export function getBannerList(params: Record<string, unknown>): Promise<PageResult<Banner>> {
  return http.get<PageResult<Banner>>('/cms/banners', params)
}

export function saveBanner(data: Partial<Banner>): Promise<Banner> {
  return http.post<Banner>('/cms/banners', data)
}

export function deleteBanner(id: number): Promise<null> {
  return http.delete<null>(`/cms/banners/${id}`)
}

export function getNoticeList(params: Record<string, unknown>): Promise<PageResult<Notice>> {
  return http.get<PageResult<Notice>>('/cms/notices', params)
}

export function saveNotice(data: Partial<Notice>): Promise<Notice> {
  return http.post<Notice>('/cms/notices', data)
}

export function deleteNotice(id: number): Promise<null> {
  return http.delete<null>(`/cms/notices/${id}`)
}

export function getHelpList(params: Record<string, unknown>): Promise<PageResult<HelpItem>> {
  return http.get<PageResult<HelpItem>>('/cms/help', params)
}

export function saveHelp(data: Partial<HelpItem>): Promise<HelpItem> {
  return http.post<HelpItem>('/cms/help', data)
}

export function deleteHelp(id: number): Promise<null> {
  return http.delete<null>(`/cms/help/${id}`)
}

export interface Article {
  id: number
  title: string
  content: string
  collectible_id: number
  collectible_name: string
  status: 'published' | 'draft'
  created_at: string
}

export function getArticleList(params: Record<string, unknown>): Promise<PageResult<Article>> {
  return http.get<PageResult<Article>>('/cms/articles', params)
}

export function saveArticle(data: Partial<Article>): Promise<null> {
  return http.post<null>('/cms/articles', data)
}

export function deleteArticle(id: number): Promise<null> {
  return http.delete<null>(`/cms/articles/${id}`)
}
