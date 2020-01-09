<template>
  <v-card v-if='data.length !== 0' class='elevation-3'>
	  <v-card-title secondary-title class='blue lighten-2 white--text headline'>
		  <h3 class='headline font-weight-regula text-sm-center align_center'>Карточка пользователя</h3>
	  </v-card-title>
	<v-layout row wrap>
	<v-flex pa-3 xs12 sm12 md12 lg6 xl6>
		<v-card flat>
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
				<span v-if="props.item.deletable" @click="routeToMyFilter( props.item.name )">{{ props.item.name }}</span>
				<span v-else>{{ props.item.name }}</span>
           </template>
		</v-treeview>
		</v-card>
		<v-card flat>
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
	</v-flex>
	<v-flex pa-3 xs12 sm12 md12 lg6 xl6>
	<v-card>
	<v-layout row wrap>
		<v-flex pr-4 pl-1 xs4 sm4 md4 lg5 xl5>
			<v-avatar size='150px' tile>
				<v-img v-if='imageSRC' class='img' :src='imageSRC' contain></v-img>
    			<v-img v-else class='img' :src='cardUserImage' contain></v-img>
    		</v-avatar>
		</v-flex>
		<v-flex xs8 sm8 md8 lg7 xl7>
			<v-card-text>
				<h5 class='ma-2'>Должность:  {{ Position || 'не заполнено'}}</h5>
				<v-divider></v-divider>
				<h4 class='ma-2'>Имя (Фамилия): {{ UserName }}</h4>
				<v-divider></v-divider>
				<h5 class='ma-2'>Компания: {{ Company }}</h5>
				<v-divider></v-divider>
				<p class='ma-2'>
					{{ AboutMe }}
				</p>
				<v-divider></v-divider>
			</v-card-text>
		</v-flex>
		<v-flex xs10 offset-xs1>
				<v-list>
					<v-list-item
						v-for='(item, index) in data'
						:key='index'
					>
					<b>{{ item.split(':')[0] }}</b>: {{ item.split(':')[0] === 'Телефон' ? Phone : item.split(':')[1] }}
					</v-list-item>
					<v-list-item>
						<b>Роль:&nbsp;</b>{{UserRole }}
					</v-list-item>
				</v-list>
		</v-flex>
		<input
		ref='fileInput'
		type='file'
		style='display:none'
		accept='image/*'
		@change='onFileChange'
		>
		<v-flex xs12 sm12 md12 lg12 class='text-center mb-2'>
			<v-btn v-if='image === null' @click='triggerUpload' :loading='localloading' :disabled='localloading' class='success'>Загрузить фото</v-btn>
			<v-btn v-else @click='uploadPhoto' :loading='localloading' :disabled='localloading' class='success'>Сохранить</v-btn>
		</v-flex>
		<v-flex>
		<v-btn v-if="$acl.check('isAdmin')" @click="$acl.change('user')">
  			я админ
		</v-btn>
		</v-flex>
	</v-layout>
	</v-card>
	</v-flex>
	</v-layout>
	</v-card>
  <div v-else>
      <v-layout row>
        <v-flex xs12 class='text-center pt-5'>
          <v-progress-circular :size='80' color='primary' indeterminate></v-progress-circular>
        </v-flex>
      </v-layout>
    </div>
</template>
<script>
import fb from 'firebase/app'

import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/storage'

import { eventBus } from '../../main.js'
import GetConfig from '@/services/GetConfig'
import _ from 'lodash'
// import store from '../store'

const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const Cryptr = require('cryptr')
const cryptr = new Cryptr('myTotalySecretKey')

export default {
	name: 'user-card',
	props: {
		cardUserImage: {
			type: String,
			default: require('@/assets/img/users/noname.png')
		}
	},
	data () {
		return {
			data: [],
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
			AboutMe: '',
			Position: '',
			Phone: '',
			Company: '',
			UserRole: '',
			formData: new FormData(),
			image: null,
			imageSRC: null,
			show: false,
			localloading: false
		}
	},
	methods: {
		async getData (user) {
			if (user != null) {
				this.data = []
				const fbUserInfo = await fb
					.database()
					.ref(`users`)
					.child(user.uid)
					.child(`info`)
					.once('value')
				const info = fbUserInfo.val()
				eventBus.$emit('setInfo', info)
				await user.providerData.forEach(profile => {
					this.imageSRC = profile.photoURL
					for (var [key, value] of Object.entries(profile)) {
						if (key === 'uid') key = 'ID'
						if (key === 'displayName') {
							key = 'Имя пользователя'
							if (!value || value === null) {
								value = 'не заполнено'
							} else {
								this.UserName = info.firstname + ' ' + info.lastname
							}
						}
						if (key === 'phoneNumber') {
							key = 'Телефон'
							value = this.Phone
						}
						if (key === 'providerId') {
							key = 'Способ входа'
							value = 'email + password'
						}
						if (value === null && value === '') value = 'не заполнено'
						if (key !== 'photoURL') this.data.push(key + ': ' + value)
					}
				})
			} else {
				this.data.push('ВНИМАНИЕ: Не удалось загрузить данные!')
			}
		},
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
	computed: {
		items () {
			return [
				{
					id: 1000,
					name: 'Данные',
					icon: 'info',
					linkLess: true
				},
				{
					id: 1001,
					name: 'Мои фильтры',
					children: this.filterNames,
					icon: 'filter_list',
					linkLess: true
				}
			]
		},
		sharedItems () {
			return [
				{
					id: 2002,
					name: 'Общие фильтры',
					children: this.sharedFilterNames,
					icon: 'filter_list',
					linkLess: true
				}
			]
		}
	},
	watch: {
		/* colorShare () {
		} */
	},
	async created () {
		// fb.auth().onAuthStateChanged(user => {
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
				const user = this.$store.getters.currentUser
				this.getData(user)
			})
	},
	mounted () {
		eventBus.$on('updateUserCard', async data => {
			const user = await this.$store.getters.currentUser
			let info = {}
			await data.forEach(item => {
				if (item.name === 'lastname') {
					this.UserName = item.value
				}
				if (item.name === 'firstname') {
					this.UserName = item.value + ' ' + this.UserName
				}
				if (item.name === 'position') {
					this.Position = item.value
				}
				if (item.name === 'aboutme') {
					this.AboutMe = item.value
				}
				if (item.name === 'phone') {
					this.Phone = item.value
				}
				if (item.name === 'company') {
					this.Company = item.value
				}
				info[item.name] = item.value
			})
			await fb
				.database()
				.ref(`users`)
				.child(user.uid)
				.child(`info`)
				.update(info)
			await user.updateProfile({
				displayName: this.UserName || 'не заполнено'
			})
				.then(() => {
					this.$store.dispatch('setData', 'Профиль успешно обновлён.')
					this.getData(user)
				})
				.catch(function (error) {
					if (error) {
						this.$store.dispatch('setError', error.message)
					}
				})
		})
		eventBus.$on('setUserCard', data => {
			data.forEach(item => {
				if (item.phone) {
					this.Phone = item.phone
				}
				if (item.company) {
					this.Company = item.company
				}
				if (item.aboutme) {
					this.AboutMe = item.aboutme
				}
				if (item.position) {
					this.Position = item.position
				}
			})
		})
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
</style>
