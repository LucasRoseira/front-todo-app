<script setup lang="ts">
import TaskFormEdit from "./TaskFormEdit.vue";
import TaskItem from "./TaskItem.vue";
import Pagination from "./Pagination.vue";
import type { Task, TaskStatusHistory } from "~/types/task";
import { ref } from "vue";
import ConfirmDeleteModal from "./ConfirmDeleteModal.vue";
import TaskHistory from "./TaskHistory.vue";

defineProps<{
  tasks: Task[];
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  loading: boolean;
  loadingHistory: boolean;
  categories: Array<{ id: number; name?: string }>;
  error?: any;
  taskHistory: Record<number, TaskStatusHistory[]>;
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
  "save-edit",
  "load-history",
  "fetch-categories",
]);

const editingId = ref<number | null>(null);
const editingTask = ref<Task | null>(null);
const showDeleteModal = ref(false);
const taskToDelete = ref<Task | null>(null);
const expandedHistory = ref<Record<number, boolean>>({});

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
  emit("save-edit", updatedTask);
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

const toggleHistory = async (taskId: number) => {
  expandedHistory.value[taskId] = !expandedHistory.value[taskId];
  if (expandedHistory.value[taskId]) emit("load-history", taskId);
};

const handleFetchCategories = () => {
  emit("fetch-categories");
};
</script>

<template>
  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4">Tasks</h2>

    <div v-if="loading" class="text-center py-4">Loading...</div>

    <div v-else-if="error" class="text-red-500 p-4 bg-red-50 rounded mb-4">
      Error loading tasks: {{ error.message }} 😓
    </div>

    <ul v-else class="space-y-3">
      <li v-for="task in tasks" :key="task.id" class="bg-white shadow p-4 rounded border space-y-3 hover:bg-gray-50">
        <div class="flex justify-between items-start gap-4">
          <div class="flex-1">
            <TaskItem :task="task" class="" @toggle-status="$emit('toggle-status', task)" />

            <TaskHistory :task-id="task.id" :expanded="expandedHistory[task.id]" :history="taskHistory[task.id] || []"
              :loading="loadingHistory" @toggle="toggleHistory" />

          </div>

          <div class="flex gap-2">
            <button @click="startEdit(task)" class="text-gray-500 hover:text-blue-600"
              :title="editingId === task.id ? 'Cancel edit' : 'Edit task'">
              {{ editingId === task.id ? "❌" : "✏️" }}
            </button>
            <button @click="confirmDelete(task)" class="text-gray-500 hover:text-red-600" title="Delete task">
              🗑️
            </button>
          </div>
        </div>

        <div v-if="editingId === task.id" class="mt-4 border-t pt-4">
          <h3 class="text-md font-semibold mb-2">Edit Task</h3>
          <TaskFormEdit :task="editingTask" :categories="categories" @save-task="saveEdit" @cancel="cancelEdit"
            @add-category="handleAddCategory" @fetch-categories="handleFetchCategories" />
        </div>
      </li>
    </ul>

    <Pagination v-if="(totalPages ?? 1) > 1" :current-page="currentPage ?? 1" :total-pages="totalPages ?? 0"
      @prev="$emit('prev-page')" @next="$emit('next-page')" @page-change="$emit('page-change', $event)" />

    <div class="text-center text-sm text-gray-500 mt-4">
      Page {{ currentPage }} of {{ totalPages }} (Total: {{ totalTasks }} tasks)
    </div>

    <ConfirmDeleteModal v-if="showDeleteModal" @cancel="cancelDelete" @confirm="deleteTask" />
  </section>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
