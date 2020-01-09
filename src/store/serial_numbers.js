import Api from '@/services/Api'
export default {
	state: {
		SerialNumbers: [],
	},
	mutations: {
		loadSerialNumbers(state, payload) {
			state.SerialNumbers = payload
		}
	},
	actions: {
		async fetchSerialNumbers({ commit, getters }) {
			commit('clearError')

			let resultSerialNumbers = []
			await Api()
				.get('serial_numbers')
				.then(res => {
					resultSerialNumbers = Object.values(res.data)
					commit('loadSerialNumbers', resultSerialNumbers)
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', error.messsage)
					throw err
				})
		}
	},
	getters: {
		sn(state) {
			return state.SerialNumbers
		}
	}
}
