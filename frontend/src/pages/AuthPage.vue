<template>
  <div class="min-h-screen flex flex-col items-center justify-center relative">
    
    <!-- Tema Değiştirme Butonu -->
    <button @click="store.toggleTheme" class="absolute top-5 right-5 p-2 rounded bg-white dark:bg-wa-panelDark shadow border border-gray-200 dark:border-gray-800 transition-colors z-100">
      <SunIcon v-if="store.isDarkMode" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
      <MoonIcon v-else class="w-5 h-5 text-gray-600 dark:text-gray-300" />
    </button>

    <!-- Ana Konteyner -->
    <div 
      class="auth-container relative w-full max-w-3xl min-h-[480px] bg-white dark:bg-wa-panelDark rounded shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-600"
      :class="{ 'right-panel-active': isSignUp }"
    >
      
      <!-- KAYIT OL (Sign Up) PANELI -->
      <div class="form-container sign-up-container absolute top-0 left-0 w-1/2 h-full transition-all duration-600 ease-in-out bg-white dark:bg-wa-panelDark">
        <form @submit.prevent="handleRegister" class="flex flex-col items-center justify-center h-full px-10 text-center">
          <h1 class="text-2xl font-bold mb-2">Kayıt Ol</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">WhatsApp SaaS Platformuna Katıl</p>
          <input v-model="registerForm.name" type="text" placeholder="İsim Soyisim" class="wa-input" required />
          <input v-model="registerForm.email" type="email" placeholder="E-posta" class="wa-input" required />
          <input v-model="registerForm.password" type="password" placeholder="Şifre" class="wa-input" required />
          <p v-if="registerError" class="text-red-500 text-sm mt-2">{{ registerError }}</p>
          <button type="submit" class="wa-btn mt-6" :disabled="isLoading">{{ isLoading ? 'Bekleyin...' : 'Kayıt Ol' }}</button>
        </form>
      </div>

      <!-- GİRİŞ YAP (Sign In) PANELI -->
      <div class="form-container sign-in-container absolute top-0 left-0 w-1/2 h-full transition-all duration-600 ease-in-out bg-white dark:bg-wa-panelDark">
        <form @submit.prevent="handleLogin" class="flex flex-col items-center justify-center h-full px-10 text-center">
          <h1 class="text-2xl font-bold mb-2">Giriş Yap</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Hesabına erişmek için giriş yap</p>
          <input v-model="loginForm.email" type="email" placeholder="E-posta" class="wa-input" required />
          <input v-model="loginForm.password" type="password" placeholder="Şifre" class="wa-input" required />
          <p v-if="loginError" class="text-red-500 text-sm mt-2">{{ loginError }}</p>
          <a href="#" class="text-sm text-gray-500 dark:text-gray-400 mt-3 mb-4 hover:text-wa-teal transition-colors">Şifreni mi unuttun?</a>
          <button type="submit" class="wa-btn" :disabled="isLoading">{{ isLoading ? 'Bekleyin...' : 'Giriş Yap' }}</button>
        </form>
      </div>

      <!-- HAREKETLİ OVERLAY (Yeşil Geçiş Alanı) -->
      <div class="overlay-container absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600">
        <div class="overlay bg-gradient-to-r from-wa-teal to-wa-primary relative -left-full h-full w-[200%] transform transition-transform duration-600 text-white">
          
          <!-- Sol Taraf Yazıları (Zaten hesabın varsa) -->
          <div class="overlay-panel overlay-left absolute flex items-center justify-center w-1/2 h-full top-0 transition-transform duration-600 transform -translate-x-[10%]">
            <div class="flex flex-col items-center text-center max-w-[260px] mx-auto">
              <h1 class="text-2xl font-bold mb-2">Tekrar Hoş Geldin</h1>
              <p class="text-sm mb-8">Müşterilerinle iletişime kaldığın yerden devam etmek için giriş yap.</p>
              <button type="button" @click="isSignUp = false" class="wa-btn-ghost">Giriş Yap</button>
            </div>
          </div>

          <!-- Sağ Taraf Yazıları (Yeni hesap oluştur) -->
          <div class="overlay-panel overlay-right absolute flex items-center justify-center w-1/2 h-full right-0 top-0 transition-transform duration-600 transform translate-x-0">
            <div class="flex flex-col items-center text-center max-w-[260px] mx-auto">
              <h1 class="text-2xl font-bold mb-2">Sisteme Katıl</h1>
              <p class="text-sm mb-8">Numaralarını şifreleyerek güvende tut. Hemen bir hesap oluştur.</p>
              <button type="button" @click="isSignUp = true" class="wa-btn-ghost">Kayıt Ol</button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

const store = useAppStore()
const router = useRouter()
const isSignUp = ref(false)

const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ name: '', email: '', password: '' })
const isLoading = ref(false)
const loginError = ref('')
const registerError = ref('')

const handleLogin = async () => {
  loginError.value = ''
  isLoading.value = true
  try {
    const res = await fetch(`http://\${window.location.hostname}:3000/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm.value)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Giriş başarısız')
    
    store.login(data.token, data.user)
    router.push('/')
  } catch (err: any) {
    loginError.value = err.message
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  registerError.value = ''
  isLoading.value = true
  try {
    const res = await fetch(`http://\${window.location.hostname}:3000/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerForm.value)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Kayıt başarısız')
    
    // hesabı oluşturunca login sayfasına atıp hemen içeri alıyoruz
    isSignUp.value = false
    loginForm.value.email = registerForm.value.email
    loginForm.value.password = registerForm.value.password
  } catch (err: any) {
    registerError.value = err.message
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@reference "../style.css";

.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
}

.sign-in-container {
  left: 0;
  width: 50%;
  z-index: 2;
}

.sign-up-container {
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
}

.auth-container.right-panel-active .sign-in-container {
  transform: translateX(100%);
}

.auth-container.right-panel-active .sign-up-container {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
  animation: show 0.6s;
}

@keyframes show {
  0%, 49.99% { opacity: 0; z-index: 1; }
  50%, 100% { opacity: 1; z-index: 5; }
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
}

.auth-container.right-panel-active .overlay-container {
  transform: translateX(-100%);
}

.overlay {
  transition: transform 0.6s ease-in-out;
}

.auth-container.right-panel-active .overlay {
  transform: translateX(50%);
}

.overlay-panel {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  transition: transform 0.6s ease-in-out;
}

.overlay-left {
  transform: translateX(-10%);
}

.auth-container.right-panel-active .overlay-left {
  transform: translateX(0);
}

.overlay-right {
  right: 0;
  transform: translateX(0);
}

.auth-container.right-panel-active .overlay-right {
  transform: translateX(10%);
}

/* özel tailwind css ayarlarımız */
.wa-input {
  @apply bg-gray-50 dark:bg-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 px-4 py-2 my-2 w-full rounded-sm focus:border-gray-800 dark:focus:border-gray-400 outline-none transition-colors;
}
.wa-btn {
  @apply rounded-sm bg-wa-primary text-white font-bold py-3 px-10 uppercase tracking-wider hover:bg-wa-teal transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed;
}
.wa-btn-ghost {
  @apply rounded-sm border border-white text-white bg-transparent font-bold py-3 px-10 uppercase tracking-wider hover:bg-white hover:text-wa-teal transition-colors;
}
</style>