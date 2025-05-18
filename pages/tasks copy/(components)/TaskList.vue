<script setup lang="ts">
import TaskForm from "./TaskForm.vue";
import TaskItem from "./TaskItem.vue";
import Pagination from "./Pagination.vue";
import type { Task } from "~/types/task";
import { ref } from "vue";
import ConfirmDeleteModal from "./ConfirmDeleteModal.vue";

defineProps<{
  tasks: Task[];
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  loading: boolean;
  categories: Array<{ id: number; name: string }>;
  error?: any;
}>();

const emit = defineEmits([
  "edit-task",
  "toggle-status",
  "prev-page",
  "next-page",
  "page-change",
  "submit-edit",
  "start-task",
  "cancel-task",
  "delete-task",
  "add-category",
]);

const editingId = ref<number | null>(null);
const editingTask = ref<Task | null>(null);
const showDeleteModal = ref(false);
const taskToDelete = ref<Task | null>(null);

const startEdit = (task: Task) => {
  if (editingId.value === task.id) return cancelEdit();
  editingId.value = task.id;
  editingTask.value = { ...task };
  emit("edit-task", task);
};

const cancelEdit = () => {
  editingId.value = null;
  editingTask.value = null;
  emit("cancel-task");
};

const saveEdit = (updatedTask: Task) => {
  emit("submit-edit", updatedTask);
  cancelEdit();
};

const confirmDelete = (task: Task) => {
  taskToDelete.value = task;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  taskToDelete.value = null;
};

const deleteTask = () => {
  if (taskToDelete.value) {
    emit("delete-task", taskToDelete.value);
    cancelDelete();
  }
};

const handleAddCategory = (name: string) => {
  emit("add-category", name);
};
</script>

<template>
  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4">Tasks</h2>

    <div v-if="loading" class="text-center py-4">Carregando...</div>

    <div v-else-if="error" class="text-red-500 p-4 bg-red-50 rounded mb-4">
      Erro ao carregar tarefas: {{ error.message }} 😓
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="task in tasks"
        :key="task.id"
        class="bg-white shadow p-4 rounded border space-y-3"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <TaskItem :task="task" @toggle-status="$emit('toggle-status', task)" />
          </div>

          <button
            @click="startEdit(task)"
            class="text-gray-500 hover:text-blue-600 ml-4"
            :title="editingId === task.id ? 'Cancelar edição' : 'Editar tarefa'"
          >
            {{ editingId === task.id ? "❌" : "✏️" }}
          </button>
          <button
            @click="confirmDelete(task)"
            class="text-gray-500 hover:text-red-600"
            title="Excluir tarefa"
          >
            🗑️
          </button>
        </div>

        <div v-if="editingId === task.id" class="mt-4 border-t pt-4">
          <h3 class="text-md font-semibold mb-2">Editar Tarefa</h3>
          <TaskForm
            v-if="editingTask"
            :task="editingTask"
            :categories="categories"
            @submit="saveEdit"
            @cancel="cancelEdit"
            @add-category="handleAddCategory"
          />
        </div>
      </li>
    </ul>

    <Pagination
      v-if="(totalPages ?? 1) > 1"
      :current-page="currentPage ?? 1"
      :total-pages="totalPages ?? 0"
      @prev="$emit('prev-page')"
      @next="$emit('next-page')"
      @page-change="$emit('page-change', $event)"
    />

    <div class="text-center text-sm text-gray-500 mt-4">
      Page {{ currentPage }} of {{ totalPages }} (Total: {{ totalTasks }} tasks)
    </div>

    <ConfirmDeleteModal
      v-if="showDeleteModal"
      @cancel="cancelDelete"
      @confirm="deleteTask"
    />
  </section>
</template>
