import { getJiraUsers } from '@/api/jira-users'

export default {
	state: {
		JIRA_USERS: []
	},
	mutations: {
		LOAD_JIRA_USERS (state, payload) {
			state.JIRA_USERS = payload
		}
	},
	actions: {
		fetchJiraUsers ({ commit }) {
			return new Promise((resolve, reject) => {
				getJiraUsers()
					.then(response => {
						commit('LOAD_JIRA_USERS', response)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		}
	},
	getters: {
		jira_users: (state) => state.JIRA_USERS
	}
}
