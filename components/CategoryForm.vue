<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import type { Category, CategoryPayload } from '~/types/category'
import { CATEGORY_COLORS } from '~/utils/labels'

const props = defineProps<{
  category?: Category | null
  saving?: boolean
  serverError?: string | null
}>()

const emit = defineEmits<{
  submit: [payload: CategoryPayload]
  cancel: []
}>()

const schema = toTypedSchema(yup.object({
  name: yup.string().trim().required('Name is required').max(255, 'Name must be 255 characters or fewer'),
  color: yup.string().nullable().matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Use a hex color like #4f46e5',
    excludeEmptyString: true,
  }),
}))

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema: schema,
  initialValues: emptyValues(),
})

const [name, nameAttrs] = defineField('name')
const [color, colorAttrs] = defineField('color')
const nameId = useId()

function emptyValues() {
  return { name: '', color: CATEGORY_COLORS[0] }
}

watch(() => props.category, (category) => {
  resetForm({
    values: category
      ? { name: category.name, color: category.color || CATEGORY_COLORS[0] }
      : emptyValues(),
  })
}, { immediate: true })

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    name: values.name.trim(),
    color: values.color || null,
  })
})
</script>

<template>
  <form class="space-y-4" @submit="onSubmit">
    <p v-if="serverError" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-100" role="alert">
      {{ serverError }}
    </p>
    <div>
      <label :for="nameId" class="label">Name</label>
      <input :id="nameId" v-model="name" v-bind="nameAttrs" type="text" class="field" :aria-invalid="Boolean(errors.name)" :aria-describedby="errors.name ? `${nameId}-error` : undefined" placeholder="Work, personal, study…">
      <p v-if="errors.name" :id="`${nameId}-error`" class="field-error">{{ errors.name }}</p>
    </div>
    <fieldset>
      <legend class="label">Color</legend>
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="swatch in CATEGORY_COLORS"
          :key="swatch"
          type="button"
          class="h-8 w-8 rounded-full ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:ring-offset-slate-900"
          :class="color === swatch ? 'ring-2 ring-slate-900 dark:ring-white' : ''"
          :style="{ backgroundColor: swatch }"
          :aria-label="`Use color ${swatch}`"
          :aria-pressed="color === swatch"
          @click="color = swatch"
        />
        <input v-model="color" v-bind="colorAttrs" type="color" class="h-8 w-10 cursor-pointer rounded border border-slate-300 bg-white p-0.5 dark:border-slate-700" aria-label="Custom color">
      </div>
      <p v-if="errors.color" class="field-error">{{ errors.color }}</p>
    </fieldset>
    <div class="flex justify-end gap-3 pt-2">
      <button type="button" class="btn-secondary" :disabled="saving" @click="emit('cancel')">
        Cancel
      </button>
      <button type="submit" class="btn-primary" :disabled="saving">
        {{ saving ? 'Saving…' : (category ? 'Save changes' : 'Create category') }}
      </button>
    </div>
  </form>
</template>
