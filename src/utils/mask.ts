// 数据脱敏工具
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '-'
  if (phone.length < 7) return phone
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

export function maskName(name: string | null | undefined): string {
  if (!name) return '-'
  if (name.length <= 1) return `${name}*`
  if (name.length === 2) return `${name[0]}*`
  return `${name[0]}**`
}

export function maskIdCard(id: string | null | undefined): string {
  if (!id) return '-'
  if (id.length < 8) return `${id[0]}****`
  return `${id.slice(0, 3)}${'*'.repeat(Math.max(6, id.length - 7))}${id.slice(-4)}`
}
