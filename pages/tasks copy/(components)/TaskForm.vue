<script setup lang="ts">
import type { Task } from "~/types/task";
import { ref, onMounted } from "vue";

const props = defineProps({
  task: {
    type: Object as () => Task | null,
    default: null,
  },
  categories: {
    type: Array as () => Array<{ id: number; name: string }>,
    default: () => [],
  },
});

const taskData = ref({ ...props.task });
const showCategoryModal = ref(false);
const newCategoryName = ref("");

const emit = defineEmits(["submit", "cancel", "add-category"]);

const addCategory = () => {
  if (newCategoryName.value.trim()) {
    emit("add-category", newCategoryName.value.trim());
    newCategoryName.value = "";
    showCategoryModal.value = false;
  }
};
</script>

<template>
  <form @submit="$emit('submit', taskData)" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Title</label>
      <input
        v-model="taskData.title"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Description</label>
      <textarea
        v-model="taskData.description"
        rows="3"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      ></textarea>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Status</label>
        <select
          v-model="taskData.status"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Priority</label>
        <select
          v-model="taskData.priority"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          v-model="taskData.due_date"
          type="date"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Category</label>
        <div class="flex">
          <select
            v-model="taskData.category_id"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option :value="null">No category</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
          <button
            type="button"
            @click="showCategoryModal = true"
            class="ml-2 px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
            title="Add new category"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showCategoryModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 class="text-lg font-medium mb-4">Add New Category</h3>
        <input
          v-model="newCategoryName"
          placeholder="Category name"
          class="w-full p-2 border rounded-md mb-4"
        />
        <div class="flex justify-end space-x-2">
          <button
            type="button"
            @click="showCategoryModal = false"
            class="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="addCategory"
            class="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Add
          </button>
        </div>
      </div>
    </div>

    <div class="flex justify-end space-x-2">
      <button type="button" @click="$emit('cancel')" class="px-4 py-2 border rounded-md">
        Cancel
      </button>
      <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-md">
        Save
      </button>
    </div>
  </form>
</template>
