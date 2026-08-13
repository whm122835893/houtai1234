import { defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'
import { pathToName } from '@/router/views'

export interface TabItem {
  path: string
  title: string
  name: string
  affix: boolean
}

interface AppState {
  sidebarCollapsed: boolean
  mobile: boolean
  mobileDrawer: boolean
  activeMenu: string
  tabs: TabItem[]
  theme: 'light' | 'dark'
  fullscreen: boolean
}

const DEFAULT_TABS: TabItem[] = [
  { path: '/dashboard', title: '数据大盘', name: 'Dashboard', affix: true }
]

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarCollapsed: false,
    mobile: false,
    mobileDrawer: false,
    activeMenu: '',
    tabs: [...DEFAULT_TABS],
    theme: 'light',
    fullscreen: false
  }),
  actions: {
    toggleSidebar(): void {
      if (this.mobile) {
        this.mobileDrawer = !this.mobileDrawer
      } else {
        this.sidebarCollapsed = !this.sidebarCollapsed
      }
    },
    setMobile(val: boolean): void {
      this.mobile = val
    },
    setMobileDrawer(val: boolean): void {
      this.mobileDrawer = val
    },
    setActiveMenu(path: string): void {
      this.activeMenu = path
    },
    addTab(route: RouteLocationNormalized): void {
      const path = route.path
      if (path === '/login') return
      if (this.tabs.some((tab) => tab.path === path)) return
      const title = (route.meta?.title as string | undefined) || path
      this.tabs.push({ path, title, name: pathToName(path), affix: Boolean(route.meta?.affix) })
    },
    removeTab(path: string): string {
      const index = this.tabs.findIndex((tab) => tab.path === path)
      if (index === -1) return ''
      const tab = this.tabs[index]
      if (tab.affix) return path
      this.tabs.splice(index, 1)
      if (this.activeMenu === path) {
        const next = this.tabs[index] || this.tabs[index - 1]
        return next ? next.path : '/'
      }
      return ''
    },
    closeOthers(path: string): void {
      this.tabs = this.tabs.filter((tab) => tab.affix || tab.path === path)
    },
    closeAll(): void {
      this.tabs = this.tabs.filter((tab) => tab.affix)
    },
    setTheme(theme: 'light' | 'dark'): void {
      this.theme = theme
      document.documentElement.setAttribute('data-theme', theme)
    },
    toggleTheme(): void {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light')
    },
    setFullscreen(val: boolean): void {
      this.fullscreen = val
    }
  }
})
