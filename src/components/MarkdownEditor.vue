<template>
  <div class="editor-wrapper">
    <div class="md-toolbar">
      <button
        v-for="tool in tools"
        :key="tool.label"
        class="tool-btn"
        :title="tool.label"
        @click="applyTool(tool)"
      >
        {{ tool.icon }}
      </button>
    </div>
    <div class="editor-container">
      <div
        ref="highlightRef"
        class="highlight-layer"
        v-html="highlightedContent"
      />
      <textarea
        ref="textareaRef"
        v-model="content"
        class="markdown-editor"
        placeholder="开始写日记..."
        spellcheck="false"
        @input="onInput"
        @scroll="syncScroll"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import { serializeEntry } from '@/utils/markdown'
import { saveDiaryFile } from '@/composables/useDiaryFiles'
import { useDebounceFn } from '@vueuse/core'

const diaryStore = useDiaryStore()
const content = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const highlightRef = ref<HTMLDivElement | null>(null)

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightText(text: string, query: string): string {
  if (!query.trim()) return escapeHtml(text)
  const escapedQuery = escapeRegExp(query)
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  return escapeHtml(text).replace(regex, '<mark class="search-highlight">$1</mark>')
}

const highlightedContent = computed(() => {
  return highlightText(content.value, diaryStore.searchQuery)
})

function syncScroll() {
  if (!textareaRef.value || !highlightRef.value) return
  const scrollTop = textareaRef.value.scrollTop
  const scrollLeft = textareaRef.value.scrollLeft
  highlightRef.value.style.transform = `translate(${-scrollLeft}px, ${-scrollTop}px)`
}

function updateHighlightSize() {
  if (!textareaRef.value || !highlightRef.value) return
  const ta = textareaRef.value
  const hl = highlightRef.value
  hl.style.width = ta.clientWidth + 'px'
  hl.style.minHeight = ta.scrollHeight + 'px'
}

function onWindowResize() {
  nextTick(() => {
    updateHighlightSize()
    syncScroll()
  })
}

onMounted(() => {
  window.addEventListener('resize', onWindowResize)
  nextTick(() => {
    updateHighlightSize()
    syncScroll()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
})

interface MdTool {
  label: string
  icon: string
  prefix: string
  suffix: string
  placeholder?: string
  block?: boolean
  action?: 'uppercase' | 'lowercase' | 'formatXml' | 'formatJson' | 'linesToTuple'
}

const tools: MdTool[] = [
  { label: '粗体', icon: 'B', prefix: '**', suffix: '**', placeholder: '粗体文字' },
  { label: '斜体', icon: 'I', prefix: '*', suffix: '*', placeholder: '斜体文字' },
  { label: '删除线', icon: 'S', prefix: '~~', suffix: '~~', placeholder: '删除文字' },
  { label: '一级标题', icon: 'H1', prefix: '# ', suffix: '', placeholder: '一级标题' },
  { label: '二级标题', icon: 'H2', prefix: '## ', suffix: '', placeholder: '二级标题' },
  { label: '三级标题', icon: 'H3', prefix: '### ', suffix: '', placeholder: '三级标题' },
  { label: '引用', icon: '❝', prefix: '> ', suffix: '', placeholder: '引用文字' },
  { label: '代码块', icon: '{}', prefix: '\n```\n', suffix: '\n```\n', placeholder: '代码' },
  { label: '无序列表', icon: '•', prefix: '- ', suffix: '', placeholder: '列表项' },
  { label: '有序列表', icon: '1.', prefix: '1. ', suffix: '', placeholder: '列表项' },
  { label: '链接', icon: '🔗', prefix: '[', suffix: '](url)', placeholder: '链接文字' },
  { label: '图片', icon: '🖼', prefix: '![', suffix: '](url)', placeholder: '图片描述' },
  { label: '分割线', icon: '—', prefix: '\n---\n', suffix: '', placeholder: '' },
  { label: '转大写', icon: 'AA', prefix: '', suffix: '', action: 'uppercase' },
  { label: '转小写', icon: 'aa', prefix: '', suffix: '', action: 'lowercase' },
  { label: 'XML格式化', icon: 'XML', prefix: '', suffix: '', action: 'formatXml' },
  { label: 'JSON格式化', icon: 'JSON', prefix: '', suffix: '', action: 'formatJson' },
  { label: '多行转元组', icon: '() ', prefix: '', suffix: '', action: 'linesToTuple' }
]

function getBlockRange(text: string, cursor: number, marker = '```'): [number, number] | null {
  const before = text.slice(0, cursor)
  const after = text.slice(cursor)
  const lastFence = before.lastIndexOf(marker)
  if (lastFence === -1) return null
  const between = before.slice(lastFence + marker.length)
  if (between.includes(marker)) return null
  const nextFence = after.indexOf(marker)
  if (nextFence === -1) return null
  let blockStart = lastFence + marker.length
  const newlineAfterOpen = text.indexOf('\n', blockStart)
  if (newlineAfterOpen !== -1 && newlineAfterOpen < cursor) {
    blockStart = newlineAfterOpen + 1
  }
  return [blockStart, cursor + nextFence]
}

function formatXml(xml: string): string {
  xml = xml.replace(/>\s+</g, '><').trim()
  let formatted = ''
  let indent = 0
  const tab = '  '
  const tokens = xml.split(/(<[^>]+>)/g).filter(t => t.trim())
  for (const token of tokens) {
    const trimmed = token.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('</')) {
      indent = Math.max(0, indent - 1)
      formatted += tab.repeat(indent) + trimmed + '\n'
    } else if (trimmed.startsWith('<') && trimmed.endsWith('/>')) {
      formatted += tab.repeat(indent) + trimmed + '\n'
    } else if (trimmed.startsWith('<') && !trimmed.startsWith('<!--')) {
      formatted += tab.repeat(indent) + trimmed + '\n'
      indent++
    } else if (trimmed.startsWith('<!--')) {
      formatted += tab.repeat(indent) + trimmed + '\n'
    } else {
      formatted += tab.repeat(indent) + trimmed + '\n'
    }
  }
  return formatted.trim()
}

function formatJson(json: string): string {
  return JSON.stringify(JSON.parse(json), null, 2)
}

function linesToTuple(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l)
  if (lines.length === 0) return '()'
  return `(${lines.map(l => `'${l.replace(/'/g, "\\'")}'`).join(', ')})`
}

function applyTool(tool: MdTool) {
  const el = textareaRef.value
  if (!el) return

  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = content.value.slice(start, end)

  // Handle text transformation actions
  if (tool.action === 'uppercase' || tool.action === 'lowercase') {
    let replaceStart = start
    let replaceEnd = end
    let targetText = selected

    if (!targetText) {
      const text = content.value
      const wordBoundaryLeft = /[\s\n\r\t.,;:!?()[\]{}'"\\/|<>@#$%^&*+=~`-]/
      let s = start
      while (s > 0 && !wordBoundaryLeft.test(text[s - 1])) s--
      let e = end
      while (e < text.length && !wordBoundaryLeft.test(text[e])) e++
      replaceStart = s
      replaceEnd = e
      targetText = text.slice(s, e)
    }

    if (!targetText) return

    const transformed = tool.action === 'uppercase' ? targetText.toUpperCase() : targetText.toLowerCase()
    content.value = content.value.slice(0, replaceStart) + transformed + content.value.slice(replaceEnd)

    nextTick(() => {
      el.selectionStart = replaceStart
      el.selectionEnd = replaceStart + transformed.length
      el.focus()
    })
    onInput()
    return
  }

  // Handle formatting actions
  if (tool.action === 'formatXml' || tool.action === 'formatJson' || tool.action === 'linesToTuple') {
    let replaceStart = start
    let replaceEnd = end
    let targetText = selected

    if (!targetText) {
      const blockRange = getBlockRange(content.value, start)
      if (blockRange) {
        replaceStart = blockRange[0]
        replaceEnd = blockRange[1]
        targetText = content.value.slice(replaceStart, replaceEnd)
      }
    }

    if (!targetText) return

    let transformed = targetText
    try {
      if (tool.action === 'formatXml') {
        transformed = formatXml(targetText)
      } else if (tool.action === 'formatJson') {
        transformed = formatJson(targetText)
      } else if (tool.action === 'linesToTuple') {
        transformed = linesToTuple(targetText)
      }
    } catch (err: any) {
      alert(`${tool.label}失败: ` + (err?.message || String(err)))
      return
    }

    content.value = content.value.slice(0, replaceStart) + transformed + content.value.slice(replaceEnd)

    nextTick(() => {
      el.selectionStart = replaceStart
      el.selectionEnd = replaceStart + transformed.length
      el.focus()
    })
    onInput()
    return
  }

  const textToInsert = selected || (tool.placeholder || '')

  let prefix = tool.prefix
  let suffix = tool.suffix

  // For block-level tools, ensure prefix starts at line beginning
  if (tool.block || ['# ', '## ', '### ', '> ', '- ', '1. '].includes(prefix.trim())) {
    const beforeCursor = content.value.slice(0, start)
    const lastNewline = beforeCursor.lastIndexOf('\n')
    const lineStart = lastNewline + 1
    const linePrefix = beforeCursor.slice(lineStart)
    // If already has same prefix, remove it (toggle)
    const trimmedPrefix = prefix.trimStart()
    if (linePrefix.startsWith(trimmedPrefix) && !selected) {
      content.value = beforeCursor.slice(0, lineStart) + beforeCursor.slice(lineStart + trimmedPrefix.length) + content.value.slice(end)
      nextTick(() => {
        el.selectionStart = el.selectionEnd = start - trimmedPrefix.length
        el.focus()
      })
      onInput()
      return
    }
    // Insert newline if not at line start
    if (start > 0 && content.value[start - 1] !== '\n' && start !== lineStart) {
      prefix = '\n' + prefix
    }
  }

  const newValue = content.value.slice(0, start) + prefix + textToInsert + suffix + content.value.slice(end)
  content.value = newValue

  nextTick(() => {
    let newCursor = start + prefix.length + textToInsert.length
    if (!selected && tool.placeholder && tool.suffix) {
      // Place cursor before suffix if we inserted placeholder text
      newCursor = start + prefix.length + textToInsert.length
    } else if (!selected && tool.placeholder && !tool.suffix) {
      newCursor = start + prefix.length + textToInsert.length
    }
    el.selectionStart = el.selectionEnd = newCursor
    el.focus()
  })

  onInput()
}

const doSave = useDebounceFn(async () => {
  const entry = diaryStore.currentEntry
  if (!entry) return
  const raw = serializeEntry(
    {
      title: entry.frontmatter.title,
      date: entry.frontmatter.date,
      tags: entry.frontmatter.tags
    },
    content.value
  )
  await saveDiaryFile(entry.path, raw)
  const updated = { ...entry, body: content.value, raw }
  diaryStore.updateEntry(updated)
}, 800)

function onInput() {
  doSave()
}

watch(() => diaryStore.currentEntry, (newEntry) => {
  if (newEntry) {
    content.value = newEntry.body
  }
}, { immediate: true })

watch(content, () => {
  nextTick(() => {
    updateHighlightSize()
    syncScroll()
  })
})

watch(() => diaryStore.searchQuery, () => {
  nextTick(() => {
    updateHighlightSize()
    syncScroll()
  })
})
</script>

<style scoped>
.editor-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.md-toolbar {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 20px;
  background: #fafafa;
  border-bottom: 1px solid #e5e5e5;
  align-items: center;
}

.tool-btn {
  padding: 4px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  background: #fff;
  color: #555;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1.4;
  min-width: 28px;
  text-align: center;
}

.tool-btn:hover {
  background: #f0f0f0;
  border-color: #bbb;
}

.editor-container {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.highlight-layer {
  position: absolute;
  top: 0;
  left: 0;
  padding: 20px 24px;
  border: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.7;
  color: transparent;
  background: transparent;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: visible;
  pointer-events: none;
  z-index: 1;
  box-sizing: border-box;
}

.highlight-layer :deep(mark.search-highlight) {
  background-color: #ffeb3b;
  color: transparent;
  border-radius: 2px;
}

.markdown-editor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 20px 24px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.7;
  color: #333;
  background: #fff;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: auto;
  z-index: 2;
  box-sizing: border-box;
}

.markdown-editor::placeholder {
  color: #ccc;
}
</style>
