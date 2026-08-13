// 表单校验工具
export const phonePattern = /^1[3-9]\d{9}$/

export function isValidPhone(phone: string): boolean {
  return phonePattern.test(phone)
}

export function validatePhone(_rule: unknown, value: string, callback: (error?: Error) => void): void {
  if (!value) {
    callback()
    return
  }
  if (!isValidPhone(value)) {
    callback(new Error('手机号格式不正确'))
    return
  }
  callback()
}

export function validateIdCard(_rule: unknown, value: string, callback: (error?: Error) => void): void {
  if (!value) {
    callback()
    return
  }
  const reg = /^\d{17}[\dXx]$/
  if (!reg.test(value)) {
    callback(new Error('身份证号格式不正确'))
    return
  }
  callback()
}

// 解析换行分隔的手机号列表
export function parsePhoneList(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

// 概率输入 0.0001 ~ 100，保留4位小数
export function validateProbability(_rule: unknown, value: string | number | null | undefined, callback: (error?: Error) => void): void {
  if (value === null || value === undefined || value === '') {
    callback(new Error('请输入中奖概率'))
    return
  }
  const num = Number(value)
  if (Number.isNaN(num)) {
    callback(new Error('请输入数字'))
    return
  }
  if (num < 0.0001 || num > 100) {
    callback(new Error('概率必须在 0.0001 ~ 100 之间'))
    return
  }
  callback()
}
