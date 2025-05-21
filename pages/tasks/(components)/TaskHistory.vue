<script setup lang="ts">
import type { TaskStatusHistory } from "~/types/task";

const props = defineProps<{
    taskId: number;
    history: TaskStatusHistory[];
    expanded: boolean;
    loading: boolean;
}>();

const emit = defineEmits(["toggle"]);

const toggle = () => emit("toggle", props.taskId);

</script>

<template>
    <div class="mt-2">
        <button @click="toggle" class="text-xs text-blue-600 hover:text-blue-800 flex items-center">
            <span>{{ expanded ? "▼" : "▶" }}</span>
            <span class="ml-1">{{ expanded ? "Hide History" : "Show History" }}</span>
        </button>

        <div v-if="loading" class="mt-1 text-xs text-gray-500">Loading history...</div>

        <div v-if="expanded && history?.length" class="mt-2 border-t pt-2 animate-fade-in">
            <h4 class="text-sm font-medium mb-1">Status History</h4>
            <ul class="space-y-1">
                <li v-for="(entry, index) in history" :key="index" class="text-xs text-gray-600 flex items-center">
                    <span class="inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0" :class="{
                        'bg-green-500': entry.status === 'completed',
                        'bg-yellow-500': entry.status === 'in_progress',
                        'bg-gray-500': entry.status === 'pending',
                    }"></span>
                    <div class="flex flex-wrap items-baseline gap-1">
                        <span class="font-medium capitalize">{{ entry.status.replace("_", " ") }}</span>
                        <span>-</span>
                        <span class="text-gray-500">{{ new Date(entry.changed_at).toLocaleString() }}</span>
                    </div>
                </li>
            </ul>
        </div>

        <div v-else-if="expanded && !loading && !history?.length" class="mt-2 text-xs text-gray-500">
            No history available
        </div>
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
