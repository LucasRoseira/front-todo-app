import type { Task } from "~/types/task";

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  currentPage: number;
  itemsPerPage: number;
  totalTasks: number;
}

export const useTaskStore = defineStore("tasks", {
  state: (): TaskState => ({
    tasks: [],
    loading: false,
    error: null,
    currentPage: 1,
    itemsPerPage: 5,
    totalTasks: 0,
  }),

  getters: {
    paginatedTasks(state: {
      currentPage: number;
      itemsPerPage: number;
      tasks: Task[];
    }): Task[] {
      const start = (state.currentPage - 1) * state.itemsPerPage;
      const end = start + state.itemsPerPage;

      return state.tasks.slice(start, end);
    },
    totalPages(state: { totalTasks: number; itemsPerPage: number }): number {
      return Math.ceil(state.totalTasks / state.itemsPerPage);
    },
  },

  actions: {
    async fetchTasks(
      this: TaskState & {
        tasks: Task[];
        loading: boolean;
        error: Error | null;
        totalTasks: number;
      }
    ): Promise<void> {
      this.loading = true;
      try {
        const { data, error } = await useFetch<Task[]>("/api/tasks");

        if (error.value) throw error.value;

        this.tasks = data.value || [];
        this.totalTasks = this.tasks.length;
      } catch (err: unknown) {
        this.error = err instanceof Error ? err : new Error(String(err));
      } finally {
        this.loading = false;
      }
    },
    setPage(this: { currentPage: number }, page: number): void {
      this.currentPage = page;
    },

    async createTask(newTask: Partial<Task>) {
    try {
      const { data, error } = await useFetch<Task>("/api/tasks", {
        method: "POST",
        body: newTask,
      });

      if (error.value) throw error.value;

      if (data.value) {
        this.tasks.unshift(data.value); 
        this.totalTasks++;
      }
    } catch (err) {
      this.error = err instanceof Error ? err : new Error(String(err));
      console.error("Failt do add task:", this.error);
    }
  },

  },
});
