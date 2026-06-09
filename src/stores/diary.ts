import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DiaryEntry, TreeNode } from '@/types/diary'
import { buildDateTree } from '@/composables/useDateTree'
import { initSearch, addToIndex, removeFromIndex, updateIndex } from '@/composables/useSearch'

export const useDiaryStore = defineStore('diary', () => {
  const entries = ref<Map<string, DiaryEntry>>(new Map())
  const currentPath = ref<string | null>(null)
  const filteredPaths = ref<string[] | null>(null)
  const searchQuery = ref<string>('')
  const isLoading = ref(false)

  const tree = computed<TreeNode[]>(() => {
    let list = Array.from(entries.value.values())
    if (filteredPaths.value) {
      list = list.filter(e => filteredPaths.value!.includes(e.path))
    }
    return buildDateTree(list)
  })

  const allTags = computed<string[]>(() => {
    const tagSet = new Set<string>()
    for (const entry of entries.value.values()) {
      for (const tag of entry.frontmatter.tags) {
        tagSet.add(tag)
      }
    }
    return Array.from(tagSet).sort()
  })

  const currentEntry = computed<DiaryEntry | null>(() => {
    return currentPath.value ? entries.value.get(currentPath.value) || null : null
  })

  function setEntries(list: DiaryEntry[]) {
    console.log('[diaryStore] setEntries', list.length)
    const map = new Map<string, DiaryEntry>()
    for (const e of list) {
      map.set(e.path, e)
    }
    entries.value = map
    initSearch(list)
    console.log('[diaryStore] setEntries done, tree length:', tree.value.length)
  }

  function addEntry(entry: DiaryEntry) {
    console.log('[diaryStore] addEntry', entry.path)
    entries.value = new Map(entries.value).set(entry.path, entry)
    addToIndex(entry)
    console.log('[diaryStore] addEntry done, total:', entries.value.size)
  }

  function updateEntry(entry: DiaryEntry) {
    console.log('[diaryStore] updateEntry', entry.path)
    entries.value = new Map(entries.value).set(entry.path, entry)
    updateIndex(entry)
  }

  function removeEntry(path: string) {
    console.log('[diaryStore] removeEntry', path)
    const next = new Map(entries.value)
    next.delete(path)
    entries.value = next
    removeFromIndex(path)
  }

  function setCurrentPath(path: string | null) {
    console.log('[diaryStore] setCurrentPath', path)
    currentPath.value = path
  }

  function setFilteredPaths(paths: string[] | null) {
    filteredPaths.value = paths
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  return {
    entries,
    currentPath,
    filteredPaths,
    searchQuery,
    isLoading,
    tree,
    allTags,
    currentEntry,
    setEntries,
    addEntry,
    updateEntry,
    removeEntry,
    setCurrentPath,
    setFilteredPaths,
    setSearchQuery
  }
})
