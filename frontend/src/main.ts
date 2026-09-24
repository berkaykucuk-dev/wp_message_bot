import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router' // rotalarımızı projemize dahil ediyoruz
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router) // vue.js'e rotaları tanıttık
app.mount('#app')