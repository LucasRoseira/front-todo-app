<script setup lang="ts">
import type { TaskStatus } from '~/types/task'
import { STATUS_LABELS } from '~/utils/labels'

defineProps<{ status: TaskStatus }>()

const classes: Record<TaskStatus, string> = {
  pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  in_progress: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
}
</script>

<template>
  <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" :class="classes[status]">
    {{ STATUS_LABELS[status] }}
  </span>
</template>
