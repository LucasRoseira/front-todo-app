<template>
    <div>
        <button @click="isOpen = !isOpen" class="p-4 z-50 fixed top-4 left-4 md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>

        <transition name="slide">
            <div v-if="isOpen"
                class="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-40 shadow-lg flex flex-col p-6">
                <h2 class="text-2xl font-bold mb-6">Menu</h2>
                <NuxtLink to="/tasks" class="hover:text-blue-400 mb-4">Tasks</NuxtLink>
                <NuxtLink to="/about" class="hover:text-blue-400 mb-4">Sobre</NuxtLink>
                <button @click="isOpen = false" class="mt-auto text-sm text-gray-400 hover:text-gray-200">
                    Fechar
                </button>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const isOpen = ref(false)
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
}

.slide-enter-from {
    transform: translateX(-100%);
}

.slide-leave-to {
    transform: translateX(-100%);
}
</style>
