<template>
  <div v-if="diaryStore.allTags.length" class="tag-cloud">
    <div class="tag-list">
      <span
        v-for="tag in diaryStore.allTags"
        :key="tag"
        class="tag-item"
        :class="{ active: uiStore.selectedTag === tag }"
        @click="toggleTag(tag)"
      >
        {{ tag }}
      </span>
    </div>
    <button v-if="uiStore.selectedTag" class="clear-tag" @click="clearTag">清除筛选</button>
  </div>
</template>

<script setup lang="ts">
import { useDiaryStore } from '@/stores/diary'
import { useUiStore } from '@/stores/ui'

const diaryStore = useDiaryStore()
const uiStore = useUiStore()

function toggleTag(tag: string) {
  if (uiStore.selectedTag === tag) {
    clearTag()
  } else {
    uiStore.setSelectedTag(tag)
    const paths: string[] = []
    for (const entry of diaryStore.entries.values()) {
      if (entry.frontmatter.tags.includes(tag)) {
        paths.push(entry.path)
      }
    }
    diaryStore.setFilteredPaths(paths)
  }
}

function clearTag() {
  uiStore.setSelectedTag(null)
  diaryStore.setFilteredPaths(null)
}
</script>

<style scoped>
.tag-cloud {
  padding: 8px 16px;
  border-top: 1px solid #3e3e3e;
  max-height: 100px;
  overflow-y: auto;
  background: #2e2e2e;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  padding: 3px 10px;
  background: #3e3e3e;
  border-radius: 3px;
  font-size: 12px;
  color: #bbb;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.tag-item:hover {
  background: #4e4e4e;
}

.tag-item.active {
  background: #07c160;
  color: #fff;
}

.clear-tag {
  margin-top: 8px;
  padding: 4px 10px;
  background: none;
  border: 1px solid #555;
  border-radius: 3px;
  font-size: 12px;
  color: #888;
  cursor: pointer;
}

.clear-tag:hover {
  border-color: #888;
  color: #ccc;
}
</style>
