<script setup lang="ts">
import type { TaskInput } from "~/types/task";
import { ref } from "vue";
import { useField, useForm } from "vee-validate";
import { taskSchema } from "./schemas/insertTaskSchema";
import { toTypedSchema } from '@vee-validate/yup';

const props = defineProps({
  categories: {
    type: Array as () => Array<{ id: number; name?: string }>,
    default: () => [],
  },
});

const emit = defineEmits(["save-task", "cancel", "add-category"]);


const taskData = ref<TaskInput>({
  title: "",
  description: "",
  status: "pending",
  priority: "medium",
  due_date: "",
  responsible_name: "",
  category: { id: 0, name: "" },
});

const showCategoryModal = ref(false);
const newCategoryName = ref("");


const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(taskSchema),
});
const { value: dueDate } = useField<Date>('due_date');


const addCategory = () => {
  if (newCategoryName.value.trim()) {
    emit("add-category", newCategoryName.value.trim());
    newCategoryName.value = "";
    showCategoryModal.value = false;
  }
};

const onSubmit = handleSubmit((values) => {
  emit('save-task', values);
});
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    class="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mb-2">
    <div>
      <label class="block text-sm font-semibold text-gray-700 mb-1">Title</label>
      <input v-model="taskData.title"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        placeholder="Enter task title" />
    </div>

    <div>
      <label class="block text-sm font-semibold text-gray-700 mb-1">Description</label>
      <textarea v-model="taskData.description" rows="3"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        placeholder="Add a description..."></textarea>
    </div>
    <div>
      <label class="block text-sm font-semibold text-gray-700 mb-1">Responsible</label>
      <input type="text" v-model="taskData.responsible_name"
        class="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700" />
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
        <input v-model="dueDate" type="date"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
        <p v-if="errors.due_date" class="text-red-500 text-sm mt-1">{{ errors.due_date }}</p>
      </div>


      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">Category</label>
        <div class="flex gap-2">
          <select v-model="taskData.category"
            class="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
            <option :value="null">No category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <button type="button" @click="showCategoryModal = true"
            class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200" title="Add new category">
            +
          </button>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-4 mt-6">
      <button type="button" @click="$emit('cancel')"
        class="px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
        Cancel
      </button>
      <button type="submit" class="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
        Save
      </button>
    </div>

    <div v-if="showCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
  </form>
</template>
