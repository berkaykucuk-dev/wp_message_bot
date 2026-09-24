<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Şablonlarım</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Meta onaylı mesaj şablonlarınızı yönetin ve yeni şablonlar oluşturun.</p>
      </div>
      <div class="flex gap-2">
        <button @click="syncTemplates" :disabled="isSyncing" class="wa-btn-outline flex items-center gap-2 disabled:opacity-50">
          <ArrowPathIcon class="w-5 h-5" :class="{'animate-spin': isSyncing}" />
          <span>{{ isSyncing ? 'Senkronize Ediliyor...' : 'Meta\'dan Senkronize Et' }}</span>
        </button>
        <button @click="showForm = !showForm" class="wa-btn flex items-center gap-2">
          <PlusIcon class="w-5 h-5" v-if="!showForm" />
          <XMarkIcon class="w-5 h-5" v-else />
          <span>{{ showForm ? 'İptal' : 'Yeni Şablon' }}</span>
        </button>
      </div>
    </div>

    <!-- Create Form -->
    <div v-if="showForm" class="bg-white dark:bg-wa-panelDark border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm p-6 space-y-4">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Yeni Şablon Oluştur</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Şablon Adı</label>
          <input v-model="form.name" type="text" class="wa-input" placeholder="örn: siparis_onayi" />
        </div>
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Dil (Language)</label>
          <select v-model="form.language" class="wa-input">
            <option value="tr">Türkçe (tr)</option>
            <option value="en_US">English (en_US)</option>
          </select>
        </div>
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
          <select v-model="form.category" class="wa-input">
            <option value="MARKETING">MARKETING (Pazarlama)</option>
            <option value="UTILITY">UTILITY (İşlem)</option>
            <option value="AUTHENTICATION">AUTHENTICATION (Doğrulama)</option>
          </select>
        </div>
      </div>

      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Mesaj Gövdesi (Body)</label>
        <textarea v-model="form.bodyText" rows="4" class="wa-input" placeholder="{{1}} gibi değişkenler kullanabilirsiniz"></textarea>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Değişkenler ({{1}}, {{2}}...)</label>
        <div class="flex flex-wrap gap-2 mb-2">
          <div v-for="(v, index) in form.variables" :key="index" class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm">
            <span class="text-gray-700 dark:text-gray-300">{{ v }}</span>
            <button @click="removeVariable(index)" class="text-gray-500 hover:text-red-500"><XMarkIcon class="w-4 h-4" /></button>
          </div>
        </div>
        <div class="flex gap-2 max-w-md">
          <input v-model="newVariable" type="text" class="wa-input" placeholder="Değişken adı (örn: isim)" @keyup.enter="addVariable" />
          <button @click="addVariable" class="wa-btn-outline whitespace-nowrap">Ekle</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-800 mt-4">
        <div class="space-y-4">
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Header Tipi</label>
            <select v-model="form.headerType" class="wa-input">
              <option value="NONE">Yok</option>
              <option value="TEXT">Metin</option>
              <option value="IMAGE">Görsel</option>
              <option value="VIDEO">Video</option>
              <option value="DOCUMENT">Doküman</option>
            </select>
          </div>
          <div class="space-y-1" v-if="form.headerType !== 'NONE'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Header İçeriği {{ form.headerType === 'TEXT' ? '(Metin)' : '(URL)' }}
            </label>
            <input v-model="form.headerContent" type="text" class="wa-input" :placeholder="form.headerType === 'TEXT' ? 'Başlık metni' : 'Medya URL'" />
          </div>
        </div>
        <div class="space-y-4">
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Footer (Opsiyonel)</label>
            <input v-model="form.footerText" type="text" class="wa-input" placeholder="Küçük gri alt metin" />
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
        <button @click="showForm = false" class="wa-btn-outline">İptal</button>
        <button @click="createTemplate" class="wa-btn" :disabled="loading">Oluştur</button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && templates.length === 0" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-wa-primary"></div>
    </div>

    <!-- Templates Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="t in templates" :key="t._id" class="bg-white dark:bg-wa-panelDark border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm flex flex-col">
        <!-- Card Header -->
        <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start gap-2">
          <div>
            <h3 class="font-bold text-gray-900 dark:text-white truncate" :title="t.name">{{ t.name }}</h3>
            <div class="flex items-center gap-2 mt-1">
              <span :class="{
                'px-2 py-0.5 text-xs font-medium rounded-full': true,
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': t.category === 'MARKETING',
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': t.category === 'UTILITY',
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': t.category === 'AUTHENTICATION'
              }">{{ t.category }}</span>
              
              <span v-if="t.origin === 'meta'" class="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                <CheckBadgeIcon class="w-4 h-4" /> Meta Onaylı
              </span>
            </div>
          </div>
          <span :class="{
            'px-2 py-1 text-xs font-semibold rounded-sm': true,
            'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400': t.status === 'APPROVED',
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400': t.status === 'PENDING',
            'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400': t.status === 'REJECTED'
          }">{{ t.status === 'APPROVED' ? 'Onaylı' : t.status === 'PENDING' ? 'Bekliyor' : 'Reddedildi' }}</span>
        </div>

        <!-- Card Body (WhatsApp Preview) -->
        <div class="p-4 flex-1 bg-gray-50/50 dark:bg-black/20">
          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 shadow-sm text-sm">
            <div v-if="t.headerType && t.headerType !== 'NONE'" class="font-bold text-gray-900 dark:text-white mb-1">
              {{ t.headerType === 'TEXT' ? t.headerContent : `[${t.headerType}]` }}
            </div>
            <div class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{{ t.bodyText }}</div>
            <div v-if="t.footerText" class="text-xs text-gray-500 mt-2">{{ t.footerText }}</div>
            
            <div v-if="t.buttons && t.buttons.length" class="mt-3 space-y-1">
              <div v-for="(btn, i) in t.buttons" :key="i" class="text-center text-blue-600 dark:text-blue-400 text-xs py-1 border border-blue-200 dark:border-blue-900/50 rounded-sm bg-white/50 dark:bg-black/20">
                {{ btn.text }}
              </div>
            </div>
          </div>
          
          <div v-if="t.variables && t.variables.length" class="mt-4">
            <p class="text-xs text-gray-500 mb-1">Değişkenler:</p>
            <div class="flex flex-wrap gap-1">
              <span v-for="(v, i) in t.variables" :key="i" class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                {{ v }}
              </span>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-wa-panelDark">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-sm">
            {{ t.language || 'TR' }}
          </span>
          <button @click="deleteTemplate(t._id)" class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center gap-1">
            <TrashIcon class="w-4 h-4" /> Sil
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../store';
import { PlusIcon, XMarkIcon, TrashIcon, CheckBadgeIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';

const API_BASE = `http://${window.location.hostname}:3000`;
const store = useAppStore();
const router = useRouter();

const templates = ref<any[]>([]);
const loading = ref(false);
const showForm = ref(false);
const isSyncing = ref(false);

const checkAuth = (res: Response) => {
  if (res.status === 401) {
    store.logout();
    router.push('/login');
    return false;
  }
  return true;
};

const syncTemplates = async () => {
  isSyncing.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/templates/sync`, {
      method: 'POST',
      headers: store.getHeaders()
    });
    if (!checkAuth(res)) return;
    const data = await res.json();
    
    if (res.ok) {
      alert(data.message || 'Şablonlar başarıyla senkronize edildi.');
      await fetchTemplates();
    } else {
      alert(`Hata: ${data.error}`);
    }
  } catch (error) {
    console.error('Senkronizasyon hatası:', error);
    alert('Sunucuya bağlanılamadı.');
  } finally {
    isSyncing.value = false;
  }
};

const form = ref({
  name: '',
  category: 'MARKETING',
  language: 'tr',
  bodyText: '',
  headerType: 'NONE',
  headerContent: '',
  footerText: '',
  variables: [] as string[],
  buttons: [] as any[]
});

const newVariable = ref('');

const addVariable = () => {
  if (newVariable.value.trim()) {
    form.value.variables.push(newVariable.value.trim());
    newVariable.value = '';
  }
};

const removeVariable = (index: number) => {
  form.value.variables.splice(index, 1);
};

const fetchTemplates = async () => {
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/templates`, {
      headers: store.getHeaders()
    });
    if (!checkAuth(res)) return;
    if (res.ok) {
      templates.value = await res.json();
    }
  } catch (error) {
    console.error('Error fetching templates:', error);
  } finally {
    loading.value = false;
  }
};

const createTemplate = async () => {
  if (!form.value.name || !form.value.bodyText) {
    alert('Şablon Adı ve Mesaj Gövdesi zorunludur!');
    return;
  }
  
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/templates`, {
      method: 'POST',
      headers: store.getHeaders(),
      body: JSON.stringify(form.value)
    });
    if (!checkAuth(res)) return;
    
    if (res.ok) {
      showForm.value = false;
      form.value = {
        name: '',
        category: 'MARKETING',
        language: 'tr',
        bodyText: '',
        headerType: 'NONE',
        headerContent: '',
        footerText: '',
        variables: [],
        buttons: []
      };
      await fetchTemplates();
    } else {
      const data = await res.json();
      alert('Hata: ' + (data.error || 'Şablon oluşturulamadı.'));
    }
  } catch (error) {
    console.error('Error creating template:', error);
    alert('Sunucuya bağlanılamadı.');
  } finally {
    loading.value = false;
  }
};

const deleteTemplate = async (id: string) => {
  if (!confirm('Bu şablonu silmek istediğinize emin misiniz?')) return;
  
  try {
    const res = await fetch(`${API_BASE}/api/templates/${id}`, {
      method: 'DELETE',
      headers: store.getHeaders()
    });
    if (!checkAuth(res)) return;
    
    if (res.ok) {
      await fetchTemplates();
    }
  } catch (error) {
    console.error('Error deleting template:', error);
  }
};

onMounted(() => {
  fetchTemplates();
});
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
