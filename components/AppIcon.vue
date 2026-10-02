<script setup lang="ts">
defineProps<{
  name: 'menu' | 'close' | 'plus' | 'trash' | 'pencil' | 'check' | 'sun' | 'moon' | 'search' | 'alert' | 'history' | 'tasks' | 'tag'
}>()
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'menu'">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="M6 6l12 12M18 6L6 18" />
    </template>
    <template v-else-if="name === 'plus'">
      <path d="M12 5v14M5 12h14" />
    </template>
    <template v-else-if="name === 'trash'">
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="M8 7l1 12h6l1-12" />
    </template>
    <template v-else-if="name === 'pencil'">
      <path d="M4 20h4l10-10-4-4L4 16v4z" />
      <path d="M13 7l4 4" />
    </template>
    <template v-else-if="name === 'check'">
      <path d="M5 12.5l4.2 4.2L19 7.5" />
    </template>
    <template v-else-if="name === 'sun'">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
    </template>
    <template v-else-if="name === 'moon'">
      <path d="M20 14.5A7.5 7.5 0 1 1 9.5 4 6 6 0 0 0 20 14.5z" />
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4 4" />
    </template>
    <template v-else-if="name === 'alert'">
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 4.8 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0z" />
    </template>
    <template v-else-if="name === 'history'">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 8v5l3 2" />
    </template>
    <template v-else-if="name === 'tasks'">
      <path d="M9 7h11M9 12h11M9 17h11" />
      <path d="M4 7h.01M4 12h.01M4 17h.01" />
    </template>
    <template v-else-if="name === 'tag'">
      <path d="M20 13l-7 7-9-9V4h7l9 9z" />
      <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </template>
  </svg>
</template>
