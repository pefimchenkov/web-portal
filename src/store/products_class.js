import Api from '@/services/Api'
export default {
	state: {
		ProductsClass: [],
	},
	mutations: {
		loadProductsClass(state, payload) {
			state.ProductsClass = payload
		}
	},
	actions: {
		async fetchProductsClass({ commit, getters }) {
			commit('clearError')

			let resultProductsClass = []
			await Api()
				.get('products_class')
				.then(res => {
					resultProductsClass = Object.values(res.data)
					commit('loadProductsClass', resultProductsClass)
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', error.messsage)
					throw err
				})
		}
	},
	getters: {
		productsclass(state) {
			return state.ProductsClass
		}
	}
}
