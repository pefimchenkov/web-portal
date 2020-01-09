import Api from '@/services/Api'
export default {
	state: {
		Aliases: []
	},
	mutations: {
		loadAliases(state, payload) {
			state.Aliases = payload
		}
	},
	actions: {
		async fetchAliases({ commit, getters }) {
			// commit('setLoading', true)
			commit('clearError')

			let resultAliases = []
			await Api()
				.get('aliases')
				.then(res => {
					resultAliases = Object.values(res.data)
					commit('loadAliases', resultAliases)
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
		aliases(state) {
			return state.Aliases
		}
	}
}
