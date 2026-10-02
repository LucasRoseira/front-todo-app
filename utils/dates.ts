export function toDateInput(value?: string | null): string {
  if (!value) return ''
  return value.slice(0, 10)
}

export function formatDisplayDate(value?: string | null): string {
  if (!value) return ''
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return value
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function isOverdue(dueDate?: string | null, status?: string): boolean {
  if (!dueDate || status === 'completed') return false
  const [year, month, day] = dueDate.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return false
  const due = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

export function isTodayOrLater(value: string): boolean {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return false
  const date = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}
