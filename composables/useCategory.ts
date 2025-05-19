import type { Category } from "~/types/category";

export interface PaginatedResponse {
  data: Category[];
  current_page: number;
  last_page: number;
  total: number;
}

export const useCategories = () => {
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
  const lastPage = ref(1);

  const fetchCategories = async (
    page: number = 1,
    perPage: number = 10,
    filter: string = ""
  ) => {
    loading.value = true;
    error.value = null;
    currentPage.value = page;
    itemsPerPage.value = perPage;

    try {
      const { data, error: fetchError } = await useFetch<PaginatedResponse>(
        `${apiBaseUrl}/api/categories`,
        {
          query: {
            page,
            per_page: perPage,
            filter,
          },
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
      const { data, error: createError } = await useFetch<Category>(
        `${apiBaseUrl}/api/categories`,
        {
          method: "POST",
          body: newCategory,
          server: false,
        }
      );

      if (createError.value) throw createError.value;

      if (data.value) {
        categories.value.unshift(data.value);
        totalCategories.value++;
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Erro ao criar categoria:", error.value);
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

      categories.value = categories.value.filter((c) => c.id !== categoryId);
      totalCategories.value--;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Erro ao deletar categoria:", error.value);
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      const { error: updateError } = await useFetch(
        `${apiBaseUrl}/api/categories/${category.id}`,
        {
          method: "PUT",
          body: {
            status: category,
          },
          server: false,
        }
      );

      if (updateError.value) throw updateError.value;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Failed to update category status:", error.value);
    }
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

  const filterCategories = (filter: string) => {
    activeFilter.value = filter;
    fetchCategories(1, itemsPerPage.value, filter);
  };

  const loadMore = async () => {
    if (currentPage.value < lastPage.value && !loading.value) {
      await fetchCategories(currentPage.value + 1);
    }
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
    filterCategories,
    updateCategory,
    deleteCategory,
    loadMore,
  };
};
