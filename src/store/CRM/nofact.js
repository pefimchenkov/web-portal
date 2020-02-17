import { getNoFactLegpers, getNoFactProjects } from '@/api/crm'

export default {
	state: {
		NO_FACT_LEGPERS: [],
		NO_FACT_PROJECTS: []
	},
	mutations: {
		LOAD_NO_FACT_LEGPERS (state, payload) {
			state.NO_FACT_LEGPERS = payload
		},
		LOAD_NO_FACT_PROJECTS (state, payload) {
			state.NO_FACT_PROJECTS = payload
		}
	},
	actions: {
		fetchNoFactLegpers ({ commit }) {
			commit('setLoading', true)
			return new Promise((resolve, reject) => {
				getNoFactLegpers()
					.then(response => {
						commit('LOAD_NO_FACT_LEGPERS', response)
						resolve()
						commit('setLoading', false)
					}).catch(error => {
						reject(error)
						commit('setLoading', false)
					})
			})
		},
		fetchNoFactProjects ({ commit }) {
			commit('setLoading', true)
			return new Promise((resolve, reject) => {
				getNoFactProjects()
					.then(response => {
						commit('LOAD_NO_FACT_PROJECTS', response)
						resolve()
						commit('setLoading', false)
					}).catch(error => {
						reject(error)
						commit('setLoading', false)
					})
			})
		}
	},
	getters: {
		NoFactLegpers: (state) => state.NO_FACT_LEGPERS,
		NoFactProjects: (state) => state.NO_FACT_PROJECTS
	}
}
