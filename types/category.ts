export interface Category {
  id: number
  name: string
  color?: string | null
  created_at?: string
  updated_at?: string
}

export interface CategoryPayload {
  name: string
  color?: string | null
}

export interface CategoryFilters {
  name?: string
}
