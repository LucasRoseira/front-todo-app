import Category from "./category";
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date?: string;
  created_at: string;
  updated_at: string;
  category: Category;
  responsible_name: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date?: string;
  category?: { id: number; name: string };
}

export interface TaskStatusHistory {
  id: number;
  task_id: number;
  status: "pending" | "in_progress" | "completed";
  changed_at: string;
  created_at?: string;
  updated_at?: string;
}
