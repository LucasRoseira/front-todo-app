import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'
import type { Task, TaskFilters, TaskPayload, TaskStatus, TaskStatusHistory } from '~/types/task'
import type { Paginated } from '~/types/pagination'
import { toApiError } from '~/utils/apiError'
import { cleanQuery } from '~/utils/query'
import { useCategoriesStore } from '~/stores/categories'

function attachCategory(task: Task): Task {
  if (task.category || task.category_id == null) return task
  const match = useCategoriesStore().options.find((category) => category.id === Number(task.category_id))
  return match ? { ...task, category: match } : task
}

export const useTaskStore = defineStore('tasks', () => {
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl

  const tasks = ref<Task[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const perPage = ref(10)
  const totalTasks = ref(0)
  const totalPages = ref(1)
  const filters = ref<TaskFilters>({})
  const historyByTaskId = ref<Record<number, TaskStatusHistory[]>>({})
  const historyLoadingId = ref<number | null>(null)

  const hasTasks = computed(() => tasks.value.length > 0)
  const isEmpty = computed(() => !loading.value && tasks.value.length === 0)
  const activeFilter = computed(() => filters.value.filter_type || '')
  const hasActiveFilters = computed(() =>
    Object.values(filters.value).some((value) => value !== undefined && value !== null && value !== ''),
  )
  const rangeLabel = computed(() => {
    if (!totalTasks.value) return 'No tasks'
    const start = (currentPage.value - 1) * perPage.value + 1
    const end = Math.min(currentPage.value * perPage.value, totalTasks.value)
    return `${start}–${end} of ${totalTasks.value}`
  })

  function endpoint(path = '') {
    return `${apiBaseUrl}/api/tasks${path}`
  }

  async function fetchTasks(page = currentPage.value) {
    loading.value = true
    error.value = null
    try {
      // $fetch is used instead of useFetch so repeated reads are not cached by URL.
      const response = await $fetch<Paginated<Task>>(endpoint(), {
        query: cleanQuery({
          page,
          per_page: perPage.value,
          ...filters.value,
        }),
      })

      if (!response || !Array.isArray(response.data)) {
        throw new Error('The API returned an unexpected tasks payload.')
      }

      tasks.value = response.data.map(attachCategory)
      currentPage.value = Number(response.current_page) || 1
      totalPages.value = Number(response.last_page) || 1
      totalTasks.value = Number(response.total) || 0
    } catch (cause) {
      error.value = toApiError(cause).message
    } finally {
      loading.value = false
    }
  }

  async function applyFilters(next: TaskFilters) {
    filters.value = { ...next }
    await fetchTasks(1)
  }

  async function setPage(page: number) {
    if (page < 1 || page > totalPages.value || page === currentPage.value) return
    await fetchTasks(page)
  }

  async function setPerPage(value: number) {
    perPage.value = value
    await fetchTasks(1)
  }

  async function createTask(payload: TaskPayload) {
    const tempId = -Date.now()
    const optimistic = attachCategory({
      id: tempId,
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status,
      priority: payload.priority,
      due_date: payload.due_date ?? null,
      category_id: payload.category_id ?? null,
      responsible_name: payload.responsible_name ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    tasks.value = [optimistic, ...tasks.value]
    totalTasks.value += 1

    try {
      const created = attachCategory(await $fetch<Task>(endpoint(), {
        method: 'POST',
        body: payload,
      }))
      tasks.value = tasks.value.map((task) => (task.id === tempId ? created : task))
      return created
    } catch (cause) {
      tasks.value = tasks.value.filter((task) => task.id !== tempId)
      totalTasks.value = Math.max(0, totalTasks.value - 1)
      throw toApiError(cause)
    }
  }

  async function updateTask(id: number, payload: TaskPayload) {
    const index = tasks.value.findIndex((task) => task.id === id)
    if (index === -1) throw new Error('Task not found')

    const previous = { ...tasks.value[index] }
    tasks.value[index] = attachCategory({
      ...previous,
      ...payload,
      id,
      category_id: payload.category_id ?? null,
      category: payload.category_id ? undefined : null,
    })

    try {
      const updated = await $fetch<Task>(endpoint(`/${id}`), {
        method: 'PUT',
        body: payload,
      })
      tasks.value[index] = attachCategory({
        ...tasks.value[index],
        ...updated,
        category: updated.category ?? tasks.value[index].category ?? null,
      })
      delete historyByTaskId.value[id]
      return tasks.value[index]
    } catch (cause) {
      tasks.value[index] = previous
      throw toApiError(cause)
    }
  }

  async function setTaskStatus(task: Task, status: TaskStatus) {
    const index = tasks.value.findIndex((item) => item.id === task.id)
    if (index === -1 || tasks.value[index].status === status) return

    const previousStatus = tasks.value[index].status
    tasks.value[index] = { ...tasks.value[index], status }

    try {
      const updated = await $fetch<Task>(endpoint(`/${task.id}`), {
        method: 'PUT',
        body: { status },
      })
      tasks.value[index] = attachCategory({
        ...tasks.value[index],
        ...updated,
        status: updated.status ?? status,
        category: updated.category ?? tasks.value[index].category ?? null,
      })
      delete historyByTaskId.value[task.id]
    } catch (cause) {
      tasks.value[index] = { ...tasks.value[index], status: previousStatus }
      throw toApiError(cause)
    }
  }

  async function deleteTask(id: number) {
    const index = tasks.value.findIndex((task) => task.id === id)
    if (index === -1) return

    const [removed] = tasks.value.splice(index, 1)
    totalTasks.value = Math.max(0, totalTasks.value - 1)

    try {
      await $fetch(endpoint(`/${id}`), { method: 'DELETE' })
      delete historyByTaskId.value[id]
      if (tasks.value.length === 0 && currentPage.value > 1) {
        await fetchTasks(currentPage.value - 1)
      }
    } catch (cause) {
      tasks.value.splice(index, 0, removed)
      totalTasks.value += 1
      throw toApiError(cause)
    }
  }

  async function fetchTaskHistory(taskId: number, force = false) {
    if (!force && historyByTaskId.value[taskId]) return historyByTaskId.value[taskId]

    historyLoadingId.value = taskId
    try {
      const history = await $fetch<TaskStatusHistory[]>(endpoint(`/${taskId}/history`))
      historyByTaskId.value = { ...historyByTaskId.value, [taskId]: history }
      return history
    } catch (cause) {
      throw toApiError(cause)
    } finally {
      historyLoadingId.value = null
    }
  }

  return {
    tasks,
    loading,
    error,
    currentPage,
    perPage,
    totalTasks,
    totalPages,
    filters,
    historyByTaskId,
    historyLoadingId,
    hasTasks,
    isEmpty,
    activeFilter,
    hasActiveFilters,
    rangeLabel,
    fetchTasks,
    applyFilters,
    setPage,
    setPerPage,
    createTask,
    updateTask,
    setTaskStatus,
    deleteTask,
    fetchTaskHistory,
  }
})
