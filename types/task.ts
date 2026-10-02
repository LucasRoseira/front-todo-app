import type { Category } from './category'

export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskFilterType = 'today' | 'pending' | 'overdue'

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  completed_at?: string | null
  category_id: number | null
  responsible_name: string | null
  created_at?: string
  updated_at?: string
  category?: Category | null
}

export interface TaskPayload {
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date?: string | null
  category_id?: number | null
  responsible_name?: string | null
}

export interface TaskFilters {
  title?: string
  description?: string
  status?: TaskStatus | ''
  priority?: TaskPriority | ''
  due_date?: string
  category_id?: number | null
  filter_type?: TaskFilterType | ''
  responsible_name?: string
}

export interface TaskStatusHistory {
  id: number
  task_id: number
  status: TaskStatus
  changed_at: string
  created_at?: string
  updated_at?: string
}
