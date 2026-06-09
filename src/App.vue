<template>
  <div class="app-container">
    <Sidebar class="sidebar" />
    <div class="main-content">
      <EditorPane />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import EditorPane from '@/components/EditorPane.vue'
import { useDiaryStore } from '@/stores/diary'
import { scanDiaryFiles } from '@/composables/useDiaryFiles'

const diaryStore = useDiaryStore()

onMounted(async () => {
  console.log('[App] onMounted start')
  try {
    diaryStore.isLoading = true
    const entries = await scanDiaryFiles()
    console.log('[App] onMounted scanned entries:', entries.length)
    diaryStore.setEntries(entries)
    console.log('[App] onMounted tree nodes:', diaryStore.tree.length)
  } catch (err: any) {
    console.error('[App] 初始化加载日记失败:', err)
    alert('加载日记失败: ' + (err?.message || String(err)))
  } finally {
    diaryStore.isLoading = false
    console.log('[App] onMounted end')
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: 'Microsoft YaHei', 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  color: #333;
  background: #f5f5f5;
}

.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  min-width: 260px;
  max-width: 400px;
  flex-shrink: 0;
  background: #2e2e2e;
  display: flex;
  flex-direction: column;
  color: #fff;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #777;
}
</style>
