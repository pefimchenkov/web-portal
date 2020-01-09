import Api from '@/services/Api'
export default {
	state: {
		Market: [],
		TechProps: []
	},
	mutations: {
		loadMarket(state, payload) {
			state.Market = payload
		},
		loadTechProps(state, payload) {
			state.TechProps = payload
			console.log(payload)
		},
		loadTechPropValue(state, payload) {
			const Item = state.TechProps.find(prop => prop.mainID === payload.id)
			Item.TH2 = payload.value.name
			Item.elementID = payload.value.id
		}
	},
	actions: {
		async fetchMarket({ commit, getters }) {
			commit('clearError')

			let resultMarket = []
			await Api()
				.get('zip_prices')
				.then(res => {
					resultMarket = Object.values(res.data)
					commit('loadMarket', resultMarket)
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', error.messsage)
					throw err
				})
		},
		 fetchTechProps({ commit, getters }, payload) {
			commit('clearError')
			let resultTechProps = []
			return Api()
				.post('market/get_tech_props', payload)
				.then(res => {
					resultTechProps = Object.values(res.data)
					commit('loadTechProps', resultTechProps)
					return resultTechProps
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					if (err) throw err
				})
		},
		fetchTechPropValues({ commit, getters }, payload) {
			commit('clearError')
			let resultTechPropValues = []
			return Api()
				.post('market/get_tech_prop_values', [payload])
				.then(res => {
					resultTechPropValues = Object.values(res.data)
					return resultTechPropValues
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					if (err) throw err
				})
		},
		async addTechPropValue({ commit, dispatch }, payload) {
			commit('clearError')
			let resultTechPropValue = []
			await Api()
				.post('market/add_tech_prop_value', payload)
				.then(res => {
					resultTechPropValue = { value: payload.TechPropValue, id: payload.item.mainID }
					commit('loadTechPropValue', resultTechPropValue)
					dispatch('fetchTechPropertiesFit')
					commit('setData', 'Для свойства `' + payload.item.TH1 + '` успешно добавлено значение `' + payload.TechPropValue.name + '`')
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					if (err) throw err
				})
		},
		deleteTechPropFit({ commit, getters }, payload) {
			commit('clearError')
			const id = payload.id
			return Api()
				.post('market/delete_tech_prop_fit', [id])
				.then(res => {
					commit('setLoading', false)
					return res.data
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					if (err) throw err
				})
		}
	},
	getters: {
		Market(state) {
			return state.Market
		},
		TechProps(state) {
			return state.TechProps
		}
	}
}
