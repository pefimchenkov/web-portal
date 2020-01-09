import Api from '@/services/Api'

export default {
	state: {
		zipImg: []
	},
	mutations: {
		loadZipImg(state, payload) {
			state.zipImg = payload;
		}
	},
	actions: {
		async fetchZipImg({ commit }) {
			let resultImg = []
			await Api()
				.post('zip/get_images')
				.then(res => {
					resultImg = Object.values(res.data)
					commit('loadZipImg', resultImg)
				})
				.catch(err => {
					commit('setError', error.messsage)
					throw err
				})
		}
	},
	getters: {
		zipImg(state) {
			return state.zipImg
		}
	}
}
