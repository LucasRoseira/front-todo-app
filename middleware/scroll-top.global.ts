export default defineNuxtRouteMiddleware(() => {
  if (import.meta.client) {
    window.scrollTo({ top: 0 })
  }
})
