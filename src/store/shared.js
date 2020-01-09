import { AclRule } from 'vue-acl'

export default {
	state: {
		loading: false,
		activeTab: '',
		error: null,
		data: null,
		info: false
	},
	mutations: {
		setLoading(state, payload) {
			state.loading = payload
		},
		setActiveTabs(state, payload) {
			state.activeTab = payload
		},
		setError(state, payload) {
			state.error = payload
		},
		setData(state, payload) {
			state.data = payload
		},
		setInfo(state, payload) {
			state.info = payload
		},
		clearError(state) {
			state.error = null
		}
	},
	actions: {
		setLoading({ commit }, payload) {
			commit('setLoading', payload)
		},
		setActiveTab({ commit }, payload) {
			commit('setActiveTab', payload)
		},
		setError({ commit }, payload) {
			commit('setError', payload)
		},
		setInfo({ commit }, payload) {
			commit('setInfo', payload)
		},
		setData({ commit }, payload) {
			return new Promise((resolve, reject) => {
				resolve(commit('setData', payload))
			})
		},
		clearError({ commit }) {
			commit('clearError')
		}
	},
	getters: {
		loading(state) {
			return state.loading
		},
		activeTab(state) {
			return state.activeTab
		},
		error(state) {
			return state.error
		},
		data(state) {
			return state.data
		},
		info(state) {
			return state.info
		}
	}
}
