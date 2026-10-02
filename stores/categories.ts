import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'
import type { Category, CategoryFilters, CategoryPayload } from '~/types/category'
import type { Paginated } from '~/types/pagination'
import { toApiError } from '~/utils/apiError'
import { cleanQuery } from '~/utils/query'

export const useCategoriesStore = defineStore('categories', () => {
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl

  const categories = ref<Category[]>([])
  const options = ref<Category[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const perPage = ref(10)
  const totalCategories = ref(0)
  const totalPages = ref(1)
  const filters = ref<CategoryFilters>({})

  const hasCategories = computed(() => categories.value.length > 0)
  const isEmpty = computed(() => !loading.value && categories.value.length === 0)
  const rangeLabel = computed(() => {
    if (!totalCategories.value) return 'No categories'
    const start = (currentPage.value - 1) * perPage.value + 1
    const end = Math.min(currentPage.value * perPage.value, totalCategories.value)
    return `${start}–${end} of ${totalCategories.value}`
  })

  function endpoint(path = '') {
    return `${apiBaseUrl}/api/categories${path}`
  }

  async function fetchCategories(page = currentPage.value) {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<Paginated<Category>>(endpoint(), {
        query: cleanQuery({
          page,
          per_page: perPage.value,
          name: filters.value.name,
        }),
      })

      if (!response || !Array.isArray(response.data)) {
        throw new Error('The API returned an unexpected categories payload.')
      }

      categories.value = response.data
      currentPage.value = Number(response.current_page) || 1
      totalPages.value = Number(response.last_page) || 1
      totalCategories.value = Number(response.total) || 0
    } catch (cause) {
      error.value = toApiError(cause).message
    } finally {
      loading.value = false
    }
  }

  async function fetchCategoryOptions() {
    const response = await $fetch<Paginated<Category>>(endpoint(), {
      query: { page: 1, per_page: 100 },
    })
    if (!response || !Array.isArray(response.data)) {
      throw new Error('The API returned an unexpected categories payload.')
    }
    options.value = response.data
  }

  function syncOption(category: Category) {
    const index = options.value.findIndex((item) => item.id === category.id)
    if (index === -1) options.value = [category, ...options.value]
    else options.value[index] = { ...options.value[index], ...category }
  }

  async function applyFilters(next: CategoryFilters) {
    filters.value = { ...next }
    await fetchCategories(1)
  }

  async function setPage(page: number) {
    if (page < 1 || page > totalPages.value || page === currentPage.value) return
    await fetchCategories(page)
  }

  async function setPerPage(value: number) {
    perPage.value = value
    await fetchCategories(1)
  }

  async function createCategory(payload: CategoryPayload) {
    const tempId = -Date.now()
    const optimistic: Category = {
      id: tempId,
      name: payload.name,
      color: payload.color ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    categories.value = [optimistic, ...categories.value]
    totalCategories.value += 1

    try {
      const created = await $fetch<Category>(endpoint(), {
        method: 'POST',
        body: payload,
      })
      categories.value = categories.value.map((category) => (category.id === tempId ? created : category))
      syncOption(created)
      return created
    } catch (cause) {
      categories.value = categories.value.filter((category) => category.id !== tempId)
      totalCategories.value = Math.max(0, totalCategories.value - 1)
      throw toApiError(cause)
    }
  }

  async function updateCategory(id: number, payload: CategoryPayload) {
    const index = categories.value.findIndex((category) => category.id === id)
    if (index === -1) throw new Error('Category not found')

    const previous = { ...categories.value[index] }
    const previousOption = options.value.find((category) => category.id === id)
    categories.value[index] = { ...previous, ...payload, id }
    syncOption(categories.value[index])

    try {
      const updated = await $fetch<Category>(endpoint(`/${id}`), {
        method: 'PUT',
        body: payload,
      })
      categories.value[index] = { ...categories.value[index], ...updated }
      syncOption(categories.value[index])
      return categories.value[index]
    } catch (cause) {
      categories.value[index] = previous
      if (previousOption) syncOption(previousOption)
      throw toApiError(cause)
    }
  }

  async function deleteCategory(id: number) {
    const index = categories.value.findIndex((category) => category.id === id)
    if (index === -1) return

    const [removed] = categories.value.splice(index, 1)
    const previousOptions = [...options.value]
    options.value = options.value.filter((category) => category.id !== id)
    totalCategories.value = Math.max(0, totalCategories.value - 1)

    try {
      await $fetch(endpoint(`/${id}`), { method: 'DELETE' })
      if (categories.value.length === 0 && currentPage.value > 1) {
        await fetchCategories(currentPage.value - 1)
      }
    } catch (cause) {
      categories.value.splice(index, 0, removed)
      options.value = previousOptions
      totalCategories.value += 1
      throw toApiError(cause)
    }
  }

  return {
    categories,
    options,
    loading,
    error,
    currentPage,
    perPage,
    totalCategories,
    totalPages,
    filters,
    hasCategories,
    isEmpty,
    rangeLabel,
    fetchCategories,
    fetchCategoryOptions,
    applyFilters,
    setPage,
    setPerPage,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
