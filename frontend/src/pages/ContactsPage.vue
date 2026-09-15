<template>
  <div class="flex flex-col h-full relative">
    
    <!-- Üst Bar -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Kişilerim</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Rehberindeki numaraları yönet ve yeni VCF dosyası yükle.</p>
      </div>
      <div class="flex space-x-3">
        <input 
          type="file" 
          ref="fileInput" 
          accept=".vcf" 
          class="hidden" 
          @change="handleFileSelect"
        />
        <button @click="triggerFileInput" class="wa-btn-outline flex items-center space-x-2">
          <DocumentPlusIcon class="w-5 h-5" />
          <span>VCF Seç</span>
        </button>
        <button @click="uploadContacts" :disabled="!selectedFile || isUploading" class="wa-btn flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <ArrowUpTrayIcon class="w-5 h-5" />
          <span>{{ isUploading ? 'Yükleniyor...' : 'Yükle' }}</span>
        </button>
      </div>
    </div>

    <div v-if="selectedFile" class="mb-6 p-4 bg-wa-light dark:bg-gray-800 border border-wa-primary/30 rounded-sm flex items-center justify-between">
      <div class="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
        <DocumentIcon class="w-6 h-6 text-wa-primary" />
        <span class="font-medium">{{ selectedFile.name }}</span>
        <span class="text-sm text-gray-500">({{ (selectedFile.size / 1024).toFixed(2) }} KB)</span>
      </div>
      <button @click="clearFile" class="text-red-500 hover:text-red-700 p-1">
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- Tablo Alanı -->
    <div class="bg-white dark:bg-wa-panelDark border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden shadow-sm flex flex-col flex-1">
      <div class="overflow-x-auto flex-1">
        <table class="w-full text-left border-collapse table-fixed">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">
              <th class="px-6 py-4 font-semibold w-1/3">Ad Soyad</th>
              <th class="px-6 py-4 font-semibold w-1/4">Telefon</th>
              <th class="px-6 py-4 font-semibold w-1/4">Etiketler</th>
              <th class="px-6 py-4 font-semibold w-24">Durum</th>
              <th class="px-6 py-4 font-semibold text-right w-28">İşlemler</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
            
            <tr v-if="paginatedContacts.length === 0" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                Kişi bulunamadı.
              </td>
            </tr>

            <tr v-for="contact in paginatedContacts" :key="contact._id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td class="px-6 py-4 text-gray-800 dark:text-gray-200 font-medium truncate" :title="contact.fullName">{{ contact.fullName }}</td>
              <td class="px-6 py-4 text-gray-500 font-mono truncate" :title="contact.phoneNumber">{{ contact.phoneNumber }}</td>
              <td class="px-6 py-4 truncate">
                <span v-for="(tag, index) in contact.tags" :key="index" class="px-2 py-1 mr-1 text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-700 uppercase tracking-wide">
                  {{ tag }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span v-if="contact.isActive" class="px-2 py-1 text-[10px] font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-sm border border-green-200 dark:border-green-800 uppercase tracking-wide">
                  Aktif
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-3">
                <button @click="openEditModal(contact)" class="text-gray-400 hover:text-wa-teal transition-colors outline-none" title="Düzenle">
                  <PencilIcon class="w-5 h-5 inline" />
                </button>
                <button @click="deleteContact(contact._id)" class="text-gray-400 hover:text-red-500 transition-colors outline-none" title="Sil">
                  <TrashIcon class="w-5 h-5 inline" />
                </button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      <!-- Sayfalama (Pagination) -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          Toplam <span class="font-semibold text-gray-800 dark:text-white">{{ contacts.length }}</span> kişiden 
          <span class="font-semibold text-gray-800 dark:text-white">{{ (currentPage - 1) * pageSize + 1 }}</span> - 
          <span class="font-semibold text-gray-800 dark:text-white">{{ Math.min(currentPage * pageSize, contacts.length) }}</span> arası gösteriliyor
        </span>
        <div class="flex space-x-2">
          <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-sm bg-white dark:bg-wa-panelDark text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Önceki
          </button>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-sm bg-white dark:bg-wa-panelDark text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Sonraki
          </button>
        </div>
      </div>
    </div>

    <!-- Düzenleme Modalı -->
    <div v-if="isEditModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-wa-panelDark rounded-sm shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
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
              <input 
                v-model="newTagInput" 
                @keyup.enter="addTag"
                type="text" 
                placeholder="Yeni etiket (Enter'a basın)" 
                class="wa-input text-sm py-1.5 flex-1" 
              />
              <button @click="addTag" type="button" class="wa-btn-outline py-1.5 px-3 text-sm">Ekle</button>
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

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import { 
  ArrowUpTrayIcon, 
  DocumentPlusIcon, 
  DocumentIcon,
  XMarkIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'

const store = useAppStore()
const router = useRouter()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const contacts = ref<any[]>([])

// tablo sayfalama (pagination) değişkenleri
const currentPage = ref(1)
const pageSize = 10

// popup (modal) aç kapa değişkenleri
const isEditModalOpen = ref(false)
const isSaving = ref(false)
const newTagInput = ref('')
const editingContact = ref({
  _id: '',
  fullName: '',
  tags: [] as string[]
})

const checkAuth = (res: Response) => {
  if (res.status === 401) {
    store.logout()
    router.push('/login')
    return false
  }
  return true
}

const totalPages = computed(() => Math.ceil(contacts.value.length / pageSize))

const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return contacts.value.slice(start, end)
})

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
    const response = await fetch(`http://localhost:3000/api/contacts`, {
      headers: store.getHeaders()
    })
    if (!checkAuth(response)) return
    if (response.ok) {
      contacts.value = await response.json()
      // limitleri aşarsak son sayfaya geri zıplıyoruz
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value
      }
    }
  } catch (error) {
    console.error('Sunucuya bağlanılamadı', error)
  }
}

const uploadContacts = async () => {
  if (!selectedFile.value) return
  
  isUploading.value = true
  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const response = await fetch('http://localhost:3000/api/contacts/upload', {
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
      currentPage.value = 1 // toplu işlem olunca ilk sayfaya dönüyoruz ki kafa karışmasın
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

// silme aksiyonunu buradan tetikliyoruz
const deleteContact = async (id: string) => {
  if (!confirm('Bu kişiyi silmek istediğinize emin misiniz?')) return

  try {
    const response = await fetch(`http://localhost:3000/api/contacts/${id}`, {
      method: 'DELETE',
      headers: store.getHeaders()
    })
    
    if (!checkAuth(response)) return
    if (response.ok) {
      await fetchContacts()
    } else {
      alert('Silme işlemi başarısız oldu.')
    }
  } catch (error) {
    console.error('Silme hatası:', error)
  }
}

// kişi düzenleme modalı fonksiyonları
const openEditModal = (contact: any) => {
  editingContact.value = {
    _id: contact._id,
    fullName: contact.fullName,
    tags: [...contact.tags]
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
    const response = await fetch(`http://localhost:3000/api/contacts/${editingContact.value._id}`, {
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