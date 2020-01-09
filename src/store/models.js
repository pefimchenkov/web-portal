import Api from '@/services/Api'
export default {
	state: {
		Models: [],
		ModelsCategory: [],
		ModelsProfile: [],
		ModelsEngineers: [],
		ModelsType: [],
		ModelsVendor: []
	},
	mutations: {
		loadModels(state, payload) {
			state.Models = payload
		},
		loadModelsCategory(state, payload) {
			state.ModelsCategory = payload
		},
		loadModelsProfile(state, payload) {
			state.ModelsProfile = payload
		},
		loadModelsEngineers(state, payload) {
			state.ModelsEngineers = payload
		},
		loadModelsType(state, payload) {
			state.ModelsType = payload
		},
		loadModelsVendor(state, payload) {
			state.ModelsVendor = payload
		}
	},
	actions: {
		async fetchModels({ commit, getters }) {
			commit('clearError')
			let resultModels = []
			await Api()
				.get('models')
				.then(res => {
					resultModels = Object.values(res.data)
					commit('loadModels', resultModels)
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', error.messsage)
					throw err
				})
		},
		async fetchModelsCategory({ commit, getters }) {
			commit('clearError')
			let resultModelsCategory = []
			await Api()
				.get('models_category')
				.then(res => {
					resultModelsCategory = Object.values(res.data)
					commit('loadModelsCategory', resultModelsCategory)
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', error.messsage)
					throw err
				})
		},
		async fetchModelsProfile({ commit, getters }) {
			commit('clearError')
			let resultModelsProfile = []
			await Api()
				.get('models_profile')
				.then(res => {
					resultModelsProfile = Object.values(res.data)
					commit('loadModelsProfile', resultModelsProfile)
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', error.messsage)
					throw err
				})
		},
		async fetchModelsEngineers({ commit, getters }) {
			commit('clearError')
			let resultModelsEngineers = []
			await Api()
				.get('models_engineers')
				.then(res => {
					resultModelsEngineers = Object.values(res.data)
					commit('loadModelsEngineers', resultModelsEngineers)
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', error.messsage)
					throw err
				})
		},
		async fetchModelsType({ commit, getters }) {
			commit('clearError')
			commit('setLoading', true)
			let resultModelsType = []
			await Api()
				.get('models_type')
				.then(res => {
					resultModelsType = Object.values(res.data)
					commit('loadModelsType', resultModelsType)
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', error.messsage)
					throw err
				})
		},
		async fetchModelsVendor({ commit, getters }) {
			commit('clearError')
			commit('setLoading', true)
			let resultModelsVendor = []
			await Api()
				.get('models/get_vendor')
				.then(res => {
					resultModelsVendor = Object.values(res.data)
					commit('loadModelsVendor', resultModelsVendor)
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', error.messsage)
					throw err
				})
		}
	},
	getters: {
		models(state) {
			return state.Models
		},
		models_profile(state) {
			return state.ModelsProfile
		},
		models_category(state) {
			return state.ModelsCategory
		},
		models_engineers(state) {
			return state.ModelsEngineers
		},
		models_type(state) {
			return state.ModelsType
		},
		models_vendor(state) {
			return state.ModelsVendor
		}
	}
}
