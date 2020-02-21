<template>
		<form>
			<v-card outlined>
				<v-card-text>
					<v-layout row wrap>
						<v-flex xs4 class="px-2">
							<v-text-field label="Компания" v-model="Company">
								<v-input>{{ Company }}</v-input>
							</v-text-field>
							<v-text-field label="Должность" v-model="Position">
								<v-input type="text">{{ Position }}</v-input>
							</v-text-field>
							<v-text-field label="Телефон" v-model="Phone">
								<v-input type="number">{{ Phone }}</v-input>
							</v-text-field>
						</v-flex>
						<v-flex xs4 flexbox class="px-2">
							<v-text-field label="Имя" v-model="FirstName">
								<v-input type="text">{{ FirstName }}</v-input>
							</v-text-field>
							<v-text-field label="Фамилия" v-model="LastName">
								<v-input type="text">{{ LastName }}</v-input>
							</v-text-field>
							<v-text-field label="Email" v-model="Email">
								<v-input v-if="Email" type="email">{{ Email }}</v-input>
							</v-text-field>
						</v-flex>
						<v-flex xs4 flexbox class="px-2">
							<v-text-field label="Страна" v-model="Country">
								<v-input type="text">{{ Country }}</v-input>
							</v-text-field>
							<v-text-field label="Город" v-model="City">
								<v-input type="text">{{ City }}</v-input>
							</v-text-field>
							<v-text-field label="Адрес" v-model="Address">
								<v-input type="text">{{ Address }}</v-input>
							</v-text-field>
						</v-flex>
					</v-layout>

					<v-textarea v-model="Aboutme" clearable counter label='Немного о себе'>{{ Aboutme }}</v-textarea>
					<v-col class='text-center ma-auto'>
						<v-btn class="success text-center" @click="updateInfo" :loading="localloading" :disabled="localloading">Обновить данные</v-btn>
					</v-col>

				</v-card-text>
			</v-card>
		</form>
</template>
<script>
// import { eventBus } from '../../main.js'
import { mapState } from 'vuex'
export default {
	name: 'edit-profile-form',
	props: {
		dataBackgroundColor: {
			type: String,
			default: ''
		}
	},
	computed: {
		...mapState({
			info: state => state.user.info
		}),
		Position: {
			get () {
				return this.$store.state.user.info.position
			},
			set (val) {
				this.$store.dispatch('changeInfo', {
					key: 'position',
					value: val
				})
			}
		},
		Company: {
			get () {
				return this.$store.state.user.info.company
			},
			set (val) {
				this.$store.dispatch('changeInfo', {
					key: 'company',
					value: val
				})
			}
		},
		FirstName: {
			get () {
				return this.$store.state.user.info.firstname
			},
			set (val) {
				this.$store.dispatch('changeInfo', {
					key: 'firstname',
					value: val
				})
			}
		},
		LastName: {
			get () {
				return this.$store.state.user.info.lastname
			},
			set (val) {
				this.$store.dispatch('changeInfo', {
					key: 'lastname',
					value: val
				})
			}
		},
		City: {
			get () {
				return this.$store.state.user.info.city
			},
			set (val) {
				this.$store.dispatch('changeInfo', {
					key: 'city',
					value: val
				})
			}
		},
		Address: {
			get () {
				return this.$store.state.user.info.address
			},
			set (val) {
				this.$store.dispatch('changeInfo', {
					key: 'Address',
					value: val
				})
			}
		},
		Email: {
			get () {
				return this.$store.state.user.info.emailaddress
			},
			set (val) {
				this.$store.dispatch('changeInfo', {
					key: 'emailaddress',
					value: val
				})
			}
		},
		Phone: {
			get () {
				return this.$store.state.user.info.phone
			},
			set (val) {
				this.$store.dispatch('changeInfo', {
					key: 'phone',
					value: val
				})
			}
		},
		Country: {
			get () {
				return this.$store.state.user.info.country
			},
			set (val) {
				this.$store.dispatch('changeInfo', {
					key: 'country',
					value: val
				})
			}
		},
		Aboutme: {
			get () {
				return this.$store.state.user.info.aboutme
			},
			set (val) {
				this.$store.dispatch('changeInfo', {
					key: 'aboutme',
					value: val
				})
			}
		}
	},
	data () {
		return {
			localloading: false
		}
	},
	methods: {
		async updateInfo () {
			await this.$store.dispatch('updateInfo', this.info)
			await this.$store.dispatch('setData', 'Профиль успешно обновлён.')
		}
	},
	mounted () {
	}
}
</script>
<style></style>
