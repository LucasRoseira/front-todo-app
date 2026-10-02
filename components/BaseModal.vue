<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const dialog = ref<HTMLDialogElement | null>(null)
const titleId = useId()

onMounted(() => {
  dialog.value?.showModal()
})

function requestClose() {
  emit('close')
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value) requestClose()
}
</script>

<template>
  <dialog
    ref="dialog"
    class="modal-dialog w-[calc(100%-2rem)] max-w-xl rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    :aria-labelledby="titleId"
    @close="requestClose"
    @click="onBackdropClick"
    @cancel.prevent="requestClose"
  >
    <div class="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
      <div>
        <h2 :id="titleId" class="text-lg font-semibold tracking-tight">
          {{ props.title }}
        </h2>
        <p v-if="props.description" class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {{ props.description }}
        </p>
      </div>
      <button type="button" class="icon-btn" aria-label="Close dialog" @click="requestClose">
        <AppIcon name="close" class="h-4 w-4" />
      </button>
    </div>
    <div class="px-5 py-5">
      <slot />
    </div>
  </dialog>
</template>
