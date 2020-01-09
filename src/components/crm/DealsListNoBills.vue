<template>
	<v-container v-if="!loadings && DealsNoBills.length !== 0" fluid>
		<ProgressDialog :show="show" :infoText="infoText"></ProgressDialog>
		<v-app-bar :fixed="checkBox1" text color="white" class="elevation-2 mb-1">
			<v-container fluid>
				<v-layout row>
					<v-flex xs12>
						<v-layout>
							<v-layout column>
								<v-flex sm2 md2 lg1 xl1 class="hidden-sm-and-down">
									<v-checkbox
										hide-details
										v-model="checkBox1"
										:label="
											checkBox1
												? 'Открепить'
												: 'Закрепить'
										"
									></v-checkbox>
								</v-flex>
								<v-flex sm2 md2 lg1 xl1 class="hidden-sm-and-down">
									<v-checkbox
										hide-details
										v-model="checkBox2"
										:label="
											checkBox2 ? 'Разтянуть' : 'Сжать'
										"
									></v-checkbox>
								</v-flex>
							</v-layout>
							<v-flex xs4 sm2>
								<p class="headline">Сделки без счетов</p>
							</v-flex>
							<v-spacer></v-spacer>
							<v-flex xs3 sm3 md3 lg2 xl1 v-show="$acl.check('Financier')">
								<v-btn width="95">
									<download-excel
										:fields="json_fields"
										:fetch="getExel"
										class="btn btn-default xlsx_btn"
										name="zip_list.xls"
									>
										<v-icon>save_alt</v-icon>excel
									</download-excel>
								</v-btn>
							</v-flex>
							<v-flex xs3 sm3 md3 lg2 xl1>
								<v-menu bottom transition="scale-transition" :close-on-content-click="false" v-model="menu">
									<template v-slot:activator="{ on }">
										<v-btn v-on="on">
											<v-icon left>list</v-icon>Колонки
										</v-btn>
									</template>

									<v-list class="pa-3">
										<v-btn @click="saveColumnFB">
											<v-icon color="success" class="mr-1">save</v-icon>Сохранить
										</v-btn>
										<v-btn @click="showAllColumn">
											<v-icon color="warning" class="mr-1">mdi-eye</v-icon>Включить всё
										</v-btn>
										<v-list-item v-for="(header, i) in headers" :key="i" dense>
											<v-checkbox
												:label="header.text"
												v-model="header.selected"
												:value="header.selected"
												v-if="header.visible"
												hide-details
											></v-checkbox>
										</v-list-item>
									</v-list>
								</v-menu>
							</v-flex>
							<v-flex xs4 sm4 md4 lg2 xl2>
								<v-menu v-model="menu_filter" :close-on-content-click="false" offset-y>
									<template v-slot:activator="{ on }">
										<v-btn v-on="on">
											<v-icon dark class="mr-2">filter_list</v-icon>Фильтры
										</v-btn>
									</template>
									<v-card class="text-center">
										<v-menu bottom transition="scale-transition" :close-on-content-click="false"></v-menu>
										<v-list class="text-center">
											<v-list-item v-for="(filter, i) of Filters" :key="i" v-model="Filters">
												<v-btn
													small
													color="blue lighten-2"
													dark
													block
													:loading="loadings"
													:disabled="loadings"
													v-model="filter.name"
													@click="
														loadFilter(filter.name)
													"
												>{{ filter.name }}</v-btn>
											</v-list-item>
											<v-list-item>
												<v-btn text @click="resetFilter">Сбросить фильтр</v-btn>
											</v-list-item>
										</v-list>
									</v-card>
								</v-menu>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-container>
		</v-app-bar>
		<v-spacer></v-spacer>
		<h4 v-if="activeFilterName" class="text-lg-center mb-2">
			Применён фильтр:
			<span class="success--text">{{ activeFilterName }}</span>
		</h4>
		<div class="data_table_wrapper">
			<v-data-table
				:headers="computedHeaders"
				:items="DealsNoBills"
				fixed-header
				calculate-widths
				:items-per-page="50"
				item-key="UniqueId"
				:mobile-breakpoint="550"
				ref="dataTable"
				sort-by="id"
				:dense="checkBox2"
				sort-desc
				:footer-props="{
					itemsPerPageAllText: 'Все',
					itemsPerPageOptions: [50, 250, 500, -1],
					showFirstLastPage: true,
					firstIcon: 'mdi-arrow-collapse-left',
					lastIcon: 'mdi-arrow-collapse-right',
					prevIcon: 'mdi-minus',
					nextIcon: 'mdi-plus'
				}"
				class="elevation-2"
			>
				<template v-slot:body.prepend v-if="mobileView">
					<tr>
						<td
							v-if="
								computedHeaders.find(
									header => header.value === 'jira_id'
								)
							"
						>
							<v-text-field clearable v-model="filters.jiraID" type="text"></v-text-field>
						</td>
						<td
							v-if="
								computedHeaders.find(
									header => header.value === 'IssueType'
								)
							"
						>
							<v-autocomplete
								v-model="filters.issueType"
								multiple
								:items="issueType"
								deletable-chips
								clearable
								chips
							></v-autocomplete>
						</td>
						<td
							v-if="
								computedHeaders.find(
									header => header.value === 'jira_date'
								)
							"
						>
							<v-menu
								v-model="menuJiraDate"
								:close-on-content-click="false"
								transition="scale-transition"
								ref="menuJiraDate"
							>
								<template v-slot:activator="{ on }">
									<v-icon
										v-on="on"
										:color="
											filters.jiraDate !== null &&
											filters.jiraDate.length > 0
												? `green darken-2`
												: ``
										"
									>event</v-icon>
								</template>
								<v-date-picker v-model="filters.jiraDate" multiple no-title scrollable>
									<div class="flex-grow-1"></div>
									<v-btn text color="primary" @click="menuJiraDate = false">Отмена</v-btn>
									<v-btn
										text
										color="primary"
										@click="
											$refs.menuJiraDate.save(
												filters.jiraDate
											)
										"
									>OK</v-btn>
								</v-date-picker>
							</v-menu>
							<v-icon
								v-if="
									filters.jiraDate !== null &&
										filters.jiraDate.length > 0
								"
								@click="filters.jiraDate = []"
							>clear</v-icon>
						</td>
						<td
							v-if="
								computedHeaders.find(
									header => header.value === 'SUMMARY'
								)
							"
						>
							<v-text-field clearable v-model="filters.SUMMARY" type="text"></v-text-field>
						</td>
						<td
							v-if="
								computedHeaders.find(
									header => header.value === 'jira_client'
								)
							"
						>
							<v-text-field clearable v-model="filters.jiraClient" type="text"></v-text-field>
						</td>
						<td
							v-if="
								computedHeaders.find(
									header => header.value === 'STATUS'
								)
							"
						>
							<v-autocomplete
								v-model="filters.STATUS"
								multiple
								:items="STATUS"
								deletable-chips
								clearable
								chips
							></v-autocomplete>
						</td>
						<td
							v-if="
								computedHeaders.find(
									header => header.value === 'jira_bill'
								)
							"
						>
							<v-text-field clearable v-model="filters.jiraBill" type="text"></v-text-field>
						</td>
						<td
							v-if="
								computedHeaders.find(
									header => header.value === 'MANAGER'
								)
							"
						>
							<v-autocomplete
								v-model="filters.MANAGER"
								multiple
								:items="MANAGER"
								deletable-chips
								clearable
								chips
							></v-autocomplete>
						</td>
						<td
							v-if="
								computedHeaders.find(
									header => header.value === 'jira_sm'
								)
							"
						>
							<v-autocomplete
								v-model="filters.jiraSM"
								multiple
								:items="jiraSM"
								deletable-chips
								clearable
								chips
							></v-autocomplete>
						</td>
						<td
							v-if="
								computedHeaders.find(
									header => header.value === 'LEAD_ENG'
								)
							"
						>
							<v-autocomplete
								v-model="filters.leadEng"
								multiple
								:items="leadEng"
								deletable-chips
								clearable
								chips
							></v-autocomplete>
						</td>
						<td
							v-if="
								computedHeaders.find(
									header => header.value === 'Dep'
								)
							"
						>
							<v-text-field clearable v-model="filters.Department" type="text"></v-text-field>
						</td>
						<td
							v-if="
								computedHeaders.find(
									header => header.value === 'Litso'
								)
							"
						>
							<v-text-field clearable v-model="filters.Litso" type="text"></v-text-field>
						</td>
						<td
							v-if="
								computedHeaders.find(
									header => header.value === 'Resolve'
								)
							"
						>
							<v-select
								v-model="filters.Resolve"
								clearable
								:items="[
									'пусто',
									'не отвечен',
									'отвечен',
									'решён'
								]"
							></v-select>
						</td>
						<td
							v-if="
								computedHeaders.find(
									header => header.value === 'Cmmnt'
								)
							"
						>
							<v-text-field clearable v-model="filters.Cmmnt" type="text"></v-text-field>
						</td>
						<td
							v-if="
								computedHeaders.find(
									header => header.value === 'action'
								)
							"
							colspan="1"
						></td>
					</tr>
				</template>
				<template
					v-slot:item.jira_date="{ item }"
				>{{ new Date(item.jira_date).toLocaleDateString('ru') }}</template>
				<template v-slot:item.LEAD_ENG="{ item }">
					<span :style="item.Spec === 'Red' ? `color:red` : ''">{{ item.LEAD_ENG }}</span>
				</template>
				<template v-slot:item.jira_id="{ item }">
					<a
						:href="
							`http://support.tsd-group.ru/browse/${item.jira_id}`
						"
						target="_blank"
					>{{ item.jira_id }}</a>
				</template>
				<template v-slot:item.action="{ item }">
					<!-- <v-btn  text fab small left :to="'/deals/' + item.id + '/' + item.bill_1c"> -->
					<v-icon>more_horiz</v-icon>
					<!-- </v-btn> -->
				</template>
			</v-data-table>
		</div>
	</v-container>
	<v-container v-else fill-height fluid>
		<v-layout row fill-height align-center>
			<v-flex xs12 text-center>
				<v-progress-circular :size="100" color="primary" indeterminate></v-progress-circular>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
import moment from 'moment'
import { formatDate } from '../../services/helpers'
import GetConfig from '@/services/GetConfig'
import _ from 'lodash'

import ProgressDialog from '../shared/ProgressDialog'

export default {
	data () {
		return {
			filters: {
				jiraID: '',
				issueType: [],
				jiraDate: [],
				SUMMARY: '',
				jiraClient: '',
				STATUS: [],
				jiraBill: '',
				MANAGER: [],
				jiraSM: [],
				leadEng: [],
				Department: '',
				Litso: '',
				Resolve: '',
				Cmmnt: ''
			},
			multiSelects: {
				leadEng: [],
				MANAGER: [],
				STATUS: [],
				jiraSM: [],
				issueType: []
			},
			show: false,
			menu: false,
			menuBillDate: false,
			menuBillBaseDate: false,
			menuBillParentDate: false,
			menuJiraDate: false,
			localloading: false,
			checkBox1: false,
			checkBox2: false,
			Filters: [],
			DealsNoBills: [],
			showForFilter: false,
			filterName: '',
			showFilterName: false,
			activeFilterName: '',
			menu_filter: false,
			selectedImage: null,
			search: '',
			infoText: '',
			dialog: false,
			headers: [
				{
					text: 'Ключ',
					value: 'jira_id',
					selected: localStorage.dealsColumn
						? localStorage.dealsColumn['jira_id']
						: false,
					visible: true,
					divider: true,
					width: 160,
					filter: value => {
						if (!this.filters.jiraID) return true
						if (!value) return false
						return value
							.toLowerCase()
							.includes(this.filters.jiraID.toLowerCase())
					}
				},
				{
					text: 'Тип задачи',
					value: 'IssueType',
					selected: localStorage.dealsColumn
						? localStorage.dealsColumn['IssueType']
						: false,
					visible: true,
					divider: true,
					width: 160,
					filter: value => {
						if (this.filters.issueType.length === 0) return true
						if (!value) return false
						return value.includes(
							this.filters.issueType.find(item => item === value)
						)
					}
				},
				{
					text: 'Создан',
					value: 'jira_date',
					selected: localStorage.dealsColumn
						? localStorage.dealsColumn['jira_date']
						: false,
					visible: true,
					divider: true,
					width: 120,
					filter: value => {
						if (!this.filters.jiraDate || this.filters.jiraDate.length === 0) return true
						if (!value || isNaN(Date.parse(value))) return false
						let Arr = this.filters.jiraDate.map(item => moment(item).unix())
						let first = Math.min(...Arr)
						let last = Math.max(...Arr)
						return (
							moment(value).unix() >= first && moment(value).unix() <= last
						)
					}
				},
				{
					text: 'Тема',
					value: 'SUMMARY',
					selected: localStorage.dealsColumn
						? localStorage.dealsColumn['SUMMARY']
						: false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.SUMMARY) return true
						if (!value) return false
						return value
							.toLowerCase()
							.includes(this.filters.SUMMARY.toLowerCase())
					}
				},
				{
					text: 'Организация',
					value: 'jira_client',
					selected: localStorage.dealsColumn
						? localStorage.dealsColumn['jira_client']
						: false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.jiraClient) return true
						if (!value) return false
						return value
							.toLowerCase()
							.includes(this.filters.jiraClient.toLowerCase())
					}
				},
				{
					text: 'Статус',
					value: 'STATUS',
					selected: localStorage.dealsColumn
						? localStorage.dealsColumn['STATUS']
						: false,
					visible: true,
					divider: true,
					filter: value => {
						if (this.filters.STATUS.length === 0) return true
						if (!value) return false
						return value.includes(
							this.filters.STATUS.find(item => item === value)
						)
					}
				},
				{
					text: 'Счёт Jira',
					value: 'jira_bill',
					selected: localStorage.dealsColumn
						? localStorage.dealsColumn['jira_bill']
						: false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.jiraBill) return true
						if (!value) return false
						return value
							.toLowerCase()
							.includes(this.filters.jiraBill.toLowerCase())
					}
				},
				{
					text: 'Менеджер',
					value: 'MANAGER',
					selected: localStorage.dealsColumn
						? localStorage.dealsColumn['MANAGER']
						: false,
					visible: true,
					divider: true,
					width: 150,
					filter: value => {
						if (this.filters.MANAGER.length === 0) return true
						if (!value) return false
						return value.includes(
							this.filters.MANAGER.find(item => item === value)
						)
					}
				},
				{
					text: 'Сервис-менеджер',
					value: 'jira_sm',
					selected: localStorage.dealsColumn
						? localStorage.dealsColumn['jira_sm']
						: false,
					visible: true,
					divider: true,
					filter: value => {
						if (this.filters.jiraSM.length === 0) return true
						if (!value) return false
						return value.includes(
							this.filters.jiraSM.find(item => item === value)
						)
					}
				},
				{
					text: 'Ведущий инженер',
					value: 'LEAD_ENG',
					selected: localStorage.dealsColumn
						? localStorage.dealsColumn['LEAD_ENG']
						: false,
					visible: true,
					divider: true,
					filter: value => {
						if (this.filters.leadEng.length === 0) return true
						if (!value) return false
						return value.split(',').includes(this.filters.leadEng.find(item => value.includes(item)))
					}
				},
				{
					text: 'Департамент',
					value: 'Dep',
					selected: localStorage.dealsColumn
						? localStorage.dealsColumn['Dep']
						: false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.Department) return true
						if (!value) return false
						return value
							.toLowerCase()
							.includes(this.filters.Department.toLowerCase())
					}
				},
				{
					text: 'Ответственный',
					value: 'Litso',
					selected: localStorage.dealsColumn
						? localStorage.dealsColumn['Litso']
						: false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.Litso) return true
						if (!value) return false
						return value
							.toLowerCase()
							.includes(this.filters.Litso.toLowerCase())
					}
				},
				{
					text: 'Резолюция',
					value: 'Resolve',
					selected: localStorage.dealsColumn
						? localStorage.dealsColumn['Resolve']
						: false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.Resolve) return true
						if (this.filters.Resolve === 'пусто') return !value
						if (this.filters.Resolve === 'не отвечен') return value === 'Не отвечен'
						if (this.filters.Resolve === 'отвечен') return value === 'Отвечен'
						if (this.filters.Resolve === 'решён') return value === 'Решён'
					}
				},
				{
					text: 'Последний ответ',
					value: 'Cmmnt',
					selected: localStorage.dealsColumn
						? localStorage.dealsColumn['Cmmnt']
						: false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.Cmmnt) return true
						if (!value) return false
						return value
							.toLowerCase()
							.includes(this.filters.Cmmnt.toLowerCase())
					}
				},
				{
					text: 'Действие',
					value: 'action',
					selected: true,
					visible: true,
					divider: true
				}
			],
			editedIndex: -1,
			lastItemId: null,
			editedItem: {},
			defaultItem: {},
			textRules: [v => !!v || 'Обязательный параметр!'],
			customRules: [
				function (v) {
					if (v === undefined || v === '' || v === null) {
						return true
					} else {
						return true
					}
				}
			],
			digitRules: [
				v => !!v || 'Обязательный параметр!',
				v => /^[0-9]+$/.test(v) || 'Допускаются только числа!'
			],
			json_fields: {}
		}
	},

	filters: {
		formatDate: value => {
			if (value) {
				return moment(new Date(value)).format('YYYY-MM-DD')
			}
		},
		moneyToPercent: (item, id) => {
			if (item) {
				if (id === 0 || id === null) return 0
				return parseFloat((id / item.bill_sum) * 100).toFixed() + ' %'
			} else {
				return null
			}
		}
	},

	computed: {
		computedHeaders () {
			return this.headers.filter(header => header.selected)
		},
		mobileView () {
			switch (this.$vuetify.breakpoint.name) {
			case 'xs':
				return false
			case 'sm':
				return false
			default:
				return true
			}
		},
		loadings () { return this.$store.getters.loadings },
		formTitle () { return this.editedIndex === -1 ? 'Новый ЗИП' : 'Редактировать ЗИП' },
		leadEng () { return _.uniq(this.multiSelects.leadEng) },
		STATUS () { return _.uniq(this.multiSelects.STATUS) },
		MANAGER () { return _.uniq(this.multiSelects.MANAGER) },
		jiraSM () { return _.uniq(this.multiSelects.jiraSM) },
		issueType () { return _.uniq(this.multiSelects.issueType) }
	},

	watch: {
		dialog (val) {
			val || this.close()
		}
	},

	methods: {
		async getExel () {
			const filtered = this.headers.filter(header => header.selected === true)
			filtered.forEach(item => {
				this.json_fields[item.text] = item.value
			})
			return this.$refs.dataTable.$children[0].filteredItems
		},
		getColor (sum) {
			if (sum >= 96) return 'green'
			else if (sum > 5 && sum < 95) return 'orange'
			else return 'red'
		},
		formatDate (date) {
			return moment(new Date(date)).format('YYYY-MM-DD')
		},
		resetFilter () {
			for (let key in this.filters) {
				if (
					typeof this.filters[key] === 'object' &&
					this.filters[key] instanceof Array
				) {
					this.filters[key] = []
				} else if (
					typeof this.filters[key] === 'object' &&
					this.filters[key] !== null
				) {
					this.filters[key] = {}
				} else {
					this.filters[key] = ''
				}
			}
			this.menu_filter = false
			this.$router.replace({
				...this.$router.currentRoute,
				query: {}
			})
		},
		saveColumnFB () {
			let dealsColumn = {}
			let id = 'dealsNoBillsColumn'
			this.headers.forEach(header => {
				header.selected === null || header.selected === undefined
					? (dealsColumn[header.value] = false)
					: (dealsColumn[header.value] = header.selected)
			})
			this.menu = false
			this.$store.dispatch('createLocalStorage', [dealsColumn, id])
		},
		showAllColumn () {
			this.headers.forEach(header => {
				header.selected = true
			})
		},
		editItem (item) {},
		deleteItem (item) {},
		close () {
			this.dialog = false
			this.editedItem = Object.assign({})
			this.editedIndex = -1
		}
	},
	async created () {
		await this.$store.dispatch('FETCH_DEALS_NO_BILLS')
		await GetConfig.getColumn('dealsNoBillsColumn')
			.then(data => {
				if (data) {
					this.headers.forEach(header => {
						for (var key in data) {
							if (key === header.value) {
								header.selected = data[key]
							}
						}
					})
					console.log(
						'Данные о сохранеённых колонках успешно загружены: ',
						data
					)
				}
			})
			.catch(error => {
				this.show = true
				this.infoText = error.message
			})
			.finally(async () => {
				this.DealsNoBills = await this.$store.getters.DealsNoBills
				this.DealsNoBills.forEach((item, index) => {
					if (item.bill_date) item.bill_date = formatDate(item.bill_date)
					if (item.jira_sm) this.multiSelects.jiraSM.push(item.jira_sm)
					if (item.MANAGER) this.multiSelects.MANAGER.push(item.MANAGER)
					if (item.STATUS) this.multiSelects.STATUS.push(item.STATUS)
					if (item.LEAD_ENG) {
						const split = item.LEAD_ENG.split(',')
						split.forEach(item => {
							this.multiSelects.leadEng.push(item)
						})
					}
					if (item.IssueType) this.multiSelects.issueType.push(item.IssueType)
				})
				await this.$emit('deals', this.DealsNoBills)
			})
	},

	async mounted () {
		let obj = {}
		for (let key in this.filters) {
			this.$watch(['filters', key].join('.'), (newVal, oldVal) => {
				if (newVal === null) newVal = ''
				obj[key] = newVal
				localStorage.setItem('filtersDealsNoBills', JSON.stringify(obj))
			})
		}
		if (localStorage.filtersDealsNoBills) {
			var ls = JSON.parse(localStorage.filtersDealsNoBills)
			if (ls) {
				Object.keys(this.filters).forEach(key => {
					Object.entries(ls).forEach(item => {
						if (
							JSON.parse(localStorage.getItem('filtersDealsNoBills'))[item[0]] && JSON.parse(localStorage.getItem('filtersDealsNoBills'))[item[0]] !== 'null' && item[0] === key
						) {
							this.filters[item[0]] = JSON.parse(
								localStorage.getItem('filtersDealsNoBills')
							)[item[0]]
						}
					})
				})
			}
		}
	},

	components: {
		ProgressDialog
	}
}
</script>

<style scoped>
.models {
	word-break: break-all;
}

.cursor_btn {
	cursor: pointer;
	touch-action: none;
}

.maxWidth {
	max-width: 100px !important;
}
</style>
