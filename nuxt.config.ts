export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  pages: true,
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxtjs/color-mode'],
  css: ['~/assets/css/tailwind.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  tailwindcss: {
    viewer: false,
  },
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    },
  },
  app: {
    head: {
      title: 'Todo',
      titleTemplate: '%s · Todo',
      meta: [
        { name: 'description', content: 'Task and category manager for the Curotec Laravel API.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
