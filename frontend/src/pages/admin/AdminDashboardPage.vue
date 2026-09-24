<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-end border-b border-gray-200 dark:border-gray-800 pb-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Sistem Yönetimi</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Platformdaki tüm kullanıcıları ve istatistikleri yönetin.</p>
      </div>
      <!-- Inline İstatistikler -->
      <div class="flex space-x-6 text-sm">
        <div class="flex flex-col text-right">
          <span class="text-gray-500 dark:text-gray-400">Toplam Kullanıcı</span>
          <span class="font-bold text-lg dark:text-white">{{ isLoadingStats ? '...' : stats.totalUsers }}</span>
        </div>
        <div class="flex flex-col text-right">
          <span class="text-gray-500 dark:text-gray-400">Toplam Kampanya</span>
          <span class="font-bold text-lg dark:text-white">{{ isLoadingStats ? '...' : stats.totalCampaigns }}</span>
        </div>
        <div class="flex flex-col text-right">
          <span class="text-gray-500 dark:text-gray-400">Toplam Şablon</span>
          <span class="font-bold text-lg dark:text-white">{{ isLoadingStats ? '...' : stats.totalTemplates }}</span>
        </div>
      </div>
    </div>

    <!-- Kullanıcı Listesi -->
    <div class="bg-white dark:bg-wa-panelDark rounded-sm shadow-sm border border-gray-200 dark:border-gray-800">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400">
              <th class="px-6 py-4 font-semibold uppercase tracking-wider">Ad Soyad</th>
              <th class="px-6 py-4 font-semibold uppercase tracking-wider">E-posta</th>
              <th class="px-6 py-4 font-semibold uppercase tracking-wider">Kayıt Tarihi</th>
              <th class="px-6 py-4 font-semibold uppercase tracking-wider">Durum</th>
              <th class="px-6 py-4 font-semibold uppercase tracking-wider text-right">İşlem</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800/50">
            <tr v-if="isLoadingUsers">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">Kullanıcılar yükleniyor...</td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">Sistemde henüz standart kullanıcı bulunmuyor.</td>
            </tr>
            <tr v-for="user in users" :key="user._id" class="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
              <td class="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                {{ user.name }}
              </td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 text-gray-500 dark:text-gray-500">
                {{ new Date(user.createdAt).toLocaleDateString('tr-TR') }}
              </td>
              <td class="px-6 py-4">
                <span 
                  class="px-2 py-1 text-xs font-semibold rounded-sm"
                  :class="user.isActive !== false ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'"
                >
                  {{ user.isActive !== false ? 'Aktif' : 'Pasif' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right flex justify-end gap-3">
                <button 
                  @click="goToUserDetail(user._id)" 
                  class="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs uppercase"
                >
                  İncele
                </button>
                <button 
                  @click="toggleUserStatus(user)" 
                  class="text-wa-primary dark:text-wa-teal hover:underline font-medium text-xs uppercase"
                >
                  {{ user.isActive !== false ? 'Dondur' : 'Aktifleştir' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../../store'

const store = useAppStore()
const router = useRouter()
const stats = ref({
  totalUsers: 0,
  totalCampaigns: 0,
  totalTemplates: 0
})
const users = ref<any[]>([])
const isLoadingStats = ref(false)
const isLoadingUsers = ref(false)

const fetchStats = async () => {
  isLoadingStats.value = true
  try {
    const res = await fetch('http://localhost:3000/api/admin/stats', {
      headers: store.getHeaders()
    })
    if (res.ok) {
      const data = await res.json()
      stats.value = data.data // api cevabını handle edip metrikleri basıyoruz
    }
  } catch (error) {
    console.error('İstatistikler alınamadı:', error)
  } finally {
    isLoadingStats.value = false
  }
}

const fetchUsers = async () => {
  isLoadingUsers.value = true
  try {
    const res = await fetch('http://localhost:3000/api/admin/users', {
      headers: store.getHeaders()
    })
    if (res.ok) {
      const data = await res.json()
      users.value = data.data // sistemdeki tüm kullanıcıları listeliyoruz
    }
  } catch (error) {
    console.error('Kullanıcılar alınamadı:', error)
  } finally {
    isLoadingUsers.value = false
  }
}

const toggleUserStatus = async (user: any) => {
  if (!confirm(`${user.name} adlı kullanıcının erişim durumunu değiştirmek istediğinize emin misiniz?`)) return
  
  const newStatus = user.isActive === false ? true : false
  try {
    const res = await fetch(`http://localhost:3000/api/admin/users/${user._id}/status`, {
      method: 'PUT',
      headers: store.getHeaders(),
      body: JSON.stringify({ isActive: newStatus })
    })
    
    if (res.ok) {
      user.isActive = newStatus
    } else {
      alert('Durum güncellenirken bir hata oluştu.')
    }
  } catch (error) {
    console.error('Durum güncellenemedi:', error)
    alert('Durum güncellenirken bir hata oluştu.')
  }
}

const goToUserDetail = (userId: string) => {
  router.push('/admin/users/' + userId)
}

onMounted(() => {
  fetchStats()
  fetchUsers()
})
</script>

<style scoped>
@reference "../../style.css";
</style>
