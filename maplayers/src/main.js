// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'jquery'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/index.css'
import axios from 'axios'

Vue.use(VXETable)

// 给 vue 实例挂载全局窗口对象
Vue.prototype.$XModal = VXETable.modal

/**
 * @author zhangwenchao  2020.4.26
 * 设置反向带你，全段请求默认发送到 baseURL
 */
// var axios = require('axios')
// axios.defaults.baseURL = 'http://localhost:8098/api'
/**
 * @author zhangwenchao  2020.4.26
 * 全局注册，之后可在其他组件中通过 this.$axios 发送数据
 */
Vue.prototype.$axios = axios
/**
 * 作用是阻止vue 在启动时生成生产提示。
 * @type {boolean}
 */
Vue.config.productionTip = false
Vue.use(ElementUI)

/**
 * 钩子函数及在某些时机会被调用的函数。这里我们使用 router.beforeEach()，意思是在访问每一个路由前调用。
 */
router.beforeEach((to, from, next) => {
  if (to.meta.requireAuth) {
    if (store.state.user.username) {
      next()
    } else {
      next({
        path: 'login',
        query: {redirect: to.fullPath}
      })
    }
  } else {
    next()
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router,
  store,
  components: { App },
  template: '<App/>'
})
