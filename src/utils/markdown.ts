import matter from 'gray-matter'
import { format } from 'date-fns'
import type { Frontmatter } from '@/types/diary'

function normalizeDate(value: unknown): string {
  if (value instanceof Date) {
    return format(value, 'yyyy-MM-dd')
  }
  if (typeof value === 'string') {
    return value
  }
  return ''
}

export function parseEntry(raw: string): { frontmatter: Frontmatter; body: string } {
  try {
    const parsed = matter(raw)
    const frontmatter: Frontmatter = {
      title: (parsed.data.title as string) || '',
      date: normalizeDate(parsed.data.date),
      tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : []
    }
    if (!frontmatter.date) {
      console.warn('[parseEntry] missing date in frontmatter, raw preview:', raw.slice(0, 80))
    }
    return { frontmatter, body: parsed.content }
  } catch (err: any) {
    console.error('[parseEntry] matter parse error:', err?.message || err, 'raw preview:', raw.slice(0, 120))
    throw err
  }
}

export function serializeEntry(frontmatter: Frontmatter, body: string): string {
  const data = {
    title: frontmatter.title,
    date: frontmatter.date,
    tags: frontmatter.tags
  }
  return matter.stringify(body.trim(), data)
}
