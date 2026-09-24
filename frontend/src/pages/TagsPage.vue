<template>
  <div class="flex flex-col h-full relative space-y-6 animate-fade-in">
    
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Etiketlerim</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Kişilerinizi sınıflandırmak için yeni etiketler oluşturun.</p>
      </div>
      <button @click="openCreateModal" class="wa-btn flex items-center gap-2">
        <PlusIcon class="w-4 h-4" />
        <span>Yeni Etiket</span>
      </button>
    </div>

    <!-- Tablo -->
    <div class="bg-white dark:bg-wa-panelDark border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm flex-1 flex flex-col overflow-hidden">
      <div class="overflow-x-auto flex-1">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
              <th class="px-6 py-4 font-semibold">Etiket Adı</th>
              <th class="px-6 py-4 font-semibold">Oluşturulma Tarihi</th>
              <th class="px-6 py-4 font-semibold text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            
            <tr v-if="tags.length === 0" class="hover:bg-transparent">
              <td colspan="3" class="px-6 py-16 text-center">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <div class="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                    <TagIcon class="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Henüz Etiket Yok</h3>
                  <p class="text-gray-500 dark:text-gray-400 max-w-sm text-center">Sistemde kayıtlı bir etiketiniz bulunmuyor.</p>
                </div>
              </td>
            </tr>

            <tr v-for="tag in tags" :key="tag._id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 text-xs font-semibold rounded-sm border" :style="{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '50' }">
                  #{{ tag.name }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-500 dark:text-gray-400">
                {{ formatDate(tag.createdAt) }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openEditModal(tag)" class="p-1.5 text-gray-400 hover:text-wa-primary hover:bg-blue-50 dark:hover:bg-gray-800 rounded transition-colors" title="Düzenle">
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button @click="deleteTag(tag._id)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="Sil">
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>

    <!-- Etiket Oluştur/Düzenle Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-wa-panelDark rounded-md shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">{{ isEditing ? 'Etiketi Düzenle' : 'Yeni Etiket' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Etiket Adı</label>
            <input v-model="currentTag.name" type="text" placeholder="Örn: vip, potansiyel..." class="wa-input" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Etiket Rengi</label>
            <input v-model="currentTag.color" type="color" class="w-full h-10 border border-gray-300 dark:border-gray-700 rounded-sm cursor-pointer" />
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button @click="closeModal" class="wa-btn-outline">İptal</button>
          <button @click="saveTag" :disabled="isSaving || !currentTag.name" class="wa-btn flex items-center space-x-2">
            <span>{{ isSaving ? 'Kaydediliyor...' : 'Kaydet' }}</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import { PlusIcon, TagIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const store = useAppStore()
const router = useRouter()

const tags = ref<any[]>([])
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const currentTag = ref({ _id: '', name: '', color: '#3B82F6' })

const checkAuth = (res: Response) => {
  if (res.status === 401) {
    store.logout()
    router.push('/login')
    return false
  }
  return true
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const fetchTags = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/tags`, {
      headers: store.getHeaders()
    })
    if (!checkAuth(response)) return
    if (response.ok) {
      tags.value = await response.json()
    }
  } catch (error) {
    console.error('Etiketleri çekme hatası:', error)
  }
}

const openCreateModal = () => {
  isEditing.value = false
  currentTag.value = { _id: '', name: '', color: '#3B82F6' }
  isModalOpen.value = true
}

const openEditModal = (tag: any) => {
  isEditing.value = true
  currentTag.value = { _id: tag._id, name: tag.name, color: tag.color || '#3B82F6' }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveTag = async () => {
  if (!currentTag.value.name.trim()) return
  
  isSaving.value = true
  try {
    const url = isEditing.value 
      ? `http://localhost:3000/api/tags/${currentTag.value._id}`
      : `http://localhost:3000/api/tags`
      
    const method = isEditing.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: store.getHeaders(),
      body: JSON.stringify({
        name: currentTag.value.name.trim(),
        color: currentTag.value.color
      })
    })

    if (!checkAuth(response)) return
    
    if (response.ok) {
      await fetchTags()
      closeModal()
    } else {
      const result = await response.json()
      alert(result.error || 'İşlem başarısız.')
    }
  } catch (error) {
    console.error('Kaydetme hatası:', error)
  } finally {
    isSaving.value = false
  }
}

const deleteTag = async (id: string) => {
  if (!confirm('Bu etiketi silmek istediğinize emin misiniz? Etiket, atanmış kişilerden de temizlenecektir.')) return

  try {
    const response = await fetch(`http://localhost:3000/api/tags/${id}`, {
      method: 'DELETE',
      headers: store.getHeaders()
    })
    
    if (!checkAuth(response)) return
    
    if (response.ok) {
      await fetchTags()
    } else {
      alert('Silme işlemi başarısız.')
    }
  } catch (error) {
    console.error('Silme hatası:', error)
  }
}

onMounted(() => {
  fetchTags()
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

