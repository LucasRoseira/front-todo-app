<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Task, TaskFilters, TaskPayload, TaskStatus } from '~/types/task'
import { STATUS_LABELS } from '~/utils/labels'
import { useTaskStore } from '~/stores/tasks'
import { useCategoriesStore } from '~/stores/categories'
import { useToastStore } from '~/stores/toasts'
import { toApiError } from '~/utils/apiError'

definePageMeta({ layout: 'default' })
useHead({ title: 'Tasks' })

const taskStore = useTaskStore()
const categoryStore = useCategoriesStore()
const toast = useToastStore()

const {
  tasks,
  loading,
  error,
  currentPage,
  totalPages,
  historyByTaskId,
  historyLoadingId,
  filters,
  hasActiveFilters,
  isEmpty,
  rangeLabel,
} = storeToRefs(taskStore)

const { options: categories } = storeToRefs(categoryStore)

const formOpen = ref(false)
const editingTask = ref<Task | null>(null)
const saving = ref(false)
const formError = ref<string | null>(null)
const pendingDelete = ref<Task | null>(null)
const deleting = ref(false)
const expandedHistory = ref<Record<number, boolean>>({})

onMounted(async () => {
  await Promise.all([
    taskStore.fetchTasks(),
    categoryStore.fetchCategoryOptions().catch((cause) => {
      toast.error(toApiError(cause).message)
    }),
  ])
})

function openCreate() {
  editingTask.value = null
  formError.value = null
  formOpen.value = true
}

function openEdit(task: Task) {
  editingTask.value = task
  formError.value = null
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
  editingTask.value = null
  formError.value = null
}

async function onFilterChange(filters: TaskFilters) {
  await taskStore.applyFilters(filters)
}

async function onSave(payload: TaskPayload) {
  saving.value = true
  formError.value = null
  try {
    if (editingTask.value) {
      await taskStore.updateTask(editingTask.value.id, payload)
      toast.success('Task updated')
    } else {
      await taskStore.createTask(payload)
      toast.success('Task created')
    }
    closeForm()
  } catch (cause) {
    formError.value = toApiError(cause).message
  } finally {
    saving.value = false
  }
}

async function onStatusChange(task: Task, status: TaskStatus) {
  try {
    await taskStore.setTaskStatus(task, status)
    toast.success(`Status set to ${STATUS_LABELS[status].toLowerCase()}`)
  } catch (cause) {
    toast.error(toApiError(cause).message)
  }
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    await taskStore.deleteTask(pendingDelete.value.id)
    toast.success('Task deleted')
    pendingDelete.value = null
  } catch (cause) {
    toast.error(toApiError(cause).message)
  } finally {
    deleting.value = false
  }
}

async function onToggleHistory(taskId: number) {
  expandedHistory.value = {
    ...expandedHistory.value,
    [taskId]: !expandedHistory.value[taskId],
  }
  if (!expandedHistory.value[taskId]) return
  try {
    await taskStore.fetchTaskHistory(taskId)
  } catch (cause) {
    toast.error(toApiError(cause).message)
  }
}
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-medium text-indigo-600 dark:text-indigo-300">Workspace</p>
        <h1 class="mt-1 text-3xl font-semibold tracking-tight">Tasks</h1>
        <p class="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Track work against the Laravel API. Status changes and deletes update the list immediately, then roll back if the request fails.
        </p>
      </div>
      <button type="button" class="btn-primary" @click="openCreate">
        <AppIcon name="plus" class="h-4 w-4" />
        New task
      </button>
    </header>

    <TaskFilters :filters="filters" :categories="categories" @change="onFilterChange" />

    <div v-if="error" class="mb-4 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100" role="alert">
      <p>{{ error }}</p>
      <button type="button" class="btn-secondary" @click="taskStore.fetchTasks()">
        Retry
      </button>
    </div>

    <LoadingState v-if="loading && tasks.length === 0" />

    <EmptyState
      v-else-if="isEmpty && !error"
      :title="hasActiveFilters ? 'No tasks match these filters' : 'No tasks yet'"
      :description="hasActiveFilters ? 'Try another view or clear the filters to see everything on the server.' : 'Create a task to send it to the Laravel API. Categories can be attached as you go.'"
    >
      <template #action>
        <button v-if="!hasActiveFilters" type="button" class="btn-primary" @click="openCreate">
          Create the first task
        </button>
      </template>
    </EmptyState>

    <template v-else>
      <TaskList
        :tasks="tasks"
        :history-by-task-id="historyByTaskId"
        :history-loading-id="historyLoadingId"
        :expanded-history="expandedHistory"
        @status-change="onStatusChange"
        @edit="openEdit"
        @delete="pendingDelete = $event"
        @toggle-history="onToggleHistory"
      />
      <PaginationBar
        :current-page="currentPage"
        :total-pages="totalPages"
        :range-label="rangeLabel"
        @change="taskStore.setPage"
      />
    </template>

    <BaseModal
      v-if="formOpen"
      :title="editingTask ? 'Edit task' : 'New task'"
      :description="editingTask ? 'Changes appear in the list immediately.' : 'The new task shows up at the top while it saves.'"
      @close="closeForm"
    >
      <TaskForm
        :task="editingTask"
        :categories="categories"
        :saving="saving"
        :server-error="formError"
        @submit="onSave"
        @cancel="closeForm"
      />
    </BaseModal>

    <ConfirmDialog
      v-if="pendingDelete"
      title="Delete task"
      :message="`Delete “${pendingDelete.title}”? This removes it from the API.`"
      :pending="deleting"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </main>
</template>
