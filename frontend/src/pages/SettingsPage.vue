<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Ayarlar</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Meta API ayarlarını buradan yapılandırın.</p>
      </div>
    </div>

    <div class="bg-white dark:bg-wa-panelDark rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <form @submit.prevent="saveSettings">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WA Telefon Numarası ID</label>
          <input v-model="settings.WA_PHONE_NUMBER_ID" type="text" class="wa-input" placeholder="Örn: 107..." />
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WA WABA ID</label>
          <input v-model="settings.WA_WABA_ID" type="text" class="wa-input" placeholder="Örn: 112..." />
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WA Erişim Belirteci (Access Token)</label>
          <input v-model="settings.WA_ACCESS_TOKEN" type="password" class="wa-input" placeholder="EAAN..." />
        </div>

        <div class="flex justify-end items-center gap-4">
          <span v-if="successMsg" class="text-green-500 text-sm">{{ successMsg }}</span>
          <span v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</span>
          <button type="submit" class="wa-btn px-6 py-2" :disabled="isSaving">
            {{ isSaving ? 'Kaydediliyor...' : 'Kaydet' }}
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white dark:bg-wa-panelDark rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 p-6 mt-6">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Geliştirici (Public API)</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Dış sistemlerden (CRM, e-ticaret vb.) sisteme kişi kaydetmek veya otomatik mesaj göndermek için bu API anahtarını <code>x-api-key</code> başlığı ile kullanın.</p>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
        <div class="flex gap-2">
          <input v-model="settings.API_KEY" type="text" class="wa-input bg-gray-100 dark:bg-gray-800 font-mono text-xs" readonly placeholder="Henüz oluşturulmadı" />
          <button @click="generateApiKey" class="wa-btn-outline whitespace-nowrap" type="button">
            {{ settings.API_KEY ? 'Yenile' : 'Oluştur' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '../store'
import { useRouter } from 'vue-router'

const store = useAppStore()
const router = useRouter()

const settings = ref({
  WA_PHONE_NUMBER_ID: '',
  WA_WABA_ID: '',
  WA_ACCESS_TOKEN: '',
  API_KEY: ''
})

const isSaving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const fetchSettings = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/settings', {
      headers: store.getHeaders()
    })
    if (res.status === 401) {
      store.logout()
      router.push('/login')
      return
    }
    const data = await res.json()
    if (res.ok && data.settings) {
      settings.value = {
        WA_PHONE_NUMBER_ID: data.settings.phoneNumberId || '',
        WA_WABA_ID: data.settings.wabaId || '',
        WA_ACCESS_TOKEN: data.settings.accessToken || '',
        API_KEY: data.settings.apiKey || ''
      }
    }
  } catch (error) {
    console.error('Ayarlar alınamadı:', error)
  }
}

const generateApiKey = async () => {
  if (settings.value.API_KEY && !confirm('Mevcut API anahtarınız iptal edilecek ve yeni bir tane oluşturulacak. Devam etmek istiyor musunuz?')) return;
  
  try {
    const res = await fetch('http://localhost:3000/api/settings/api-key', {
      method: 'POST',
      headers: store.getHeaders()
    });
    const data = await res.json();
    if (res.ok) {
      settings.value.API_KEY = data.apiKey;
      alert('API Key başarıyla oluşturuldu!');
    } else {
      alert('Hata: ' + data.error);
    }
  } catch (err) {
    alert('Sunucu hatası');
  }
}

const saveSettings = async () => {
  isSaving.value = true
  successMsg.value = ''
  errorMsg.value = ''
  try {
    const res = await fetch('http://localhost:3000/api/settings', {
      method: 'POST',
      headers: store.getHeaders(),
      body: JSON.stringify({
        phoneNumberId: settings.value.WA_PHONE_NUMBER_ID,
        wabaId: settings.value.WA_WABA_ID,
        accessToken: settings.value.WA_ACCESS_TOKEN
      })
    })
    if (res.status === 401) {
      store.logout()
      router.push('/login')
      return
    }
    if (!res.ok) throw new Error('Kaydedilemedi')
    successMsg.value = 'Ayarlar başarıyla kaydedildi.'
    setTimeout(() => successMsg.value = '', 3000)
  } catch (error: any) {
    errorMsg.value = error.message
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
@reference "../style.css";

.wa-input {
  @apply bg-gray-50 dark:bg-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 px-4 py-2 w-full rounded-sm focus:border-wa-teal dark:focus:border-wa-primary outline-none transition-colors;
}

.wa-btn {
  @apply rounded-sm bg-wa-primary text-white font-bold uppercase tracking-wider hover:bg-wa-teal transition-colors shadow-sm disabled:opacity-50;
}
</style>
