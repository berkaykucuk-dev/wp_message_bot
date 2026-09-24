<template>
  <div class="max-w-7xl mx-auto space-y-8 animate-fade-in">
    <!-- Üst Kısım: Karşılama ve Hızlı İşlemler -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Hoş Geldiniz, {{ store.user?.name }}!</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">WhatsApp otomasyon özetiniz aşağıdadır.</p>
      </div>
      
      <!-- Hızlı İşlemler (Quick Actions) -->
      <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0">
        <button @click="router.push('/campaigns')" class="flex items-center gap-2 bg-wa-teal text-white px-4 py-2 rounded-sm shadow-sm hover:bg-teal-600 transition-colors text-sm font-semibold whitespace-nowrap">
          <PlusIcon class="w-4 h-4" /> Yeni Kampanya
        </button>
        <button @click="router.push('/contacts')" class="flex items-center gap-2 bg-white dark:bg-wa-panelDark border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-semibold whitespace-nowrap">
          <UsersIcon class="w-4 h-4" /> Kişi Ekle
        </button>
        <button @click="router.push('/templates')" class="flex items-center gap-2 bg-white dark:bg-wa-panelDark border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-semibold whitespace-nowrap">
          <DocumentTextIcon class="w-4 h-4" /> Şablonlar
        </button>
      </div>
    </div>

    <!-- İstatistik Kartları -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <!-- Toplam Kişi -->
      <div class="bg-white dark:bg-wa-panelDark p-6 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm flex items-center justify-between transition-colors">
        <div>
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Toplam Kişi</p>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.contacts.total }}</h3>
        </div>
        <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-sm border border-gray-100 dark:border-gray-800">
          <UsersIcon class="w-6 h-6 text-gray-500 dark:text-gray-400" />
        </div>
      </div>

      <!-- Aktif Kampanyalar -->
      <div class="bg-white dark:bg-wa-panelDark p-6 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm flex items-center justify-between transition-colors">
        <div>
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Aktif Kampanyalar</p>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ activeCampaignCount }}</h3>
        </div>
        <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-sm border border-gray-100 dark:border-gray-800">
          <MegaphoneIcon class="w-6 h-6 text-wa-primary" />
        </div>
      </div>

      <!-- Gönderilen Mesaj -->
      <div class="bg-white dark:bg-wa-panelDark p-6 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm flex items-center justify-between transition-colors">
        <div>
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Başarılı Gönderim</p>
          <div class="flex items-baseline gap-2">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.campaigns.sent }}</h3>
            <span class="text-xs text-green-500 font-medium">Başarı: %{{ successRate }}</span>
          </div>
        </div>
        <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-sm border border-gray-100 dark:border-gray-800">
          <CheckBadgeIcon class="w-6 h-6 text-wa-teal" />
        </div>
      </div>

      <!-- Okunma Oranı -->
      <div class="bg-white dark:bg-wa-panelDark p-6 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm flex items-center justify-between transition-colors">
        <div>
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Okunma Oranı</p>
          <div class="flex items-baseline gap-2">
            <h3 class="text-2xl font-bold text-wa-primary">%{{ calculateRate(stats.campaigns.read, stats.campaigns.sent) }}</h3>
            <span class="text-xs text-gray-500">{{ stats.campaigns.read }} / {{ stats.campaigns.sent }}</span>
          </div>
        </div>
        <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-sm border border-gray-100 dark:border-gray-800">
          <EyeIcon class="w-6 h-6 text-wa-primary" />
        </div>
      </div>

    </div>

    <!-- Grafik ve Sistem Durumu Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Grafik Alanı -->
      <div class="lg:col-span-2">
        <DashboardChart :labels="chartStats.labels" :sentData="chartStats.sent" :failedData="chartStats.failed" />
      </div>

      <!-- Sistem Durumu (Dar Alan) -->
      <div class="bg-white dark:bg-wa-panelDark border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm transition-colors flex flex-col h-full">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 class="text-base font-bold text-gray-800 dark:text-white">API Durumu</h2>
        </div>
        <div class="p-6 flex-1 flex flex-col space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-300 font-medium">WhatsApp Cloud API</span>
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <span class="text-xs font-semibold text-green-600 dark:text-green-400">Bağlı</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-300 font-medium">Redis (BullMQ) Kuyruğu</span>
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <span class="text-xs font-semibold text-green-600 dark:text-green-400">Aktif</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-300 font-medium">Rate Limit Status</span>
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
              <span class="text-xs font-semibold text-blue-600 dark:text-blue-400">Normal (Tier 1)</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>

    <!-- Alt Bölüm: Son İşlemler -->
    <div class="bg-white dark:bg-wa-panelDark border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm transition-colors flex flex-col">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h2 class="text-base font-bold text-gray-800 dark:text-white">Son Kampanyalar</h2>
        <router-link to="/campaigns" class="text-sm font-semibold text-wa-teal dark:text-wa-primary hover:underline outline-none">Tümünü Gör</router-link>
      </div>
      <div class="p-0 overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">
              <th class="px-6 py-3 font-semibold">Kampanya Adı</th>
              <th class="px-6 py-3 font-semibold">Tarih</th>
              <th class="px-6 py-3 font-semibold">Hedef</th>
              <th class="px-6 py-3 font-semibold text-right">Durum</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
            
            <tr v-if="recentCampaigns.length === 0" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td colspan="4" class="px-6 py-8 text-center text-gray-500">Henüz başlatılmış bir kampanya yok.</td>
            </tr>

            <tr v-for="campaign in recentCampaigns" :key="campaign._id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td class="px-6 py-4 text-gray-800 dark:text-gray-200 font-medium">{{ campaign.name }}</td>
              <td class="px-6 py-4 text-gray-500">{{ formatDate(campaign.createdAt) }}</td>
              <td class="px-6 py-4 text-gray-500">{{ campaign.stats.total }} Kişi</td>
              <td class="px-6 py-4 text-right">
                <span v-if="campaign.status === 'Tamamlandı'" class="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-sm border border-green-200 dark:border-green-800">
                  Tamamlandı
                </span>
                <span v-else class="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-sm border border-blue-200 dark:border-blue-800">
                  {{ campaign.status }}
                </span>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import DashboardChart from '../components/DashboardChart.vue'
import { 
  UsersIcon, 
  PlusIcon,
  DocumentTextIcon,
  CheckBadgeIcon, 
  MegaphoneIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'

const store = useAppStore()
const router = useRouter()
let pollingInterval: any = null

const stats = ref({
  contacts: { total: 0, active: 0 },
  campaigns: { total: 0, sent: 0, failed: 0, delivered: 0, read: 0 }
})

const chartStats = ref({
  labels: [] as string[],
  sent: [] as number[],
  failed: [] as number[]
})

const recentCampaigns = ref<any[]>([])

const successRate = computed(() => {
  const totalAttempted = stats.value.campaigns.sent + stats.value.campaigns.failed
  if (totalAttempted === 0) return 0
  return ((stats.value.campaigns.sent / totalAttempted) * 100).toFixed(1)
})

const activeCampaignCount = computed(() => {
  return recentCampaigns.value.filter(c => c.status === 'Gönderiliyor').length
})

const calculateRate = (value: number, total: number) => {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

const fetchDashboardData = async () => {
  try {
    const response = await fetch(`http://${window.location.hostname}:3000/api/dashboard`, {
      headers: store.getHeaders()
    })
    if (response.status === 401) {
      store.logout()
      router.push('/login')
      return
    }
    if (response.ok) {
      const data = await response.json()
      stats.value.contacts = data.contacts
      stats.value.campaigns = data.campaigns
      recentCampaigns.value = data.recentCampaigns
      if (data.chartData) {
        chartStats.value = data.chartData
      }
    }
  } catch (error) {
    console.error('Dashboard verisi alınamadı:', error)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

onMounted(() => {
  fetchDashboardData()
  pollingInterval = setInterval(fetchDashboardData, 5000)
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})
</script>