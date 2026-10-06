<script setup lang="ts">
import type { TaskPriority } from '~/types/task'
import { PRIORITY_LABELS } from '~/utils/labels'

defineProps<{ priority: TaskPriority }>()

const classes: Record<TaskPriority, string> = {
  low: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-200',
  medium: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-200',
  high: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-200',
}
</script>

<template>
  <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset" :class="classes[priority]">
    {{ PRIORITY_LABELS[priority] }}
  </span>
</template>
