<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
  rangeLabel: string
}>()

const emit = defineEmits<{
  change: [page: number]
}>()

const visiblePages = computed(() => {
  const range = 2
  const start = Math.max(1, props.currentPage - range)
  const end = Math.min(props.totalPages, props.currentPage + range)
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index)
})
</script>

<template>
  <nav v-if="totalPages > 1" class="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row" aria-label="Pagination">
    <p class="text-sm text-slate-500 dark:text-slate-400">
      {{ rangeLabel }}
    </p>
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="icon-btn"
        :disabled="currentPage === 1"
        aria-label="Previous page"
        @click="emit('change', currentPage - 1)"
      >
        ‹
      </button>
      <button
        v-for="page in visiblePages"
        :key="page"
        type="button"
        class="min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        :class="page === currentPage
          ? 'bg-indigo-600 text-white'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'"
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="emit('change', page)"
      >
        {{ page }}
      </button>
      <button
        type="button"
        class="icon-btn"
        :disabled="currentPage === totalPages"
        aria-label="Next page"
        @click="emit('change', currentPage + 1)"
      >
        ›
      </button>
    </div>
  </nav>
  <p v-else class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
    {{ rangeLabel }}
  </p>
</template>
