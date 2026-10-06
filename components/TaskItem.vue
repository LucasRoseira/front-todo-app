<script setup lang="ts">
import type { Task, TaskStatus, TaskStatusHistory } from '~/types/task'
import { formatDisplayDate, isOverdue } from '~/utils/dates'
import { STATUS_LABELS } from '~/utils/labels'

const props = defineProps<{
  task: Task
  history: TaskStatusHistory[]
  historyExpanded: boolean
  historyLoading: boolean
}>()

const emit = defineEmits<{
  'status-change': [task: Task, status: TaskStatus]
  edit: [task: Task]
  delete: [task: Task]
  'toggle-history': [taskId: number]
}>()

const statusId = useId()
const overdue = computed(() => isOverdue(props.task.due_date, props.task.status))
const statuses = Object.keys(STATUS_LABELS) as TaskStatus[]

function onStatusChange(event: Event) {
  const status = (event.target as HTMLSelectElement).value as TaskStatus
  if (status === props.task.status) return
  emit('status-change', props.task, status)
}
</script>

<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
    <div class="flex items-start gap-3">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100" :class="{ 'text-slate-400 line-through': task.status === 'completed' }">
            {{ task.title }}
          </h3>
          <PriorityBadge :priority="task.priority" />
          <label class="sr-only" :for="statusId">Status for {{ task.title }}</label>
          <select :id="statusId" class="field w-auto py-1 text-xs" :value="task.status" @change="onStatusChange">
            <option v-for="status in statuses" :key="status" :value="status">
              {{ STATUS_LABELS[status] }}
            </option>
          </select>
        </div>
        <p v-if="task.description" class="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {{ task.description }}
        </p>
        <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span
            v-if="task.category?.name"
            class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: task.category.color || '#6366f1' }" />
            {{ task.category.name }}
          </span>
          <span v-if="task.responsible_name">{{ task.responsible_name }}</span>
          <span v-if="task.due_date" :class="{ 'font-medium text-rose-600 dark:text-rose-300': overdue }">
            {{ overdue ? 'Overdue · ' : 'Due ' }}{{ formatDisplayDate(task.due_date) }}
          </span>
        </div>
        <TaskHistory
          :task-id="task.id"
          :history="history"
          :expanded="historyExpanded"
          :loading="historyLoading"
          @toggle="emit('toggle-history', $event)"
        />
      </div>
      <div class="flex shrink-0 gap-1">
        <button type="button" class="icon-btn" :aria-label="`Edit ${task.title}`" @click="emit('edit', task)">
          <AppIcon name="pencil" class="h-4 w-4" />
        </button>
        <button type="button" class="icon-btn hover:text-rose-600" :aria-label="`Delete ${task.title}`" @click="emit('delete', task)">
          <AppIcon name="trash" class="h-4 w-4" />
        </button>
      </div>
    </div>
  </article>
</template>
