import Api from '@/services/Api'
export default {
	state: {
		Zip: [],
		ZipName: []
	},
	mutations: {
		loadZip(state, payload) {
			state.Zip = payload
		}
	},
	actions: {
		async fetchZip({ commit, getters }) {
			// commit('setLoading', true)
			commit('clearError')

			let resultZip = []
			await Api()
				.get('zip')
				.then(res => {
					resultZip = Object.values(res.data)
					commit('loadZip', resultZip)
					// commit('setLoading', false)
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', error.messsage)
					throw err
				})
		}
	},
	getters: {
		zip(state) {
			return state.Zip
		}
	}
}
