import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

export const useToastStore = defineStore('toasts', () => {
  const toasts = ref<ToastItem[]>([])
  let nextId = 1

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function push(message: string, type: ToastType = 'info', duration = 4200) {
    const id = nextId++
    toasts.value = [...toasts.value, { id, message, type }]
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }

  return {
    toasts,
    dismiss,
    push,
    success: (message: string) => push(message, 'success'),
    error: (message: string) => push(message, 'error', 6400),
    info: (message: string) => push(message, 'info'),
    warning: (message: string) => push(message, 'warning', 5200),
  }
})
