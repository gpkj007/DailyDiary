import { format, parseISO } from 'date-fns'

export function formatDateKey(dateStr: string): string {
  return dateStr
}

export function getYear(dateStr: string): string {
  return dateStr.slice(0, 4)
}

export function getMonth(dateStr: string): string {
  return dateStr.slice(0, 7)
}

export function getMonthLabel(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'M月')
  } catch {
    return dateStr.slice(5, 7) + '月'
  }
}

export function getDayLabel(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'd日')
  } catch {
    return dateStr.slice(8, 10) + '日'
  }
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
