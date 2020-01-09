import Api from '@/services/Api'
export default {
	state: {
		Suppliers: []
	},
	mutations: {
		loadSuppliers(state, payload) {
			state.Suppliers = payload
		}
	},
	actions: {
		async fetchSuppliers({ commit, getters }) {
			// commit('setLoading', true)
			commit('clearError')

			let resultSuppliers = []
			await Api()
				.get('suppliers')
				.then(res => {
					resultSuppliers = Object.values(res.data)
					commit('loadSuppliers', resultSuppliers)
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
		suppliers(state) {
			return state.Suppliers
		}
	}
}
