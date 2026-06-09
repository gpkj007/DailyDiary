<template>
  <div class="editor-pane">
    <div v-if="!diaryStore.currentEntry" class="empty-state">
      <template v-if="uiStore.pendingDate">
        <div class="empty-icon">D</div>
        <p class="pending-date">{{ uiStore.pendingDate }} 暂无日记</p>
        <button class="btn-create-pending" @click="createPendingDiary">创建该日期日记</button>
      </template>
      <template v-else>
        <div class="empty-icon">D</div>
        <p>选择一篇日记开始阅读或编辑</p>
        <p class="hint">点击左侧日期树中的条目，或点击左上角 + 创建日记</p>
      </template>
    </div>
    <template v-else>
      <EntryHeader />
      <div class="editor-toolbar">
        <div class="mode-buttons">
          <button
            v-for="mode in modes"
            :key="mode.value"
            :class="{ active: uiStore.editorMode === mode.value }"
            @click="uiStore.setEditorMode(mode.value)"
          >
            {{ mode.label }}
          </button>
        </div>
        <div class="toolbar-actions">
          <button class="btn-export" @click="exportToWord" title="导出为Word">导出Word</button>
          <button class="btn-delete" @click="confirmDelete" title="删除日记">删除</button>
        </div>
      </div>
      <div class="editor-body" :class="uiStore.editorMode">
        <MarkdownEditor v-if="uiStore.editorMode !== 'preview'" />
        <MarkdownPreview v-if="uiStore.editorMode !== 'edit'" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useDiaryStore } from '@/stores/diary'
import { useUiStore } from '@/stores/ui'
import { deleteDiaryFile, createDiaryFile, readDiaryFile } from '@/composables/useDiaryFiles'
import { exportDiaryToDocx } from '@/utils/exportDocx'
import EntryHeader from './EntryHeader.vue'
import MarkdownEditor from './MarkdownEditor.vue'
import MarkdownPreview from './MarkdownPreview.vue'

const diaryStore = useDiaryStore()
const uiStore = useUiStore()

const modes = [
  { value: 'edit' as const, label: '编辑' },
  { value: 'preview' as const, label: '预览' },
  { value: 'split' as const, label: '分栏' }
]

async function confirmDelete() {
  const entry = diaryStore.currentEntry
  if (!entry) return
  if (confirm(`确定要删除日记 "${entry.frontmatter.title || entry.frontmatter.date}" 吗？`)) {
    await deleteDiaryFile(entry.path)
    diaryStore.removeEntry(entry.path)
    diaryStore.setCurrentPath(null)
    uiStore.setPendingDate(null)
  }
}

async function createPendingDiary() {
  const dateStr = uiStore.pendingDate
  if (!dateStr) return
  try {
    const result = await createDiaryFile(dateStr)
    if (result.success || result.exists) {
      const entry = await readDiaryFile(result.path)
      if (entry) {
        diaryStore.addEntry(entry)
        diaryStore.setCurrentPath(entry.path)
        uiStore.setEditorMode('edit')
        uiStore.setPendingDate(null)
      } else {
        alert('读取新建日记失败')
      }
    } else {
      alert('创建日记失败')
    }
  } catch (err: any) {
    console.error('创建日记失败:', err)
    alert('创建日记失败: ' + (err?.message || String(err)))
  }
}

async function exportToWord() {
  const entry = diaryStore.currentEntry
  if (!entry) return
  try {
    await exportDiaryToDocx(entry)
  } catch (err: any) {
    console.error('导出Word失败:', err)
    alert('导出Word失败: ' + (err?.message || String(err)))
  }
}
</script>

<style scoped>
.editor-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #fff;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 15px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: #e0e0e0;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 20px;
}

.empty-state .hint {
  margin-top: 8px;
  font-size: 13px;
  color: #bbb;
}

.pending-date {
  font-size: 16px;
  color: #666;
  margin-bottom: 16px;
}

.btn-create-pending {
  padding: 8px 24px;
  border: none;
  border-radius: 4px;
  background: #07c160;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-create-pending:hover {
  background: #06ad56;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
}

.mode-buttons {
  display: flex;
  gap: 0;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #d9d9d9;
}

.mode-buttons button {
  padding: 6px 16px;
  border: none;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  transition: all 0.15s;
}

.mode-buttons button:not(:last-child) {
  border-right: 1px solid #d9d9d9;
}

.mode-buttons button:hover {
  background: #f5f5f5;
}

.mode-buttons button.active {
  background: #07c160;
  color: #fff;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.btn-export {
  padding: 6px 16px;
  border: 1px solid #e5e5e5;
  background: #fff;
  color: #555;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.btn-export:hover {
  background: #f5f5f5;
  border-color: #bbb;
}

.btn-delete {
  padding: 6px 16px;
  border: 1px solid #e5e5e5;
  background: #fff;
  color: #fa5151;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.btn-delete:hover {
  background: #fa5151;
  color: #fff;
  border-color: #fa5151;
}

.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-body.edit > :first-child {
  flex: 1;
}

.editor-body.preview > :first-child {
  flex: 1;
}

.editor-body.split > * {
  flex: 1;
  width: 50%;
}

.editor-body.split > :first-child {
  border-right: 1px solid #e5e5e5;
}
</style>
