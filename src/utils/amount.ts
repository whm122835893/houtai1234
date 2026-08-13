import Decimal from 'decimal.js'

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

// 金额统一使用字符串传输，展示保留两位小数
export function formatAmount(value: string | number | Decimal | null | undefined, keep = 2): string {
  if (value === null || value === undefined || value === '') return '0.00'
  const d = new Decimal(value)
  return d.toFixed(keep)
}

export function toAmount(value: string | number | Decimal): string {
  return new Decimal(value).toFixed(2)
}

export function add(a: string | number, b: string | number): string {
  return new Decimal(a).plus(new Decimal(b)).toFixed(2)
}

export function subtract(a: string | number, b: string | number): string {
  return new Decimal(a).minus(new Decimal(b)).toFixed(2)
}

export function multiply(a: string | number, b: string | number): string {
  return new Decimal(a).mul(new Decimal(b)).toFixed(2)
}

export function divide(a: string | number, b: string | number): string {
  if (new Decimal(b).eq(0)) return '0'
  return new Decimal(a).div(new Decimal(b)).toFixed(2)
}

// 千分位展示
export function formatThousands(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0'
  const d = new Decimal(value)
  const parts = d.toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}
