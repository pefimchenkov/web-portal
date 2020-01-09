import Api from '@/services/Api'
import axios from 'axios'

export default {
	state: {
		Currency: [],
		Rate: []
	},
	mutations: {
		loadCurrency(state, payload) {
			state.Currency = payload
		},
		loadRate(state, payload) {
			state.Rate = payload
		}
	},
	actions: {
		async fetchCurrency({ commit, getters }) {
			// commit('setLoading', true)
			commit('clearError')

			let resultCurrency = []
			await Api()
				.get('currency')
				.then(res => {
					resultCurrency = Object.values(res.data)
					commit('loadCurrency', resultCurrency)
					// commit('setLoading', false)
				})
				.catch(err => {
					// commit('setLoading', false)
					commit('setError', error.messsage)
					throw err
				})
		},
		async getRate({ commit, getters }) {
			commit('clearError')
			let resultRate = []
			await axios
				.get('https://www.cbr-xml-daily.ru/daily_json.js')
				.then(res => {
					resultRate = Object.values(res.data)
					commit('loadRate', resultRate)
				})
				.catch(err => {
					console.log(err)
					if (err.Error === 'Network') return null
				})
		}
	},
	getters: {
		currency(state) {
			return state.Currency
		},
		rate(state) {
			return state.Rate
		}
	}
}
