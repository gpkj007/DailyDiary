<template>
  <div class="markdown-preview" v-html="sanitizedHtml" />
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useDiaryStore } from '@/stores/diary'

const diaryStore = useDiaryStore()
const content = ref('')

watch(() => diaryStore.currentEntry, (newEntry) => {
  content.value = newEntry?.body || ''
}, { immediate: true })

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightHtml(html: string, query: string): string {
  if (!query.trim()) return html
  const escapedQuery = escapeRegExp(query)
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  return html.replace(/(<[^>]+>)|([^<]+)/g, (_match, tag, text) => {
    if (tag) return tag
    return text.replace(regex, '<mark class="search-highlight">$1</mark>')
  })
}

const sanitizedHtml = computed(() => {
  const rawHtml = marked.parse(content.value, { async: false }) as string
  const clean = DOMPurify.sanitize(rawHtml)
  return highlightHtml(clean, diaryStore.searchQuery)
})
</script>

<style scoped>
.markdown-preview {
  width: 100%;
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  background: #fff;
  line-height: 1.7;
  color: #333;
}

.markdown-preview :deep(h1) { font-size: 24px; margin: 16px 0 12px; font-weight: 600; color: #111; }
.markdown-preview :deep(h2) { font-size: 20px; margin: 14px 0 10px; font-weight: 600; color: #111; }
.markdown-preview :deep(h3) { font-size: 17px; margin: 12px 0 8px; font-weight: 600; color: #111; }
.markdown-preview :deep(p) { margin: 8px 0; }
.markdown-preview :deep(ul), .markdown-preview :deep(ol) { margin: 8px 0; padding-left: 24px; }
.markdown-preview :deep(li) { margin: 4px 0; }
.markdown-preview :deep(blockquote) { border-left: 4px solid #ddd; padding-left: 12px; margin: 8px 0; color: #666; }
.markdown-preview :deep(code) { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 13px; }
.markdown-preview :deep(pre) { background: #f4f4f4; padding: 12px; border-radius: 4px; overflow-x: auto; }
.markdown-preview :deep(pre code) { background: none; padding: 0; }
.markdown-preview :deep(a) { color: #07c160; }
.markdown-preview :deep(hr) { border: none; border-top: 1px solid #e5e5e5; margin: 16px 0; }
.markdown-preview :deep(table) { border-collapse: collapse; width: 100%; margin: 12px 0; }
.markdown-preview :deep(th), .markdown-preview :deep(td) { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
.markdown-preview :deep(th) { background: #f8f8f8; font-weight: 600; }
.markdown-preview :deep(img) { max-width: 100%; border-radius: 4px; }
.markdown-preview :deep(mark.search-highlight) {
  background-color: #ffeb3b;
  border-radius: 2px;
  padding: 1px 2px;
}
</style>
