import http from '@/utils/request'

export interface SiteConfig {
  site_name: string
  site_logo: string
  site_description: string
  icp: string
  customer_service_phone: string
  recharge_min: string
  recharge_max: string
  register_enabled: boolean
  login_enabled: boolean
}

export interface PaymentChannel {
  id: number
  name: string
  channel: string
  enabled: boolean
  fee_rate: string
  config: Record<string, string>
  updated_at: string
}

export function getSiteConfig(): Promise<SiteConfig> {
  return http.get<SiteConfig>('/system/site')
}

export function saveSiteConfig(data: SiteConfig): Promise<null> {
  return http.post<null>('/system/site', data)
}

export function getPaymentChannels(): Promise<PaymentChannel[]> {
  return http.get<PaymentChannel[]>('/system/payment-channels')
}

export function savePaymentChannel(data: PaymentChannel, password: string): Promise<null> {
  return http.post<null>('/system/payment-channels', { ...data, password })
}

export interface ThirdPartyConfig {
  oss: { access_key: string; bucket: string; endpoint: string }
  sms: { provider: string; sign_name: string; enabled: boolean }
  map: { provider: string; key: string }
  payment: { provider: string; merchant_id: string }
}

export function getThirdPartyConfig(): Promise<ThirdPartyConfig> {
  return http.get<ThirdPartyConfig>('/system/third-party')
}

export function saveThirdPartyConfig(data: ThirdPartyConfig, password: string): Promise<null> {
  return http.post<null>('/system/third-party', { ...data, password })
}

export function getAgreements(): Promise<Record<string, string>> {
  return http.get<Record<string, string>>('/system/agreements')
}

export function saveAgreement(key: string, content: string, password: string): Promise<null> {
  return http.post<null>('/system/agreements', { key, content, password })
}
