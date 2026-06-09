<template>
  <div v-if="entry" class="entry-header">
    <input
      v-model="title"
      class="title-input"
      placeholder="日记标题"
      @input="onChange"
    />
    <div class="meta-row">
      <span class="date-display">{{ entry.frontmatter.date }}</span>
      <div class="tag-editor">
        <input
          v-model="tagInput"
          class="tag-input"
          placeholder="添加标签，回车确认"
          @keydown.enter.prevent="addTag"
        />
        <div class="tag-chips">
          <span v-for="tag in tags" :key="tag" class="tag-chip">
            {{ tag }}
            <span class="remove" @click="removeTag(tag)">×</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import { serializeEntry } from '@/utils/markdown'
import { saveDiaryFile } from '@/composables/useDiaryFiles'
import { useDebounceFn } from '@vueuse/core'

const diaryStore = useDiaryStore()
const entry = computed(() => diaryStore.currentEntry)

const title = ref('')
const tags = ref<string[]>([])
const tagInput = ref('')

function syncFromEntry() {
  const e = entry.value
  if (e) {
    title.value = e.frontmatter.title
    tags.value = [...e.frontmatter.tags]
  }
}

const doSave = useDebounceFn(async () => {
  const e = entry.value
  if (!e) return
  const raw = serializeEntry(
    {
      title: title.value,
      date: e.frontmatter.date,
      tags: tags.value
    },
    e.body
  )
  await saveDiaryFile(e.path, raw)
  const updated = { ...e, frontmatter: { ...e.frontmatter, title: title.value, tags: [...tags.value] }, raw }
  diaryStore.updateEntry(updated)
}, 800)

function onChange() {
  doSave()
}

function addTag() {
  const t = tagInput.value.trim()
  if (t && !tags.value.includes(t)) {
    tags.value.push(t)
    tagInput.value = ''
    doSave()
  }
}

function removeTag(tag: string) {
  tags.value = tags.value.filter(x => x !== tag)
  doSave()
}

watch(() => diaryStore.currentEntry, () => {
  syncFromEntry()
}, { immediate: true })
</script>

<style scoped>
.entry-header {
  padding: 20px 24px 14px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
}

.title-input {
  width: 100%;
  font-size: 22px;
  font-weight: 600;
  border: none;
  outline: none;
  color: #111;
  background: transparent;
  margin-bottom: 12px;
}

.title-input::placeholder {
  color: #ccc;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.date-display {
  font-size: 13px;
  color: #888;
  font-family: monospace;
}

.tag-editor {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.tag-input {
  padding: 5px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  width: 160px;
  color: #333;
}

.tag-input:focus {
  border-color: #07c160;
}

.tag-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: #e9f7ef;
  color: #07c160;
  border-radius: 3px;
  font-size: 12px;
}

.tag-chip .remove {
  cursor: pointer;
  font-weight: bold;
  color: #5cdb8b;
}

.tag-chip .remove:hover {
  color: #fa5151;
}
</style>
