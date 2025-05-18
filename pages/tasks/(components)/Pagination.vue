<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
    currentPage: {
        type: Number,
        required: true
    },
    totalPages: {
        type: Number,
        required: true
    }
})

const visiblePages = computed(() => {
    const range = 2
    const start = Math.max(1, props.currentPage - range)
    const end = Math.min(props.totalPages, props.currentPage + range)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

defineEmits(['prev', 'next', 'page-change'])
</script>

<template>
    <div class="flex items-center justify-center mt-8 space-x-1">
        <button @click="$emit('prev')" :disabled="currentPage === 1"
            class="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
            </svg>
        </button>

        <template v-for="page in visiblePages" :key="page">
            <button @click="$emit('page-change', page)" class="px-4 py-2 rounded-md border transition-colors" :class="{
                'bg-blue-600 border-blue-600 text-white hover:bg-blue-700': currentPage === page,
                'border-gray-300 text-gray-700 hover:bg-gray-50': currentPage !== page
            }">
                {{ page }}
            </button>
        </template>

        <button @click="$emit('next')" :disabled="currentPage === totalPages"
            class="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd" />
            </svg>
        </button>
    </div>
</template>