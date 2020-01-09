import { getEngineersStock, getEngineersStockArchive, getEngineersStockGood, getEngineersStockDetails,
	setConditionStock, deleteEngineersStock, sendRequest, sendApprove, sendCheck, sendDecline, sendRequestForZip } from '@/api/engineers-stock'
import moment from 'moment'

export default {
	state: {
		EngineersStock: [],
		EngineersStockArchive: [],
		EngineersStockGood: [],
		EngineersStockDetails: []
	},
	mutations: {
		LOAD_ENGINEERS_STOCK(state, payload) {
			state.EngineersStock = payload
		},
		LOAD_ENGINEERS_STOCK_ARCHIVE(state, payload) {
			state.EngineersStockArchive = payload
		},
		LOAD_ENGINEERS_STOCK_GOOD(state, payload) {
			state.EngineersStockGood = payload
		},
		LOAD_ENGINEERS_STOCK_DETAILS(state, payload) {
			state.EngineersStockDetails = payload
		},
		CHANGE_ENGINEERS_STOCK_DETAILS: (state, payload) => {
			const details = state.EngineersStockDetails.find(obj => obj.ID === payload.jiraID)
			const index = state.EngineersStockDetails.indexOf(details)
			state.EngineersStockDetails.splice(index, 1)
		},
		DELETE_ENGINEERS_STOCK: (state, payload) => {
			const ItemGood = state.EngineersStockGood.find(item => item.id === payload.id)
			const index = state.EngineersStockGood.indexOf(ItemGood)
			state.EngineersStockGood.splice(index, 1)
			const Item = state.EngineersStock.find(item => (item.JIRA_ID === parseInt(payload.zip_id)) && (item.Eng === payload.eng))
			Item.Count = Item.Count + 1
		},
		SEND_REQUEST: (state, payload) => {
			const { status, id} = payload
			const obj = state.EngineersStockGood.find(item => item.id === parseInt(id))
			obj.request = parseInt(status)
			obj.executor = payload.user
			obj.date = payload.date
		},
		SEND_APPROVE: (state, payload) => {
			const { id } = payload
			const obj = state.EngineersStockGood.find(item => item.id === parseInt(id))
			obj.executor = payload.user
			obj.date = payload.date
			const index = state.EngineersStockGood.indexOf(obj)
			state.EngineersStockGood.splice(index, 1)
		},
		SEND_CHECK: (state, payload) => {
			const { id } = payload
			const obj = state.EngineersStockGood.find(item => item.id === parseInt(id))
			obj.request = 2
			obj.executor = payload.user
			obj.date = payload.date
		},
		SEND_REQUEST_FOR_ZIP: (state, payload) => {
			console.log(payload)
		}
	},
	actions: {
		fetchEngineersStockGood({ commit }) {
			return new Promise((resolve, reject) => {
				getEngineersStockGood().
					then(response => {
						commit('LOAD_ENGINEERS_STOCK_GOOD', response)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		fetchEngineersStock({ commit }) {
			return new Promise((resolve, reject) => {
				getEngineersStock().
					then(response => {
						commit('LOAD_ENGINEERS_STOCK', response)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		fetchEngineersStockArchive({ commit }) {
			return new Promise((resolve, reject) => {
				getEngineersStockArchive().
					then(response => {
						commit('LOAD_ENGINEERS_STOCK_ARCHIVE', response)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		fetchEngineersStockDetails({ commit }, payload) {
			return new Promise((resolve, reject) => {
				getEngineersStockDetails(payload).
					then(response => {
						commit('LOAD_ENGINEERS_STOCK_DETAILS', response)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		setConditionStock({ commit }, payload) {
			return new Promise((resolve, reject) => {
				setConditionStock(payload).
					then(response => {
						commit('CHANGE_ENGINEERS_STOCK_DETAILS', response)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		deleteEngineersStock({ commit }, payload) {
			return new Promise((resolve, reject) => {
				deleteEngineersStock(payload.id).
					then(() => {
						commit('DELETE_ENGINEERS_STOCK', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		sendRequest({ commit }, payload) {
			return new Promise((resolve, reject) => {
				sendRequest(payload).
					then(() => {
						commit('SEND_REQUEST', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		sendApprove({ commit }, payload) {
			return new Promise((resolve, reject) => {
				sendApprove(payload).
					then(() => {
						commit('SEND_APPROVE', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		sendDecline({ commit }, payload) {
			return new Promise((resolve, reject) => {
				sendDecline(payload).
					then(() => {
						commit('SEND_APPROVE', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		sendCheck({ commit }, payload) {
			return new Promise((resolve, reject) => {
				sendCheck(payload).
					then(() => {
						commit('SEND_CHECK', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		sendRequestForZip({ commit }, payload) {
			return new Promise((resolve, reject) => {
				sendRequestForZip(payload).
					then(() => {
						commit('SEND_REQUEST_FOR_ZIP', payload)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		}
	},
	getters: {
		EngineersStock: (state) => state.EngineersStock,
		EngineersStockArchive: (state) => state.EngineersStockArchive,
		EngineersStockGood: (state) => state.EngineersStockGood,
		EngineersStockDetails: (state) => state.EngineersStockDetails
	}
}
