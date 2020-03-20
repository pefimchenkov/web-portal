// just import firebase
import fb from 'firebase/app'

import { getBonusSale, getBonusSaleSum, getBonusProfit, getBonusProfitSum, getUsersWithBonus } from '@/api/user'

// import package
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/storage'

const Cryptr = require('cryptr')
const cryptr = new Cryptr('myTotalySecretKey')

class User {
	constructor(id) {
		this.id = id
	}
}

export default {
	state: {
		user: null,
		currentUser: null,
		id: null,
		userRole: '',
		BonusSale: [],
		BonusProfit: [],
		BonusSaleSum: {},
		BonusProfitSum: {},
		UsersWithBonus: [],
		info: {
			firstname: '',
			lastname: '',
			company: '',
			position: '',
			country: '',
			city: '',
			address: '',
			email: '',
			phone: '',
			aboutme: ''
		}
	},
	mutations: {
		setUser(state, payload) {
			state.user = payload
		},
		setCurrentUser(state, payload) {
			state.currentUser = payload
		},
		getUserRole(state, payload) {
			state.userRole = payload
		},
		setUserInfo(state, payload) {
			state.info = payload
		},
		CHANGE_INFO: (state, { key, value }) => {
			if (state.info.hasOwnProperty(key)) {
				state.info[key] = value
			}
		},
		GET_BONUS_SALE(state, payload) {
			state.BonusSale = payload
		},
		GET_BONUS_SALE_SUM(state, payload) {
			state.BonusSaleSum = payload
		},
		GET_BONUS_PROFIT(state, payload) {
			state.BonusProfit = payload
		},
		GET_BONUS_PROFIT_SUM(state, payload) {
			state.BonusProfitSum = payload
		},
		GET_USERS_WITH_BONUS(state, payload) {
			state.UsersWithBonus = payload
		}
	},
	actions: {
		async registerUser({ commit }, { email, password }) {
			commit('clearError')
			commit('setLoading', true)
				await fb
					.auth()
					.createUserWithEmailAndPassword(email, password)
					.then(async userCredential => {
						await fb
							.database()
							.ref(`/users/${userCredential.user.uid}/config`)
							.child('userRole')
							.set('user')
					commit('setUser', new User(userCredential.user.uid))
					commit('setLoading', false)
				})
				.catch(error => {
					commit('setLoading', false)
					commit('setError', error.message)
					throw error
				})
		},
		async loginUser({ commit }, { email, password }) {
			commit('clearError')
			commit('setLoading', true)
			try {
				const user = await fb.auth().signInWithEmailAndPassword(email, password)
				commit('setUser', new User(user.uid))
				commit('setLoading', false)
			} catch (error) {
				commit('setLoading', false)
				commit('setError', error.message)
				throw error
			}
		},
		async getUserInfo({ commit, state }) {
			try {
				const info = await fb
					.database()
					.ref(`users`)
					.child(state.user.id)
					.child(`info`)
					.once('value')
				commit('setUserInfo', info.val())
				return info.val()
			} catch (error) {
				commit('setError', error.messsage)
				throw error
			}
		},
		async getCurrentUser ({ commit }) {
			commit('clearError')
			try {
				const currentUser = await fb.auth().currentUser
				commit('setCurrentUser', currentUser)
				return currentUser
			} catch (error) {
				commit('setError', error.messsage)
				throw error
			}
		},
		async getUserRole({ commit, getters }, user) {
			commit('clearError')
			try {
				const userRole = await fb
					.database()
					.ref(`/users/${user.uid}/config`)
					.child('userRole')
					.once('value')
				commit('getUserRole', userRole.val() !== null ? userRole.val() : 'public')
				const encryptedString = cryptr.encrypt(userRole.val())
				sessionStorage.setItem('UserRole', encryptedString)
			} catch (error) {
				commit('setError', error.messsage)
				throw error
			}
		},
		changeInfo({ commit }, data) {
			commit('CHANGE_INFO', data)
		},
		async updateInfo({ commit, state }) {
			const user = fb.auth().currentUser
			await fb
				.database()
				.ref(`users`)
				.child(user.uid)
				.child(`info`)
				.update(state.info)
			await user.updateProfile({
				displayName: state.info.lastname + ' ' + state.info.firstname
			})
		},
		setUserEmail({ commit, getters }, email) {
			commit('clearError')
			return new Promise((resolve, reject) => {
				try {
					fb
						.database()
						.ref(`/users/${getters.user.id}/info`)
						.child('emailaddress')
						.set(email)
					resolve(email)
				} catch (error) {
					commit('setError', error.messsage)
					throw error
				}
			})
		},
		getBonusSale({ getters, commit }, email) {
			console.log(email)
			return new Promise((resolve, reject) => {
				getBonusSale().
					then(response => {
						response.forEach(item => {
							item.doc_date = new Date(item.doc_date).toLocaleDateString('ru')
							item.HeadManager && item.HeadManager === email ? item.hmp = item.hmp : item.hmp = 0
							item.Manager && item.Manager === email ? item.mp = item.mp : item.mp = 0
							item.LocalManager && item.LocalManager === email ? item.lmp = item.lmp : item.lmp = 0
							item.LocalManager && item.LocalManager === email ? item.lmpX = item.lmpX : item.lmpX = 0
						})
						commit('GET_BONUS_SALE', response)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		getBonusSaleSum({ commit, state }, payload) {
			state.BonusSaleSum = {}
			commit('setLoading', true)
			return new Promise((resolve, reject) => {
				getBonusSaleSum(payload).
					then(response => {
						commit('GET_BONUS_SALE_SUM', response)
						commit('setLoading', false)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		getBonusProfit({ getters, commit }, email) {
			return new Promise((resolve, reject) => {
				getBonusProfit().
					then(response => {
						response.forEach(item => {
							item.doc_date = new Date(item.doc_date).toLocaleDateString('ru')
							item.HeadManager && item.HeadManager === email ? item.hmp = item.hmp : item.hmp = 0
							item.Manager && item.Manager === email ? item.mp = item.mp : item.mp = 0
							item.LocalManager && item.LocalManager === email ? item.lmp = item.lmp : item.lmp = 0
							item.lmpX === -1 ? item.lmpX = item.hmp + item.mp + item.lmp : item.lmpX
						})
						commit('GET_BONUS_PROFIT', response)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		getBonusProfitSum({ commit, state }, payload) {
			state.BonusProfitSum = {}
			commit('setLoading', true)
			return new Promise((resolve, reject) => {
				getBonusProfitSum(payload).
					then(response => {
						commit('GET_BONUS_PROFIT_SUM', response)
						commit('setLoading', false)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		getUsersWithBonus({ commit }) {
			return new Promise((resolve, reject) => {
				getUsersWithBonus().
					then(response => {
						commit('GET_USERS_WITH_BONUS', response)
						resolve()
					}).catch(error => {
						reject(error)
					})
			})
		},
		autoLoginUser({ commit }, payload) {
			commit('setUser', new User(payload.uid))
		},
		LogoutUser({ commit }) {
			fb.auth().signOut()
			commit('setUser', null)
		}
	},
	getters: {
		user(state) {
			return state.user
		},
		userRole(state) {
			return state.userRole
		},
		isUserLoggedIn(state) {
			return state.user !== null
		},
		currentUser(state) {
			return state.currentUser
		}
	}
}
