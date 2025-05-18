export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
  category_id: number | null;
}

export interface TaskInput {
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  category_id: number | null;
}

export interface TaskStatusHistory {
  id: number;
  task_id: number;
  status: 'pending' | 'in_progress' | 'completed';
  changed_at: string;
  created_at?: string;
  updated_at?: string;
}
