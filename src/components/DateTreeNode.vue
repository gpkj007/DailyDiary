<template>
  <div class="tree-node">
    <div
      class="node-label"
      :class="{ active: isActive, leaf: !hasChildren, collapsed: isNodeCollapsed }"
      @click="onClick"
    >
      <span v-if="hasChildren" class="toggle-icon" :class="{ collapsed: isNodeCollapsed }">
        ▶
      </span>
      <span v-else class="toggle-placeholder"></span>
      <span class="label-text">{{ node.label }}</span>
      <span v-if="node.type === 'day' && entryTags.length" class="node-tags">
        {{ entryTags.join(' ') }}
      </span>
    </div>
    <div v-if="hasChildren && !isNodeCollapsed" class="node-children">
      <DateTreeNode
        v-for="child in node.children"
        :key="child.key"
        :node="child"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DateTreeNode' })
import { computed } from 'vue'
import type { TreeNode } from '@/types/diary'
import { useDiaryStore } from '@/stores/diary'
import { useUiStore } from '@/stores/ui'

const props = defineProps<{
  node: TreeNode
}>()

const diaryStore = useDiaryStore()
const uiStore = useUiStore()

const hasChildren = computed(() => !!props.node.children && props.node.children.length > 0)
const isNodeCollapsed = computed(() => uiStore.isCollapsed(props.node.key))
const isActive = computed(() => diaryStore.currentPath === props.node.path)

const entryTags = computed(() => {
  if (props.node.type !== 'day' || !props.node.path) return []
  const entry = diaryStore.entries.get(props.node.path)
  return entry ? entry.frontmatter.tags : []
})

function onClick() {
  if (hasChildren.value) {
    uiStore.toggleNode(props.node.key)
  } else if (props.node.path) {
    diaryStore.setCurrentPath(props.node.path)
    uiStore.setPendingDate(null)
  }
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.node-label {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 13px;
  line-height: 1.4;
  color: #ddd;
}

.node-label:hover {
  background: #3a3a3a;
}

.node-label.active {
  background: #3e3e3e;
  color: #07c160;
}

.node-label.leaf {
  padding-left: 32px;
}

.node-label.leaf.active {
  background: #3e3e3e;
}

.toggle-icon {
  display: inline-block;
  width: 16px;
  font-size: 10px;
  color: #888;
  transition: transform 0.15s;
  transform: rotate(90deg);
  margin-right: 4px;
}

.toggle-icon.collapsed {
  transform: rotate(0deg);
}

.toggle-placeholder {
  display: inline-block;
  width: 16px;
  margin-right: 4px;
}

.label-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-tags {
  font-size: 11px;
  color: #888;
  margin-left: 6px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-children {
  padding-left: 12px;
}
</style>
