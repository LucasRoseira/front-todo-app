<script setup lang="ts">
import type { TaskFilters, TaskFilterType, TaskPriority, TaskStatus } from '~/types/task'

const props = defineProps<{
  filters: TaskFilters
}>()

const emit = defineEmits<{
  change: [filters: TaskFilters]
}>()

const tabs: { value: '' | TaskFilterType, label: string }[] = [
  { value: '', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
]

const search = ref(props.filters.title || '')
const filterType = ref<'' | TaskFilterType>(props.filters.filter_type || '')
const showAdvanced = ref(false)
const advanced = reactive({
  description: props.filters.description || '',
  status: (props.filters.status || '') as '' | TaskStatus,
  priority: (props.filters.priority || '') as '' | TaskPriority,
  due_date: props.filters.due_date || '',
  responsible_name: props.filters.responsible_name || '',
})

let timer: ReturnType<typeof setTimeout> | undefined

function payload(): TaskFilters {
  return {
    title: search.value.trim(),
    filter_type: filterType.value,
    description: advanced.description.trim(),
    status: advanced.status,
    priority: advanced.priority,
    due_date: advanced.due_date,
    responsible_name: advanced.responsible_name.trim(),
  }
}

function emitChange() {
  emit('change', payload())
}

watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(emitChange, 300)
})

onBeforeUnmount(() => clearTimeout(timer))

function selectTab(value: '' | TaskFilterType) {
  filterType.value = value
  if (value) advanced.status = ''
  emitChange()
}

function clearAll() {
  search.value = ''
  filterType.value = ''
  advanced.description = ''
  advanced.status = ''
  advanced.priority = ''
  advanced.due_date = ''
  advanced.responsible_name = ''
  emitChange()
}
</script>

<template>
  <section class="mb-5 space-y-3">
    <div class="flex flex-wrap gap-2" role="tablist" aria-label="Task views">
      <button
        v-for="tab in tabs"
        :key="tab.label"
        type="button"
        role="tab"
        class="rounded-full px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        :class="filterType === tab.value
          ? 'bg-indigo-600 text-white'
          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'"
        :aria-selected="filterType === tab.value"
        @click="selectTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="flex flex-col gap-2 sm:flex-row">
      <label class="relative min-w-0 flex-1">
        <span class="sr-only">Search tasks by title</span>
        <AppIcon name="search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="search"
          type="search"
          class="field pl-9"
          placeholder="Search by title"
          @keydown.enter.prevent="emitChange"
        >
      </label>
      <button type="button" class="btn-secondary" :aria-expanded="showAdvanced" @click="showAdvanced = !showAdvanced">
        {{ showAdvanced ? 'Hide filters' : 'Filters' }}
      </button>
      <button type="button" class="btn-secondary" @click="clearAll">
        Clear
      </button>
    </div>

    <form v-if="showAdvanced" class="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900" @submit.prevent="emitChange">
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-slate-700 dark:text-slate-200">Description</span>
        <input v-model="advanced.description" type="text" class="field" placeholder="Contains…">
      </label>
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-slate-700 dark:text-slate-200">Responsible</span>
        <input v-model="advanced.responsible_name" type="text" class="field" placeholder="Name">
      </label>
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-slate-700 dark:text-slate-200">Status</span>
        <select v-model="advanced.status" class="field">
          <option value="">Any status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-slate-700 dark:text-slate-200">Priority</span>
        <select v-model="advanced.priority" class="field">
          <option value="">Any priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label class="block text-sm sm:col-span-2">
        <span class="mb-1 block font-medium text-slate-700 dark:text-slate-200">Due on or after</span>
        <input v-model="advanced.due_date" type="date" class="field sm:max-w-xs">
      </label>
      <div class="sm:col-span-2 flex justify-end">
        <button type="submit" class="btn-primary">
          Apply filters
        </button>
      </div>
    </form>
  </section>
</template>
