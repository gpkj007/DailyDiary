import { defineStore } from 'pinia'
import { ref } from 'vue'

export type EditorMode = 'edit' | 'preview' | 'split'

export const useUiStore = defineStore('ui', () => {
  const sidebarWidth = ref(280)
  const collapsedNodes = ref<Set<string>>(new Set())
  const editorMode = ref<EditorMode>('edit')
  const selectedTag = ref<string | null>(null)
  const pendingDate = ref<string | null>(null)

  function toggleNode(key: string) {
    const set = new Set(collapsedNodes.value)
    if (set.has(key)) {
      set.delete(key)
    } else {
      set.add(key)
    }
    collapsedNodes.value = set
  }

  function isCollapsed(key: string): boolean {
    return collapsedNodes.value.has(key)
  }

  function setEditorMode(mode: EditorMode) {
    editorMode.value = mode
  }

  function setSelectedTag(tag: string | null) {
    selectedTag.value = tag
  }

  function setSidebarWidth(width: number) {
    sidebarWidth.value = width
  }

  function setPendingDate(date: string | null) {
    pendingDate.value = date
  }

  return {
    sidebarWidth,
    collapsedNodes,
    editorMode,
    selectedTag,
    pendingDate,
    toggleNode,
    isCollapsed,
    setEditorMode,
    setSelectedTag,
    setSidebarWidth,
    setPendingDate
  }
})
