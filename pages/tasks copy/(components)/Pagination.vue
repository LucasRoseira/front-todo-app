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
    <div class="flex justify-center mt-6 space-x-2">
        <button @click="$emit('prev')" :disabled="currentPage === 1" class="px-3 py-1 rounded disabled:opacity-50">
            &lt;
        </button>

        <button v-for="page in visiblePages" :key="page" @click="$emit('page-change', page)" class="px-3 py-1 rounded"
            :class="{
                'bg-blue-500 text-white': currentPage === page,
                'bg-gray-200 hover:bg-gray-300': currentPage !== page
            }">
            {{ page }}
        </button>

        <button @click="$emit('next')" :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded disabled:opacity-50">
            &gt;
        </button>
    </div>
</template>
