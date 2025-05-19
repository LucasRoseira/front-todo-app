<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  category: Record<string, any> | null
}>();


const categoryData = ref({ ...props.category });

const emit = defineEmits(["submit", "cancel"]);

</script>

<template>
  <form @submit="$emit('submit', categoryData)" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Category Name</label>
      <input v-model="categoryData.name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Status</label>
      <select v-model="categoryData.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
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