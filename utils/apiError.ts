export class ApiError extends Error {
  status?: number
  fieldErrors?: Record<string, string[]>

  constructor(message: string, status?: number, fieldErrors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface FetchLikeError {
  status?: number
  statusCode?: number
  data?: {
    message?: string
    errors?: Record<string, string[]>
  }
  message?: string
}

/**
 * Laravel validation errors arrive as `{ message, errors: { field: [msg] } }`.
 * Network failures have no HTTP status because the dev server never answered.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  const fetchError = error as FetchLikeError
  const status = fetchError?.status ?? fetchError?.statusCode
  const fieldErrors = fetchError?.data?.errors
  const firstFieldMessage = fieldErrors
    ? Object.values(fieldErrors).flat().find(Boolean)
    : undefined

  if (!status) {
    const name = error instanceof Error ? error.name : ''
    if (name && name !== 'FetchError') {
      return new ApiError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    }
    return new ApiError(
      'Could not reach the API. Start the Laravel server and confirm NUXT_PUBLIC_API_BASE_URL (default http://localhost:8000).',
    )
  }

  if (status === 404) {
    return new ApiError(firstFieldMessage || 'That record could not be found.', status, fieldErrors)
  }

  if (status === 422) {
    return new ApiError(
      firstFieldMessage || fetchError?.data?.message || 'Please check the form and try again.',
      status,
      fieldErrors,
    )
  }

  return new ApiError(
    firstFieldMessage || fetchError?.data?.message || fetchError?.message || 'Something went wrong. Please try again.',
    status,
    fieldErrors,
  )
}
