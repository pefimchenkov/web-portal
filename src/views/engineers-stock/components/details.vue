<template>
	<v-container fluid class="grey lighten-2">
		<Confirm ref="confirm"></Confirm>
		<v-dialog width="500px" v-model="dialog" persistent>
			<v-card class="pa-3 mx-auto" outlined>
				<v-card-title class="subheading">{{ label }}</v-card-title>
				<v-select
					v-model="prop"
					:items="propsUnknown"
					label="* Свойство"
					validation
					:rules="reqRules"
					required
					ref="prop"
				>
				</v-select>
				<v-textarea
					v-model="comment"
					label="Комментарий:"
					auto-grow
					outlined
					rows="3"
					row-height="25"
				></v-textarea>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="green darken-1"
						text="text"
						@click="close"
					>
					Отменить
					</v-btn>
					<v-btn
						color="green darken-1"
						text="text"
						@click.native="save()"
						:disabled="localloading"
						:loading="localloading"
					>
					Сохранить
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-container fluid class="white elevation-2">
			<v-row>
				<v-col cols="11">
					<span class="font-weight-bold">ЗИП ID: </span><v-chip color="orange" dark label class="mr-4">{{ zipID }}</v-chip>
					<span class="font-weight-bold">Название: </span><v-chip color="orange" dark label class="mr-4">{{ zipName }}</v-chip>
					<span class="font-weight-bold">На складе у инженера:</span> <v-chip dark color="orange"  label>{{ Eng }}</v-chip>
				</v-col>
				<v-col cols="1">
					<v-btn color="orange" dark @click.native="goBack">Назад</v-btn>
				</v-col>
			</v-row>
		</v-container>
		<v-data-table
				:headers="headers"
				:items="EngineersStockDetails"
				fixed-header
				calculate-widths
				:items-per-page="10"
				item-key="ID"
				sort-by="ID"
				dense
				sort-desc
				class="elevation-2 ma-3"
				:footer-props="{
					itemsPerPageAllText: 'Все',
					itemsPerPageOptions: [50,250,500,-1],
					showFirstLastPage: true,
					firstIcon: 'mdi-arrow-collapse-left',
					lastIcon: 'mdi-arrow-collapse-right',
					prevIcon: 'mdi-minus',
					nextIcon: 'mdi-plus'
				}"
			>
			<template v-slot:item.CREATED="{ item }">
				{{ new Date(item.CREATED).toLocaleDateString('ru') }}
			</template>
			<template v-slot:item.RESOLUTIONDATE="{ item }">
				{{ new Date(item.RESOLUTIONDATE).toLocaleDateString('ru') }}
			</template>
			<template v-slot:item.IssKey="{ item }">
					<a icon :href="settings.jira_url + item.IssKey" target="_blank">
  						{{ item.IssKey }}
					</a>
			</template>
			<template v-slot:item.action="{ item }">
				<template v-if="item.email_address">
					<v-btn :disabled="(email !== user && user !== item.email_lead)" small icon @click.prevent="open(item)">
							<v-icon small color="grey">mdi-pencil</v-icon>
					</v-btn>
					<v-btn small icon @click.prevent="send(item)">
							<v-icon small color="grey">mdi-send</v-icon>
					</v-btn>
				</template>
    		</template>
			<template v-if="PersonalItems" v-slot:no-data>
				<v-row justify="center" align="center">
					<v-col cols="12" class="text-center">
						<div>Запчасти отстутствуют на складе</div>
					</v-col>
				</v-row>
			</template>
			<template v-if="!PersonalItems" v-slot:no-data>
				<v-row justify="center" align="center">
					<v-col cols="12" class="text-center">
						<v-progress-circular :size="100" color="primary" indeterminate></v-progress-circular>
					</v-col>
				</v-row>
			</template>
		</v-data-table>
	</v-container>
</template>

<script>
	import { mapGetters } from 'vuex'
	import moment from 'moment'
	import settings from '@/settings.js'
	import Confirm from '@/components/shared/Confirm'
	export default {
		props: ['zipID', 'Eng', 'activeTab'],
		components: {
			Confirm
		},
		data () {
			return {
				prop: '',
				comment: '',
				settings,
				dialog: false,
				localloading: false,
				label: 'Перевод ЗИП в состояние: ',
				propsUnknown: ['Новый', 'Можно восстановить', 'Отсутствующий'],
				reqRules: [
					v => !!v || 'Обязательный параметр!'
				],
				editedItem: {},
				editedIndex: null,
				headers: [
					{ text: 'ID',
						value: 'ID',
						selected: true,
						divider: true
					},
					{ text: 'Номер ремонта',
						value: 'NomRem',
						selected: true,
						divider: true
					},
					{ text: 'Номер задачи',
						value: 'IssKey',
						selected: true,
						width: 150,
						divider: true
					},
					{ text: 'Тема',
						value: 'SUMMARY',
						selected: true,
						divider: true
					},
					{ text: 'Статус',
						value: 'Status',
						selected: true,
						divider: true
					},
					{ text: 'Дата создания',
						value: 'CREATED',
						selected: true,
						divider: true
					},
					{ text: 'Результат диагностики',
						value: 'DiagResult',
						selected: true,
						divider: true
					},
					{ text: 'Маркет ID',
						value: 'MarketId',
						selected: true,
						divider: true
					},
					{ text: 'АРТ 1С',
						value: 'ART_1C',
						selected: true,
						divider: true
					},
					{ text: 'Дата решения',
						value: 'RESOLUTIONDATE',
						selected: true,
						divider: true
					},
					{ text: 'Ведущий',
						value: 'email_lead',
						selected: true,
						divider: true
					},
					{ text: 'Действия',
						value: 'action',
						align: 'center',
						selected: true
					}
				]
			}
		},
		computed: {
			...mapGetters(['EngineersStock', 'EngineersStockArchive', 'EngineersStockDetails']),
			PersonalItems () {
				if (this.activeTab && this.activeTab === 'tab-archive') {
					return this.EngineersStockArchive.find(item => (item.JIRA_ID === parseInt(this.zipID)) && (item.Eng === this.Eng && !item.Eng))
				} else {
					if (this.Eng) {
						return this.EngineersStock.find(item => (item.JIRA_ID === parseInt(this.zipID)) && (item.Eng === this.Eng))
					} else {
						return this.EngineersStock.find(item => (item.JIRA_ID === parseInt(this.zipID)) && (!item.Eng))
					}
				}
			},
			user () {
				if (this.$store.getters.currentUser) return this.$store.getters.currentUser.email
			},
			displayName () {
				if (this.$store.getters.currentUser) return this.$store.getters.currentUser.displayName
			},
			zipName () {
				if (this.EngineersStockDetails.length > 0) return this.EngineersStockDetails[0].ZipName
			},
			email () {
				if (this.EngineersStockDetails.length > 0) return this.EngineersStockDetails[0].Email
			}
		},
		methods: {
			open (item) {
				this.editedItem = Object.assign({}, item)
				this.editedIndex = this.EngineersStockDetails.indexOf(item)
				this.dialog = true
			},
			close () {
				this.dialog = false
				this.prop = null
				this.comment = ''
			},
			save () {
				if (this.prop) {
					const now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
					let type
					if (this.prop === 'Новый') type = 2
					if (this.prop === 'Можно восстановить') type = 1
					if (this.prop === 'Отсутствующий') type = 0
					this.$store.dispatch('setConditionStock', { jiraID: this.editedItem.ID, zipID: this.zipID, type: type, user: this.user, comment: this.comment, date: now })
						.then(() => {
							this.$store.commit('setData', 'Зип успешно перемещён.')
							this.dialog = false
						})
				} else {
					this.$store.commit('setError', 'Не все поля заполнены!')
				}
			},
			async send (item) {
				if (await this.$refs.confirm.open('Сделать запрос', 'Вы уверены?', { color: 'green' })) {
					await this.$store.dispatch('sendRequestForZip', { item: item, user: this.displayName ? this.displayName + ' (' + this.user + ')' : this.user, email: this.user })
						.then(() => {
							this.$store.commit('setData', 'Запрос успешно отправлен.')
						})
				} else {
					this.$store.commit('setInfo', 'Запрос отменён')
				}
			},
			goBack () {
				this.$store.commit('LOAD_ENGINEERS_STOCK_DETAILS', [])
				this.$router.replace({ name: 'engineers_stock' })
			}
		},
		async created () {
			await window.scrollTo(0, 0)
			await this.$store.dispatch('fetchEngineersStock')
			if (this.PersonalItems) this.$store.dispatch('fetchEngineersStockDetails', { ids: await this.PersonalItems.IDs, zipID: this.zipID, userName: this.Eng })
		}
	}
</script>

<style lang="scss" scoped>

</style>
