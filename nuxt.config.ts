export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:5000/api",
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
    },
  },
});
