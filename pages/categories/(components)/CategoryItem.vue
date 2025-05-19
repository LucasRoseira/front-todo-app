<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
    category: {
        type: Object,
        required: true,
    },
    active: {
        type: Boolean,
        default: false
    }
})

defineEmits(['toggle-status'])

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }
    return new Date(dateString).toLocaleDateString('en-US', options)
}

const statusClasses = computed(() => ({
    'bg-green-100 text-green-800': props.category.status === 'active',
    'bg-gray-100 text-gray-800': props.category.status === 'archived'
}))
</script>

<template>
    <li class="flex items-start p-3 hover:bg-gray-50 rounded transition-colors group">
        <input type="checkbox" class="mt-1 mr-3" :checked="category.status === 'active'"
            @change="$emit('toggle-status', category)">
        <div class="flex-1">
            <span class="font-medium" :class="{ 'line-through text-gray-400': category.status === 'archived' }">
                {{ category.name }}
            </span>
            <div class="text-sm text-gray-500 mt-1">
                <span v-if="category.created_at">
                    Created: {{ formatDate(category.created_at) }}
                </span>
                <span class="ml-2 px-2 py-0.5 text-xs rounded" :class="statusClasses">
                    {{ category.status }}
                </span>
            </div>
        </div>
    </li>
</template>