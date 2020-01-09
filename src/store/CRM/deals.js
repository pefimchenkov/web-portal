import Api from '@/services/Api'
export default {
	state: {
		Deals: [],
		DealsNoBills: [],
		Weeks: [],
		Budget: [],
		BudgetPrev: [],
		Income: [],
		Fact: [],
		Plans: [],
		Pays: []
	},
	mutations: {
		LOAD_DEALS (state, payload) {
			state.Deals = payload
		},
		LOAD_DEALS_NO_BILLS (state, payload) {
			state.DealsNoBills = payload
		},
		LOAD_WEEKS (state, payload) {
			state.Weeks = payload
		},
		LOAD_BUDGET (state, payload) {
			state.Budget = payload
		},
		LOAD_BUDGET_PREV (state, payload) {
			state.BudgetPrev = payload
		},
		LOAD_INCOME (state, payload) {
			state.Income = payload
		},
		LOAD_PLANS (state, payload) {
			state.Plans = payload
		},
		LOAD_FACT (state, payload) {
			state.Fact = payload
		},
		LOAD_PAYS (state, payload) {
			state.Pays = payload
		},
		DEBIT_DONE (state, payload) {
			let Item = state.Budget.find(item => item.bill_1c === payload.bill_1c)
			Item.zp_done = (payload.zp_done === true || payload.zp_done === 1) ? 1 : 0
			Item.zakupka_done = (payload.zakupka_done === true || payload.zakupka_done === 1) ? 1 : 0
			Item.credit_done = (payload.credit_done === true || payload.credit_done === 1) ? 1 : 0
			Item.other_done = (payload.other_done === true || payload.other_done === 1) ? 1 : 0
			Item.date = payload.date
			Item.responsible = payload.responsible
		}
	},
	actions: {
		FETCH_DEALS ({ commit, getters }) {
			commit('setLoading', true)
			commit('clearError')

			let resultDeals = []
			return Api()
				.get('deals/list')
				.then(res => {
					resultDeals = Object.values(res.data)
					commit('LOAD_DEALS', resultDeals)
					commit('setLoading', false)
					return res.data
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					throw err
				})
		},
		FETCH_DEALS_NO_BILLS ({ commit, getters }) {
			commit('setLoading', true)
			commit('clearError')

			let resultDeals = []
			return Api()
				.get('deals_no_bills')
				.then(res => {
					resultDeals = Object.values(res.data)
					commit('LOAD_DEALS_NO_BILLS', resultDeals)
					commit('setLoading', false)
					return res.data
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					throw err
				})
		},
		FETCH_WEEKS ({ commit, getters }) {
			commit('setLoading', true)
			commit('clearError')

			let resultWeeks = []
			return Api()
				.get('weeks')
				.then(res => {
					resultWeeks = Object.values(res.data)
					commit('LOAD_WEEKS', resultWeeks)
					commit('setLoading', false)
					return res.data
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					throw err
				})
		},
		FETCH_BUDGET ({ commit, getters }) {
			commit('setLoading', true)
			commit('clearError')

			let resultBudget = []
			return Api()
				.get('budget/list')
				.then(res => {
					resultBudget = Object.values(res.data)
					commit('LOAD_BUDGET', resultBudget)
					commit('setLoading', false)
					return res.data
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					throw err
				})
		},
		FETCH_BUDGET_PREV ({ commit, getters }) {
			commit('setLoading', true)
			commit('clearError')

			let resultBudget = []
			return Api()
				.get('budget/list_prev')
				.then(res => {
					resultBudget = Object.values(res.data)
					commit('LOAD_BUDGET_PREV', resultBudget)
					commit('setLoading', false)
					return res.data
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					throw err
				})
		},
		FETCH_INCOME ({ commit, getters }, payload) {
			let url = (parseInt(payload) === 6) ? 'budget/income_prev' : 'budget/income'
			commit('setLoading', true)
			commit('clearError')

			let resultIncome = []
			return Api()
				.post(url, [payload])
				.then(res => {
					resultIncome = Object.values(res.data)
					commit('LOAD_INCOME', resultIncome)
					commit('setLoading', false)
					return resultIncome
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					throw err
				})
		},
		FETCH_PLANS ({ commit, getters }, payload) {
			commit('setLoading', true)
			commit('clearError')

			let resultPlans = []
			return Api()
				.post('budget/plans', [payload])
				.then(res => {
					resultPlans = Object.values(res.data)
					commit('LOAD_PLANS', resultPlans)
					commit('setLoading', false)
					return resultPlans
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					throw err
				})
		},
		FETCH_FACT ({ commit, getters }, payload) {
			commit('setLoading', true)
			commit('clearError')

			let resultFact = []
			return Api()
				.post('budget/fact', [payload])
				.then(res => {
					resultFact = Object.values(res.data)
					commit('LOAD_FACT', resultFact)
					commit('setLoading', false)
					return resultFact
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					throw err
				})
		},
		ADD_BUDGET ({ commit, getters }, payload) {
			commit('setLoading', true)
			commit('clearError')

			return Api()
				.post('deals/add_budget', payload)
				.then(res => {
					commit('setLoading', false)
					return res.data
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					throw err
				})
		},
		DELETE_DEBIT ({ commit, getters }, payload) {
			commit('setLoading', true)
			commit('clearError')

			return Api()
				.post('deals/delete_debit', payload)
				.then(res => {
					commit('setLoading', false)
					return res.data
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					throw err
				})
		},
		DEBIT_DONE ({ commit, getters }, payload) {
			commit('setLoading', true)
			commit('clearError')

			let done = {}
			Object.entries(payload).forEach(item => {
				if (item[0] === 'zp_done' ||
					item[0] === 'zakupka_done' ||
					item[0] === 'credit_done' ||
					item[0] === 'other_done' ||
					item[0] === 'bill_1c' ||
					item[0] === 'responsible' ||
					item[0] === 'date'
				) {
					done[item[0]] = item[1]
				}
			})
			return Api()
				.post('deals/debit_done', done)
				.then(res => {
					commit('setLoading', false)
					commit('DEBIT_DONE', payload)
					return res.data
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					throw err
				})
		},
		FETCH_PAYS ({ commit, getters }, payload) {
			commit('setLoading', true)
			commit('clearError')

			let resultPays = []
			return Api()
				.get('budget/pays')
				.then(res => {
					resultPays = Object.values(res.data)
					commit('LOAD_PAYS', resultPays)
					commit('setLoading', false)
					return resultPays
				})
				.catch(err => {
					commit('setLoading', false)
					commit('setError', err.messsage)
					throw err
				})
		}
	},
	getters: {
		Deals: (state) => state.Deals,
		DealsNoBills: (state) => state.DealsNoBills,
		Weeks: (state) => state.Weeks,
		Budget: (state) => state.Budget,
		BudgetPrev: (state) => state.BudgetPrev,
		Income: (state) => state.Income,
		Plans: (state) => state.Plans,
		Fact: (state) => state.Fact,
		Pays: (state) => state.Pays
	}
}
