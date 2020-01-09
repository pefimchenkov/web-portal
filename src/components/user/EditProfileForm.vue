<template>
		<form>
			<v-card class="elevation-3">
				<v-card-title class="blue lighten-2 white--text headline">
					<h3 class='headline font-weight-regula text-sm-center align_center'>Информация</h3>
				</v-card-title>
				<v-card-text>
					<v-layout row wrap>
						<v-flex xs4 class="px-2">
							<v-text-field label="Компания" v-model="company">
								<v-input>{{ company }}</v-input>
							</v-text-field>
							<v-text-field label="Должность" v-model="position">
								<v-input type="text">{{ position }}</v-input>
							</v-text-field>
							<v-text-field label="Телефон" v-model="phone">
								<v-input type="number">{{ phone }}</v-input>
							</v-text-field>
						</v-flex>
						<v-flex xs4 flexbox class="px-2">
							<v-text-field label="Имя" v-model="firstname">
								<v-input type="text">{{ firstname }}</v-input>
							</v-text-field>
							<v-text-field label="Фамилия" v-model="lastname">
								<v-input type="text">{{ lastname }}</v-input>
							</v-text-field>
							<v-text-field label="Email" v-model="emailaddress">
								<v-input v-if="emailaddress" type="email">{{ emailaddress }}</v-input>
								<!-- <v-input v-else type="email">{{ getEmail }}</v-input> -->
							</v-text-field>
						</v-flex>
						<v-flex xs4 flexbox class="px-2">
							<v-text-field label="Адрес" v-model="address">
								<v-input type="text">{{ address }}</v-input>
							</v-text-field>
							<v-text-field label="Город" v-model="city">
								<v-input type="text">{{ city }}</v-input>
							</v-text-field>
							<v-text-field label="Страна" v-model="country">
								<v-input type="text">{{ country }}</v-input>
							</v-text-field>
						</v-flex>
					</v-layout>

					<v-textarea v-model="aboutme" clearable counter label='Немного о себе'>{{ aboutme }}</v-textarea>

					<v-btn class="success" @click="updateUserCard" :loading="localloading" :disabled="localloading">Обновить данные</v-btn>

				</v-card-text>
			</v-card>
		</form>
</template>
<script>
import { eventBus } from '../../main.js'
export default {
	name: 'edit-profile-form',
	props: {
		dataBackgroundColor: {
			type: String,
			default: ''
		}
	},
	data () {
		return {
			position: '',
			company: '',
			emailaddress: '',
			lastname: '',
			firstname: '',
			address: '',
			city: '',
			country: '',
			phone: null,
			aboutme: '',
			localloading: false
		}
	},
	methods: {
		updateUserCard () {
			let arr = [
				{ name: 'aboutme', value: this.aboutme },
				{ name: 'company', value: this.company },
				{ name: 'position', value: this.position },
				{ name: 'lastname', value: this.lastname },
				{ name: 'firstname', value: this.firstname },
				{ name: 'phone', value: parseInt(this.phone) },
				{ name: 'emailaddress', value: this.emailaddress },
				{ name: 'address', value: this.address },
				{ name: 'city', value: this.city },
				{ name: 'country', value: this.country }
			]
			eventBus.$emit('updateUserCard', arr)
			this.localloading = true
			setTimeout(() => {
				this.localloading = false
			}, 2000)
		},
		setUserCard (data) {
			return new Promise((resolve, reject) => {
				if (data !== null && data !== undefined) {
					Object.entries(data).forEach(item => {
						this[item[0]] = item[1]
					})
					resolve(true)
				}
			})
		}
	},
	mounted () {
		eventBus.$on('setInfo', data => {
			this.setUserCard(data)
				.then(() => {
					eventBus.$emit('setUserCard',
						[
							{ phone: this.phone },
							{ position: this.position },
							{ company: this.company },
							{ aboutme: this.aboutme }
						]
					)
					if (!this.emailaddress) {
						this.$store.dispatch('setUserEmail', this.$store.getters.currentUser.email)
							.then((email) => {
								this.emailaddress = email
							})
					}
				})
		})
	},
	computed: {
	}
}
</script>
<style></style>
