<template>
  <div class="flex flex-col h-full relative space-y-6 animate-fade-in">
    
    <!-- Üst Bar: Başlık ve Import/Export -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Kişilerim</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Rehberinizi yönetin, gruplayın ve toplu mesajlar gönderin.</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- VCF Input (Gizli) -->
        <input type="file" ref="fileInput" accept=".vcf,.csv" class="hidden" @change="handleFileSelect" />
        
        <button @click="triggerFileInput" class="wa-btn-outline flex items-center gap-2">
          <ArrowDownTrayIcon class="w-4 h-4" />
          <span>İçe Aktar</span>
        </button>
        <button class="wa-btn-outline flex items-center gap-2" title="Yakında!">
          <ArrowUpTrayIcon class="w-4 h-4" />
          <span>Dışa Aktar</span>
        </button>
        <button v-if="selectedFile" @click="uploadContacts" :disabled="isUploading" class="wa-btn flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <CloudArrowUpIcon class="w-4 h-4" />
          <span>{{ isUploading ? 'Yükleniyor...' : 'Kayıtları Kaydet' }}</span>
        </button>
      </div>
    </div>

    <!-- Seçili Dosya Uyarısı -->
    <div v-if="selectedFile" class="p-4 bg-wa-light dark:bg-gray-800 border border-wa-primary/30 rounded-sm flex items-center justify-between shadow-sm">
      <div class="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
        <DocumentIcon class="w-6 h-6 text-wa-primary" />
        <span class="font-medium">{{ selectedFile.name }}</span>
        <span class="text-sm text-gray-500">({{ (selectedFile.size / 1024).toFixed(2) }} KB)</span>
      </div>
      <button @click="clearFile" class="text-red-500 hover:text-red-700 p-1 bg-red-50 dark:bg-red-900/30 rounded">
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- Arama, Filtreleme ve Toplu İşlem Barı -->
    <div class="bg-white dark:bg-wa-panelDark border border-gray-200 dark:border-gray-800 rounded-sm p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-1 items-center gap-4">
        <!-- Search -->
        <div class="relative w-full max-w-md">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
          </div>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="İsim veya numara ile ara..." 
            class="bg-gray-50 dark:bg-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 py-2 pr-4 pl-10 w-full rounded-sm focus:border-gray-800 dark:focus:border-gray-400 outline-none transition-colors"
          />
        </div>
        <!-- Tag Filter -->
        <div class="relative min-w-[150px]">
          <select v-model="selectedTagFilter" class="wa-input appearance-none">
            <option value="">Tüm Etiketler</option>
            <option v-for="tag in allAvailableTags" :key="tag" :value="tag">{{ tag }}</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDownIcon class="h-4 w-4" />
          </div>
        </div>
      </div>

      <!-- Toplu İşlemler -->
      <div v-if="selectedContacts.length > 0" class="flex items-center gap-3 animate-fade-in">
        <span class="text-sm font-semibold text-wa-primary">{{ selectedContacts.length }} kişi seçildi</span>
        <button @click="openBulkTagModal" class="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-sm transition-colors text-sm font-medium">
          <TagIcon class="w-4 h-4" /> Toplu Etiketle
        </button>
        <button @click="bulkDeleteContacts" class="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-sm transition-colors text-sm font-medium">
          <TrashIcon class="w-4 h-4" /> Seçilenleri Sil
        </button>
      </div>
    </div>

    <!-- Tablo -->
    <div class="bg-white dark:bg-wa-panelDark border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm flex-1 flex flex-col overflow-hidden">
      <div class="overflow-x-auto flex-1">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
              <th class="px-6 py-4 w-10">
                <input type="checkbox" :checked="isAllSelected" @change="toggleAll" class="modern-checkbox" />
              </th>
              <th class="px-6 py-4 font-semibold">Kişi Adı</th>
              <th class="px-6 py-4 font-semibold">Telefon</th>
              <th class="px-6 py-4 font-semibold">Etiketler</th>
              <th class="px-6 py-4 font-semibold text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            
            <tr v-if="filteredContacts.length === 0" class="hover:bg-transparent">
              <td colspan="5" class="px-6 py-16 text-center">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <div class="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                    <UsersIcon class="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Kimse Yok Mu?</h3>
                  <p class="text-gray-500 dark:text-gray-400 max-w-sm text-center">Şu anda eşleşen bir kayıt bulunmuyor. Rehberinize yeni kişiler ekleyerek veya filtreleri temizleyerek başlayın.</p>
                  <button v-if="searchQuery || selectedTagFilter" @click="clearFilters" class="mt-2 text-wa-primary font-medium hover:underline">Filtreleri Temizle</button>
                </div>
              </td>
            </tr>

            <tr v-for="contact in paginatedContacts" :key="contact._id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
              <td class="px-6 py-4">
                <input type="checkbox" :value="contact._id" v-model="selectedContacts" class="modern-checkbox" />
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div :class="`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white ${getAvatarColor(contact.fullName)}`">
                    {{ getInitials(contact.fullName) }}
                  </div>
                  <span class="font-medium text-gray-900 dark:text-white">{{ contact.fullName || 'İsimsiz Kişi' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-sm">{{ contact.phoneNumber }}</td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="tag in contact.tags" :key="tag" class="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 rounded-sm">
                    #{{ tag }}
                  </span>
                  <span v-if="!contact.tags || contact.tags.length === 0" class="text-gray-400 italic text-xs">Etiket Yok</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openEditModal(contact)" class="p-1.5 text-gray-400 hover:text-wa-primary hover:bg-blue-50 dark:hover:bg-gray-800 rounded transition-colors" title="Düzenle">
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button @click="deleteContact(contact._id)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="Sil">
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      <!-- Sayfalama (Pagination) -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          Toplam <span class="font-semibold text-gray-900 dark:text-white">{{ filteredContacts.length }}</span> kişiden <span class="font-semibold text-gray-900 dark:text-white">{{ ((currentPage - 1) * pageSize) + 1 }}</span> - <span class="font-semibold text-gray-900 dark:text-white">{{ Math.min(currentPage * pageSize, filteredContacts.length) }}</span> arası gösteriliyor.
        </span>
        <div class="flex space-x-2">
          <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-wa-panelDark hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Önceki
          </button>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-wa-panelDark hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Sonraki
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal (Mevcut yapı korunarak hafif stilize edildi) -->
    <div v-if="isEditModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-wa-panelDark rounded-md shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">Kişiyi Düzenle</h3>
          <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Ad Soyad</label>
            <input v-model="editingContact.fullName" type="text" class="wa-input" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Etiketler</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span v-for="(tag, index) in editingContact.tags" :key="index" class="flex items-center px-2 py-1 text-xs font-medium bg-wa-teal/10 text-wa-teal rounded-sm border border-wa-teal/30">
                {{ tag }}
                <button @click="removeTag(index)" class="ml-1 hover:text-red-500 focus:outline-none">
                  <XMarkIcon class="w-3 h-3" />
                </button>
              </span>
            </div>
            <div class="flex space-x-2">
              <select v-model="newTagInput" @change="addTag" class="wa-input text-sm py-1.5 flex-1">
                <option value="" disabled>Sistemden etiket seçin...</option>
                <option v-for="tag in dbTags" :key="tag._id" :value="tag.name">{{ tag.name }}</option>
              </select>
              <button @click="addTag" type="button" :disabled="!newTagInput" class="wa-btn-outline py-1.5 px-3 text-sm">Ekle</button>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button @click="closeEditModal" class="wa-btn-outline">İptal</button>
          <button @click="saveContact" :disabled="isSaving" class="wa-btn flex items-center space-x-2">
            <span>{{ isSaving ? 'Kaydediliyor...' : 'Kaydet' }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Bulk Tag Modal -->
    <div v-if="isBulkTagModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-wa-panelDark rounded-md shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">Toplu Etiketle</h3>
          <button @click="isBulkTagModalOpen = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Mevcut Etiketlerden Seçin</label>
            <select v-model="bulkTagInput" class="wa-input">
              <option value="" disabled>Etiket seçin...</option>
              <option v-for="tag in dbTags" :key="tag._id" :value="tag.name">{{ tag.name }}</option>
            </select>
            <p class="text-xs text-gray-500 mt-2">Bu etiket seçili {{ selectedContacts.length }} kişiye eklenecek.</p>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button @click="isBulkTagModalOpen = false" class="wa-btn-outline">İptal</button>
          <button @click="applyBulkTag" :disabled="!bulkTagInput.trim()" class="wa-btn flex items-center space-x-2">
            <span>Uygula</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import { 
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
  TrashIcon,
  PencilIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  TagIcon
} from '@heroicons/vue/24/outline'

const store = useAppStore()
const router = useRouter()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const contacts = ref<any[]>([])
const dbTags = ref<any[]>([])

// Arama ve Filtreleme
const searchQuery = ref('')
const selectedTagFilter = ref('')

// Toplu İşlemler
const selectedContacts = ref<string[]>([])

// Sayfalama
const currentPage = ref(1)
const pageSize = 10

// Modal Durumları
const isEditModalOpen = ref(false)
const isBulkTagModalOpen = ref(false)
const bulkTagInput = ref('')
const isSaving = ref(false)
const newTagInput = ref('')
const editingContact = ref({
  _id: '',
  fullName: '',
  tags: [] as string[]
})

// Avatar Helper
const getInitials = (name: string) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return parts[0].substring(0, 2).toUpperCase()
}

const getAvatarColor = (name: string) => {
  if (!name) return 'bg-gray-400'
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 
    'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
    'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500'
  ]
  const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[charCodeSum % colors.length]
}

const checkAuth = (res: Response) => {
  if (res.status === 401) {
    store.logout()
    router.push('/login')
    return false
  }
  return true
}

// Tüm Benzersiz Etiketler (Filtre dropdown'u için)
const allAvailableTags = computed(() => {
  const tagsSet = new Set<string>()
  contacts.value.forEach(c => {
    if (c.tags && Array.isArray(c.tags)) {
      c.tags.forEach((t: string) => tagsSet.add(t))
    }
  })
  return Array.from(tagsSet).sort()
})

const clearFilters = () => {
  searchQuery.value = ''
  selectedTagFilter.value = ''
}

// Filtrelenmiş Kişiler
const filteredContacts = computed(() => {
  return contacts.value.filter(c => {
    const matchesSearch = c.fullName?.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          c.phoneNumber?.includes(searchQuery.value)
    const matchesTag = selectedTagFilter.value ? c.tags?.includes(selectedTagFilter.value) : true
    return matchesSearch && matchesTag
  })
})

const totalPages = computed(() => Math.ceil(filteredContacts.value.length / pageSize))

// Sayfalanmış Kişiler
const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredContacts.value.slice(start, end)
})

// Toplu Seçim Checkbox Kontrolleri
const isAllSelected = computed(() => {
  return paginatedContacts.value.length > 0 && 
         paginatedContacts.value.every(c => selectedContacts.value.includes(c._id))
})

const toggleAll = () => {
  if (isAllSelected.value) {
    // Sadece şu anki sayfadakileri seçimden çıkar
    const pageIds = paginatedContacts.value.map(c => c._id)
    selectedContacts.value = selectedContacts.value.filter(id => !pageIds.includes(id))
  } else {
    // Sadece şu anki sayfadakileri ekle
    const newIds = paginatedContacts.value.map(c => c._id).filter(id => !selectedContacts.value.includes(id))
    selectedContacts.value.push(...newIds)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const fetchContacts = async () => {
  try {
    const response = await fetch(`http://\${window.location.hostname}:3000/api/contacts`, {
      headers: store.getHeaders()
    })
    if (!checkAuth(response)) return
    if (response.ok) {
      contacts.value = await response.json()
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value
      }
    }
  } catch (error) {
    console.error('Sunucuya bağlanılamadı', error)
  }
}

const fetchDbTags = async () => {
  try {
    const response = await fetch(`http://\${window.location.hostname}:3000/api/tags`, {
      headers: store.getHeaders()
    })
    if (!checkAuth(response)) return
    if (response.ok) {
      dbTags.value = await response.json()
    }
  } catch (error) {
    console.error('Etiketler çekilemedi', error)
  }
}

const uploadContacts = async () => {
  if (!selectedFile.value) return
  
  isUploading.value = true
  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const response = await fetch(`http://\${window.location.hostname}:3000/api/contacts/upload`, {
      method: 'POST',
      headers: {
        ...(store.token ? { 'Authorization': 'Bearer ' + store.token } : {})
      },
      body: formData
    })

    if (!checkAuth(response)) return
    const result = await response.json()
    
    if (response.ok) {
      alert(`Başarılı: ${result.summary}`)
      await fetchContacts() 
      currentPage.value = 1
    } else {
      alert(`Hata: ${result.error}`)
    }
  } catch (error) {
    console.error('Yükleme hatası:', error)
  } finally {
    clearFile()
    isUploading.value = false
  }
}

const deleteContact = async (id: string) => {
  if (!confirm('Bu kişiyi silmek istediğinize emin misiniz?')) return

  try {
    const response = await fetch(`http://\${window.location.hostname}:3000/api/contacts/${id}`, {
      method: 'DELETE',
      headers: store.getHeaders()
    })
    
    if (!checkAuth(response)) return
    if (response.ok) {
      // Seçili ise diziden çıkar
      selectedContacts.value = selectedContacts.value.filter(sId => sId !== id)
      await fetchContacts()
    } else {
      alert('Silme işlemi başarısız oldu.')
    }
  } catch (error) {
    console.error('Silme hatası:', error)
  }
}

// Backend toplu silme desteklemiyor olabilir, bu yüzden şimdilik for döngüsüyle sileceğiz
const bulkDeleteContacts = async () => {
  if (!confirm(`Seçili ${selectedContacts.value.length} kişiyi silmek istediğinize emin misiniz?`)) return
  
  let successCount = 0
  for (const id of selectedContacts.value) {
    try {
      const response = await fetch(`http://\${window.location.hostname}:3000/api/contacts/${id}`, {
        method: 'DELETE',
        headers: store.getHeaders()
      })
      if (response.ok) successCount++
    } catch (e) {
      console.error(e)
    }
  }
  
  alert(`${successCount} kişi başarıyla silindi.`)
  selectedContacts.value = []
  await fetchContacts()
}

const openBulkTagModal = () => {
  bulkTagInput.value = ''
  isBulkTagModalOpen.value = true
}

const applyBulkTag = async () => {
  const tag = bulkTagInput.value.trim()
  if (!tag) return
  
  try {
    const response = await fetch(`http://\${window.location.hostname}:3000/api/contacts/bulk-tag`, {
      method: 'POST',
      headers: store.getHeaders(),
      body: JSON.stringify({
        contactIds: selectedContacts.value,
        tag: tag
      })
    })

    if (!checkAuth(response)) return
    
    if (response.ok) {
      isBulkTagModalOpen.value = false
      selectedContacts.value = []
      await fetchContacts()
    } else {
      alert('Toplu etiketleme başarısız oldu.')
    }
  } catch (error) {
    console.error('Toplu etiketleme hatası:', error)
  }
}

const openEditModal = (contact: any) => {
  editingContact.value = {
    _id: contact._id,
    fullName: contact.fullName,
    tags: contact.tags ? [...contact.tags] : []
  }
  newTagInput.value = ''
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
}

const addTag = () => {
  const tag = newTagInput.value.trim()
  if (tag && !editingContact.value.tags.includes(tag)) {
    editingContact.value.tags.push(tag)
  }
  newTagInput.value = ''
}

const removeTag = (index: number) => {
  editingContact.value.tags.splice(index, 1)
}

const saveContact = async () => {
  isSaving.value = true
  try {
    const response = await fetch(`http://\${window.location.hostname}:3000/api/contacts/${editingContact.value._id}`, {
      method: 'PUT',
      headers: store.getHeaders(),
      body: JSON.stringify({
        fullName: editingContact.value.fullName,
        tags: editingContact.value.tags
      })
    })

    if (!checkAuth(response)) return
    if (response.ok) {
      await fetchContacts()
      closeEditModal()
    } else {
      alert('Güncelleme işlemi başarısız oldu.')
    }
  } catch (error) {
    console.error('Güncelleme hatası:', error)
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchContacts()
  fetchDbTags()
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
.modern-checkbox {
  @apply appearance-none w-5 h-5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded checked:bg-wa-teal checked:border-wa-teal focus:ring-2 focus:ring-wa-teal focus:ring-offset-1 transition-all cursor-pointer;
}
.modern-checkbox:checked {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
}
</style>