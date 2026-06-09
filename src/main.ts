import { Buffer } from 'buffer'
if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer
}

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
