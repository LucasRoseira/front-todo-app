<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Task } from '~/types/task'

const props = defineProps({
  task: {
    type: Object as () => Task,
    required: true,
  },
  categories: {
    type: Array as () => Array<{ id: number, name: string }>,
    default: () => []
  }
})

const emit = defineEmits(['toggle-status', 'show-history'])
const showHistory = ref(false)

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

const priorityClasses = computed(() => ({
  'bg-red-100 text-red-800': props.task.priority === 'high',
  'bg-green-100 text-green-800': props.task.priority === 'low'
}))

const responsibleClasses = computed(() => ({
  'bg-purple-100 text-purple-800': props.task.responsible_name
}))
</script>

<template>
  <li class="flex items-start p-3 hover:bg-gray-50 rounded transition-colors group">
    <input type="checkbox" class="mt-1 mr-3" :checked="task.status === 'completed'"
      @change="$emit('toggle-status', task)">
    <div class="flex-1">
      <span class="font-medium" :class="{ 'line-through text-gray-400': task.status === 'completed' }">
        {{ task.title }}
      </span>
      <div class="text-sm text-gray-500 mt-1">
        <span v-if="task.due_date">
          {{ formatDate(task.due_date) }}
        </span>
        <span v-if="task.priority !== 'medium'" class="ml-2 px-2 py-0.5 text-xs rounded" :class="priorityClasses">
          {{ task.priority }}
        </span>
        <span v-if="task.category.name" class="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
          {{ task.category.name }}
        </span>
        <span v-if="task.responsible_name" class="ml-2 px-2 py-0.5 text-xs rounded" :class="responsibleClasses">
          {{ task.responsible_name }}
        </span>
      </div>
    </div>
  </li>
</template>