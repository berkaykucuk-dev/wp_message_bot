<template>
  <div class="max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col">
    <div class="mb-6 flex justify-between items-end border-b border-gray-200 dark:border-gray-800 pb-4 shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Canlı Sunucu Logları</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">docker-compose logs -f backend akışının anlık görünümü</p>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex items-center text-xs text-green-500 font-bold">
          <span class="relative flex h-3 w-3 mr-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          CANLI YAYIN
        </span>
      </div>
    </div>

    <!-- Terminal Window -->
    <div class="flex-1 bg-gray-950 rounded-sm shadow-inner border border-gray-800 overflow-hidden flex flex-col font-mono text-sm relative">
      <!-- Terminal Header -->
      <div class="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center shrink-0">
        <div class="flex space-x-2">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span class="text-gray-500 text-xs ml-4">root@wa_backend:~# logs</span>
      </div>
      
      <!-- Terminal Body -->
      <div 
        ref="logContainer"
        class="flex-1 overflow-y-auto p-4 text-gray-300 leading-relaxed whitespace-pre-wrap"
      >
        <div v-if="logs.length === 0" class="text-gray-600 italic">Sunucu bağlantısı bekleniyor...</div>
        <div v-for="(log, index) in logs" :key="index" :class="getLogColor(log)">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useAppStore } from '../../store'

const store = useAppStore()
const logs = ref<string[]>([])
const logContainer = ref<HTMLElement | null>(null)
let pollInterval: number | undefined

const fetchLogs = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/admin/server-logs', {
      headers: store.getHeaders()
    })
    if (res.ok) {
      const data = await res.json()
      if (data.success) {
        const isAtBottom = logContainer.value 
          ? logContainer.value.scrollHeight - logContainer.value.scrollTop <= logContainer.value.clientHeight + 50
          : false
          
        logs.value = data.data

        if (isAtBottom) {
          nextTick(() => {
            if (logContainer.value) {
              logContainer.value.scrollTop = logContainer.value.scrollHeight
            }
          })
        }
      }
    }
  } catch (error) {
    console.error('Loglar alınamadı:', error)
  }
}

const getLogColor = (log: string) => {
  if (log.includes('[ERROR]')) return 'text-red-400'
  if (log.includes('[WARN]')) return 'text-yellow-400'
  if (log.includes('[INFO]')) return 'text-blue-400'
  return 'text-gray-300'
}

onMounted(() => {
  fetchLogs()
  // sunucu loglarını her 2 saniyede bir çekip adeta canlı yayın yapıyoruz
  pollInterval = setInterval(fetchLogs, 2000) as unknown as number
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style scoped>
@reference "../../style.css";

/* terminal hissiyatı için özel scrollbar css'i */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #030712; 
}
::-webkit-scrollbar-thumb {
  background: #374151; 
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #4B5563; 
}
</style>

