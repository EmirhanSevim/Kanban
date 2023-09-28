// // import './assets/main.css'

// import { createApp } from 'vue'
// import App from './App.vue'
// import {appAxios} from "./utils/appAxios" 

// createApp(App).mount('#app')
// const app=createApp(App)
// app.config.globalProperties.$appAxios=appAxios

// app.provide("appAxios",appAxios);
//----- Cli Default --------------------------
import { createApp } from 'vue'

import App from './App.vue' 
import {appAxios} from "./utils/appAxios" 

const app=createApp(App)

app.config.globalProperties.$appAxios=appAxios

app.provide("appAxios",appAxios);

app.mount('#app')
 