<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 4 })
</script>

<template>
  <div class="space-y-3" role="status" aria-live="polite" aria-label="Loading">
    <div
      v-for="row in rows"
      :key="row"
      class="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div class="mt-3 h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
      <div class="mt-4 flex gap-2">
        <div class="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
        <div class="h-5 w-20 rounded-full bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  </div>
</template>
