<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-wa-dark">

    <!-- Mobil Overlay -->
    <Transition name="overlay">
      <div
        v-if="sidebarOpen && !isDesktop"
        class="fixed inset-0 bg-black/50 z-20"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <Transition name="slide">
      <aside
        v-show="sidebarOpen"
        class="fixed lg:static z-30 w-64 bg-white dark:bg-wa-panelDark border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen shrink-0"
      >
        <div class="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-bold text-wa-teal dark:text-wa-primary">Super Admin</h2>
          <button
            class="lg:hidden text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            @click="sidebarOpen = false"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <nav class="flex-1 p-4 space-y-2">
          <router-link
            to="/admin/dashboard"
            class="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            active-class="bg-wa-teal text-white dark:bg-wa-primary dark:text-gray-900 hover:bg-wa-teal dark:hover:bg-wa-primary"
            @click="!isDesktop && (sidebarOpen = false)"
          >
            Genel Bakis
          </router-link>
          <router-link
            to="/admin/logs"
            class="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            active-class="bg-wa-teal text-white dark:bg-wa-primary dark:text-gray-900 hover:bg-wa-teal dark:hover:bg-wa-primary"
            @click="!isDesktop && (sidebarOpen = false)"
          >
            Sistem Loglari
          </router-link>
          <router-link
            to="/admin/server-logs"
            class="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            active-class="bg-wa-teal text-white dark:bg-wa-primary dark:text-gray-900 hover:bg-wa-teal dark:hover:bg-wa-primary"
            @click="!isDesktop && (sidebarOpen = false)"
          >
            Canli Sunucu (Terminal)
          </router-link>
          <button
            @click="handleLogout"
            class="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mt-4"
          >
            Cikis Yap
          </button>
        </nav>
      </aside>
    </Transition>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-x-hidden overflow-y-auto">
      <header class="h-16 bg-white dark:bg-wa-panelDark flex items-center px-4 md:px-6 shadow-sm z-10 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <button
          class="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors p-1 mr-3"
          @click="sidebarOpen = !sidebarOpen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-800 dark:text-white truncate">Admin Panel</h1>
      </header>
      <div class="flex-1 p-4 md:p-6">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

const sidebarOpen = ref(true)
const isDesktop = ref(true)

const checkDesktop = () => {
  const wasDesktop = isDesktop.value
  isDesktop.value = window.innerWidth >= 1024
  if (wasDesktop && !isDesktop.value) {
    sidebarOpen.value = false
  } else if (!wasDesktop && isDesktop.value) {
    sidebarOpen.value = true
  }
}

onMounted(() => {
  isDesktop.value = window.innerWidth >= 1024
  sidebarOpen.value = isDesktop.value
  window.addEventListener('resize', checkDesktop)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkDesktop)
})

const handleLogout = () => {
  store.logout()
  router.push('/admin-login')
}
</script>

<style scoped>
@reference "../style.css";

/* Overlay */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Sidebar Slide */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
