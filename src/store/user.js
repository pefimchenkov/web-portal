// just import firebase
import fb from 'firebase/app'

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
