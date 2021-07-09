import Vue from 'vue'
import App from './App.vue'
import router from './router'
//导入全局样式
import './assets/css/global.css'
//导入element插件
import './plugins/element.js'
//导入element样式
import 'element-ui/lib/theme-chalk/index.css'
import './assets/fonts/iconfont.css'

import axios from 'axios'
Vue.prototype.$http = axios

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
