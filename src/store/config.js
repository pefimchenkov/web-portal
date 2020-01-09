// just import firebase
import fb from 'firebase/app'

// import package
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/storage'

import _ from 'lodash'

export default {
	state: {
		ls: '',
		filters: []
	},
	mutations: {
		loadLocalStorage(state, payload) {
			state.ls = payload
		},
		loadFilters(state, payload) {
			state.filters = payload
		}
	},
	actions: {
		async createLocalStorage({ commit, getters }, payload) {
			const obj = {}
			obj[payload[1]] = payload[0]
			try {
				commit('clearError')
				await fb
					.database()
					.ref(`/users/${getters.user.id}/config`)
					.update(obj)
				if (localStorage.getItem(payload[1])) {
					localStorage.removeItem(payload[1])
				}
				localStorage.setItem(payload[1], JSON.stringify(payload[0]))
			} catch (error) {
				commit('setError', error.messsage)
				throw error
			}
		},
		fetchLocalStorage({ commit, getters }, user) {
			commit('setLoading', true)
			commit('clearError')
			try {
				return fb
					.database()
					.ref(`/users/${user.uid}/config/`)
					.once('value')
					.then((res => {
						commit('loadLocalStorage', res.val())
						return res.val()
					}))

			} catch (error) {
				commit('setLoading', false)
				commit('setError', error.messsage)
				throw error
			}
		},
		async createFilter({commit, getters }, payload) {
			commit('clearError')
			commit('setLoading', true)
			console.log(payload)
			const filterName = payload[0]
			const filterID = payload[1]
			const filterData = payload[2].Data
			const filterColumns = payload[2].Columns
			let filterDataName = ''
			let filterColumnsName = ''
			Object.keys(payload[2]).forEach(key => {
				if (key === 'Data') {
					filterDataName = key
				}
				if (key === 'Columns') {
					filterColumnsName = key
				}
			})

			try {
				await fb
					.database()
					.ref(`/users/${getters.user.id}/filters/` + filterID + '/' + filterName)
					.child(filterDataName)
					.set(filterData)
				await fb
					.database()
					.ref(`/users/${getters.user.id}/filters/` + filterID + '/' + filterName)
					.child(filterColumnsName)
					.set(filterColumns)
				await commit('setLoading', true)
				await commit('setData', 'Фильтр успешно сохранён!!!')
			} catch (error) {
				commit('setError', error.messsage)
				throw error
			}
		},
		async fetchFilters({ commit, getters }, user) {
			commit('setLoading', true)
			commit('clearError')
			try {
				await fb
					.database()
					.ref(`/users/${user.uid}`)
					.child('filters')
					.once('value')
					.then(snapshot => {
						commit('loadFilters', snapshot.val())
						commit('setLoading', false)
					})
			} catch (error) {
				commit('setLoading', false)
				commit('setError', error.messsage)
				throw error
			}
		},
		delFilter({ commit, getters }, payload) {
			commit('setLoading', true)
			commit('clearError')
			console.log(payload)
			return new Promise((resolve, reject) => {
				try {
					const data = fb
						.database()
						.ref(`/users/${getters.user.id}`)
						.child(`filters/${payload.filterName}`)
						.child(payload.childName)
						.remove()
					resolve(data)
				} catch (error) {
					commit('setLoading', false)
					commit('setError', error.messsage)
					reject(error)
					throw error
				}
			})
		},
		setFilterShare({ commit, getters }, payload) {
			commit('setLoading', true)
			commit('clearError')
			var id = payload.id
			var name = payload.name
			var iconColor = ''
			var shareStatus = true
			const ref = fb.database().ref(`/users/${getters.user.id}`).child(`filters/${id}`).child(name)
			return new Promise((resolve, reject) => {
				try {
					ref
						.once('value')
						.then(snapshot => {
							if (!snapshot.val().Share) {
								ref.child('Share').set(true)
								iconColor = 'green'
							} else if (snapshot.val().Share === true) {
								ref.update({ Share: false })
								iconColor = 'grey'
								shareStatus = false
							} else {
								ref.update({ Share: true })
								iconColor = 'green'
							}
							resolve({ name: name, iconColor: iconColor, shareStatus: shareStatus })
						})
				} catch (error) {
					commit('setLoading', false)
					commit('setError', error.messsage)
					reject(error)
					throw error
				}
			})
		},
		getSharedFilterNames({ commit, getters }) {
			const ref = fb.database().ref(`/users`)
			return new Promise((resolve, reject) => {
				try {
					ref.once('value')
					.then((snapshot) => {
						resolve(snapshot.val())
					})
				} catch (error) {
					commit('setLoading', false)
					commit('setError', error.messsage)
					reject(error)
					throw error
				}
			})
		}
	},
	getters: {
		ls(state) {
			return state.ls
		},
		filters(state) {
			return state.filters
		}
	}
};
