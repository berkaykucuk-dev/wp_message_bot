<template>
  <div class="min-h-screen bg-gray-50 dark:bg-wa-dark flex flex-col md:flex-row">
    <!-- Sidebar -->
    <aside class="w-full md:w-64 bg-white dark:bg-wa-panelDark border-r border-gray-200 dark:border-gray-700">
      <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-bold text-wa-teal dark:text-wa-primary">Süper Admin</h2>
      </div>
      <nav class="p-4 space-y-2">
        <router-link
          to="/admin/dashboard"
          class="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          active-class="bg-wa-teal text-white dark:bg-wa-primary dark:text-gray-900 hover:bg-wa-teal dark:hover:bg-wa-primary"
        >
          Genel Bakış
        </router-link>
        <router-link
          to="/admin/logs"
          class="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          active-class="bg-wa-teal text-white dark:bg-wa-primary dark:text-gray-900 hover:bg-wa-teal dark:hover:bg-wa-primary"
        >
          Sistem Logları
        </router-link>
        <router-link
          to="/admin/server-logs"
          class="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          active-class="bg-wa-teal text-white dark:bg-wa-primary dark:text-gray-900 hover:bg-wa-teal dark:hover:bg-wa-primary"
        >
          Canlı Sunucu (Terminal)
        </router-link>
        <button
          @click="handleLogout"
          class="w-full text-left px-4 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mt-4"
        >
          Çıkış Yap
        </button>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-x-hidden overflow-y-auto">
      <div class="p-6">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

const handleLogout = () => {
  store.logout()
  router.push('/admin-login')
}
</script>

<style scoped>
@reference "../style.css";
</style>
