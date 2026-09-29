<template>
  <div class="flex h-screen overflow-hidden">
    
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
        class="fixed lg:static z-30 w-64 bg-white dark:bg-wa-panelDark border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen shrink-0 transition-colors duration-300"
      >
        <div class="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <h2 class="text-xl font-bold text-wa-teal dark:text-wa-primary tracking-wide">Saas<span class="text-gray-800 dark:text-white">Panel</span></h2>
          <button
            class="lg:hidden text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            @click="sidebarOpen = false"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <nav class="flex-1 overflow-y-auto py-4">
          <ul class="space-y-1 px-3">
            <li>
              <router-link to="/dashboard" class="nav-item" exact-active-class="active" @click="!isDesktop && (sidebarOpen = false)">
                <HomeIcon class="w-5 h-5" />
                <span>Dashboard</span>
              </router-link>
            </li>
            <li>
              <router-link to="/contacts" class="nav-item" active-class="active" @click="!isDesktop && (sidebarOpen = false)">
                <UsersIcon class="w-5 h-5" />
                <span>Kişilerim</span>
              </router-link>
            </li>
            <li>
              <router-link to="/campaigns" class="nav-item" active-class="active" @click="!isDesktop && (sidebarOpen = false)">
                <PaperAirplaneIcon class="w-5 h-5" />
                <span>Kampanyalar</span>
              </router-link>
            </li>
            <li>
              <router-link to="/templates" class="nav-item" active-class="active" @click="!isDesktop && (sidebarOpen = false)">
                <DocumentTextIcon class="w-5 h-5" />
                <span>Şablonlarım</span>
              </router-link>
            </li>
            <li>
              <router-link to="/tags" class="nav-item" active-class="active" @click="!isDesktop && (sidebarOpen = false)">
                <TagIcon class="w-5 h-5" />
                <span>Etiketlerim</span>
              </router-link>
            </li>
            <li>
              <router-link to="/settings" class="nav-item" active-class="active" @click="!isDesktop && (sidebarOpen = false)">
                <Cog8ToothIcon class="w-5 h-5" />
                <span>Ayarlar / API</span>
              </router-link>
            </li>
          </ul>
        </nav>
        
        <div class="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-gray-200 dark:border-gray-800">
          <button @click="handleLogout" class="flex items-center space-x-3 text-gray-500 hover:text-red-500 transition-colors w-full px-3 py-2 font-medium">
            <ArrowRightOnRectangleIcon class="w-5 h-5" />
            <span>Cikis Yap</span>
          </button>
        </div>
      </aside>
    </Transition>

    <main class="flex-1 flex flex-col bg-wa-light dark:bg-wa-dark transition-colors duration-300 min-w-0">
      <header class="h-16 bg-white dark:bg-wa-panelDark flex items-center justify-between px-4 md:px-6 shadow-sm z-10 transition-colors border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <!-- Hamburger -->
          <button
            class="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors p-1"
            @click="sidebarOpen = !sidebarOpen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 class="text-lg font-semibold truncate">Hoş Geldin, {{ store.user?.name || 'Kullanıcı' }}</h1>
        </div>
        <div class="flex items-center space-x-4">
          <button @click="store.toggleTheme" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <SunIcon v-if="store.isDarkMode" class="w-5 h-5" />
            <MoonIcon v-else class="w-5 h-5" />
          </button>
          <div class="w-8 h-8 bg-wa-teal text-white flex items-center justify-center font-bold text-sm">
            {{ store.user?.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-4 md:p-6">
        <router-view></router-view>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../store'
import { useRouter } from 'vue-router'
import { 
  HomeIcon, 
  UsersIcon, 
  PaperAirplaneIcon, 
  DocumentTextIcon, 
  Cog8ToothIcon, 
  TagIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/vue/24/outline'

const store = useAppStore()
const router = useRouter()

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
  router.push('/login')
}
</script>

<style scoped>
@reference "../style.css";

.nav-item {
  @apply flex items-center px-3 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors;
  gap: 0.75rem;
}
.nav-item.active {
  @apply bg-wa-light dark:bg-gray-800 text-wa-teal dark:text-wa-primary;
}

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
