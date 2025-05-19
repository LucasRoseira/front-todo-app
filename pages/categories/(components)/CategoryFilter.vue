<script setup lang="ts">
defineProps({
    activeFilter: {
        type: String,
        required: true
    }
})

const filters = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' }
]

defineEmits(['filter'])
</script>

<template>
    <div class="flex justify-between mb-6 bg-white rounded-lg shadow p-4">
        <div v-for="filter in filters" :key="filter.value" @click="$emit('filter', filter.value)"
            class="flex-1 text-center py-2 rounded-lg font-medium cursor-pointer transition-colors mx-[1px]" :class="{
                'bg-blue-500 text-white': activeFilter === filter.value,
                'bg-gray-100 hover:bg-gray-200': activeFilter !== filter.value
            }">
            {{ filter.label }}
        </div>
    </div>
</template>