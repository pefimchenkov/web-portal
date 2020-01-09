import Api from '@/services/Api'
export default {
	state: {
		EditPrices: []
	},
	mutations: {
		loadEditPrices(state, payload) {
			state.EditPrices = payload
		}
	},
	actions: {
		async fetchEditPrices({ commit, getters }) {
			commit('clearError')

			let resultEditPrices = []
			await Api()
				.get('zip_prices/editprices')
				.then(res => {
					resultEditPrices = Object.values(res.data)
					commit('loadEditPrices', resultEditPrices)
				})
				.catch(err => {
					commit('setError', error.messsage)
					throw err
				})
		}
	},
	getters: {
		editprices(state) {
			return state.EditPrices
		}
	}
}
