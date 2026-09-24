<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Kullanıcı Detayları</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Kullanıcı bilgileri ve istatistikleri</p>
      </div>
      <button 
        @click="goBack" 
        class="wa-btn-outline"
      >
        Geri Dön
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-10">
      <p class="text-gray-500">Yükleniyor...</p>
    </div>
    
    <div v-else-if="user" class="space-y-6">
      <!-- Info Cards Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Basic Info -->
        <div class="bg-white dark:bg-wa-panelDark rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 p-5">
          <h2 class="font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Temel Bilgiler</h2>
          <div class="space-y-3 text-sm">
            <div>
              <span class="block text-gray-500 dark:text-gray-400">Ad Soyad</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ user.name }}</span>
            </div>
            <div>
              <span class="block text-gray-500 dark:text-gray-400">E-posta</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ user.email }}</span>
            </div>
            <div>
              <span class="block text-gray-500 dark:text-gray-400">Kayıt Tarihi</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ new Date(user.createdAt).toLocaleDateString('tr-TR') }}</span>
            </div>
          </div>
        </div>

        <!-- Meta Status -->
        <div class="bg-white dark:bg-wa-panelDark rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 p-5">
          <h2 class="font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">WhatsApp Bağlantısı</h2>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-gray-500 dark:text-gray-400">WABA ID</span>
              <span :class="user.metaSetup?.hasWabaId ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'" class="font-medium">
                {{ user.metaSetup?.hasWabaId ? 'Ayarlı' : 'Ayarlı Değil' }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 dark:text-gray-400">Erişim Jetonu (Token)</span>
              <span :class="user.metaSetup?.hasAccessToken ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'" class="font-medium">
                {{ user.metaSetup?.hasAccessToken ? 'Ayarlı' : 'Ayarlı Değil' }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 dark:text-gray-400">Telefon No ID</span>
              <span :class="user.metaSetup?.phoneNumberId ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'" class="font-medium">
                {{ user.metaSetup?.phoneNumberId ? 'Ayarlı' : 'Ayarlı Değil' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="bg-white dark:bg-wa-panelDark rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 p-5">
          <h2 class="font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">İstatistikler</h2>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-gray-500 dark:text-gray-400">Toplam Kampanya</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ stats.totalCampaigns || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 dark:text-gray-400">Toplam Şablon</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ stats.totalTemplates || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 dark:text-gray-400">Toplam Kişi</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ stats.totalContacts || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Campaigns -->
      <div class="bg-white dark:bg-wa-panelDark rounded-sm shadow-sm border border-gray-200 dark:border-gray-800">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 class="font-semibold text-gray-800 dark:text-gray-200">Son Kampanyalar (Maks 5)</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                <th class="px-6 py-3 font-semibold uppercase tracking-wider">Kampanya Adı</th>
                <th class="px-6 py-3 font-semibold uppercase tracking-wider">Tarih</th>
                <th class="px-6 py-3 font-semibold uppercase tracking-wider">Durum</th>
                <th class="px-6 py-3 font-semibold uppercase tracking-wider">Hedef Kitle</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800/50">
              <tr v-if="!recentCampaigns || recentCampaigns.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-gray-500">Kullanıcının henüz kampanyası bulunmuyor.</td>
              </tr>
              <tr v-for="campaign in recentCampaigns" :key="campaign._id" class="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                <td class="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                  {{ campaign.name }}
                </td>
                <td class="px-6 py-4 text-gray-500 dark:text-gray-500">
                  {{ new Date(campaign.createdAt).toLocaleString('tr-TR') }}
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="px-2 py-1 text-xs font-semibold rounded-sm"
                    :class="campaign.status === 'Tamamlandı' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                            campaign.status === 'Gönderiliyor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'"
                  >
                    {{ campaign.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {{ campaign.stats?.total || 0 }} Kişi
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../../store'

const store = useAppStore()
const router = useRouter()
const route = useRoute()

const userId = route.params.id as string
const isLoading = ref(true)
const user = ref<any>(null)
const stats = ref<any>({})
const recentCampaigns = ref<any[]>([])

const fetchUserDetails = async () => {
  isLoading.value = true
  try {
    const res = await fetch(`http://\${window.location.hostname}:3000/api/admin/users/${userId}`, {
      headers: store.getHeaders()
    })
    if (res.ok) {
      const data = await res.json()
      if (data.success) {
        user.value = data.data.user
        stats.value = data.data.stats || {}
        recentCampaigns.value = data.data.recentCampaigns || []
      }
    }
  } catch (error) {
    console.error('Kullanıcı detayları alınamadı:', error)
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/admin/dashboard')
}

onMounted(() => {
  fetchUserDetails()
})
</script>

<style scoped>
@reference "../../style.css";
</style>
