<template>
  <div class="flex h-screen overflow-hidden">
    
    <aside class="w-64 bg-white dark:bg-wa-panelDark border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors duration-300">
      <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <h2 class="text-xl font-bold text-wa-teal dark:text-wa-primary tracking-wide">SaaS<span class="text-gray-800 dark:text-white">Panel</span></h2>
      </div>
      
      <nav class="flex-1 overflow-y-auto py-4">
        <ul class="space-y-1 px-3">
          <li>
            <!-- Anasayfa için exact-active-class kullanıyoruz ki alt rotalarla karışmasın -->
            <router-link to="/dashboard" class="nav-item" exact-active-class="active">
              <HomeIcon class="w-5 h-5" />
              <span>Dashboard</span>
            </router-link>
          </li>
          <li>
            <!-- Diğer sayfalar için active-class yeterli -->
            <router-link to="/contacts" class="nav-item" active-class="active">
              <UsersIcon class="w-5 h-5" />
              <span>Kişilerim</span>
            </router-link>
          </li>
          <li>
            <router-link to="/campaigns" class="nav-item" active-class="active">
              <PaperAirplaneIcon class="w-5 h-5" />
              <span>Kampanyalar</span>
            </router-link>
          </li>
          <li>
            <router-link to="/templates" class="nav-item" active-class="active">
              <DocumentTextIcon class="w-5 h-5" />
              <span>Şablonlarım</span>
            </router-link>
          </li>
          <li>
            <router-link to="/tags" class="nav-item" active-class="active">
              <TagIcon class="w-5 h-5" />
              <span>Etiketlerim</span>
            </router-link>
          </li>
          <li>
            <router-link to="/settings" class="nav-item" active-class="active">
              <Cog8ToothIcon class="w-5 h-5" />
              <span>Ayarlar / API</span>
            </router-link>
          </li>
        </ul>
      </nav>
      
      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <button @click="handleLogout" class="flex items-center space-x-3 text-gray-500 hover:text-red-500 transition-colors w-full px-3 py-2 font-medium">
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col bg-wa-light dark:bg-wa-dark transition-colors duration-300">
      <header class="h-16 bg-white dark:bg-wa-panelDark flex items-center justify-between px-6 shadow-sm z-10 transition-colors border-b border-gray-200 dark:border-gray-800">
        <h1 class="text-lg font-semibold">Hoş Geldin, {{ store.user?.name || 'Kullanıcı' }}</h1>
        <div class="flex items-center space-x-4">
          <button @click="store.toggleTheme" class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <SunIcon v-if="store.isDarkMode" class="w-5 h-5" />
            <MoonIcon v-else class="w-5 h-5" />
          </button>
          <div class="w-8 h-8 rounded bg-wa-teal text-white flex items-center justify-center font-bold">
            {{ store.user?.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-6">
        <router-view></router-view>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
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

const handleLogout = () => {
  store.logout()
  router.push('/login')
}
</script>

<style scoped>
@reference "../style.css";

.nav-item {
  @apply flex items-center px-3 py-2.5 rounded text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors;
  gap: 0.75rem;
}
.nav-item.active {
  @apply bg-wa-light dark:bg-gray-800 text-wa-teal dark:text-wa-primary;
}
</style>
