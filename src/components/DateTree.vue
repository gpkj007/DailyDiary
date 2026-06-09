<template>
  <div class="date-tree">
    <DateTreeNode
      v-for="node in nodes"
      :key="node.key"
      :node="node"
    />
  </div>
</template>

<script setup lang="ts">
import type { TreeNode } from '@/types/diary'
import DateTreeNode from './DateTreeNode.vue'

defineProps<{
  nodes: TreeNode[]
}>()
</script>

<style scoped>
.date-tree {
  padding: 0 8px;
}
</style>
