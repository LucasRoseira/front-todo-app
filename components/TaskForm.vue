<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import type { Category } from '~/types/category'
import type { Task, TaskPayload, TaskPriority, TaskStatus } from '~/types/task'
import { toDateInput, isTodayOrLater } from '~/utils/dates'
import { CATEGORY_COLORS } from '~/utils/labels'
import { useCategoriesStore } from '~/stores/categories'
import { useToastStore } from '~/stores/toasts'
import { toApiError } from '~/utils/apiError'

const props = defineProps<{
  task?: Task | null
  categories: Category[]
  saving?: boolean
  serverError?: string | null
}>()

const emit = defineEmits<{
  submit: [payload: TaskPayload]
  cancel: []
}>()

const categoriesStore = useCategoriesStore()
const toast = useToastStore()
const showCategoryForm = ref(false)
const newCategoryName = ref('')
const newCategoryColor = ref(CATEGORY_COLORS[0])
const addingCategory = ref(false)
const categoryFormError = ref('')

const schema = computed(() => toTypedSchema(yup.object({
  title: yup.string().trim().required('Title is required').max(255, 'Title must be 255 characters or fewer'),
  description: yup.string().trim().max(5000, 'Description is too long').nullable(),
  responsible_name: yup.string().trim().max(255, 'Name must be 255 characters or fewer').nullable(),
  status: yup.string().oneOf(['pending', 'in_progress', 'completed']).required('Status is required'),
  priority: yup.string().oneOf(['low', 'medium', 'high']).required('Priority is required'),
  due_date: yup.string().nullable().test('due-date', 'Due date cannot be in the past', (value) => {
    if (!value) return true
    if (props.task?.id) return true
    return isTodayOrLater(value)
  }),
  category_id: yup.number().nullable().transform((value, original) => {
    if (original === '' || original === null || original === undefined) return null
    return value
  }).typeError('Select a valid category'),
})))

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema: schema,
  initialValues: emptyValues(),
})

const [title, titleAttrs] = defineField('title')
const [description, descriptionAttrs] = defineField('description')
const [responsibleName, responsibleAttrs] = defineField('responsible_name')
const [status, statusAttrs] = defineField('status')
const [priority, priorityAttrs] = defineField('priority')
const [dueDate, dueDateAttrs] = defineField('due_date')
const [categoryId, categoryAttrs] = defineField('category_id')

const titleId = useId()
const descriptionId = useId()
const responsibleId = useId()
const statusId = useId()
const priorityId = useId()
const dueDateId = useId()
const categoryIdField = useId()

function emptyValues() {
  return {
    title: '',
    description: '',
    responsible_name: '',
    status: 'pending' as TaskStatus,
    priority: 'medium' as TaskPriority,
    due_date: '',
    category_id: null as number | null,
  }
}

function valuesFromTask(task?: Task | null) {
  if (!task) return emptyValues()
  return {
    title: task.title,
    description: task.description ?? '',
    responsible_name: task.responsible_name ?? '',
    status: task.status,
    priority: task.priority,
    due_date: toDateInput(task.due_date),
    category_id: task.category_id ?? task.category?.id ?? null,
  }
}

watch(() => props.task, (task) => {
  resetForm({ values: valuesFromTask(task) })
}, { immediate: true })

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    title: values.title.trim(),
    description: values.description?.trim() ? values.description.trim() : null,
    responsible_name: values.responsible_name?.trim() ? values.responsible_name.trim() : null,
    status: values.status as TaskStatus,
    priority: values.priority as TaskPriority,
    due_date: values.due_date || null,
    category_id: values.category_id ?? null,
  })
})

async function addCategory() {
  categoryFormError.value = ''
  const name = newCategoryName.value.trim()
  if (!name) {
    categoryFormError.value = 'Category name is required'
    return
  }

  addingCategory.value = true
  try {
    const created = await categoriesStore.createCategory({
      name,
      color: newCategoryColor.value,
    })
    categoryId.value = created.id
    newCategoryName.value = ''
    showCategoryForm.value = false
    toast.success('Category added')
  } catch (error) {
    categoryFormError.value = toApiError(error).message
  } finally {
    addingCategory.value = false
  }
}
</script>

<template>
  <form class="space-y-4" @submit="onSubmit">
    <p v-if="serverError" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-100" role="alert">
      {{ serverError }}
    </p>

    <div>
      <label :for="titleId" class="label">Title</label>
      <input :id="titleId" v-model="title" v-bind="titleAttrs" type="text" class="field" :aria-invalid="Boolean(errors.title)" :aria-describedby="errors.title ? `${titleId}-error` : undefined" placeholder="What needs to be done?">
      <p v-if="errors.title" :id="`${titleId}-error`" class="field-error">{{ errors.title }}</p>
    </div>

    <div>
      <label :for="descriptionId" class="label">Description</label>
      <textarea :id="descriptionId" v-model="description" v-bind="descriptionAttrs" rows="3" class="field" placeholder="Add context for whoever picks this up" />
      <p v-if="errors.description" class="field-error">{{ errors.description }}</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label :for="responsibleId" class="label">Responsible</label>
        <input :id="responsibleId" v-model="responsibleName" v-bind="responsibleAttrs" type="text" class="field" placeholder="Optional">
        <p v-if="errors.responsible_name" class="field-error">{{ errors.responsible_name }}</p>
      </div>
      <div>
        <label :for="dueDateId" class="label">Due date</label>
        <input :id="dueDateId" v-model="dueDate" v-bind="dueDateAttrs" type="date" class="field" :aria-invalid="Boolean(errors.due_date)" :aria-describedby="errors.due_date ? `${dueDateId}-error` : undefined">
        <p v-if="errors.due_date" :id="`${dueDateId}-error`" class="field-error">{{ errors.due_date }}</p>
      </div>
      <div>
        <label :for="statusId" class="label">Status</label>
        <select :id="statusId" v-model="status" v-bind="statusAttrs" class="field">
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <p v-if="task && status === 'in_progress'" class="mt-1 text-xs leading-5 text-amber-700 dark:text-amber-300">
          The current API only accepts pending or completed when updating a task.
        </p>
      </div>
      <div>
        <label :for="priorityId" class="label">Priority</label>
        <select :id="priorityId" v-model="priority" v-bind="priorityAttrs" class="field">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>

    <div>
      <label :for="categoryIdField" class="label">Category</label>
      <div class="flex gap-2">
        <select :id="categoryIdField" v-model="categoryId" v-bind="categoryAttrs" class="field">
          <option :value="null">No category</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <button type="button" class="btn-secondary shrink-0" @click="showCategoryForm = !showCategoryForm">
          {{ showCategoryForm ? 'Close' : 'New' }}
        </button>
      </div>
      <p v-if="errors.category_id" class="field-error">{{ errors.category_id }}</p>
    </div>

    <div v-if="showCategoryForm" class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
      <label class="label" :for="`${categoryIdField}-new`">New category</label>
      <div class="flex flex-col gap-2 sm:flex-row">
        <input :id="`${categoryIdField}-new`" v-model="newCategoryName" type="text" class="field" placeholder="Category name" maxlength="255">
        <label class="sr-only" for="new-category-color">Color</label>
        <input id="new-category-color" v-model="newCategoryColor" type="color" class="h-10 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-700" aria-label="Category color">
        <button type="button" class="btn-primary" :disabled="addingCategory" @click="addCategory">
          {{ addingCategory ? 'Adding…' : 'Add' }}
        </button>
      </div>
      <p v-if="categoryFormError" class="field-error" role="alert">{{ categoryFormError }}</p>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <button type="button" class="btn-secondary" :disabled="saving" @click="emit('cancel')">
        Cancel
      </button>
      <button type="submit" class="btn-primary" :disabled="saving">
        {{ saving ? 'Saving…' : (task ? 'Save changes' : 'Create task') }}
      </button>
    </div>
  </form>
</template>
