<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <AppSidebar />
    <div class="lg:pl-64">
      <slot />
    </div>
    <ToastHost />
  </div>
</template>
