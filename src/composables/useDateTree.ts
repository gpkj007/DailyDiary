import type { DiaryEntry, TreeNode } from '@/types/diary'
import { getYear, getMonth, getMonthLabel } from '@/utils/dateHelpers'

export function buildDateTree(entries: DiaryEntry[]): TreeNode[] {
  console.log('[buildDateTree] input entries:', entries.length)
  const yearMap = new Map<string, Map<string, Map<string, TreeNode>>>()

  for (const entry of entries) {
    const date = entry.frontmatter.date
    if (!date || typeof date !== 'string' || date.length < 10) {
      console.error('[buildDateTree] invalid date for entry:', entry.path, 'date:', date)
      continue
    }
    const y = getYear(date)
    const m = getMonth(date)
    const d = date

    if (!yearMap.has(y)) {
      yearMap.set(y, new Map())
    }
    const monthMap = yearMap.get(y)!
    if (!monthMap.has(m)) {
      monthMap.set(m, new Map())
    }
    const dayMap = monthMap.get(m)!
    if (!dayMap.has(d)) {
      dayMap.set(d, {
        key: `day-${d}`,
        label: d,
        type: 'day',
        date: d,
        path: entry.path
      })
    }
  }

  const tree: TreeNode[] = []
  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => a.localeCompare(b))

  for (const y of sortedYears) {
    const monthMap = yearMap.get(y)!
    const monthNodes: TreeNode[] = []
    const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => a.localeCompare(b))

    for (const m of sortedMonths) {
      const dayMap = monthMap.get(m)!
      const dayNodes: TreeNode[] = []
      const sortedDays = Array.from(dayMap.keys()).sort((a, b) => a.localeCompare(b))

      for (const d of sortedDays) {
        dayNodes.push(dayMap.get(d)!)
      }

      monthNodes.push({
        key: `month-${m}`,
        label: getMonthLabel(m + '-01'),
        type: 'month',
        children: dayNodes
      })
    }

    tree.push({
      key: `year-${y}`,
      label: `${y}年`,
      type: 'year',
      children: monthNodes
    })
  }

  return tree
}
