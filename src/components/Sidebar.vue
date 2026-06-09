<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="avatar">D</div>
      <div class="header-actions">
        <button class="btn-icon" @click="createNewDiary" title="新建日记">+</button>
        <button class="btn-icon" @click="changeDir" title="更改保存路径">...</button>
      </div>
    </div>
    <SearchBar />
    <Calendar :entries="Array.from(diaryStore.entries.values())" @select="onCalendarSelect" />
    <div class="tree-wrapper">
      <div v-if="diaryStore.isLoading" class="state-text">加载中...</div>
      <div v-else-if="diaryStore.tree.length === 0" class="state-text">暂无日记</div>
      <DateTree v-else :nodes="diaryStore.tree" />
    </div>
    <TagCloud />
    <div class="path-footer" :title="currentDir">{{ displayDir }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import { useUiStore } from '@/stores/ui'
import { createDiaryFile, readDiaryFile, initDiaryDir, selectDiaryDir, setDiaryDir, scanDiaryFiles } from '@/composables/useDiaryFiles'
import { getTodayString } from '@/utils/dateHelpers'
import SearchBar from './SearchBar.vue'
import TagCloud from './TagCloud.vue'
import DateTree from './DateTree.vue'
import Calendar from './Calendar.vue'

const diaryStore = useDiaryStore()
const uiStore = useUiStore()
const currentDir = ref('')

const displayDir = computed(() => {
  if (!currentDir.value) return ''
  const parts = currentDir.value.split(/[\\/]/)
  return parts.slice(-2).join('/')
})

onMounted(async () => {
  try {
    currentDir.value = await initDiaryDir()
  } catch (err: any) {
    console.error('初始化目录失败:', err)
  }
})

async function createNewDiary() {
  console.log('[Sidebar] createNewDiary clicked')
  try {
    if (!window.electronAPI) {
      alert('Electron API 未加载，请检查控制台错误信息')
      console.error('[Sidebar] window.electronAPI is undefined')
      return
    }
    const today = getTodayString()
    console.log('[Sidebar] createNewDiary today:', today)
    const result = await createDiaryFile(today)
    console.log('[Sidebar] createNewDiary result:', result)
    if (result.success || result.exists) {
      const entry = await readDiaryFile(result.path)
      console.log('[Sidebar] createNewDiary read entry:', entry)
      if (entry) {
        diaryStore.addEntry(entry)
        diaryStore.setCurrentPath(entry.path)
        uiStore.setEditorMode('edit')
        uiStore.setPendingDate(null)
        console.log('[Sidebar] createNewDiary done, currentPath:', diaryStore.currentPath)
      } else {
        alert('读取新建日记失败')
      }
    } else {
      alert('创建日记失败')
    }
  } catch (err: any) {
    console.error('[Sidebar] 新建日记失败:', err)
    alert('新建日记失败: ' + (err?.message || String(err)))
  }
}

async function changeDir() {
  try {
    if (!window.electronAPI) {
      alert('Electron API 未加载')
      return
    }
    const selected = await selectDiaryDir()
    if (selected) {
      await setDiaryDir(selected)
      currentDir.value = selected
      diaryStore.isLoading = true
      diaryStore.setCurrentPath(null)
      uiStore.setPendingDate(null)
      const entries = await scanDiaryFiles()
      diaryStore.setEntries(entries)
      diaryStore.isLoading = false
    }
  } catch (err: any) {
    console.error('更改目录失败:', err)
    alert('更改目录失败: ' + (err?.message || String(err)))
  }
}

async function onCalendarSelect(dateStr: string) {
  console.log('[Sidebar] onCalendarSelect', dateStr)
  const existing = Array.from(diaryStore.entries.values()).find(e => e.frontmatter.date === dateStr)
  if (existing) {
    diaryStore.setCurrentPath(existing.path)
    uiStore.setEditorMode('split')
    uiStore.setPendingDate(null)
    console.log('[Sidebar] onCalendarSelect open existing:', existing.path)
  } else {
    diaryStore.setCurrentPath(null)
    uiStore.setPendingDate(dateStr)
    console.log('[Sidebar] onCalendarSelect no entry for date:', dateStr)
  }
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px 14px;
  background: #2e2e2e;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: #07c160;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: none;
  background: #3e3e3e;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #4e4e4e;
}

.tree-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.state-text {
  padding: 40px 16px;
  text-align: center;
  color: #888;
  font-size: 13px;
}

.path-footer {
  padding: 8px 16px;
  font-size: 11px;
  color: #666;
  border-top: 1px solid #3e3e3e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
}
</style>
