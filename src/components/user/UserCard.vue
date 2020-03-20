<template>
	<v-container fluid v-if='currentUser' class='elevation-1 grey lighten-5 ma-auto'>
	  	<v-toolbar flat color="primary lighten-2" class="mb-3" dark>
      		<v-toolbar-title>Профиль пользователя</v-toolbar-title>
    	</v-toolbar>
			<v-tabs vertical v-model="activeTab" class="vertical-tabs" slider-size="3">

				<v-tab href="#tab-data">
				<v-icon left>mdi-information-variant</v-icon>
					Инфо
				</v-tab>
				<v-tab href="#tab-info">
					<v-icon left>mdi-pencil</v-icon>
					Ред. инфо
				</v-tab>
				<v-tab href="#tab-bonus">
					<v-icon left>mdi-cash-multiple</v-icon>
					Бонусы
				</v-tab>
				<v-tab href="#tab-filters">
					<v-icon left>mdi-filter</v-icon>
					Фильтры
				</v-tab>

				<v-tabs-slider></v-tabs-slider>

				<v-tab-item :value="'tab-data'" class="ml-10">
					<v-card class="mx-auto" outlined>
						<v-skeleton-loader
							v-if="!Position"
							ref="skeleton"
							type="list-item-avatar-three-line"
							class="mx-auto"
							tile
						></v-skeleton-loader>
						<v-row v-else class="ma-auto">
							<v-col class="text-center" xs="12" sm="12" md="4" lg="4" xl="4">
								<v-avatar size='300' tile>
									<v-img v-if='Photo' class='img' :src='Photo' contain></v-img>
									<v-img v-else class='img' :src='cardUserImage' contain></v-img>
								</v-avatar>
							</v-col>
							<v-col xs="12" sm="12" md="8" lg="8" xl="8">
								<v-row>
									<v-col>
										<v-list>
											<div class='ma-4'><b>ФИО: </b> {{ Name || 'не заполнено'}}</div>
											<v-divider></v-divider>
											<div class='ma-4'><b>Должность: </b>  {{ Position || 'не заполнено'}}</div>
											<v-divider></v-divider>
											<div class='ma-4'><b>Компания: </b>  {{ Company  || 'не заполнено' }}</div>
											<v-divider></v-divider>
										</v-list>
									</v-col>
									<v-col>
										<v-list>
											<div class='ma-4'><b>Email: </b>  {{ Email  || 'не заполнено' }}</div>
											<v-divider></v-divider>
											<div class='ma-4'><b>Телефон: </b>  {{ Phone  || 'не заполнено' }}</div>
											<v-divider></v-divider>
											<div class='ma-4'><b>Роль: </b>  {{ UserRole  || 'не известно' }}</div>
											<v-divider></v-divider>
										</v-list>
									</v-col>
								</v-row>
								<v-row>
									<v-col>
										<div class='ma-4'><b>О себе: </b>  {{ AboutMe  || 'не заполнено' }}</div>
											<v-divider></v-divider>
									</v-col>
								</v-row>
							</v-col>
						</v-row>
						<v-row>
							<input
								ref='fileInput'
								type='file'
								style='display:none'
								accept='image/*'
								@change='onFileChange'
							>
							<v-col class='text-center ma-auto'>
								<v-btn v-if='image === null' @click='triggerUpload' :loading='localloading' :disabled='localloading' class='success'>Загрузить фото</v-btn>
								<v-btn v-else @click='uploadPhoto' :loading='localloading' :disabled='localloading' class='success'>Сохранить</v-btn>
							</v-col>
						</v-row>
					</v-card>
				</v-tab-item>

				<v-tab-item :value="`tab-info`" class="ml-10">
					<EditProfile />
				</v-tab-item>

				<v-tab-item :value="'tab-bonus'" class="ml-10">
					<Bonus></Bonus>
				</v-tab-item>

				<v-tab-item :value="'tab-filters'" class="ml-10">
					<v-card outlined>
					<v-treeview
						:items='items'
						:active.sync='active'
						:open.sync="open"
						activatable
						:load-children="getFiltersName"
						hoverable
						active-class='success--text'
						class='pa-2'
						open-on-click
					>
						<template slot="label" slot-scope="props">
							<v-icon
								:color="active ? 'success' : ''"
								>
								{{ props.item.icon }}
							</v-icon>
							<v-icon :color="props.item.share ? 'green' : 'grey'"
									v-if="props.item.deletable"
									@click="setFilterShare($event, props.item.name )"
							>
								mdi-share-variant
							</v-icon>
							<v-icon
								v-if="props.item.deletable"
								@click="delFilter( props.item.name )"
							>
								mdi-delete-forever
							</v-icon>
							<span v-if="props.item.deletable" @click="routeToMyFilter(props.item.name)">{{ props.item.name }}</span>
							<span v-else>{{ props.item.name }}</span>
						</template>
					</v-treeview>
					<v-treeview
						:items='sharedItems'
						:active.sync='activeShare'
						:open.sync="openShare"
						activatable
						:load-children="getSharedFiltersName"
						hoverable
						active-class='success--text'
						class='pa-2'
						open-on-click
					>
						<template slot="label" slot-scope="props">
							<v-icon
								:color="activeShare ? 'success' : ''"
							>
								{{ props.item.icon }}
							</v-icon>
							<span @click="routeToSharedFilter( props.item.name, props.item.user, props.item.key, props.item.payload )">{{ props.item.name }}</span>
						</template>
					</v-treeview>
					</v-card>
				</v-tab-item>
			</v-tabs>
	</v-container>
  	<v-container fluid v-else>
      <v-layout row>
        <v-flex xs12 class='text-center pt-5'>
          <v-progress-circular :size='100' color='primary' indeterminate></v-progress-circular>
        </v-flex>
      </v-layout>
  	</v-container>
</template>
<script>

import EditProfile from './EditProfileForm'
import Bonus from './bonus/index.vue'

import fb from 'firebase/app'

import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/storage'

// import { eventBus } from '../../main.js'
import GetConfig from '@/services/GetConfig'
import _ from 'lodash'

import { mapState } from 'vuex'

const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const Cryptr = require('cryptr')
const cryptr = new Cryptr('myTotalySecretKey')

export default {
	name: 'user-card',
	components: {
		EditProfile,
		Bonus
	},
	props: {
		cardUserImage: {
			type: String,
			default: require('@/assets/img/users/noname.png')
		}
	},
	data () {
		return {
			data: [],
			activeTab: 'tab-data',
			active: [1111],
			activeShare: [],
			filterNames: [],
			sharedFilterNames: [],
			colorShare: '',
			nameShare: '',
			open: [],
			openShare: [],
			Filters: [],
			SharedFilters: [],
			item: null,
			UserName: '',
			UserRole: '',
			formData: new FormData(),
			image: null,
			imageSRC: null,
			show: false,
			localloading: false
		}
	},
	computed: {
		...mapState({
			info: state => state.user.info
		}),
		currentUser () {
			return this.$store.getters.currentUser
		},
		Name () {
			return this.currentUser.providerData[0].displayName
		},
		Company () {
			return this.info.company
		},
		Position () {
			return this.info.position
		},
		Photo () {
			return this.currentUser.providerData[0].photoURL
		},
		Email () {
			return this.currentUser.providerData[0].email
		},
		Phone () {
			return this.info.phone
		},
		AboutMe () {
			return this.info.aboutme
		},
		items () {
			return [
				{ id: 1000, name: 'Фильтры', icon: 'info', linkLess: true },
				{ id: 1001, name: 'Мои фильтры', children: this.filterNames, icon: 'filter_list', linkLess: true }
			]
		},
		sharedItems () {
			return [{ id: 2002, name: 'Общие фильтры', children: this.sharedFilterNames, icon: 'filter_list', linkLess: true }]
		}
	},
	methods: {

		triggerUpload () {
			this.$refs.fileInput.click()
		},
		onFileChange (event) {
			const file = event.target.files[0]
			if (file.size > 2048 * 2048) {
				event.preventDefault()
				this.$store.dispatch('setError', 'Размер файла превышает допустимый порог в 4 МБ!')
				return
			} else if (!file.type.match('image.*')) {
				event.preventDefault()
				this.$store.dispatch('setError', 'Выбранный файл не является изображением!')
				return
			}
			const reader = new FileReader()
			reader.onload = e => {
				this.imageSRC = reader.result
			}
			reader.readAsDataURL(file)
			this.image = file
			this.formData.append('id', this.ID)
			this.formData.append('image', this.image)
		},
		async uploadPhoto () {
			const user = fb.auth().currentUser
			if (this.imageSRC) {
				this.show = true
				const imageExt = this.image.name.slice(this.image.name.lastIndexOf('.'))
				this.localloading = true
				const imageSRC = await fb
					.storage()
					.ref(`users/photos/${user.uid}.${imageExt}`)
					.put(this.image)
					.then(snapshot => {
						return snapshot.ref.getDownloadURL()
					})
				await user.updateProfile({
					photoURL: imageSRC
				})
					.then(() => {
						this.$store.dispatch('setData', 'Фото успешно сохранено!')
						this.localloading = false
						this.image = null
					})
					.catch(function (error) {
						if (error) {
							this.$store.dispatch('setError', error.message)
						}
					})
				this.imageSRC = imageSRC
			}
		},
		async getSharedFiltersName (item) {
			await pause(1000)
			return new Promise((resolve, reject) => {
				resolve(this.SharedFilters)
			})
				.then(json => {
					item.children.push(...json)
				})
				.catch(err => console.warn(err))
		},
		async getFiltersName (item) {
			await pause(1000)
			return new Promise((resolve, reject) => {
				resolve(this.Filters)
			})
				.then(json => {
					item.children.push(...json)
				})
				.catch(err => console.warn(err))
		},
		routeToMyFilter (name) {
			this.Filters.forEach(filter => {
				for (var obj of filter.children) {
					if (obj.name === name) {
						var filterName = filter.name
					}
				}
				if (filterName === 'Маркет') {
					this.$router.push({ path: '/zip_prices/', query: { market: name } })
				}
				if (filterName === 'ЗИП') {
					this.$router.push({ path: '/zip/', query: { zip: name } })
				}
			})
		},
		routeToSharedFilter (filterName, userID, key, payload) {
			if (key === 'Маркет') {
				this.$router.push({ path: '/zip_prices/', query: { userID: userID, filterName: filterName, payload: payload } })
			}
			if (key === 'ЗИП') {
				this.$router.push({ path: '/zip/', query: { userID: userID, filterName: filterName, payload: payload } })
			}
		},
		delFilter (name) {
			if (confirm('Вы уверены, что хотите удалить этот Фильтр?')) {
				this.Filters.forEach(filter => {
					filter.children.forEach(async child => {
						if (child.name === name) {
							delete filter.children[filter.children.indexOf(child)]
							let payload = { childName: name, filterName: filter.name }
							this.$store.dispatch('delFilter', payload)
								.then(() => {
									this.$store.commit('setData', 'Удаление прошло успешно!')
								})
						}
					})
				})
			} else {
				this.$store.commit('setLoading', false)
				this.$store.commit('setInfo', 'Удаление отменено')
			}
		},
		async setFilterShare (e, name) {
			const id = await parentName(this.Filters)
			this.$store.dispatch('setFilterShare', { id, name })
				.then((result) => {
					this.$store.commit('setInfo', result.shareStatus ? 'Общий доступ для фильтра "' + result.name + '" установлен.' : 'Общий доступ для фильтра "' + result.name + '" снят.')
					if (result.shareStatus) {
						e.target.classList.add('greenClass')
						e.target.classList.remove('greyClass')
					} else {
						e.target.classList.add('greyClass')
						e.target.classList.remove('greenClass')
					}
				})
			function parentName (arr) {
				return new Promise((resolve, reject) => {
					arr.forEach(filter => {
						if (!_.isEmpty(_.pickBy(filter.children, val => val.name === name.toString()))) {
							return resolve(filter.name)
						}
					})
				})
			}
		}
		/* async fetchUsers (item) {
			await pause(1500)
			return fetch('https://jsonplaceholder.typicode.com/users')
			.then(res => res.json())
			.then(json => {
				item.children.push(...json)
				console.log(item.children)
			})
			.catch(err => console.warn(err))
		} */
	},

	async created () {
		await GetConfig.getMyFilters()
			.then((filters) => {
				if (filters && filters !== null) {
					Object.entries(filters).forEach((filter, index) => {
						let obj = []
						Object.entries(filter[1]).forEach((entry) => {
							obj.push({ 'id': Math.ceil(Math.random() * 10000), 'name': entry[0], 'deletable': true, 'share': entry[1].Share })
						})
						this.Filters.push({ 'id': Math.ceil(Math.random() * 10000), 'name': filter[0], 'children': obj })
					})
				} else {
					return false
				}
			})
			.catch(error => {
				this.$store.dispatch('setError', error)
				this.$store.dispatch('setLoader', false)
			})
		await GetConfig.getSharedFilterNames()
			.then((users) => {
				const hasFilters = _.filter(users, 'filters')
				var arr = []
				hasFilters.forEach((obj, index) => {
					var SF = {
						id: null,
						name: '(' + index + ')',
						children: []
					}
					SF['id'] = Math.ceil(Math.random() * 22222)
					if (obj.info && obj.info.lastname) {
						SF['name'] = obj.info.lastname
					} else if (obj.info && !obj.info.lastname && obj.info.emailaddress) {
						SF['name'] = obj.info.emailaddress
					} else {
						SF['name'] += ' не заполнено'
					}
					for (var key in obj.filters) {
						_.forIn(obj.filters[key], function (v, k) {
							if (v.Share === true) {
								arr.push({ 'id': Math.ceil(Math.random() * 22222), 'name': k, 'user': SF['name'], 'key': key, 'payload': v })
							}
						})
					}
					SF['children'] = arr.filter(f => f.user === SF['name'])
					if (SF['children'].length !== 0) {
						this.SharedFilters.push(SF)
					}
				})
			})
			.then(() => {
				this.$store.dispatch('getUserInfo')
			})
	},
	async mounted () {
		this.UserRole = cryptr.decrypt(sessionStorage.getItem('UserRole'))
		switch (this.UserRole) {
		case 'user': this.UserRole = 'Пользователь'; break
		case 'admin': this.UserRole = 'Администратор'; break
		case 'user&engineer': this.UserRole = 'Инженер'; break
		default: { this.UserRole = '' }
		}
	}
}
</script>
<style scouped>
.cursor {
	cursor: pointer;
}
.cursor:hover {
	background-color: #f5f5f5;
}
.align_center {
	width: 100%;
}
.v-treeview-node__label {
	font-size: 1em !important;
}
.wdt {
	max-width: 300px;
}
.greenClass {
	color: #4caf50 !important;
}
.greyClass {
	color: grey !important;
}
.vertical-tabs [role="tab"] {
	justify-content: flex-start;
}
.v-tab--active {
	background-color: #e8e8e8e8 !important;
}
</style>
