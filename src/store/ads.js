// just import firebase
import fb from 'firebase/app'

// import package
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/storage'

class Ad {
	constructor(title, desc, ownerId, imageSRC = '', promo = false, id = null) {
		this.title = title
		this.desc = desc
		this.ownerId = ownerId
		this.imageSRC = imageSRC
		this.promo = promo
		this.id = id
	}
}

export default {
	state: {
		ads: []
	},
	mutations: {
		createAd(state, payload) {
			state.ads.push(payload)
			console.log(state.ads)
		},
		loadAds(state, payload) {
			state.ads = payload
		},
		updateAd(state, { title, desc, id }) {
			const ad = state.ads.find(a => {
				return (a.id = id)
			})
			ad.title = title
			ad.desc = desc
		}
	},
	actions: {
		async createAd({ commit, getters }, payload) {
			commit('clearError')
			commit('setLoading', true)

			const image = payload.image

			try {
				const newAd = new Ad(
					payload.title,
					payload.desc,
					getters.user.id,
					'',
					payload.promo
				)
				const ad = await fb
					.database()
					.ref('ads')
					.push(newAd)

				const imageExt = image.name.slice(image.name.lastIndexOf('.'))

				const imageSRC = await fb
					.storage()
					.ref(`ads/${ad.key}.${imageExt}`)
					.put(image)
					.then(snapshot => {
						return snapshot.ref.getDownloadURL()
					})

				await fb
					.database()
					.ref(`ads`)
					.child(ad.key)
					.update({ imageSRC })

				commit('setLoading', false)
				commit('createAd', {
					...newAd,
					id: ad.key,
					imageSRC
				})
			} catch (error) {
				commit('setError', error.message)
				commit('setLoading', false)
				throw error
			}
		},
		async fetchAds({ commit }) {
			commit('clearError')
			commit('setLoading', true)
			const resultAds = []

			try {
				const fbVal = await fb
					.database()
					.ref('ads')
					.once('value')
				const val = fbVal.val()
				Object.keys(val).forEach(key => {
					const ad = val[key]
					resultAds.push(
						new Ad(ad.title, ad.desc, ad.ownerId, ad.imageSRC, ad.promo, key)
					)
				})
				commit('loadAds', resultAds)
				commit('setLoading', false)
			} catch (error) {
				commit('setError', error.message)
				commit('setLoading', false)
				throw error
			}
		},
		async updateAd({ commit }, { title, desc, id }) {
			commit('clearError')
			commit('setLoading', true)
			try {
				await fb
					.database()
					.ref('ads')
					.child(id)
					.update({
						title,
						desc
					})
				commit('updateAd', { title, desc, id })
				commit('setLoading', false)
			} catch (error) {
				commit('setError', error.message)
				commit('setLoading', false)
				throw error
			}
		}
	},
	getters: {
		ads(state) {
			return state.ads
		},
		promoAds(state) {
			return state.ads.filter(ad => {
				return ad.promo
			})
		},
		myAds(state, getters) {
			return state.ads.filter(ad => {
				return ad.ownerId == getters.user.id
			})
		},
		adsById(state) {
			return adId => {
				return state.ads.find(ad => ad.id === adId)
			}
		}
	}
}
