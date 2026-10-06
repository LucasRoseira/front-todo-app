<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToastStore } from '~/stores/toasts'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)

const styles: Record<string, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
  error: 'border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100',
  info: 'border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100',
}
</script>

<template>
  <div class="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(100%-2rem,22rem)] flex-col gap-2" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg"
        :class="styles[toast.type]"
        role="status"
      >
        <p class="flex-1 text-sm font-medium leading-5">
          {{ toast.message }}
        </p>
        <button type="button" class="rounded-md p-1 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current" aria-label="Dismiss notification" @click="toastStore.dismiss(toast.id)">
          <AppIcon name="close" class="h-4 w-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
