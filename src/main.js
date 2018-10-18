import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import store from './store'
import * as fb from 'firebase'
import ByModalComponent from './components/shared/BayModal.vue'

Vue.use(Vuetify)
Vue.component('app-buy-modal', ByModalComponent)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  store,
  created () {
    let config = {
      apiKey: 'AIzaSyDl2M-tIePSginA3hzMVChNZWadj0V6FEk',
      authDomain: 'web-portal-75244.firebaseapp.com',
      databaseURL: 'https://web-portal-75244.firebaseio.com',
      projectId: 'web-portal-75244',
      storageBucket: 'web-portal-75244.appspot.com',
      messagingSenderId: '804378274290'
    }

    fb.initializeApp(config)
    fb.auth().onAuthStateChanged(user => {
      if (user) {
        this.$store.dispatch('autoLoginUser', user)
      }
    })
    this.$store.dispatch('fetchAds')
  }
})
