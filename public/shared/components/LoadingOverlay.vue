<script setup>
defineProps({
  message: {
    type: String,
    default: "Loading..."
  },
  showSpinner: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
      <div v-if="showSpinner" class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-gray-700 font-medium">{{ message }}</p>
    </div>
  </div>
</template>