export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss',
    '@nuxtjs/supabase'
  ],

  supabase: {
    redirect: false, // ← DISABLE ALL REDIRECTS
  }
})