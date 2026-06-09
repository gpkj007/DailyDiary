import { Document } from 'flexsearch'
import type { DiaryEntry } from '@/types/diary'

let index: InstanceType<typeof Document> | null = null

export function initSearch(entries: DiaryEntry[]) {
  index = new Document({
    document: {
      id: 'path',
      index: ['title', 'body', 'tags']
    },
    tokenize: 'forward'
  })
  for (const entry of entries) {
    addToIndex(entry)
  }
}

export function addToIndex(entry: DiaryEntry) {
  if (!index) return
  index.add({
    path: entry.path,
    title: entry.frontmatter.title,
    body: entry.body,
    tags: entry.frontmatter.tags.join(' ')
  })
}

export function removeFromIndex(path: string) {
  if (!index) return
  index.remove(path)
}

export function updateIndex(entry: DiaryEntry) {
  removeFromIndex(entry.path)
  addToIndex(entry)
}

export function searchDiary(query: string): string[] {
  if (!index || !query.trim()) return []
  const results = index.search(query, { enrich: true }) as any
  const paths = new Set<string>()
  for (const fieldResults of results) {
    for (const r of fieldResults.result) {
      paths.add(typeof r === 'string' ? r : (r.id as string))
    }
  }
  return Array.from(paths)
}
