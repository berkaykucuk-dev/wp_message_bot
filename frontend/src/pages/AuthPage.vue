<template>
  <div class="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center relative px-4 py-8">
    
    <!-- Tema Butonu -->
    <button @click="store.toggleTheme" class="absolute top-4 right-4 p-2 bg-white dark:bg-wa-panelDark shadow border border-gray-200 dark:border-gray-800 transition-colors z-10">
      <SunIcon v-if="store.isDarkMode" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
      <MoonIcon v-else class="w-5 h-5 text-gray-600 dark:text-gray-300" />
    </button>

    <!-- Masaustu: yan yana kaydirmali panel -->
    <div 
      class="auth-container relative w-full max-w-3xl min-h-[480px] bg-white dark:bg-wa-panelDark shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-600 hidden md:block"
      :class="{ 'right-panel-active': isSignUp }"
    >
      
      <!-- KAYIT OL -->
      <div class="form-container sign-up-container absolute top-0 left-0 w-1/2 h-full transition-all duration-600 ease-in-out bg-white dark:bg-wa-panelDark">
        <form @submit.prevent="handleRegister" class="flex flex-col items-center justify-center h-full px-10 text-center">
          <h1 class="text-2xl font-bold mb-2">Kayit Ol</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">WhatsApp SaaS Platformuna Katil</p>
          <input v-model="registerForm.name" type="text" placeholder="Isim Soyisim" class="wa-input" required />
          <input v-model="registerForm.email" type="email" placeholder="E-posta" class="wa-input" required />
          <input v-model="registerForm.password" type="password" placeholder="Sifre" class="wa-input" required />
          <p v-if="registerError" class="text-red-500 text-sm mt-2">{{ registerError }}</p>
          <button type="submit" class="wa-btn mt-6" :disabled="isLoading">{{ isLoading ? 'Bekleyin...' : 'Kayit Ol' }}</button>
        </form>
      </div>

      <!-- GIRIS YAP -->
      <div class="form-container sign-in-container absolute top-0 left-0 w-1/2 h-full transition-all duration-600 ease-in-out bg-white dark:bg-wa-panelDark">
        <form @submit.prevent="handleLogin" class="flex flex-col items-center justify-center h-full px-10 text-center">
          <h1 class="text-2xl font-bold mb-2">Giris Yap</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Hesabina erismek icin giris yap</p>
          <input v-model="loginForm.email" type="email" placeholder="E-posta" class="wa-input" required />
          <input v-model="loginForm.password" type="password" placeholder="Sifre" class="wa-input" required />
          <p v-if="loginError" class="text-red-500 text-sm mt-2">{{ loginError }}</p>
          <a href="#" class="text-sm text-gray-500 dark:text-gray-400 mt-3 mb-4 hover:text-wa-teal transition-colors">Sifreni mi unuttun?</a>
          <button type="submit" class="wa-btn" :disabled="isLoading">{{ isLoading ? 'Bekleyin...' : 'Giris Yap' }}</button>
        </form>
      </div>

      <!-- OVERLAY -->
      <div class="overlay-container absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600">
        <div class="overlay bg-gradient-to-r from-wa-teal to-wa-primary relative -left-full h-full w-[200%] transform transition-transform duration-600 text-white">
          <div class="overlay-panel overlay-left absolute flex items-center justify-center w-1/2 h-full top-0 transition-transform duration-600 transform -translate-x-[10%]">
            <div class="flex flex-col items-center text-center max-w-[260px] mx-auto">
              <h1 class="text-2xl font-bold mb-2">Tekrar Hos Geldin</h1>
              <p class="text-sm mb-8">Musterilerinle iletisime kaldigin yerden devam etmek icin giris yap.</p>
              <button type="button" @click="isSignUp = false" class="wa-btn-ghost">Giris Yap</button>
            </div>
          </div>
          <div class="overlay-panel overlay-right absolute flex items-center justify-center w-1/2 h-full right-0 top-0 transition-transform duration-600 transform translate-x-0">
            <div class="flex flex-col items-center text-center max-w-[260px] mx-auto">
              <h1 class="text-2xl font-bold mb-2">Sisteme Katil</h1>
              <p class="text-sm mb-8">Numaralarini sifreleyerek guvende tut. Hemen bir hesap olustur.</p>
              <button type="button" @click="isSignUp = true" class="wa-btn-ghost">Kayit Ol</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobil: basit dikey form -->
    <div class="w-full max-w-sm md:hidden">
      <div class="bg-white dark:bg-wa-panelDark shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <!-- Ust renkli alan -->
        <div class="bg-gradient-to-r from-wa-teal to-wa-primary px-6 py-8 text-center text-white">
          <h1 class="text-2xl font-bold mb-1">SaasPanel</h1>
          <p class="text-sm opacity-90">{{ mobileIsSignUp ? 'Yeni hesap olustur' : 'Hesabina giris yap' }}</p>
        </div>

        <!-- Giris Formu (Mobil) -->
        <form v-if="!mobileIsSignUp" @submit.prevent="handleLogin" class="p-6 space-y-3">
          <input v-model="loginForm.email" type="email" placeholder="E-posta" class="wa-input" required />
          <input v-model="loginForm.password" type="password" placeholder="Sifre" class="wa-input" required />
          <p v-if="loginError" class="text-red-500 text-sm">{{ loginError }}</p>
          <button type="submit" class="wa-btn w-full" :disabled="isLoading">{{ isLoading ? 'Bekleyin...' : 'Giris Yap' }}</button>
          <p class="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
            Hesabin yok mu? 
            <button type="button" @click="mobileIsSignUp = true" class="text-wa-teal dark:text-wa-primary font-semibold">Kayit Ol</button>
          </p>
        </form>

        <!-- Kayit Formu (Mobil) -->
        <form v-else @submit.prevent="handleRegister" class="p-6 space-y-3">
          <input v-model="registerForm.name" type="text" placeholder="Isim Soyisim" class="wa-input" required />
          <input v-model="registerForm.email" type="email" placeholder="E-posta" class="wa-input" required />
          <input v-model="registerForm.password" type="password" placeholder="Sifre" class="wa-input" required />
          <p v-if="registerError" class="text-red-500 text-sm">{{ registerError }}</p>
          <button type="submit" class="wa-btn w-full" :disabled="isLoading">{{ isLoading ? 'Bekleyin...' : 'Kayit Ol' }}</button>
          <p class="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
            Zaten hesabin var mi? 
            <button type="button" @click="mobileIsSignUp = false" class="text-wa-teal dark:text-wa-primary font-semibold">Giris Yap</button>
          </p>
        </form>
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
const mobileIsSignUp = ref(false)

const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ name: '', email: '', password: '' })
const isLoading = ref(false)
const loginError = ref('')
const registerError = ref('')

const handleLogin = async () => {
  loginError.value = ''
  isLoading.value = true
  try {
    const res = await fetch(`http://${window.location.hostname}:3000/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm.value)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Giris basarisiz')
    
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
    const res = await fetch(`http://${window.location.hostname}:3000/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerForm.value)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Kayit basarisiz')
    
    isSignUp.value = false
    mobileIsSignUp.value = false
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

.wa-input {
  @apply bg-gray-50 dark:bg-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 px-4 py-2 my-2 w-full focus:border-gray-800 dark:focus:border-gray-400 outline-none transition-colors;
}
.wa-btn {
  @apply bg-wa-primary text-white font-bold py-3 px-10 uppercase tracking-wider hover:bg-wa-teal transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed;
}
.wa-btn-ghost {
  @apply border border-white text-white bg-transparent font-bold py-3 px-10 uppercase tracking-wider hover:bg-white hover:text-wa-teal transition-colors;
}
</style>