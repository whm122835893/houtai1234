import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

export function formatDate(date: string | number | Date | null | undefined, pattern = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '-'
  return dayjs(date).format(pattern)
}

export function formatDateOnly(date: string | number | Date | null | undefined): string {
  return formatDate(date, 'YYYY-MM-DD')
}

export function fromNow(date: string | number | Date): string {
  return formatDate(date)
}

// 时间范围快捷
export function dateRangeShortcuts(): Array<{ text: string; value: () => [Date, Date] }> {
  return [
    { text: '今天', value: () => [dayjs().startOf('day').toDate(), dayjs().endOf('day').toDate()] },
    { text: '昨天', value: () => [dayjs().subtract(1, 'day').startOf('day').toDate(), dayjs().subtract(1, 'day').endOf('day').toDate()] },
    { text: '近7天', value: () => [dayjs().subtract(6, 'day').startOf('day').toDate(), dayjs().endOf('day').toDate()] },
    { text: '近30天', value: () => [dayjs().subtract(29, 'day').startOf('day').toDate(), dayjs().endOf('day').toDate()] },
    { text: '本月', value: () => [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()] }
  ]
}
