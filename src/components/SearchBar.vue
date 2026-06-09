<template>
  <div class="search-bar">
    <input
      v-model="query"
      type="text"
      placeholder="搜索日记"
      class="search-input"
      @input="onSearch"
    />
    <button v-if="query" class="clear-btn" @click="clearSearch">×</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import { searchDiary } from '@/composables/useSearch'

const diaryStore = useDiaryStore()
const query = ref('')

function onSearch() {
  const trimmed = query.value.trim()
  diaryStore.setSearchQuery(trimmed)
  if (!trimmed) {
    diaryStore.setFilteredPaths(null)
    return
  }
  const paths = searchDiary(query.value)
  diaryStore.setFilteredPaths(paths)
}

function clearSearch() {
  query.value = ''
  diaryStore.setSearchQuery('')
  diaryStore.setFilteredPaths(null)
}
</script>

<style scoped>
.search-bar {
  padding: 10px 16px;
  position: relative;
  background: #2e2e2e;
}

.search-input {
  width: 100%;
  padding: 7px 28px 7px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  background: #3e3e3e;
  color: #fff;
  transition: background 0.2s;
}

.search-input::placeholder {
  color: #888;
}

.search-input:focus {
  background: #4e4e4e;
}

.clear-btn {
  position: absolute;
  right: 22px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 2px 6px;
}

.clear-btn:hover {
  color: #ccc;
}
</style>
