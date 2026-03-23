import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import permission from './directives/permission.js'

const app = createApp(App)
app.directive('permission', permission)
app.use(router)
app.mount('#app')
