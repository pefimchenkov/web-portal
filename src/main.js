import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import store from './store'
import ByModalComponent from './components/shared/BayModal.vue'
import '@mdi/font/css/materialdesignicons.css'
import JsonExcel from 'vue-json-excel'
import MultiFiltersPlugin from './plugins/MultiFilters'
import './icons' // icon

// IMPORTANT just import firebase
import fb from 'firebase/app'
import config from './config/fb'

// import package
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/storage'

import VueTinyLazyloadImg from 'vue-tiny-lazyload-img'

import acl from './acl'

Vue.use(Vuetify)
Vue.use(MultiFiltersPlugin)
Vue.use(VueTinyLazyloadImg)
Vue.component('app-buy-modal', ByModalComponent)
Vue.component('downloadExcel', JsonExcel)

Vue.config.productionTip = false

export const eventBus = new Vue()

const opts = {
	theme: {
		dark: false
	},
	icons: {
		iconfont: 'mdi'
	}
}

new Vue({
	el: '#app',
	router,
	acl,
	store,
	vuetify: new Vuetify(opts),
	render: h => h(App),
	created () {
		if (!fb.apps.length) {
			fb.initializeApp(config)
		}
		fb.auth().onAuthStateChanged(user => {
			if (user) {
				this.$store.dispatch('getCurrentUser')
				this.$store.dispatch('autoLoginUser', user)
					.then(() => {
						this.$store.dispatch('getUserRole', user)
					})
			}
		})
		this.$store.dispatch('loadMarketImg')
			.then(res => {
				if (res.success === false) this.$store.commit('setError', 'Отсутствует соединение с базой данных ТСД Групп')
			})
	}
}).$mount('#app')
