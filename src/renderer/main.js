import Vue from 'vue'
import i18next from 'i18next'
import i18nextBackend from 'i18next-node-fs-backend'

import App from './App'
import router from './router'
import store from './store'

const electron = require('electron')
const { app } = require('electron').remote


init()

async function init () {
  Vue.prototype.$electron = electron

  Vue.prototype.$t = await i18next
    .use(i18nextBackend)
    .init({
      lng: app.getLocale(),
      fallbackLng: 'en',
      ns: ['renderer'],
      defaultNS: 'renderer',
      backend: {
        loadPath: 'static/locales/{{lng}}/{{ns}}.json',
        addPath: 'static/locales/{{lng}}/{{ns}}.missing.json'
      }
    })

  Vue.config.productionTip = false

  new Vue({
    components: { App },
    router,
    store,
    template: '<App/>'
  }).$mount('#app')
}
