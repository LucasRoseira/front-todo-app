import { defineStore } from "pinia";
import type { Category } from "~/types/category";

interface PaginatedResponse {
  data: Category[];
  current_page: number;
  last_page: number;
  total: number;
}

export const useCategoriesStore = defineStore("categories", () => {
  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl;
  const activeFilter = ref<string>("");
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalCategories = ref(0);
  const totalPages = ref(1);

  const fetchCategories = async (
    page: number = 1,
    perPage: number = 10,
    filters: Record<string, any> = {}
  ) => {
    loading.value = true;
    error.value = null;
    currentPage.value = page;
    itemsPerPage.value = perPage;

    try {
      const query = {
        page,
        per_page: perPage,
        ...Object.fromEntries(
          Object.entries(filters).filter(
            ([_, value]) =>
              value !== undefined && value !== null && value !== ""
          )
        ),
      };

      const { data, error: fetchError } = await useFetch<PaginatedResponse>(
        `${apiBaseUrl}/api/categories`,
        {
          query,
          server: false,
        }
      );

      if (fetchError.value) throw fetchError.value;

      if (data.value) {
        categories.value = data.value.data;
        currentPage.value = data.value.current_page;
        totalPages.value = data.value.last_page;
        totalCategories.value = data.value.total;
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Failed to fetch categories:", error.value);
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async (newCategory: Partial<Category>) => {
    try {
      const data = await $fetch<Category>(`${apiBaseUrl}/api/categories`, {
        method: "POST",
        body: newCategory,
      });

      if (data) {
        categories.value.unshift(data);
        totalCategories.value++;
      }
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Erro ao criar categoria:", error.value);
      throw err;
    }
  };

  const deleteCategory = async (categoryId: number) => {
    try {
      const { error: deleteError } = await useFetch(
        `${apiBaseUrl}/api/categories/${categoryId}`,
        {
          method: "DELETE",
          server: false,
        }
      );

      if (deleteError.value) throw deleteError.value;

      categories.value = categories.value.filter(
        (category) => category.id !== categoryId
      );
      totalCategories.value--;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Erro ao deletar categoria:", error.value);
      throw err;
    }
  };

  const updateCategory = async (category: Category) => {
    const originalCategory = { ...category };

    try {
      const payload: Partial<Category> = {
        name: category.name,
      };

      const { error: updateError } = await useFetch(
        `${apiBaseUrl}/api/categories/${category.id}`,
        {
          method: "PUT",
          body: payload,
          server: false,
        }
      );

      if (updateError.value) throw updateError.value;

      const index = categories.value.findIndex((c) => c.id === category.id);
      if (index !== -1) {
        categories.value[index] = { ...categories.value[index], ...payload };
      }
    } catch (err) {
      const index = categories.value.findIndex(
        (c) => c.id === originalCategory.id
      );
      if (index !== -1) {
        categories.value[index] = originalCategory;
      }
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Failed to update category:", error.value);
      throw err;
    }
  };

  const handleFilter = (filter: Record<string, any>) => {
    if (filter.name) activeFilter.value = filter.name;
    fetchCategories(1, 10, filter);
  };

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      fetchCategories(page, itemsPerPage.value);
    }
  };

  const setItemsPerPage = (perPage: number) => {
    itemsPerPage.value = perPage;
    fetchCategories(1, perPage);
  };

  if (process.client) fetchCategories();

  return {
    categories,
    loading,
    error,
    currentPage,
    itemsPerPage,
    totalCategories,
    totalPages,
    activeFilter,
    fetchCategories,
    createCategory,
    setPage,
    setItemsPerPage,
    updateCategory,
    deleteCategory,
    handleFilter,
  };
});
