<script setup lang="ts">
import type { TaskStatusHistory } from '~/types/task'
import { STATUS_LABELS } from '~/utils/labels'
import { formatDateTime } from '~/utils/dates'

const props = defineProps<{
  taskId: number
  history: TaskStatusHistory[]
  expanded: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  toggle: [taskId: number]
}>()
</script>

<template>
  <div class="mt-3">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-300"
      :aria-expanded="expanded"
      @click="emit('toggle', props.taskId)"
    >
      <AppIcon name="history" class="h-3.5 w-3.5" />
      {{ expanded ? 'Hide history' : 'Status history' }}
    </button>

    <p v-if="expanded && loading" class="mt-2 text-xs text-slate-500">
      Loading history…
    </p>
    <ul v-else-if="expanded && history.length" class="mt-2 space-y-1.5 border-t border-slate-100 pt-2 dark:border-slate-800">
      <li v-for="entry in history" :key="entry.id" class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        <span
          class="h-2 w-2 rounded-full"
          :class="{
            'bg-emerald-500': entry.status === 'completed',
            'bg-sky-500': entry.status === 'in_progress',
            'bg-slate-400': entry.status === 'pending',
          }"
        />
        <span class="font-medium">{{ STATUS_LABELS[entry.status] }}</span>
        <span class="text-slate-400">{{ formatDateTime(entry.changed_at) }}</span>
      </li>
    </ul>
    <p v-else-if="expanded" class="mt-2 text-xs text-slate-500">
      No status changes recorded yet.
    </p>
  </div>
</template>
