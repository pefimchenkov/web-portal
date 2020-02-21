import Api from '@/services/Api'
export default {
	state: {
		Market: [],
		TechProps: [],
		Basket: []
	},
	mutations: {
		loadMarket(state, payload) {
			state.Market = payload
		},
		loadTechProps(state, payload) {
			state.TechProps = payload
		},
		loadTechPropValue(state, payload) {
			const Item = state.TechProps.find(prop => prop.mainID === payload.id)
			Item.TH2 = payload.value.name
			Item.elementID = payload.value.id
		},
		SET_BASKET(state, payload) {
			state.Basket = payload.CurrentOrder
		},
		DEL_FROM_BASKET(state, payload) {
			const obj = state.Basket.find(item => item.marketid === parseInt(payload))
			const index = state.Basket.indexOf(obj)
			state.Basket.splice(index, 1)
		},
		SET_ORDERS(state, payload) {
			state.Orders = payload
		},
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
		},
		getBasket({ commit }) {
			if (localStorage.getItem('marketBasket')) {
				const marketBasket = JSON.parse(localStorage.getItem('marketBasket'))
				commit('SET_BASKET', marketBasket)
			} else {
				return false
			}
		},
		setBasket({ commit }, payload) {
			commit('SET_BASKET', payload)
		},
		delFromBasket({ commit }, payload) {
			const marketBasket = JSON.parse(localStorage.getItem('marketBasket'))
			const obj = marketBasket.CurrentOrder.find(item => item.marketid === parseInt(payload))
			const index = marketBasket.CurrentOrder.indexOf(obj)
			marketBasket.CurrentOrder.splice(index, 1)
			localStorage.setItem('marketBasket', JSON.stringify({ CurrentOrder: marketBasket.CurrentOrder }))
			commit('DEL_FROM_BASKET', payload)
		},
		getOrders({ commit }) {
			if (localStorage.getItem('marketOrders')) {
				const marketOrders = JSON.parse(localStorage.getItem('marketOrders'))
				commit('SET_ORDERS', marketOrders)
			} else {
				return false
			}
		},
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
