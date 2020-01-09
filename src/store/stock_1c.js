import Api from '@/services/Api'
export default {
	state: {
		Stock1C: [],
		EngineersStock: []
	},
	mutations: {
		LOAD_STOCK_1C(state, payload) {
			state.Stock1C = payload
		}
	},
	actions: {
		async FETCH_STOCK_1C({ commit, getters }) {
			commit('clearError')

			let resultStock1C = []
			await Api()
				.get('stock_1c')
				.then(res => {
					resultStock1C = Object.values(res.data)
					commit('LOAD_STOCK_1C', resultStock1C)
				})
				.catch(err => {
					commit('setError', error.messsage)
					throw err
				})
		}
	},
	getters: {
		Stock1C: (state) => state.Stock1C
	}
}
