import Api from '@/services/Api'
export default {
	state: {
		Conditions: []
	},
	mutations: {
		loadConditions(state, payload) {
			state.Conditions = payload
		}
	},
	actions: {
		async fetchConditions({ commit, getters }) {
			// commit('setLoading', true)
			commit('clearError')

			let resultConditions = []
			await Api()
				.get('conditions')
				.then(res => {
					resultConditions = Object.values(res.data)
					commit('loadConditions', resultConditions)
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
		conditions(state) {
			return state.Conditions
		}
	}
}
