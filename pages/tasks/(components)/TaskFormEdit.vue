<script setup lang="ts">
import type { Task } from "~/types/task";
import { ref, watch } from "vue";

const props = defineProps<{
  task: Task | null;
  categories: Array<{ id: number; name?: string }>;
}>();

const emit = defineEmits<{
  (e: "save-task", task: Task): void;
  (e: "cancel"): void;
  (e: "add-category", name: string): void;
  (e: "fetch-categories"): void;
}>();

const taskData = ref<Task | null>(null);

watch(
  () => props.task,
  (newTask) => {
    taskData.value = newTask ? { ...newTask } : null;
  },
  { immediate: true }
);

const showCategoryModal = ref(false);
const newCategoryName = ref("");

const addCategory = () => {
  const name = newCategoryName.value.trim();
  if (name) {
    emit("add-category", name);
    newCategoryName.value = "";
    showCategoryModal.value = false;
  }
};

const handleCategorySelectClick = () => {
  emit("fetch-categories");
};
</script>

<template>
  <form v-if="taskData" @submit.prevent="emit('save-task', taskData)"
    class="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
    <div>
      <label class="block text-sm font-semibold text-gray-700 mb-1">Title</label>
      <input v-model="taskData.title"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        required />
    </div>

    <div>
      <label class="block text-sm font-semibold text-gray-700 mb-1">Description</label>
      <textarea v-model="taskData.description" rows="3"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"></textarea>
    </div>
    <div>
      <label class="block text-sm font-semibold text-gray-700 mb-1">Responsible</label>
      <input type="text" :value="taskData.responsible_name" readonly
        class="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed" />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">Status</label>
        <select v-model="taskData.status"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
        <select v-model="taskData.priority"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
        <input v-model="taskData.due_date" type="date"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Category</label>
          <div class="flex gap-2">
            <select v-model="taskData.category.id" @click="handleCategorySelectClick"
              class="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
              <option :value="null">No category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
            <button type="button" @click="showCategoryModal = true"
              class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              title="Add new category">
              +
            </button>
          </div>
        </div>

        <div v-if="showCategoryModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 class="text-lg font-semibold mb-4">Add New Category</h3>
            <input v-model="newCategoryName" placeholder="Category name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md mb-4" />
            <div class="flex justify-end gap-3">
              <button type="button" @click="showCategoryModal = false"
                class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
                Cancel
              </button>
              <button type="button" @click="addCategory"
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-end gap-4 mt-6">
      <button type="button" @click="emit('cancel')"
        class="px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
        Cancel
      </button>
      <button type="submit" class="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
        Save
      </button>
    </div>
  </form>
</template>
