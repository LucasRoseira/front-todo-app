<script setup lang="ts">
import type { Category } from '~/types/category'
import { formatDisplayDate } from '~/utils/dates'

defineProps<{
  categories: Category[]
}>()

const emit = defineEmits<{
  edit: [category: Category]
  delete: [category: Category]
}>()
</script>

<template>
  <ul class="space-y-3">
    <li
      v-for="category in categories"
      :key="category.id"
      class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <span class="h-10 w-10 shrink-0 rounded-xl" :style="{ backgroundColor: category.color || '#6366f1' }" :aria-hidden="true" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {{ category.name }}
        </p>
        <p v-if="category.created_at" class="text-xs text-slate-500 dark:text-slate-400">
          Created {{ formatDisplayDate(category.created_at) }}
        </p>
      </div>
      <button type="button" class="icon-btn" :aria-label="`Edit ${category.name}`" @click="emit('edit', category)">
        <AppIcon name="pencil" class="h-4 w-4" />
      </button>
      <button type="button" class="icon-btn hover:text-rose-600" :aria-label="`Delete ${category.name}`" @click="emit('delete', category)">
        <AppIcon name="trash" class="h-4 w-4" />
      </button>
    </li>
  </ul>
</template>
