<script setup lang="ts">
import { ref } from 'vue';

defineProps({
    activeFilter: {
        type: String,
        required: true
    },
    searchQuery: {
        type: String,
        default: ''
    }
})

const filters = [
    { value: 'today', label: 'Today' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' }
]

const emit = defineEmits(['filter', 'search'])

const localSearchQuery = ref('')

const handleSearch = () => {
    emit('search', localSearchQuery.value)
}
</script>

<template>
    <div class="space-y-4 mb-6">
        <div class="flex justify-between bg-white rounded-lg shadow p-4">
            <div v-for="filter in filters" :key="filter.value" @click="$emit('filter', filter.value)"
                class="flex-1 text-center py-2 rounded-lg font-medium cursor-pointer transition-colors mx-[1px]" :class="{
                    'bg-blue-500 text-white': activeFilter === filter.value,
                    'bg-gray-100 hover:bg-gray-200': activeFilter !== filter.value
                }">
                {{ filter.label }}
            </div>
        </div>

        <div class="relative bg-white rounded-lg shadow p-4">
            <div class="flex items-center">
                <input v-model="localSearchQuery" @keyup.enter="handleSearch" type="text" placeholder="Search tasks..."
                    class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                <button @click="handleSearch"
                    class="absolute right-6 text-gray-500 hover:text-blue-600 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>