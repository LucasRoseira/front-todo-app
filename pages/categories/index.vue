<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Category, CategoryPayload } from '~/types/category'
import { useCategoriesStore } from '~/stores/categories'
import { useToastStore } from '~/stores/toasts'
import { toApiError } from '~/utils/apiError'

definePageMeta({ layout: 'default' })
useHead({ title: 'Categories' })

const categoryStore = useCategoriesStore()
const toast = useToastStore()

const {
  categories,
  loading,
  error,
  currentPage,
  totalPages,
  filters,
  isEmpty,
  rangeLabel,
} = storeToRefs(categoryStore)

const search = ref(filters.value.name || '')
const formOpen = ref(false)
const editingCategory = ref<Category | null>(null)
const saving = ref(false)
const formError = ref<string | null>(null)
const pendingDelete = ref<Category | null>(null)
const deleting = ref(false)

let timer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  categoryStore.fetchCategories()
})

watch(search, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    categoryStore.applyFilters({ name: value.trim() })
  }, 300)
})

onBeforeUnmount(() => clearTimeout(timer))

function openCreate() {
  editingCategory.value = null
  formError.value = null
  formOpen.value = true
}

function openEdit(category: Category) {
  editingCategory.value = category
  formError.value = null
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
  editingCategory.value = null
  formError.value = null
}

async function onSave(payload: CategoryPayload) {
  saving.value = true
  formError.value = null
  try {
    if (editingCategory.value) {
      await categoryStore.updateCategory(editingCategory.value.id, payload)
      toast.success('Category updated')
    } else {
      await categoryStore.createCategory(payload)
      toast.success('Category created')
    }
    closeForm()
  } catch (cause) {
    formError.value = toApiError(cause).message
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    await categoryStore.deleteCategory(pendingDelete.value.id)
    toast.success('Category deleted')
    pendingDelete.value = null
  } catch (cause) {
    toast.error(toApiError(cause).message)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-medium text-indigo-600 dark:text-indigo-300">Workspace</p>
        <h1 class="mt-1 text-3xl font-semibold tracking-tight">Categories</h1>
        <p class="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Name and color are the fields the API stores. Tasks keep working if a category is removed — the API clears that link.
        </p>
      </div>
      <button type="button" class="btn-primary" @click="openCreate">
        <AppIcon name="plus" class="h-4 w-4" />
        New category
      </button>
    </header>

    <label class="relative mb-5 block">
      <span class="sr-only">Search categories</span>
      <AppIcon name="search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input v-model="search" type="search" class="field pl-9" placeholder="Search by name">
    </label>

    <div v-if="error" class="mb-4 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100" role="alert">
      <p>{{ error }}</p>
      <button type="button" class="btn-secondary" @click="categoryStore.fetchCategories()">
        Retry
      </button>
    </div>

    <LoadingState v-if="loading && categories.length === 0" :rows="3" />

    <EmptyState
      v-else-if="isEmpty && !error"
      title="No categories found"
      :description="search ? 'Nothing matches that name. Clear the search or create a new category.' : 'Add a category before assigning it to a task.'"
    >
      <template #icon>
        <AppIcon name="tag" class="h-6 w-6" />
      </template>
      <template #action>
        <button v-if="!search" type="button" class="btn-primary" @click="openCreate">
          Create a category
        </button>
      </template>
    </EmptyState>

    <template v-else>
      <CategoryList :categories="categories" @edit="openEdit" @delete="pendingDelete = $event" />
      <PaginationBar
        :current-page="currentPage"
        :total-pages="totalPages"
        :range-label="rangeLabel"
        @change="categoryStore.setPage"
      />
    </template>

    <BaseModal
      v-if="formOpen"
      :title="editingCategory ? 'Edit category' : 'New category'"
      description="The list updates before the API responds, and restores the previous value if saving fails."
      @close="closeForm"
    >
      <CategoryForm
        :category="editingCategory"
        :saving="saving"
        :server-error="formError"
        @submit="onSave"
        @cancel="closeForm"
      />
    </BaseModal>

    <ConfirmDialog
      v-if="pendingDelete"
      title="Delete category"
      :message="`Delete “${pendingDelete.name}”? Tasks in this category stay, without a category.`"
      :pending="deleting"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </main>
</template>
