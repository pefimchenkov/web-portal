import Api from '@/services/Api'
export default {
	state: {
		Brands: []
	},
	mutations: {
		loadBrands(state, payload) {
			state.Brands = payload
		}
	},
	actions: {
		async fetchBrands({ commit, getters }) {
			// commit('setLoading', true)
			commit('clearError')

			let resultBrands = []
			await Api()
				.get('brands')
				.then(res => {
					resultBrands = Object.values(res.data)
					commit('loadBrands', resultBrands)
					// commit('setLoading', false)
				})
				.catch(err => {
					// commit('setLoading', false)
					commit('setError', error.messsage)
					throw err
				})
		}
	},
	getters: {
		brands(state) {
			return state.Brands
		}
	}
}
