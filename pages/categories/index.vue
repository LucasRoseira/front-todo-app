<script setup lang="ts">
import { ref, onMounted } from "vue";
import CategoryForm from "./(components)/CategoryForm.vue";
import CategoryFilter from "./(components)/CategoryFilter.vue";
import CategoryList from "./(components)/CategoryList.vue";
import LoadingOverlay from "../../public/shared/components/LoadingOverlay.vue";
import type { Category } from "~/types/category";

const {
  loading,
  error,
  currentPage,
  totalPages,
  totalCategories,
  activeFilter,
  fetchCategories,
  setPage,
  createCategory,
  deleteCategory,
  updateCategory,
} = useCategoriesStore();

const editingCategory = ref<any | null>(null);
const showCreateModal = ref(false);
const categoryStore = useCategoriesStore();
const { categories } = storeToRefs(categoryStore);

const handleEdit = (category: Category) => {
  if (editingCategory.value?.id === category.id) return (editingCategory.value = null);

  return (editingCategory.value = { ...category });
};

const handleStart = () => {
  editingCategory.value = null;
  showCreateModal.value = true;
};

const cancelEdit = () => {
  editingCategory.value = null;
  showCreateModal.value = false;
};

const isSaving = ref(false);

const saveEdit = async (updatedCategory: Category) => {
  isSaving.value = true;
  try {
    if (!updatedCategory.id) {
      await createCategory(updatedCategory);
    } else {
      await updateCategory(updatedCategory);
    }
    await fetchCategories();
    showCreateModal.value = false;
    editingCategory.value = null;
  } catch (err) {
    console.error("Error saving category:", err);
  } finally {
    isSaving.value = false;
  }
};

const handleDeleteCategory = async (category: Category) => {
  await deleteCategory(category.id);
  fetchCategories();
};

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Category Management</h1>

    <div class="flex justify-between mb-6 bg-white rounded-lg shadow p-4">
      <div @click="handleStart"
        class="flex-1 text-center py-2 rounded-lg font-medium cursor-pointer transition-colors mx-[1px] bg-gray-100 hover:bg-gray-200">
        Add Category
      </div>
      <router-link to="/tasks"
        class="flex-1 text-center py-2 rounded-lg font-medium cursor-pointer transition-colors mx-[1px] bg-gray-100 hover:bg-gray-200">
        List Tasks
      </router-link>
    </div>

    <CategoryFilter :active-filter="activeFilter" />

    <CategoryForm v-if="showCreateModal" :category="null" @submit="saveEdit" @cancel="cancelEdit" />

    <CategoryList :categories="categories" :loading="loading" :current-page="currentPage" :total-pages="totalPages"
      :total-categories="totalCategories" @toggle-status="updateCategory" @prev-page="setPage(currentPage - 1)"
      @next-page="setPage(currentPage + 1)" @page-change="setPage" @edit-category="handleEdit"
      @cancel-category="cancelEdit" @delete-category="handleDeleteCategory" />

    <LoadingOverlay v-if="isSaving" />
  </div>
</template>
