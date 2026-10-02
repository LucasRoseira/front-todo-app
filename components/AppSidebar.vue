<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()
const open = ref(false)

const links = [
  { to: '/tasks', label: 'Tasks', icon: 'tasks' as const },
  { to: '/categories', label: 'Categories', icon: 'tag' as const },
]

watch(() => route.path, () => {
  open.value = false
})

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/85">
    <button type="button" class="icon-btn" aria-label="Open navigation" @click="open = true">
      <AppIcon name="menu" class="h-5 w-5" />
    </button>
    <p class="text-sm font-semibold tracking-tight">Todo</p>
    <button type="button" class="icon-btn" :aria-label="colorMode.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
      <AppIcon :name="colorMode.value === 'dark' ? 'sun' : 'moon'" class="h-5 w-5" />
    </button>
  </div>

  <div v-if="open" class="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" @click="open = false" />

  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-indigo-950/40 bg-indigo-950 text-indigo-100 transition-transform duration-200 lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex items-center justify-between px-5 py-5">
      <NuxtLink to="/tasks" class="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white">
          <AppIcon name="check" class="h-5 w-5" />
        </span>
        <span>
          <span class="block text-sm font-semibold tracking-tight text-white">Todo</span>
          <span class="block text-xs text-indigo-200/80">Curotec assessment</span>
        </span>
      </NuxtLink>
      <button type="button" class="rounded-lg p-2 text-indigo-200 hover:bg-white/10 lg:hidden" aria-label="Close navigation" @click="open = false">
        <AppIcon name="close" class="h-4 w-4" />
      </button>
    </div>

    <nav class="flex-1 space-y-1 px-3" aria-label="Primary">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-indigo-100/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        active-class="bg-white/15 text-white"
      >
        <AppIcon :name="link.icon" class="h-4 w-4" />
        {{ link.label }}
      </NuxtLink>
    </nav>

    <div class="hidden border-t border-white/10 p-3 lg:block">
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-indigo-100/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        @click="toggleTheme"
      >
        <AppIcon :name="colorMode.value === 'dark' ? 'sun' : 'moon'" class="h-4 w-4" />
        {{ colorMode.value === 'dark' ? 'Light mode' : 'Dark mode' }}
      </button>
    </div>
  </aside>
</template>
