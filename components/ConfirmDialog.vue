<script setup lang="ts">
defineProps<{
  title: string
  message: string
  confirmLabel?: string
  pending?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <BaseModal :title="title" @close="emit('cancel')">
    <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">
      {{ message }}
    </p>
    <div class="mt-6 flex justify-end gap-3">
      <button type="button" class="btn-secondary" :disabled="pending" @click="emit('cancel')">
        Cancel
      </button>
      <button type="button" class="btn-danger" :disabled="pending" @click="emit('confirm')">
        {{ pending ? 'Deleting…' : (confirmLabel || 'Delete') }}
      </button>
    </div>
  </BaseModal>
</template>
