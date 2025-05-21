import { defineStore } from "pinia";
import type { Task } from "~/types/task";

interface PaginatedResponse {
  data: Task[];
  current_page: number;
  last_page: number;
  total: number;
}

export const useTaskStore = defineStore("tasks", () => {
  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl;

  const activeFilter = ref<string>("");
  const tasks = ref<Task[]>([]);
  const loadingHistory = ref(false);
  const error = ref<Error | null>(null);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalTasks = ref(0);
  const totalPages = ref(1);

  const fetchTasks = async (
    page: number = 1,
    perPage: number = 10,
    filters: Record<string, any> = {}
  ) => {
    error.value = null;
    currentPage.value = page;
    itemsPerPage.value = perPage;

    try {
      const query = {
        page,
        per_page: perPage,
        ...Object.fromEntries(
          Object.entries(filters).filter(
            ([_, value]) =>
              value !== undefined && value !== null && value !== ""
          )
        ),
      };

      const { data, error: fetchError } = await useFetch<PaginatedResponse>(
        `${apiBaseUrl}/api/tasks`,
        {
          query,
          server: false,
        }
      );

      if (fetchError.value) throw fetchError.value;

      if (data.value) {
        tasks.value = data.value.data;
        currentPage.value = data.value.current_page;
        totalPages.value = data.value.last_page;
        totalTasks.value = data.value.total;
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Failed to fetch tasks:", error.value);
    }
  };

  const saveTask = async (newTask: Partial<Task>) => {
    try {
      const data = await $fetch<Task>(`${apiBaseUrl}/api/tasks`, {
        method: "POST",
        body: newTask,
      });

      if (data) {
        tasks.value.unshift(data);
        totalTasks.value++;
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Erro ao criar tarefa:", error.value);
    } 
  };

  const deleteTask = async (taskId: number) => {
    try {
      const { error: deleteError } = await useFetch(
        `${apiBaseUrl}/api/tasks/${taskId}`,
        {
          method: "DELETE",
          server: false,
        }
      );

      if (deleteError.value) throw deleteError.value;

      tasks.value = tasks.value.filter((task) => task.id !== taskId);
      totalTasks.value--;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Erro ao deletar tarefa:", error.value);
    }
  };

  const updateTask = async (task: Task) => {
    const originalStatus = task.status;
    try {
      task.status = task.status === "completed" ? "pending" : "completed";

      const payload: Partial<Task> = { status: task.status };

      if (task.title) payload.title = task.title;
      if (task.description) payload.description = task.description;
      if (task.priority) payload.priority = task.priority;
      if (task.due_date) payload.due_date = task.due_date;
      if (task.category?.id) payload.category.id = task.category?.id;

      const { error: updateError } = await useFetch(
        `${apiBaseUrl}/api/tasks/${task.id}`,
        {
          method: "PUT",
          body: payload,
          server: false,
        }
      );

      if (updateError.value) throw updateError.value;
    } catch (err) {
      task.status = originalStatus;
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Failed to update task status:", error.value);
    } 
  };

  const updateTaskStatus = async (task: Task) => {
    const originalStatus = task.status;
    try {
      task.status = task.status === "completed" ? "pending" : "completed";

      const { error: updateError } = await useFetch(
        `${apiBaseUrl}/api/tasks/${task.id}`,
        {
          method: "PUT",
          body: { status: task.status },
          server: false,
        }
      );

      if (updateError.value) throw updateError.value;
    } catch (err) {
      task.status = originalStatus;
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Failed to update task status:", error.value);
    } 
  };

  const fetchTaskHistory = async (taskId: number) => {
    loadingHistory.value = true;
    try {
      const response = await fetch(`${apiBaseUrl}/api/tasks/${taskId}/history`);
      if (!response.ok) throw new Error("Failed to fetch task history");
      loadingHistory.value = false;

      return await response.json();
    } catch (error) {
      console.error("Error fetching task history:", error);
      throw error;
    } finally {
      loadingHistory.value = false;
    }
  };

  const handleFilter = (filter: Record<string, any>) => {
    if (filter.status) activeFilter.value = filter.status;
    fetchTasks(1, 10, filter);
  };

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value)
      fetchTasks(page, itemsPerPage.value);
  };

  const setItemsPerPage = (perPage: number) => {
    itemsPerPage.value = perPage;
    fetchTasks(1, perPage);
  };

  if (process.client) fetchTasks();

  return {
    tasks,
    error,
    currentPage,
    itemsPerPage,
    totalTasks,
    totalPages,
    activeFilter,
    loadingHistory,
    handleFilter,
    fetchTasks,
    saveTask,
    setPage,
    setItemsPerPage,
    updateTask,
    deleteTask,
    updateTaskStatus,
    fetchTaskHistory,
  };
});
