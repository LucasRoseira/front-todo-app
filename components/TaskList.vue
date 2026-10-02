<script setup lang="ts">
import type { Task, TaskStatusHistory } from '~/types/task'

defineProps<{
  tasks: Task[]
  historyByTaskId: Record<number, TaskStatusHistory[]>
  historyLoadingId: number | null
  expandedHistory: Record<number, boolean>
}>()

const emit = defineEmits<{
  toggle: [task: Task]
  edit: [task: Task]
  delete: [task: Task]
  'toggle-history': [taskId: number]
}>()
</script>

<template>
  <div class="space-y-3">
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      :history="historyByTaskId[task.id] || []"
      :history-expanded="Boolean(expandedHistory[task.id])"
      :history-loading="historyLoadingId === task.id"
      @toggle="emit('toggle', $event)"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
      @toggle-history="emit('toggle-history', $event)"
    />
  </div>
</template>
