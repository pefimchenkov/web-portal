import Api from '@/services/Api'
export default {
	state: {
		ProductsType: [],
	},
	mutations: {
		loadProductsType(state, payload) {
			state.ProductsType = payload
		}
	},
	actions: {
		async fetchProductsType({ commit, getters }) {
			commit('clearError')

			let resultProductsType = []
			await Api()
				.get('products_type')
				.then(res => {
					resultProductsType = Object.values(res.data)
					commit('loadProductsType', resultProductsType)
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', error.messsage)
					throw err
				})
		}
	},
	getters: {
		productstype(state) {
			return state.ProductsType
		}
	}
}
