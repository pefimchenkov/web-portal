import Api from '@/services/Api'
import { getEditableCRM, getReadonlyCRM, getLegPers, getClientsDomains, getPercentCRM, updateCurator,
	updateManager, updateAIDC_SALE, updateAIDC_SALE_ZIP, updateAIDC_SERV,
	updateIT, activateCRM, deactivateCRM, setPercent, setCustomPercent, deleteCustomPercent, addLegPers,
	addDomains, updateDomains, deleteDomains, updateLegPers, deleteLegPers } from '@/api/clients'
export default {
	state: {
		Clients: [],
		LegPers: [],
		Domains: [],
		editable: [],
		readonly: [],
		percents: []
	},
	mutations: {
		loadClients(state, payload) {
			state.Clients = payload
		},
		LOAD_CRM_EDITABLE: (state, editable) => {
			state.editable = editable
		},
		LOAD_CRM_READONLY: (state, readonly) => {
			state.readonly = readonly
		},
		LOAD_LEGPERS: (state, legpers) => {
			state.LegPers = legpers
		},
		LOAD_CLIENTS_DOMAINS: (state, domains) => {
			state.Domains = domains
		},
		LOAD_CRM_CURATOR: (state, curator) => {
			state.editable.HEAD_MANAGER = curator
		},
		LOAD_CRM_MANAGER: (state, manager) => {
			state.editable.MANAGER = manager
		},
		LOAD_CRM_AIDC_SALE: (state, payload) => {
			state.editable.AIDC_SALE = payload.plan
			payload.manager === null ? state.editable.OM_SALE = state.editable.MANAGER : state.editable.OM_SALE = payload.manager + ' *'
		},
		LOAD_CRM_AIDC_SALE_ZIP: (state, payload) => {
			state.editable.AIDC_SALE_ZIP = payload.plan
			payload.manager === null ? state.editable.OM_SALE_ZIP = state.editable.MANAGER : state.editable.OM_SALE_ZIP = payload.manager + ' *'
		},
		LOAD_CRM_AIDC_SERV: (state, payload) => {
			state.editable.AIDC_SERV = payload.plan
			payload.manager === null ? state.editable.OM_SERV = state.editable.MANAGER : state.editable.OM_SERV = payload.manager + ' *'
		},
		LOAD_CRM_IT: (state, payload) => {
			state.editable.IT = payload.plan
			payload.manager === null ? state.editable.OM_IT = state.editable.MANAGER : state.editable.OM_IT = payload.manager + ' *'
		},
		LOAD_CRM_PERCENTS: (state, percents) => {
			state.percents = percents
		},
		ACTIVATE_CRM_STATUS: (state, id) => {
			const client = state.Clients.find(client => parseInt(client.ID) === id)
			client.CRM = 1
		},
		DEACTIVATE_CRM_STATUS: (state, id) => {
			const client = state.Clients.find(client => parseInt(client.ID) === id)
			client.CRM = 2
		},
		ADD_LEGPERS: (state, payload) => {
			const legpers = { id: payload.insertID, name: payload.fullName, just_name: payload.justName, id_1c: payload.code1c, client_id: payload.id, form: payload.form.name }
			state.LegPers.unshift(legpers)
		},
		UPDATE_LEGPERS: (state, payload) => {
			const legpers = state.LegPers.find(item => item.id === payload.id)
			legpers.name = payload.fullName
			legpers.just_name = payload.justName
			legpers.form = payload.form.name
			legpers.code1c = payload.code1c
		},
		DELETE_LEGPERS: (state, payload) => {
			const index = state.LegPers.findIndex(item => item.id === payload.id)
			state.LegPers.splice(index, 1)

		},
		ADD_DOMAINS: (state, payload) => {
			const domain = { id: payload.insertID, NAME: payload.name, client_id: payload.id }
			state.Domains.unshift(domain)
		},
		UPDATE_DOMAINS: (state, payload) => {
			const domain = state.Domains.find(domain => domain.id === payload.id)
			domain.NAME = payload.name
		},
		DELETE_DOMAINS: (state, payload) => {
			const index = state.Domains.findIndex(domain => domain.id === payload.id)
			state.Domains.splice(index, 1)

		},
		SET_CRM_PERCENT: (state, payload) => {
			const client = state.Clients.find(client => parseInt(client.ID) === parseInt(payload.id))
			client.CRM_TYPE = payload.type
			if (state.editable.P_SALE_type !== 'manual') state.editable.P_SALE = payload.AIDC_SALE
			if (state.editable.P_SALE_ZIP_type !== 'manual') state.editable.P_SALE_ZIP = payload.AIDC_SALE_ZIP
			if (state.editable.P_SERV_type !== 'manual') state.editable.P_SERV = payload.AIDC_SERV
			if (state.editable.P_IT_type !== 'manual') state.editable.P_IT = payload.IT
		},
		SET_CUSTOM_CRM_PERCENT: (state, payload) => {
			if (payload.name === 'AIDC_SALE') {
				state.editable.P_SALE = payload.percent
				state.editable.P_SALE_type = 'manual'
			}
			if (payload.name === 'AIDC_SALE_ZIP') {
				state.editable.P_SALE_ZIP = payload.percent
				state.editable.P_SALE_ZIP_type = 'manual'
			}
			if (payload.name === 'AIDC_SERV') {
				state.editable.P_SERV = payload.percent
				state.editable.P_SERV_type = 'manual'
			}
			if (payload.name === 'IT') {
				state.editable.P_IT = payload.percent
				state.editable.P_IT_type = 'manual'
			}
		},
		DELETE_CUSTOM_CRM_PERCENT: (state, payload) => {
			console.log(state)
			const client = state.Clients.find(client => parseInt(client.ID) === parseInt(payload.id))
			const percents = state.percents.find(percent => percent.crm_id === client.CRM_TYPE)
			if (payload.value === 'AIDC_SALE') {
				state.editable.P_SALE = percents[payload.value]
				state.editable.P_SALE_type = 'global'
			}
			if (payload.value === 'AIDC_SALE_ZIP') {
				state.editable.P_SALE_ZIP = percents[payload.value]
				state.editable.P_SALE_ZIP_type = 'global'
			}
			if (payload.value === 'AIDC_SERV') {
				state.editable.P_SERV = percents[payload.value]
				state.editable.P_SERV_type = 'global'
			}
			if (payload.value === 'IT') {
				state.editable.P_IT = percents[payload.value]
				state.editable.P_IT_type = 'global'
			}
		}
	},
	actions: {
		async fetchClients({ commit, getters }) {
			commit('clearError')

			let resultClients = []
			await Api()
				.get('clients')
				.then(res => {
					resultClients = Object.values(res.data)
					commit('loadClients', resultClients)
				})
				.catch(err => {
					commit('setError', err.messsage)
					throw err
				})
		},
		fetchEditableCRM({ commit }, id) {
			return new Promise((resolve, reject) => {
				getEditableCRM(id).
					then(response => {
						commit('LOAD_CRM_EDITABLE', response)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		fetchReadonlyCRM({ commit }, id) {
			return new Promise((resolve, reject) => {
				getReadonlyCRM(id).
					then(response => {
						commit('LOAD_CRM_READONLY', response)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		fetchLegPers({ commit }, id) {
			return new Promise((resolve, reject) => {
				getLegPers(id).
					then(response => {
						commit('LOAD_LEGPERS', response)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		fetchClientsDomains({ commit }, id) {
			return new Promise((resolve, reject) => {
				getClientsDomains(id).
					then(response => {
						commit('LOAD_CLIENTS_DOMAINS', response)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		fetchPercentCRM({ commit }) {
			return new Promise((resolve, reject) => {
				getPercentCRM().
					then(response => {
						commit('LOAD_CRM_PERCENTS', response)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		updateCurator({ commit }, payload) {
			return new Promise((resolve, reject) => {
				updateCurator(payload).
					then(() => {
						commit('LOAD_CRM_CURATOR', payload.name)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		updateManager({ commit }, payload) {
			return new Promise((resolve, reject) => {
				updateManager(payload).
					then(() => {
						commit('LOAD_CRM_MANAGER', payload.name)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		updateAIDC_SALE({ commit }, payload) {
			return new Promise((resolve, reject) => {
				updateAIDC_SALE(payload).
					then(() => {
						commit('LOAD_CRM_AIDC_SALE', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		updateAIDC_SALE_ZIP({ commit }, payload) {
			return new Promise((resolve, reject) => {
				updateAIDC_SALE_ZIP(payload).
					then(() => {
						commit('LOAD_CRM_AIDC_SALE_ZIP', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		updateAIDC_SERV({ commit }, payload) {
			return new Promise((resolve, reject) => {
				updateAIDC_SERV(payload).
					then(() => {
						commit('LOAD_CRM_AIDC_SERV', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		updateIT({ commit }, payload) {
			return new Promise((resolve, reject) => {
				updateIT(payload).
					then(() => {
						commit('LOAD_CRM_IT', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		activateCRM({ commit }, id) {
			return new Promise((resolve, reject) => {
				activateCRM(id).
					then(() => {
						commit('ACTIVATE_CRM_STATUS', id)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		deactivateCRM({ commit }, id) {
			return new Promise((resolve, reject) => {
				deactivateCRM(id).
					then(() => {
						commit('DEACTIVATE_CRM_STATUS', id)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		addLegPers({ commit }, payload) {
			return new Promise((resolve, reject) => {
				addLegPers(payload).
					then((res) => {
						payload.insertID = res
						commit('ADD_LEGPERS', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		updateLegPers({ commit }, payload) {
			return new Promise((resolve, reject) => {
				updateLegPers(payload).
					then((res) => {
						commit('UPDATE_LEGPERS', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		deleteLegPers({ commit }, payload) {
			return new Promise((resolve, reject) => {
				deleteLegPers(payload).
					then(() => {
						commit('DELETE_LEGPERS', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		addDomains({ commit }, payload) {
			return new Promise((resolve, reject) => {
				addDomains(payload).
					then((res) => {
						payload.insertID = res
						commit('ADD_DOMAINS', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		updateDomains({ commit }, payload) {
			return new Promise((resolve, reject) => {
				updateDomains(payload).
					then(() => {
						commit('UPDATE_DOMAINS', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		deleteDomains({ commit }, payload) {
			return new Promise((resolve, reject) => {
				deleteDomains(payload).
					then(() => {
						commit('DELETE_DOMAINS', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		setPercent({ commit }, payload) {
			console.log(payload)
			return new Promise((resolve, reject) => {
				setPercent(payload).
					then(() => {
						commit('SET_CRM_PERCENT', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		setCustomPercent({ commit }, payload) {
			console.log(payload)
			return new Promise((resolve, reject) => {
				setCustomPercent(payload).
					then(() => {
						commit('SET_CUSTOM_CRM_PERCENT', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		deleteCustomPercent({ commit }, payload) {
			console.log(payload)
			return new Promise((resolve, reject) => {
				deleteCustomPercent(payload).
					then(() => {
						commit('DELETE_CUSTOM_CRM_PERCENT', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		}
	},
	getters: {
		clients(state) {
			return state.Clients
		},
		legpers(state) {
			return state.LegPers
		},
		domains(state) {
			return state.Domains
		},
		percents(state) {
			return state.percents
		},
		editable(state) {
			return state.editable
		},
		readonly(state) {
			return state.readonly
		}
	}
}
