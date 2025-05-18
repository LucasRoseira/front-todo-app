import type { Task } from "~/types/task";

export interface PaginatedResponse {
  data: Task[];
  current_page: number;
  last_page: number;
  total: number;
}

export const useTasks = () => {
  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl;
  const activeFilter = ref<string>("");
  const tasks = ref<Task[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalTasks = ref(0);
  const totalPages = ref(1);

  const fetchTasks = async (
    page: number = 1,
    perPage: number = 10,
    filter: string = ""
  ) => {
    loading.value = true;
    error.value = null;
    currentPage.value = page;
    itemsPerPage.value = perPage;

    try {
      const { data, error: fetchError } = await useFetch<PaginatedResponse>(
        `${apiBaseUrl}/api/tasks`,
        {
          query: {
            page,
            per_page: perPage,
            filter,
          },
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
    } finally {
      loading.value = false;
    }
  };

  const createTask = async (newTask: Partial<Task>) => {
    try {
      const { data, error: createError } = await useFetch<Task>(
        `${apiBaseUrl}/api/tasks`,
        {
          method: "POST",
          body: newTask,
          server: false,
        }
      );

      if (createError.value) throw createError.value;

      if (data.value) {
        tasks.value.unshift(data.value);
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

      const { error: updateError } = await useFetch(
        `${apiBaseUrl}/api/tasks/${task.id}`,
        {
          method: "PUT",
          body: {
            status: task.status,
          },
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

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      fetchTasks(page, itemsPerPage.value);
    }
  };

  const setItemsPerPage = (perPage: number) => {
    itemsPerPage.value = perPage;
    fetchTasks(1, perPage);
  };

  const filterTasks = (filter: string) => {
    activeFilter.value = filter;
    fetchTasks(1, itemsPerPage.value, filter);
  };

  if (process.client) fetchTasks();

  return {
    tasks,
    loading,
    error,
    currentPage,
    itemsPerPage,
    totalTasks,
    totalPages,
    activeFilter,
    fetchTasks,
    createTask,
    setPage,
    setItemsPerPage,
    filterTasks,
    updateTask,
    deleteTask,
  };
};
