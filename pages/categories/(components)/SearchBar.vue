<template>
  <input
    v-model="search"
    placeholder="Search Category..."
    class="px-4 py-2 border rounded-md w-full max-w-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
  />
</template>

<script setup>
const search = ref('')
</script>
