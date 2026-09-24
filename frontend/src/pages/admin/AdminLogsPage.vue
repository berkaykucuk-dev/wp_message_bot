<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-end border-b border-gray-200 dark:border-gray-800 pb-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Sistem Logları</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Platformdaki tüm sistem hareketleri ve hatalar.</p>
      </div>
      <button @click="fetchLogs" class="wa-btn-outline flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        <span>Yenile</span>
      </button>
    </div>

    <!-- Logs Table -->
    <div class="bg-white dark:bg-wa-panelDark rounded-sm shadow-sm border border-gray-200 dark:border-gray-800">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400">
              <th class="px-6 py-4 font-semibold uppercase tracking-wider w-40">Tarih</th>
              <th class="px-6 py-4 font-semibold uppercase tracking-wider w-24">Seviye</th>
              <th class="px-6 py-4 font-semibold uppercase tracking-wider w-40">Kullanıcı</th>
              <th class="px-6 py-4 font-semibold uppercase tracking-wider w-40">İşlem</th>
              <th class="px-6 py-4 font-semibold uppercase tracking-wider">Mesaj</th>
              <th class="px-6 py-4 font-semibold uppercase tracking-wider w-24 text-right">Detay</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800/50">
            <tr v-if="isLoading">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">Loglar yükleniyor...</td>
            </tr>
            <tr v-else-if="logs.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">Henüz log kaydı bulunmuyor.</td>
            </tr>
            <template v-for="log in logs" :key="log._id">
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                <td class="px-6 py-4 text-gray-500 dark:text-gray-500 whitespace-nowrap">
                  {{ new Date(log.createdAt).toLocaleString('tr-TR') }}
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="px-2 py-1 text-xs font-semibold rounded-sm"
                    :class="log.level === 'ERROR' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                            log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'"
                  >
                    {{ log.level }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                  {{ log.user ? log.user.name : 'Sistem' }}
                </td>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                  {{ log.action }}
                </td>
                <td class="px-6 py-4 text-gray-900 dark:text-gray-100">
                  {{ log.message }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button 
                    v-if="log.metaData"
                    @click="toggleDetails(log._id)" 
                    class="text-wa-primary dark:text-wa-teal hover:underline font-medium text-xs uppercase"
                  >
                    {{ expandedLogId === log._id ? 'Gizle' : 'Göster' }}
                  </button>
                </td>
              </tr>
              <!-- Expanded Details Row -->
              <tr v-if="expandedLogId === log._id && log.metaData" class="bg-gray-50 dark:bg-gray-800/30">
                <td colspan="6" class="px-6 py-4">
                  <pre class="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto bg-gray-100 dark:bg-gray-900 p-3 rounded-md">{{ JSON.stringify(log.metaData, null, 2) }}</pre>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '../../store'

const store = useAppStore()
const logs = ref<any[]>([])
const isLoading = ref(false)
const expandedLogId = ref<string | null>(null)

const fetchLogs = async () => {
  isLoading.value = true
  try {
    const res = await fetch(`http://${window.location.hostname}:3000/api/admin/logs`, {
      headers: store.getHeaders()
    })
    if (res.ok) {
      const data = await res.json()
      logs.value = data.data || []
    }
  } catch (error) {
    console.error('Loglar alınamadı:', error)
  } finally {
    isLoading.value = false
  }
}

const toggleDetails = (id: string) => {
  if (expandedLogId.value === id) {
    expandedLogId.value = null
  } else {
    expandedLogId.value = id
  }
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
@reference "../../style.css";
</style>
