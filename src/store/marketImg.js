import Api from '@/services/Api'

export default {
	state: {
		loadMarketImg: [],
		getMarketImg: []
	},
	mutations: {
		loadMarketImg(state, payload) {
			state.loadMarketImg = payload
		},
		getMarketImg(state, payload) {
			state.getMarketImg = payload
		}
	},
	actions: {
		 loadMarketImg({ commit }) {
			commit('clearError')
			commit('setLoading', true)
			let resultImg = []
			return Api()
				.get('market/loadimages')
				.then(res => {
					resultImg = Object.values(res.data)
					commit('loadMarketImg', resultImg)
					commit('setLoading', false)
					return res.data
				})
				.catch(err => {
					commit('setError', error.messsage)
					throw err
				})
		},
		async getMarketImg({ commit }) {
			commit('clearError')
			commit('setLoading', true)
			let resultImg = []
			await Api()
				.post('market/getimages')
				.then(res => {
					resultImg = Object.values(res.data)
					commit('getMarketImg', resultImg)
					commit('setLoading', false)
				})
				.catch(err => {
					commit('setError', error.messsage)
					throw err
				})
		}
	},
	getters: {
		loadMarketImg(state) {
			return state.loadMarketImg
		},
		getMarketImg(state) {
			return state.getMarketImg
		}
	}
}
