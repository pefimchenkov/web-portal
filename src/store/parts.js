import Api from '@/services/Api'
export default {
	state: {
		Parts: []
	},
	mutations: {
		loadParts(state, payload) {
			state.Parts = payload
		}
	},
	actions: {
		async fetchParts({ commit, getters }) {
			commit('clearError')

			let resultParts = []
			await Api()
				.get('Parts')
				.then(res => {
					resultParts = Object.values(res.data)
					commit('loadParts', resultParts)
				})
				.catch(err => {
					commit('setError', error.messsage)
					throw err
				})
		}
	},
	getters: {
		Parts(state) {
			return state.Parts
		}
	}
}
