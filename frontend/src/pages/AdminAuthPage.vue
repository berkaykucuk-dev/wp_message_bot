<template>
  <div class="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center relative bg-gray-50 dark:bg-wa-dark px-4 py-8">
    <!-- Tema Butonu -->
    <button @click="store.toggleTheme" class="absolute top-4 right-4 p-2 bg-white dark:bg-wa-panelDark shadow border border-gray-200 dark:border-gray-800 transition-colors z-10">
      <SunIcon v-if="store.isDarkMode" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
      <MoonIcon v-else class="w-5 h-5 text-gray-600 dark:text-gray-300" />
    </button>

    <div class="w-full max-w-md bg-white dark:bg-wa-panelDark shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <!-- Ust Renkli Alan -->
      <div class="bg-gradient-to-r from-gray-800 to-gray-900 px-6 sm:px-8 py-8 sm:py-10 text-center">
        <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">Super Admin</h1>
        <p class="text-gray-300 text-sm">Sistem Yonetimi Kontrol Paneli</p>
      </div>
      
      <!-- Form Alani -->
      <form @submit.prevent="handleLogin" class="p-6 sm:p-8 space-y-3">
        <input v-model="email" type="email" placeholder="Admin E-posta" class="wa-input" required />
        <input v-model="password" type="password" placeholder="Sifre" class="wa-input" required />
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button type="submit" class="wa-btn mt-4 w-full" :disabled="isLoading">
          {{ isLoading ? 'Bekleyin...' : 'Yonetici Girisi' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const store = useAppStore()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const response = await fetch(`http://${window.location.hostname}:3000/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Giris basarisiz')

    store.login(data.token, data.user)
    router.push('/admin/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Bir hata olustu'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@reference "../style.css";

.wa-input {
  @apply bg-gray-50 dark:bg-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 px-4 py-3 w-full focus:border-gray-800 dark:focus:border-gray-400 outline-none transition-colors;
}

.wa-btn {
  @apply bg-gray-800 dark:bg-gray-700 text-white font-bold py-3 px-10 uppercase tracking-wider hover:bg-black dark:hover:bg-gray-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>