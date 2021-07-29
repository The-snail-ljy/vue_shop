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
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
Vue.prototype.$http = axios

axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  //console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
}) 

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
