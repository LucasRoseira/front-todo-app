<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/50">
    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
      <slot name="icon">
        <AppIcon name="tasks" class="h-6 w-6" />
      </slot>
    </div>
    <h3 class="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
      {{ title }}
    </h3>
    <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
      {{ description }}
    </p>
    <div v-if="$slots.action" class="mt-5">
      <slot name="action" />
    </div>
  </div>
</template>
