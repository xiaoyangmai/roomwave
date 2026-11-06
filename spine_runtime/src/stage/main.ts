import { createPinia } from 'pinia'
import { createApp } from 'vue'
import Stage from './stage.vue'

createApp(Stage).use(createPinia()).mount('#app')
