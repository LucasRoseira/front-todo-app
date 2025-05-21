<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTaskStore } from "~/stores/useTasksStore";
import TaskForm from "./(components)/TaskFormEdit.vue";
import TaskFormAdd from "./(components)/TaskFormAdd.vue";
import TaskFilter from "./(components)/TaskFilter.vue";
import TaskList from "./(components)/TaskList.vue";
import type { Task } from "~/types/task";
import LoadingOverlay from "../../public/shared/components/LoadingOverlay.vue";

const toast = useNuxtApp().$toast;

const {
  error,
  activeFilter,
  fetchTasks,
  setPage,
  updateTask,
  saveTask,
  deleteTask,
  updateTaskStatus,
  fetchTaskHistory,
  handleFilter,
} = useTaskStore();

const { fetchCategories } = useCategoriesStore();

const editingTask = ref<Task | null>(null);
const showCreateModal = ref(false);
const taskHistory = ref<Record<number, any[]>>({});
const searchQuery = ref("");
const taskStore = useTaskStore();
const loadingTasks = ref(false);
const loadingCategories = ref(false);
const loadingTaskHistory = ref(false);
const isSaving = ref(false);

const {
  tasks,
  totalPages,
  totalTasks,
  currentPage,
  loadingHistory,
} = storeToRefs(taskStore);

const categoryStore = useCategoriesStore();
const { categories } = storeToRefs(categoryStore);

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

const handleSearch = (query: string) => {
  searchQuery.value = query;
};

const handleSearchBlur = (query: string) => {
  loadingTasks.value = true;
  fetchTasks(1, 10, { title: query })
    .finally(() => {
      loadingTasks.value = false;
    });
};


const saveTaskStatus = async (updatedTask: Task) => {
  isSaving.value = true;
  try {
    await updateTaskStatus(updatedTask);
    await fetchTasks();
    showCreateModal.value = false;
    editingTask.value = null;

    toast.success("Status da tarefa atualizado com sucesso!");
  } catch (err) {
    isSaving.value = false;

    console.error(err);
    toast.error("Erro ao atualizar status da tarefa.");
  } finally {
    isSaving.value = false;
  }
};

const createTask = async (task: Task) => {
  isSaving.value = true;

  try {
    if (!task.id) {
      await saveTask(task);
      toast.success("Tarefa criada com sucesso!");
    } else {
      await updateTask(task);
      toast.success("Tarefa atualizada com sucesso!");
    }
    isSaving.value = false;

    await fetchTasks();
    showCreateModal.value = false;
    editingTask.value = null;
  } catch (err) {
    isSaving.value = false;
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
  loadingTaskHistory.value = true;
  try {
    const history = await fetchTaskHistory(taskId);
    taskHistory.value[taskId] = history;
  } catch (err) {
    console.error(err);
    toast.error(`Erro ao buscar histórico da tarefa ${taskId}`);
  } finally {
    loadingTaskHistory.value = false;
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

onMounted(async () => {
  loadingTasks.value = true;
  loadingCategories.value = true;

  try {
    await Promise.all([
      fetchTasks(),
      handleFetchCategories()
    ]);
  } catch (error) {
    loadingTasks.value = false;
    loadingCategories.value = false;
    console.error(error);
    toast.error("Erro ao carregar dados iniciais");
  } finally {
    loadingTasks.value = false;
    loadingCategories.value = false;
  }
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
        List Categories
      </NuxtLink>
    </div>

    <TaskFormAdd v-if="showCreateModal && !editingTask" :categories="categories" @save-task="createTask"
      @cancel="cancelEdit" @add-category="handleAddCategory" />

    <TaskFilter :active-filter="activeFilter" :search-query="searchQuery" @filter="handleFilter" @search="handleSearch"
      @search-blur="handleSearchBlur" />

    <TaskForm v-if="editingTask" :task="editingTask" :categories="categories" @save-task="createTask"
      @cancel="cancelEdit" @add-category="handleAddCategory" />

    <TaskList :tasks="tasks" :loading="loadingTasks" :current-page="currentPage" :total-pages="totalPages"
      :total-tasks="totalTasks" :categories="categories" :taskHistory="taskHistory" :loadingHistory="loadingHistory"
      @toggle-status="saveTaskStatus" @save-edit="createTask" @prev-page="() => setPage(currentPage - 1)"
      @next-page="() => setPage(currentPage + 1)" @page-change="setPage" @edit-task="handleEdit"
      @cancel-task="cancelEdit" @delete-task="handleDeleteTask" @add-category="handleAddCategory"
      @load-history="handleShowHistory" @show-history="handleShowHistory" @handleFilter="handleFilter"
      @handleFetchCategories="handleFetchCategories" />

    <LoadingOverlay v-if="loadingTasks || loadingCategories" />
    <LoadingOverlay v-if="isSaving" :message="'Saving...'" />
    <LoadingOverlay v-if="loadingTaskHistory" :message="'Loading history...'" />

  </div>
</template>
