<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTaskStore } from '~/stores/tasks'
import TaskForm from "./(components)/TaskFormEdit.vue";
import TaskFormAdd from "./(components)/TaskFormAdd.vue";
import TaskFilter from "./(components)/TaskFilter.vue";
import TaskList from "./(components)/TaskList.vue";
import type { Task } from "~/types/task";
import LoadingOverlay from "../../public/shared/components/LoadingOverlay.vue";

const toast = useNuxtApp().$toast;

const {
  tasks,
  loading,
  loadingHistory,
  error,
  currentPage,
  totalPages,
  totalTasks,
  activeFilter,
  fetchTasks,
  setPage,
  updateTask,
  createTask,
  deleteTask,
  updateTaskStatus,
  fetchTaskHistory,
} = useTasks();

const {
  categories: fetchedCategories,
  fetchCategories,
  createCategory,
  deleteCategory,
} = useCategories();

const editingTask = ref<Task | null>(null);
const showCreateModal = ref(false);
const categories = ref<{ id: number; name: string }[]>([]);
const taskHistory = ref<Record<number, any[]>>({});
const searchQuery = ref("");
const showFilterModal = ref(false);

const handleEdit = (task: Task) => {
  if (editingTask.value?.id === task.id) return (editingTask.value = null);
  return (editingTask.value = { ...task });
};

const handleStart = () => {
  editingTask.value = null;
  showCreateModal.value = true;
};

const cancelEdit = () => {
  editingTask.value = null;
  showCreateModal.value = false;
};

const handleFilter = (filter: Record<string, any>) => {
  if (filter.status) activeFilter.value = filter.status;
  fetchTasks(1, 10, filter);
};

const handleSearch = (query: string) => {
  searchQuery.value = query;
};

const isSaving = ref(false);

const saveTaskStatus = async (updatedTask: Task) => {
  isSaving.value = true;
  try {
    await updateTaskStatus(updatedTask);
    await fetchTasks();
    showCreateModal.value = false;
    editingTask.value = null;
    toast.success("Status da tarefa atualizado com sucesso!");
  } catch (err) {
    console.error(err);
    toast.error("Erro ao atualizar status da tarefa.");
  } finally {
    isSaving.value = false;
  }
};

const saveEdit = async (updatedTask: Task) => {
  isSaving.value = true;
  try {
    if (!updatedTask.id) {
      await createTask(updatedTask);
      toast.success("Tarefa criada com sucesso!");
    } else {
      await updateTask(updatedTask);
      toast.success("Tarefa atualizada com sucesso!");
    }
    await fetchTasks();
    showCreateModal.value = false;
    editingTask.value = null;
  } catch (err) {
    console.error(err);
    toast.error("Erro ao salvar tarefa.");
  } finally {
    isSaving.value = false;
  }
};

const handleDeleteTask = async (task: Task) => {
  try {
    await deleteTask(task.id);
    await fetchTasks();
    toast.success("Tarefa deletada com sucesso!");
  } catch (err) {
    console.error(err);
    toast.error("Erro ao deletar tarefa.");
  }
};

const handleShowHistory = async (taskId: number) => {
  try {
    const history = await fetchTaskHistory(taskId);
    taskHistory.value[taskId] = history;
  } catch (err) {
    console.error(err);
    toast.error(`Erro ao buscar histórico da tarefa ${taskId}`);
  }
};

const handleAddCategory = async (name: string) => {
  try {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) throw new Error("Falha ao adicionar categoria");

    const newCategory = await response.json();
    categories.value = [...categories.value, newCategory];
    toast.success("Categoria adicionada com sucesso!");
  } catch (error) {
    console.error(error);
    toast.error("Erro ao adicionar categoria.");
  }
};

const handleFetchCategories = async () => {
  try {
    await fetchCategories();
  } catch (error) {
    console.error(error);
    toast.error("Erro ao buscar categorias.");
  }
};

onMounted(() => {
  fetchTasks();
  handleFetchCategories();
});
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Todo App</h1>

    <div class="flex justify-between mb-6 bg-white rounded-lg shadow p-4">
      <div @click="handleStart"
        class="flex-1 text-center py-2 rounded-lg font-medium cursor-pointer transition-colors mx-[1px] bg-gray-100 hover:bg-gray-200">
        Add Task
      </div>
      <NuxtLink to="/categories"
        class="flex-1 text-center py-2 rounded-lg font-medium cursor-pointer transition-colors mx-[1px] bg-gray-100 hover:bg-gray-200">
        Add Category
      </NuxtLink>
    </div>

    <TaskFilter :active-filter="activeFilter" :search-query="searchQuery" @filter="handleFilter"
      @search="handleSearch" />

    <TaskForm v-if="editingTask" :task="editingTask" :categories="categories" @save-task="saveEdit" @cancel="cancelEdit"
      @add-category="handleAddCategory" />

    <TaskFormAdd v-if="showCreateModal && !editingTask" :categories="categories" @save-task="saveEdit"
      @cancel="cancelEdit" @add-category="handleAddCategory" />

    <TaskList :tasks="tasks" :loading="loading" :current-page="currentPage" :total-pages="totalPages"
      :total-tasks="totalTasks" :categories="categories" :taskHistory="taskHistory" :loadingHistory="loadingHistory"
      @toggle-status="saveTaskStatus" @save-edit="saveEdit" @prev-page="() => setPage(currentPage - 1)"
      @next-page="() => setPage(currentPage + 1)" @page-change="setPage" @edit-task="handleEdit"
      @cancel-task="cancelEdit" @delete-task="handleDeleteTask" @add-category="handleAddCategory"
      @load-history="handleShowHistory" @show-history="handleShowHistory" @handleFilter="handleFilter"
      @handleFetchCategories="handleFetchCategories" />

    <LoadingOverlay v-if="isSaving" />
  </div>
</template>