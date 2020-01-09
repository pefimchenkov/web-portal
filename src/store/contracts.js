import Api from '@/services/Api'
export default {
	state: {
		Contracts: []
	},
	mutations: {
		loadContracts(state, payload) {
			state.Contracts = payload
		}
	},
	actions: {
		async fetchContracts({ commit, getters }) {
			commit('clearError')

			let resultContracts = []
			await Api()
				.get('contracts')
				.then(res => {
					resultContracts = Object.values(res.data)
					commit('loadContracts', resultContracts)
				})
				.catch(err => {
					commit('setError', error.messsage)
					throw err
				})
		}
	},
	getters: {
		contracts(state) {
			return state.Contracts
		}
	}
}
