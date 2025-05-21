<script setup lang="ts">
import { ref, reactive } from 'vue';

const props = defineProps({
    activeFilter: {
        type: String,
        required: true
    },
    searchQuery: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['filter', 'search', 'search-blur'])
const showFilterModal = ref(false);

const tabFilters = [
    { value: 'today', label: 'Today' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' }
]

const localSearchQuery = ref('')
const handleSearch = () => {
    emit('search', localSearchQuery.value)
}

const filters: { [key: string]: any } = reactive({
    title: '',
    description: '',
    status: '',
    priority: '',
    due_date: '',
    category_id: null,
    per_page: 10
})

const handleBlur = () => {
    if (localSearchQuery.value) emit('search-blur', localSearchQuery.value)
}

const applyFilters = () => {
    emit('filter', { ...filters });
    showFilterModal.value = false;
}

const resetFilters = () => {
    Object.keys(filters).forEach(key => {
        filters[key] = key === 'per_page' ? 10 : ''
    })
    emit('filter', { ...filters })

    showFilterModal.value = false;
}
</script>

<template>
    <div class="space-y-4 mb-6">
        <div class="flex justify-between bg-white rounded-lg shadow p-4">
            <div v-for="filter in tabFilters" :key="filter.value"
                @click="$emit('filter', { filter_type: filter.value })"
                class="flex-1 text-center py-2 rounded-lg font-medium cursor-pointer transition-colors mx-[1px]" :class="{
                    'bg-blue-500 text-white': activeFilter === filter.value,
                    'bg-gray-100 hover:bg-gray-200': activeFilter !== filter.value
                }">
                {{ filter.label }}
            </div>
        </div>

        <div class="relative bg-white rounded-lg shadow p-4 flex items-center gap-2">
            <input v-model="localSearchQuery" @keyup.enter="handleSearch" @blur="handleBlur" type="text"
                placeholder="Search Tasks..."
                class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />

            <button @click="showFilterModal = true" class="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-sm">
                Filters 🔍
            </button>
        </div>

        <div v-if="showFilterModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
                <button class="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                    @click="showFilterModal = false">
                    ✕
                </button>

                <h2 class="font-bold text-lg mb-4">Filters</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input v-model="filters.title" type="text" placeholder="Title" class="input" />
                    <input v-model="filters.description" type="text" placeholder="Description" class="input" />

                    <select v-model="filters.status" class="input">
                        <option value="">Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>

                    <select v-model="filters.priority" class="input">
                        <option value="">Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>

                    <input v-model="filters.due_date" type="date" class="input" />
                    <input v-model.number="filters.category_id" type="number" placeholder="Category ID" class="input" />
                </div>

                <div class="flex justify-end gap-2 mt-4">
                    <button @click="applyFilters" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Apply
                    </button>
                    <button @click="resetFilters" class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
                        Clear
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>


<style scoped>
.input {
    @apply px-3 py-2 border rounded-md w-full dark:bg-gray-800 dark:text-white dark:border-gray-600;
}
</style>
