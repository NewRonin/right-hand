

export default defineNuxtConfig({
  ssr: true,
  app: {
    head: {
      charset: "utf-8",
      title: "Project Evaluation",
      viewport: "width=device-width, initial-scale=1, maximum-scale=1",
      htmlAttrs: {
        lang: "ru",
      },
    },
    pageTransition: { name: "page", mode: "out-in" },
  },

  css: [
    "@/assets/scss/bundle.scss",
  ],

  modules: [
    '@nuxt/image',
    '@pinia/nuxt',
  ],

  nitro: {
    experimental: {
      websocket: true,
    },
  },

  plugins: [
    { src: '@/plugins/socket.ts', ssr: false },
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/scss/mixins.scss";`,
          noExternal: ['vue-countup-v3']
        }
      }
    }
  },

  build: {
    transpile: ['vue-countup-v3'],
  },

  compatibilityDate: '2024-04-03',
  devtools: { enabled: false }
})
