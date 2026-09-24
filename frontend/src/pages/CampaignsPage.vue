<template>
  <div class="flex flex-col h-full">
    
    <!-- Üst Bar -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Kampanyalar</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Rehberindeki kişilere toplu mesaj gönder ve durumlarını takip et.</p>
      </div>
      <button @click="toggleCreateForm" class="wa-btn flex items-center space-x-2">
        <PlusIcon class="w-5 h-5" />
        <span>Yeni Kampanya</span>
      </button>
    </div>

    <!-- Yeni Kampanya Formu (Genişleyen Alan) -->
    <div v-if="showCreateForm" class="mb-6 p-6 bg-white dark:bg-wa-panelDark border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm transition-all">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Yeni Kampanya Oluştur</h2>
      
      <form @submit.prevent="submitCampaign" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">KAMPANYA ADI</label>
            <input v-model="newCampaign.name" type="text" placeholder="Örn: Bayram İndirimi" class="wa-input" required />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">HEDEF ETİKET</label>
            <div class="relative">
              <select v-model="newCampaign.targetTag" class="wa-input appearance-none pr-10" required>
                <option value="" disabled>Etiket Seçin...</option>
                <option v-for="tag in tags" :key="tag._id" :value="tag.name">{{ tag.name }}</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <ChevronDownIcon class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">ŞABLON SEÇİMİ</label>
            <div class="relative">
              <select v-model="selectedTemplateId" class="wa-input appearance-none pr-10" required>
                <option value="" disabled>Şablon Seçin...</option>
                <option v-for="tmpl in templates" :key="tmpl._id" :value="tmpl._id">
                  {{ tmpl.name }} ({{ tmpl.category }})
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <ChevronDownIcon class="w-4 h-4" />
              </div>
            </div>
          </div>

          <!-- Dynamic UI -->
          <div v-if="selectedTemplate" class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Şablon Önizleme & Değişkenler</h3>
            
            <div class="flex flex-col md:flex-row gap-6">
              <!-- Message Bubble -->
              <div class="flex-1">
                <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 shadow-sm border border-green-100 dark:border-green-800/30">
                  <div v-if="selectedTemplate.headerText" class="font-bold text-gray-800 dark:text-gray-200 mb-2">{{ selectedTemplate.headerText }}</div>
                  <div class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{{ selectedTemplate.bodyText }}</div>
                  <div v-if="selectedTemplate.footerText" class="text-xs text-gray-500 mt-2">{{ selectedTemplate.footerText }}</div>
                  <div v-if="selectedTemplate.buttons?.length" class="mt-3 flex flex-wrap gap-2">
                    <span v-for="(btn, i) in selectedTemplate.buttons" :key="i" class="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-xs font-medium text-blue-600 dark:text-blue-400">
                      {{ btn.text }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Variable & Media Inputs -->
              <div class="flex-1 space-y-4">
                <!-- Medya Inputu (Görsel/Video/Doküman ise) -->
                <div v-if="selectedTemplate?.headerType && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(selectedTemplate.headerType)" class="space-y-1">
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    MEDYA URL'Sİ <span class="text-red-500">*</span>
                  </label>
                  <input v-model="variableValues._mediaUrl" type="url" :placeholder="`Geçerli bir ${selectedTemplate.headerType.toLowerCase()} bağlantısı girin`" class="wa-input" required />
                  <p class="text-[10px] text-gray-500">Şablonunuz medya içeriyor. Herkese gönderilecek ortak bir bağlantı girin.</p>
                </div>

                <!-- Text Variables -->
                <div v-if="selectedTemplate?.variables?.length" class="space-y-3">
                  <div v-for="(variable, index) in selectedTemplate.variables" :key="index">
                    <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      {{ variable.toUpperCase() }} <span class="text-gray-400">({{index + 1}})</span>
                    </label>
                    <input v-model="variableValues[variable]" type="text" :placeholder="`${variable} değerini girin`" class="wa-input" required />
                  </div>
                </div>
                <div v-else-if="!['IMAGE', 'VIDEO', 'DOCUMENT'].includes(selectedTemplate?.headerType || '')" class="h-full flex items-center justify-center text-sm text-gray-500 italic">
                  Bu şablonda değişken bulunmuyor.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-2">
          <button type="button" @click="toggleCreateForm" class="wa-btn-outline">İptal</button>
          <button type="submit" :disabled="isSubmitting" class="wa-btn flex items-center space-x-2 disabled:opacity-50">
            <PaperAirplaneIcon class="w-4 h-4" />
            <span>{{ isSubmitting ? 'Başlatılıyor...' : 'Kampanyayı Başlat' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Kampanyalar Tablosu -->
    <div class="bg-white dark:bg-wa-panelDark border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden shadow-sm flex flex-col flex-1">
      <div class="overflow-x-auto flex-1">
        <table class="w-full text-left border-collapse table-fixed">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">
              <th class="px-6 py-4 font-semibold w-[28px]"></th>
              <th class="px-6 py-4 font-semibold">Kampanya Adı</th>
              <th class="px-6 py-4 font-semibold w-1/6">Hedef Kitle</th>
              <th class="px-6 py-4 font-semibold w-1/6">Durum</th>
              <th class="px-6 py-4 font-semibold w-1/6">İlerleme</th>
              <th class="px-6 py-4 font-semibold text-right w-1/6">Tarih</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
            
            <tr v-if="campaigns.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                Henüz başlatılmış bir kampanya bulunmuyor.
              </td>
            </tr>

            <template v-for="campaign in campaigns" :key="campaign._id">
              <!-- Ana Satır -->
              <tr 
                @click="toggleExpand(campaign._id)" 
                class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <td class="pl-6 py-4 w-[28px]">
                  <ChevronDownIcon 
                    class="w-4 h-4 text-gray-400 transition-transform duration-200" 
                    :class="{ 'rotate-180': expandedId === campaign._id }" 
                  />
                </td>
                <td class="px-6 py-4 text-gray-800 dark:text-gray-200 font-medium truncate" :title="campaign.name">
                  {{ campaign.name }}
                </td>
                <td class="px-6 py-4 text-gray-500">
                  <span class="px-2 py-1 text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-700 uppercase tracking-wide">
                    {{ campaign.targetTag }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span v-if="campaign.status === 'Gönderiliyor'" class="px-2 py-1 flex items-center w-max space-x-1 text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-sm border border-blue-200 dark:border-blue-800 uppercase tracking-wide">
                    <ArrowPathIcon class="w-3 h-3 animate-spin" />
                    <span>Gönderiliyor</span>
                  </span>
                  <span v-else-if="campaign.status === 'Tamamlandı'" class="px-2 py-1 flex items-center w-max space-x-1 text-[10px] font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-sm border border-green-200 dark:border-green-800 uppercase tracking-wide">
                    <CheckCircleIcon class="w-3 h-3" />
                    <span>Tamamlandı</span>
                  </span>
                  <span v-else class="px-2 py-1 flex items-center w-max space-x-1 text-[10px] font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 rounded-sm border border-gray-200 dark:border-gray-700 uppercase tracking-wide">
                    <ClockIcon class="w-3 h-3" />
                    <span>{{ campaign.status }}</span>
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-1.5 overflow-hidden flex">
                      <div class="bg-blue-500 h-1.5 transition-all duration-500" :style="{ width: `${campaign.stats.total ? (campaign.stats.sent / campaign.stats.total) * 100 : 0}%` }"></div>
                      <div v-if="campaign.stats.failed > 0" class="bg-red-500 h-1.5 transition-all duration-500" :style="{ width: `${(campaign.stats.failed / campaign.stats.total) * 100}%` }"></div>
                    </div>
                    <span class="text-xs text-gray-500 font-mono whitespace-nowrap">{{ campaign.stats.sent }}/{{ campaign.stats.total }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right text-gray-500 text-xs font-mono">
                  {{ new Date(campaign.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }}
                </td>
              </tr>

              <!-- Detay Satırı (Dropdown) -->
              <tr v-if="expandedId === campaign._id">
                <td colspan="6" class="px-0 py-0">
                  <div class="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 px-12 py-4">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div class="flex flex-col items-center p-3 bg-white dark:bg-wa-panelDark rounded-sm border border-gray-200 dark:border-gray-800">
                        <span class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1">Hedef Kitle</span>
                        <span class="text-lg font-bold text-gray-800 dark:text-white">{{ campaign.stats.total }}</span>
                      </div>
                      <div class="flex flex-col items-center p-3 bg-white dark:bg-wa-panelDark rounded-sm border border-gray-200 dark:border-gray-800">
                        <span class="text-[10px] uppercase tracking-wider text-blue-500 font-semibold mb-1">API'ye Giden</span>
                        <span class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ campaign.stats.sent }}</span>
                      </div>
                      <div class="flex flex-col items-center p-3 bg-white dark:bg-wa-panelDark rounded-sm border border-gray-200 dark:border-gray-800">
                        <span class="text-[10px] uppercase tracking-wider text-wa-teal font-semibold mb-1">İletilen ✓✓</span>
                        <span class="text-lg font-bold text-wa-teal">{{ campaign.stats.delivered || 0 }}</span>
                      </div>
                      <div class="flex flex-col items-center p-3 bg-white dark:bg-wa-panelDark rounded-sm border border-gray-200 dark:border-gray-800">
                        <span class="text-[10px] uppercase tracking-wider text-wa-primary font-semibold mb-1">Okunan</span>
                        <span class="text-lg font-bold text-wa-primary">{{ campaign.stats.read || 0 }}</span>
                      </div>
                    </div>
                    <div v-if="campaign.stats.failed > 0" class="mt-3 flex items-center space-x-2 text-xs text-red-500">
                      <ExclamationTriangleIcon class="w-4 h-4" />
                      <span class="font-semibold">{{ campaign.stats.failed }} mesaj gönderilemedi.</span>
                    </div>
                  </div>
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import { 
  PlusIcon, 
  PaperAirplaneIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const store = useAppStore()
const router = useRouter()
const showCreateForm = ref(false)
const isSubmitting = ref(false)
const campaigns = ref<any[]>([])
const expandedId = ref<string | null>(null)
let pollingInterval: any = null

const tags = ref<any[]>([])
const templates = ref<any[]>([])
const selectedTemplateId = ref('')
const variableValues = ref<Record<string, string>>({})

const checkAuth = (res: Response) => {
  if (res.status === 401) {
    store.logout()
    router.push('/login')
    return false
  }
  return true
}

const selectedTemplate = computed(() => 
  templates.value.find(t => t._id === selectedTemplateId.value)
)

watch(selectedTemplateId, (newId) => {
  const tmpl = templates.value.find(t => t._id === newId)
  if (tmpl?.variables) {
    const vals: Record<string, string> = {}
    tmpl.variables.forEach((v: string) => { vals[v] = '' })
    variableValues.value = vals
  } else {
    variableValues.value = {}
  }
})

const newCampaign = ref({
  name: '',
  targetTag: '',
  templateId: ''
})

const toggleExpand = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id
}

const toggleCreateForm = () => {
  showCreateForm.value = !showCreateForm.value
  if (!showCreateForm.value) {
    newCampaign.value = { name: '', targetTag: '', templateId: '' }
    selectedTemplateId.value = ''
    variableValues.value = {}
  }
}

const fetchTags = async () => {
  try {
    const response = await fetch(`http://${window.location.hostname}:3000/api/tags`, { headers: store.getHeaders() })
    if (!checkAuth(response)) return
    if (response.ok) tags.value = await response.json()
  } catch (error) { console.error('Etiketler getirilemedi', error) }
}

const fetchTemplates = async () => {
  try {
    const response = await fetch(`http://${window.location.hostname}:3000/api/templates`, { headers: store.getHeaders() })
    if (!checkAuth(response)) return
    if (response.ok) templates.value = (await response.json()).filter((t: any) => t.status === 'APPROVED')
  } catch (error) { console.error('Şablonlar getirilemedi', error) }
}

const fetchCampaigns = async () => {
  try {
    const response = await fetch(`http://${window.location.hostname}:3000/api/campaigns`, { headers: store.getHeaders() })
    if (!checkAuth(response)) return
    if (response.ok) {
      campaigns.value = await response.json()
    }
  } catch (error) {
    console.error('Kampanyalar getirilemedi', error)
  }
}

const submitCampaign = async () => {
  isSubmitting.value = true
  try {
    const response = await fetch(`http://${window.location.hostname}:3000/api/campaigns', {
      method: 'POST',
      headers: store.getHeaders(),
      body: JSON.stringify({
        name: newCampaign.value.name,
        targetTag: newCampaign.value.targetTag,
        templateId: selectedTemplateId.value || undefined,
        variableValues: variableValues.value,
        messageContent: selectedTemplate.value?.bodyText || ''
      })
    })

    if (!checkAuth(response)) return
    const result = await response.json()
    
    if (response.ok) {
      toggleCreateForm()
      await fetchCampaigns()
    } else {
      alert(`Hata: ${result.error}`)
    }
  } catch (error) {
    console.error('Kampanya oluşturma hatası:', error)
    alert('Sunucuya bağlanılamadı.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchTags()
  fetchTemplates()
  fetchCampaigns()
  pollingInterval = setInterval(fetchCampaigns, 3000)
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})
</script>

<style scoped>
@reference "../style.css";

.wa-input {
  @apply bg-gray-50 dark:bg-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 px-4 py-2 w-full rounded-sm focus:border-gray-800 dark:focus:border-gray-400 outline-none transition-colors;
}
.wa-btn {
  @apply bg-gray-900 dark:bg-wa-primary text-white font-semibold py-2 px-4 rounded-sm hover:bg-black dark:hover:bg-wa-teal transition-colors shadow-sm;
}
.wa-btn-outline {
  @apply border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm bg-white dark:bg-wa-panelDark;
}
</style>
