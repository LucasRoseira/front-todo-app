<script setup lang="ts">
import CategoryForm from "./CategoryForm.vue";
import CategoryItem from "./CategoryItem.vue";
import Pagination from "./Pagination.vue";
import { ref } from "vue";
import ConfirmDeleteModal from "./ConfirmDeleteModal.vue";

defineProps<{
  categories: any[];
  currentPage: number;
  totalPages: number;
  totalCategories: number;
  loading: boolean;
  error?: any;
}>();

const emit = defineEmits([
  "edit-category",
  "toggle-status",
  "prev-page",
  "next-page",
  "page-change",
  "submit-edit",
  "start-category",
  "cancel-category",
  "delete-category",
]);

const editingId = ref<number | null>(null);
const editingCategory = ref<any | null>(null);
const showDeleteModal = ref(false);
const categoryToDelete = ref<any | null>(null);

const startEdit = (category: any) => {
  if (editingId.value === category.id) return cancelEdit();
  editingId.value = category.id;
  editingCategory.value = { ...category };
  emit("edit-category", category);
};

const cancelEdit = () => {
  editingId.value = null;
  editingCategory.value = null;
  emit("cancel-category");
};

const saveEdit = (updatedCategory: any) => {
  emit("submit-edit", updatedCategory);
  cancelEdit();
};

const confirmDelete = (category: any) => {
  categoryToDelete.value = category;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  categoryToDelete.value = null;
};

const deleteCategory = () => {
  if (categoryToDelete.value) {
    emit("delete-category", categoryToDelete.value);
    cancelDelete();
  }
};
</script>

<template>
  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4">Categories</h2>

    <div v-if="loading" class="text-center py-4">Loading...</div>

    <div v-else-if="error" class="text-red-500 p-4 bg-red-50 rounded mb-4">
      Error loading categories: {{ error.message }} 😓
    </div>

    <ul v-else class="space-y-3">
      <li v-for="category in categories" :key="category.id" class="bg-white shadow p-4 rounded border space-y-3">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <CategoryItem :category="category" @toggle-status="$emit('toggle-status', category)" />
          </div>

          <button @click="startEdit(category)" class="text-gray-500 hover:text-blue-600 ml-4"
            :title="editingId === category.id ? 'Cancel editing' : 'Edit category'">
            {{ editingId === category.id ? "❌" : "✏️" }}
          </button>
          <button @click="confirmDelete(category)" class="text-gray-500 hover:text-red-600" title="Delete category">
            🗑️
          </button>
        </div>

        <div v-if="editingId === category.id" class="mt-4 border-t pt-4">
          <h3 class="text-md font-semibold mb-2">Edit Category</h3>
          <CategoryForm v-if="editingCategory" :category="editingCategory" @submit="saveEdit" @cancel="cancelEdit" />
        </div>
      </li>
    </ul>

    <Pagination v-if="(totalPages ?? 1) > 1" :current-page="currentPage ?? 1" :total-pages="totalPages ?? 0"
      @prev="$emit('prev-page')" @next="$emit('next-page')" @page-change="$emit('page-change', $event)" />

    <div class="text-center text-sm text-gray-500 mt-4">
      Page {{ currentPage }} of {{ totalPages }} (Total: {{ totalCategories }} categories)
    </div>

    <ConfirmDeleteModal v-if="showDeleteModal" @cancel="cancelDelete" @confirm="deleteCategory" />
  </section>
</template>