<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTasks } from "~/composables/useTasks";
import TaskForm from "./(components)/TaskForm.vue";
import TaskFilter from "./(components)/TaskFilter.vue";
import TaskList from "./(components)/TaskList.vue";
import type { Task } from "~/types/task";
import LoadingOverlay from "../../public/shared/components/LoadingOverlay.vue"

const {
  tasks,
  loading,
  error,
  currentPage,
  totalPages,
  totalTasks,
  activeFilter,
  fetchTasks,
  setPage,
  filterTasks,
  updateTask,
  createTask,
  deleteTask
} = useTasks();

const editingTask = ref<Task | null>(null);
const showCreateModal = ref(false);
const categories = ref<{ id: number; name: string }[]>([]);

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

const isSaving = ref(false);

const saveEdit = async (updatedTask: Task) => {
  isSaving.value = true;
  try {
    if (!updatedTask.id) {
      await createTask(updatedTask);
    } else {
      await updateTask(updatedTask);
    }
    await fetchTasks();
    showCreateModal.value = false;
    editingTask.value = null;
  } catch (err) {
    console.error("Erro ao salvar tarefa:", err);
  } finally {
    isSaving.value = false;
  }
};

const handleDeleteTask = async (task: Task) => {
  await deleteTask(task.id);
  fetchTasks();
};

const handleAddCategory = async (name: string) => {
  try {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name })
    });

    if (!response.ok) throw new Error('Failed to add category');

    const newCategory = await response.json();
    categories.value = [...categories.value, newCategory];
  } catch (error) {
    console.error('Error adding category:', error);
  }
};

onMounted(() => {
  fetchTasks();
});
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Todo App</h1>

    <TaskFilter :active-filter="activeFilter" @filter="filterTasks" />

    <div class="flex justify-between mb-6 bg-white rounded-lg shadow p-4">
      <div @click="handleStart"
        class="flex-1 text-center py-2 rounded-lg font-medium cursor-pointer transition-colors mx-[1px] bg-gray-100 hover:bg-gray-200">
        Add Task
      </div>
    </div>

    <TaskForm v-if="showCreateModal" :task="null" @submit="saveEdit" @cancel="cancelEdit" />

    <TaskList :tasks="tasks" :loading="loading" :current-page="currentPage" :total-pages="totalPages"
      :total-tasks="totalTasks" :categories="categories" @toggle-status="updateTask"
      @prev-page="setPage(currentPage - 1)" @next-page="setPage(currentPage + 1)" @page-change="setPage"
      @edit-task="handleEdit" @cancel-task="cancelEdit" @delete-task="handleDeleteTask"
      @add-category="handleAddCategory" />
      
    <LoadingOverlay v-if="isSaving" />

  </div>
</template>
