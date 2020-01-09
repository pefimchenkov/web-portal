import Api from '@/services/Api'

class TechProperty {
	constructor(name) {
		this.name = name
		this.parent_id = null
	}
}
class TechPropertyType {
	constructor(types) {
		this.types = types
	}
}
class TechPropertyValue {
	constructor(name, parent_id) {
		this.name = name
		this.parent_id = parent_id
	}
}

export default {
	state: {
		TechProperties: [],
		TechPropertiesValues: [],
		TechPropertiesFit: []
	},
	mutations: {
		createTechProperties(state, payload) {
			if (payload.types && payload.types.length > 0) {
				payload.types = payload.types.map(item => {
					return item.name
				})
				payload.types = payload.types.join(', ')
			}
			state.TechProperties.push(payload)
		},
		createTechPropertiesValues(state, payload) {
			state.TechPropertiesValues.push(payload)
		},
		updateTechProperty(state, payload) {
			if (payload.parent_id) {
				const PropertyValue = state.TechPropertiesValues.find(prop => {
					return (prop.id === payload.id)
				})
				PropertyValue.name = payload.name
			} else {
				const Property = state.TechProperties.find(prop => {
					return (prop.id === payload.id)
				})
				Property.name = payload.name
				payload.types = payload.types.map(item => {
					return item.name
				})
				Property.types = payload.types.join(', ')
			}

		},
		deleteTechProperties(state, payload) {
			const index = state.TechProperties.indexOf(payload)
			state.TechProperties.splice(index, 1)
		},
		deleteTechPropertiesValues(state, payload) {
			const index = state.TechPropertiesValues.indexOf(payload)
			state.TechPropertiesValues.splice(index, 1)
		},
		loadTechProperties(state, payload) {
			state.TechProperties = payload
		},
		loadTechPropertiesValues(state, payload) {
			state.TechPropertiesValues = payload
		},
		loadTechPropertiesFit(state, payload) {
			state.TechPropertiesFit = payload
		}
	},
	actions: {
		async createTechPropertyValue({ commit, getters }, payload) {
			commit('clearError')
			commit('setLoading', true)
			try {
				const newTechPropertyValue = new TechPropertyValue(
					payload.name,
					payload.parent_id
				)
				Api()
					.post('/tech_properties/add_tech_property_value', newTechPropertyValue)
					.then(res => {
						try {
							commit('createTechPropertiesValues', {
								...newTechPropertyValue,
								id: res.data.insertId
							})
						} catch (error) {
							commit('setError', error.message)
							commit('setLoading', false)
							throw error
						}
						commit('setLoading', false)
					})
					.catch(error => {
						if (error) throw error
					})
			} catch (error) {
				if (error) throw error
			}
		},
		async createTechProperty({ commit, getters }, payload) {
			commit('clearError')
			commit('setLoading', true)
			try {
				const newTechProperty = new TechProperty(
					payload.name
				)
				const newTechPropertyType = new TechPropertyType(
					payload.types
				)
				newTechPropertyType.types && newTechPropertyType.types.length > 0 ? newTechProperty.types = newTechPropertyType.types : newTechProperty
				Api()
					.post('/tech_properties/add_tech_property',
						newTechProperty
					)
					.then(res => {
							try {
								commit('createTechProperties', {
									...newTechProperty,
									id: res.data.insertId
								})
							} catch (error) {
								commit('setError', error.message)
								commit('setLoading', false)
								throw error
							}
							commit('setLoading', false)
					})
					.catch(error => {
						if (error) throw error
					})
			} catch (error) {
				if (error) throw error
			}
		},
		async updateTechProperty({ commit, dispatch, getters }, payload) {
			commit('clearError')
			commit('setLoading', true)
			try {
				Api()
					.post('/tech_properties/update_tech_property', payload)
					.then((res) => {
						try {
							commit('updateTechProperty', payload)
							dispatch('fetchTechPropertiesTypes', payload.id)
								.then(res => {
									commit('setLoading', false)
								})
						} catch (error) {
							commit('setError', error.message)
							commit('setLoading', false)
							throw error
						}
					})
					.catch(error => {
						if (error) throw error
					})
			} catch (error) {
				if (error) throw error
			}
		},
		async deleteTechProperty({ commit, getters }, payload) {
			commit('clearError')
			Api()
				.post('tech_properties/delete_tech_property', [payload.id])
				.then(res => {
					commit('deleteTechProperties', payload)
					commit('setData', res.data.text)
				})
				.catch(error => {
					commit('setLoading', false)
					commit('setError', error.message)
				})
		},
		async deleteTechPropertyValue({ commit, getters }, payload) {
			commit('clearError')
			Api()
				.post('tech_properties/delete_tech_property_value', [payload.id])
				.then(res => {
					commit('deleteTechPropertiesValues', payload)
					commit('setData', res.data.text)
				})
				.catch(error => {
					commit('setLoading', false)
					commit('setError', error.message)
				})
		},
		fetchTechProperties({ commit, getters }) {
			commit('clearError')

			let resultTechProperties = []
			return  Api()
				.get('tech_properties')
				.then(res => {
					resultTechProperties = Object.values(res.data)
					commit('loadTechProperties', resultTechProperties)
					return resultTechProperties
				})
				.catch(err => {
					commit('setError', error.messsage)
					throw err
				})
		},
		 fetchTechPropertiesValues({ commit, getters }) {
			commit('clearError')

			let resultTechPropertiesValues = []
			return Api()
				.get('tech_properties_values')
				.then(res => {
					resultTechPropertiesValues = Object.values(res.data)
					commit('loadTechPropertiesValues', resultTechPropertiesValues)
					return resultTechPropertiesValues
				})
				.catch(err => {
					commit('setError', error.messsage)
					throw err
				})
		},
		fetchTechPropertiesFit({ commit, getters }) {
			commit('clearError')

			let resultTechPropertiesFit = []
			return Api()
				.get('tech_properties_fit')
				.then(res => {
					resultTechPropertiesFit = Object.values(res.data)
					commit('loadTechPropertiesFit', resultTechPropertiesFit)
					return resultTechPropertiesFit
				})
				.catch(err => {
					commit('setError', error.messsage)
					throw err
				})
		},
		 fetchTechPropertiesTypes({ commit, getters }, payload) {
			let resultTypes = []
			return Api()
				.post('tech_properties/types', [payload])
				.then(res => {
					return Object.values(res.data)
				})
				.catch(err => {
					commit('setError', error.messsage)
					throw err
				})
		},
		checkUseTypeInProp({ commit, getters }, payload) {
			return Api()
				.post('tech_properties/check_use_type_in_prop', payload)
				.then(res => {
					return Object.values(res.data)
				})
				.catch(err => {
					commit('setError', error.messsage)
					throw err
				})
		},
		checkUseValueInProp({ commit, getters }, payload) {
			console.log(payload)
			return Api()
				.post('tech_properties/check_use_value_in_prop', payload)
				.then(res => {
					return Object.values(res.data)
				})
				.catch(err => {
					commit('setError', error.messsage)
					throw err
				})
		}
	},
	getters: {
		techProperties(state) {
			return state.TechProperties
		},
		techPropertiesValues(state) {
			return state.TechPropertiesValues
		},
		techPropertiesFit(state) {
			return state.TechPropertiesFit
		}
	}
}
