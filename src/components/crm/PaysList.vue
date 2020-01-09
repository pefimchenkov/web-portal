<template>
<v-container v-if="!loadings && Pays.length !== 0" fluid>
    <ProgressDialog :show="show" :infoText="infoText"></ProgressDialog>
    <v-app-bar :fixed="checkBox1" text color="white" class="elevation-2 mb-1">
        <v-container fluid>
            <v-layout row>
                <v-flex xs12>
                    <v-layout>
                        <v-layout column>
                            <v-flex sm2 md2 lg1 xl1 class="hidden-sm-and-down">
                                <v-checkbox hide-details v-model="checkBox1" :label="checkBox1 ? 'Открепить' : 'Закрепить'"></v-checkbox>
                            </v-flex>
                            <v-flex sm2 md2 lg1 xl1 class="hidden-sm-and-down">
                                <v-checkbox hide-details v-model="checkBox2" :label="checkBox2 ? 'Разтянуть' : 'Сжать'"></v-checkbox>
                            </v-flex>
                        </v-layout>
                        <v-flex xs4 sm2>
                            <p class="headline">Контроль расходов</p>
                        </v-flex>
                        <v-spacer></v-spacer>
                        <v-flex xs3 sm3 md3 lg2 xl1>
                            <v-btn width='95'>
                                <download-excel :fields="json_fields" :fetch="getExel" class="btn btn-default xlsx_btn" name="pays_list.xls">
                                    <v-icon>save_alt</v-icon> excel
                                </download-excel>
                            </v-btn>
                        </v-flex>
                        <v-flex xs3 sm3 md3 lg2 xl1>
                            <v-menu bottom transition="scale-transition" :close-on-content-click="false" v-model="menu">
                                <template v-slot:activator={on}>
                                    <v-btn v-on="on">
                                        <v-icon left>list</v-icon>
                                        Колонки
                                    </v-btn>
                                </template>

                                <v-list class="pa-3">
                                    <v-btn @click="saveColumnFB">
                                        <v-icon color="success" class="mr-1">save</v-icon>
                                        Сохранить
                                    </v-btn>
                                    <v-btn @click="showAllColumn">
                                        <v-icon color="warning" class="mr-1">mdi-eye</v-icon>
                                        Включить всё
                                    </v-btn>
                                    <v-list-item v-for="(header, i) in headers" :key="i" dense>
                                        <v-checkbox :label="header.text" v-model="header.selected" :value="header.selected" v-if="header.visible" hide-details>
                                        </v-checkbox>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-flex>
                        <v-flex xs4 sm4 md4 lg2 xl2>
                            <v-menu v-model="menu_filter" :close-on-content-click="false" offset-y>
                                <template v-slot:activator="{ on }">
                                    <v-btn v-on="on">
                                        <v-icon dark class="mr-2">filter_list</v-icon>
                                        Фильтры
                                    </v-btn>
                                </template>
                                <v-card class="text-center">
                                    <v-menu bottom transition="scale-transition" :close-on-content-click="false">
                                    </v-menu>
                                    <v-list class="text-center">
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
    <div class="data_table_wrapper">
        <v-data-table
		ref="paysListTable"
		:headers="computedHeaders"
		:items="Pays"
		:items-per-page=50
		item-key="id"
		:mobile-breakpoint="1050"
		sort-by='id'
		:dense="checkBox2" sort-desc
		:footer-props="{
			itemsPerPageAllText: 'Все',
			itemsPerPageOptions: [50,250,500,-1],
			showFirstLastPage: true,
			firstIcon: 'mdi-arrow-collapse-left',
			lastIcon: 'mdi-arrow-collapse-right',
			prevIcon: 'mdi-minus',
			nextIcon: 'mdi-plus'
		}"
		class="elevation-2">
            <template v-slot:body.prepend v-if="mobileView">
				<tr>
					<td v-if="computedHeaders.find(header => header.value === 'id')" ><span>ИТОГО:</span></td>
					<td v-if="computedHeaders.find(header => header.value === 'client_1c')" colspan="1"></td>
					<td v-if="computedHeaders.find(header => header.value === 'pay_1c')" colspan="1"></td>
					<td v-if="computedHeaders.find(header => header.value === 'pay_date')" colspan="1"></td>
					<td v-if="computedHeaders.find(header => header.value === 'currency_code')" colspan="1"></td>
					<td v-if="computedHeaders.find(header => header.value === 'pay_sum')" colspan="1">
						<v-text-field v-if="$refs.paysListTable" v-model="paySum" type="text" readonly append-icon="mdi-currency-rub"></v-text-field>
					</td>
					<td v-if="computedHeaders.find(header => header.value === 'account_pay_sum')" colspan="1"></td>
					<td v-if="computedHeaders.find(header => header.value === 'project_name')" colspan="1"></td>
					<td v-if="computedHeaders.find(header => header.value === 'yellow')" colspan="1"></td>
					<td v-if="computedHeaders.find(header => header.value === 'one_c_name')" colspan="1"></td>
					<td v-if="computedHeaders.find(header => header.value === 'jira_name')" colspan="1"></td>
					<td v-if="computedHeaders.find(header => header.value === 'fact_pay_date')" colspan="1"></td>
					<td v-if="computedHeaders.find(header => header.value === 'action')" colspan="1"></td>
				</tr>
                <tr>
                    <td v-if="computedHeaders.find(header => header.value === 'id')" colspan="1"></td>
                    <td v-if="computedHeaders.find(header => header.value === 'client_1c')">
                        <v-text-field clearable v-model="filters.client1C" type="text"></v-text-field>
                    </td>
                    <td v-if="computedHeaders.find(header => header.value === 'pay_1c')">
                        <v-text-field clearable v-model="filters.pay1C" type="text"></v-text-field>
                    </td>
					<td v-if="computedHeaders.find(header => header.value === 'pay_date')">
                        <v-menu v-model="menuPayDate" :close-on-content-click="false" transition="scale-transition" ref="menuPayDate">
                            <template v-slot:activator="{ on }">
                                <v-icon v-on="on" :color="filters.payDate !== null && filters.payDate.length > 0 ? `green darken-2` : ``">event</v-icon>
                            </template>
                            <v-date-picker v-model="filters.payDate" multiple no-title>
                                <div class="flex-grow-1"></div>
                                <v-btn text color="primary" @click="menuPayDate = false">Отмена</v-btn>
                                <v-btn text color="primary" @click="$refs.menuPayDate.save(filters.payDate)">OK</v-btn>
                            </v-date-picker>
                        </v-menu>
                        <v-icon v-if="filters.payDate !== null && filters.payDate.length > 0" @click="filters.payDate = []">clear</v-icon>
                    </td>
                    <td v-if="computedHeaders.find(header => header.value === 'currency_code')" colspan="1"></td>
                    <td v-if="computedHeaders.find(header => header.value === 'pay_sum')" colspan="1"></td>
                    <td v-if="computedHeaders.find(header => header.value === 'account_pay_sum')" colspan="1"></td>
                    <td v-if="computedHeaders.find(header => header.value === 'project_name')">
						<v-autocomplete
							v-model="filters.projectName"
							multiple
							:items="projectName"
							deletable-chips
							clearable
							chips
						>
						</v-autocomplete>
					</td>
					<td v-if="computedHeaders.find(header => header.value === 'yellow')">
						<v-text-field clearable v-model="filters.yellow" type="text"></v-text-field>
					</td>
                    <td v-if="computedHeaders.find(header => header.value === 'one_c_name')">
						<v-autocomplete
							v-model="filters.oneCName"
							multiple
							:items="oneCName"
							deletable-chips
							clearable
							chips
						>
						</v-autocomplete>
					</td>
					<td v-if="computedHeaders.find(header => header.value === 'jira_name')">
						<v-autocomplete
							v-model="filters.jiraName"
							multiple
							:items="jiraName"
							deletable-chips
							clearable
							chips
						>
						</v-autocomplete>
					</td>
					<td v-if="computedHeaders.find(header => header.value === 'fact_pay_date')">
                        <v-menu v-model="menuFactPayDate" :close-on-content-click="false" transition="scale-transition" ref="menuFactPayDate">
                            <template v-slot:activator="{ on }">
                                <v-icon v-on="on" :color="filters.factPayDate !== null && filters.factPayDate.length > 0 ? `green darken-2` : ``">event</v-icon>
                            </template>
                            <v-date-picker v-model="filters.factPayDate" multiple no-title>
                                <div class="flex-grow-1"></div>
                                <v-btn text color="primary" @click="menuFactPayDate = false">Отмена</v-btn>
                                <v-btn text color="primary" @click="$refs.menuFactPayDate.save(filters.factPayDate)">OK</v-btn>
                            </v-date-picker>
                        </v-menu>
                        <v-icon v-if="filters.factPayDate !== null && filters.factPayDate.length > 0" @click="filters.factPayDate = []">clear</v-icon>
                    </td>
                    <td v-if="computedHeaders.find(header => header.value === 'action')" colspan='1'></td>
                </tr>
            </template>
            <template v-slot:item.bill_sum="{ item }">
                {{ item.bill_sum.toLocaleString('ru') }}
                <v-icon color="primary" small>mdi-currency-rub</v-icon>
            </template>
			<template v-slot:item.pay_sum="{ item }">
                {{ item.pay_sum.toLocaleString('ru') }}
                <v-icon color="primary" small>mdi-currency-rub</v-icon>
            </template>
            <template v-slot:item.pay_date="{ item }">
                {{ new Date(item.pay_date).toLocaleDateString('ru') }}
            </template>
			<template v-slot:item.fact_pay_date="{ item }">
                {{ new Date(item.fact_pay_date).toLocaleDateString('ru') }}
            </template>
            <template v-slot:item.rnh="{ item }">
                {{ item.rnh | formatRNH }}
            </template>
            <template v-slot:item.bill_pay="{ item }">
                <v-chip dark :class="getColorSum(item.bill_pay)">{{ item.bill_pay }}
                    <v-icon x-small>mdi-percent</v-icon>
                </v-chip>
            </template>
            <template v-slot:item.Jira="{ item }">
                <span :class="setColor()">{{ item.Jira }}</span>
            </template>
            <template v-slot:item.action="{ item }">
                <v-icon :disabled="true" small @click="edit(item)">edit</v-icon>
            </template>
        </v-data-table>
    </div>
</v-container>

<v-container v-else-if="!loadings && Pays.length === 0" fill-height fluid>
    <v-layout row fill-height align-center>
        <v-flex xs12 text-center>
            <v-progress-circular :size="100" color="primary" indeterminate></v-progress-circular>
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
import moment from 'moment'
import { AclRule } from 'vue-acl'
import GetConfig from '@/services/GetConfig'
import { formatDate } from '../../services/helpers'
import ProgressDialog from '../shared/ProgressDialog'
import _ from 'lodash'

export default {
	data () {
		return {
			filters: {
				client1C: '',
				pay1C: '',
				projectName: [],
				oneCName: [],
				payDate: [],
				yellow: '',
				jiraName: [],
				factPayDate: []
			},
			multiSelects: {
				jiraName: [],
				projectName: [],
				oneCName: []
			},
			show: false,
			menu: false,
			dialog: false,
			menuPayDate: false,
			menuFactPayDate: false,
			localloading: false,
			menu_filter: false,
			checkBox1: false,
			checkBox2: false,
			Filters: [],
			Pays: [],
			showForFilter: false,
			infoText: '',
			editItem: {},

			headers: [{
				text: 'id',
				value: 'id',
				selected: localStorage.paysColumn ? localStorage.paysColumn['id'] : false,
				visible: true
			},
			{
				text: 'Поставщик',
				value: 'client_1c',
				selected: localStorage.paysColumn ? localStorage.paysColumn['client_1c'] : false,
				visible: true,
				divider: true,
				filter: value => {
					if (!this.filters.client1C) return true
					if (!value) return false
					return value.toLowerCase().includes(this.filters.client1C.toLowerCase())
				}
			},
			{
				text: 'Документ',
				value: 'pay_1c',
				selected: localStorage.paysColumn ? localStorage.paysColumn['pay_1c'] : false,
				visible: true,
				divider: true,
				filter: value => {
					if (!this.filters.pay1C) return true
					if (!value) return false
					return value.toLowerCase().includes(this.filters.pay1C.toLowerCase())
				}
			},
			{
				text: 'Дата документа',
				value: 'pay_date',
				selected: localStorage.paysColumn ? localStorage.paysColumn['pay_date'] : false,
				visible: true,
				divider: true,
				width: 120,
				filter: value => {
					if (!this.filters.payDate || this.filters.payDate.length === 0) return true
					if (!value || isNaN(Date.parse(value))) return false
					let Arr = this.filters.payDate.map(item => moment(item).unix())
					let first = Math.min(...Arr)
					let last = Math.max(...Arr)
					return (moment(value).unix() >= first && moment(value).unix() <= last)
				}
			},
			{
				text: 'Валюта',
				value: 'currency_code',
				selected: localStorage.paysColumn ? localStorage.paysColumn['currency_code'] : false,
				visible: true,
				divider: true
			},
			{
				text: 'Сумма',
				value: 'pay_sum',
				selected: localStorage.paysColumn ? localStorage.paysColumn['pay_sum'] : false,
				visible: true,
				divider: true,
				width: 155
			},
			{
				text: 'Учётная валютная сумма',
				value: 'account_pay_sum',
				selected: localStorage.paysColumn ? localStorage.paysColumn['account_pay_sum'] : false,
				visible: true
			},
			{
				text: 'Проект 1С',
				value: 'project_name',
				selected: localStorage.paysColumn ? localStorage.paysColumn['project_name'] : false,
				visible: true,
				divider: true,
				filter: value => {
					if (this.filters.projectName.length === 0) return true
					if (!value) return false
					return value.includes(this.filters.projectName.find(item => item === value))
				}
			},
			{
				text: 'Жёлтый',
				value: 'yellow',
				selected: localStorage.paysColumn ? localStorage.paysColumn['yellow'] : false,
				visible: true,
				divider: true,
				filter: value => {
					if (!this.filters.yellow) return true
					if (!value) return false
					return value.toString().includes(this.filters.yellow.toString())
				}
			},
			{
				text: 'Статья 1C',
				value: 'one_c_name',
				divider: true,
				selected: localStorage.paysColumn ? localStorage.paysColumn['one_c_name'] : false,
				visible: true,
				filter: value => {
					if (this.filters.oneCName.length === 0) return true
					if (!value) return false
					return value.includes(this.filters.oneCName.find(item => item === value))
				}
			},
			{
				text: 'Статья расходов',
				value: 'jira_name',
				selected: localStorage.paysColumn ? localStorage.paysColumn['jira_name'] : false,
				visible: true,
				divider: true,
				filter: value => {
					if (this.filters.jiraName.length === 0) return true
					if (!value) return false
					return value.includes(this.filters.jiraName.find(item => item === value))
				}
			},
			{
				text: 'Фактическая дата',
				value: 'fact_pay_date',
				selected: localStorage.paysColumn ? localStorage.paysColumn['fact_pay_date'] : false,
				visible: true,
				divider: true,
				filter: value => {
					if (!this.filters.factPayDate || this.filters.factPayDate.length === 0) return true
					if (!value || isNaN(Date.parse(value))) return false
					let Arr = this.filters.factPayDate.map(item => moment(item).unix())
					let first = Math.min(...Arr)
					let last = Math.max(...Arr)
					return (moment(value).unix() >= first && moment(value).unix() <= last)
				}
			},
			{
				text: 'Ред.',
				value: 'action',
				selected: localStorage.paysColumn ? localStorage.paysColumn['action'] : false,
				visible: true
			}
			],
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
		jiraName () { return _.uniq(this.multiSelects.jiraName) },
		projectName () { return _.uniq(this.multiSelects.projectName) },
		oneCName () { return _.uniq(this.multiSelects.oneCName) },
		paySum () {
			const filteredSum = this.$refs.paysListTable.$children[0].filteredItems.map(arr => arr.pay_sum)
			return Math.round(_.sum(filteredSum)).toLocaleString('ru')
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
		loadings () {
			return this.$store.getters.loadings
		},
		Edit () {
			return new AclRule('user').and('engineer').or('admin').generate()
		},
		user () {
			return this.$store.getters.currentUser
		}
	},

	methods: {
		async getExel () {
			const filtered = await this.headers.filter(header => header.selected === true)
			filtered.forEach(item => {
				this.json_fields[item.text] = item.value
			})
			return this.$refs.paysListTable.$children[0].filteredItems
		},
		setColor (item) {
			return 'grey--text lighten-3'
		},
		getColorSum (sum) {
			if (sum >= 96) return 'green'
			else if (sum >= 5 && sum <= 95) return 'orange'
			else return 'red'
		},
		resetFilter () {
			for (let key in this.filters) {
				if (typeof this.filters[key] === 'object' && (this.filters[key] instanceof Array)) {
					this.filters[key] = []
				} else if (typeof this.filters[key] === 'object' && this.filters[key] !== null) {
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
			let paysColumn = {}
			let id = 'paysColumn'
			this.headers.forEach(header => {
				header.selected === null || header.selected === undefined ? paysColumn[header.value] = false : paysColumn[header.value] = header.selected
			})
			this.menu = false
			this.$store.dispatch('createLocalStorage', [paysColumn, id])
		},
		showAllColumn () {
			this.headers.forEach(header => {
				header.selected = true
			})
		},
		close () {
			this.dialog = false
		},
		edit (item) {
			this.editItem = {
				...item
			}
			this.dialog = true
		}
	},
	watch: {
	},

	components: {
		ProgressDialog
	},

	async created () {
		await this.$store.dispatch('FETCH_PAYS')
		await GetConfig.getColumn('paysColumn')
			.then((data) => {
				if (data) {
					this.headers.forEach(header => {
						for (var key in data) {
							if (key === header.value) {
								header.selected = data[key]
							}
						}
					})
					console.log('Данные о сохранеённых колонках успешно загружены: ', data)
				}
			})
			.catch(error => {
				this.show = true
				this.infoText = error.message
			})
			.finally(() => {
				this.Pays = this.$store.getters.Pays
				this.Pays.forEach((item, index) => {
					if (item.pay_date) item.pay_date = formatDate(item.pay_date)
					if (item.fact_pay_date) item.fact_pay_date = formatDate(item.fact_pay_date)
					if (item.jira_name) this.multiSelects.jiraName.push(item.jira_name)
					if (item.project_name) this.multiSelects.projectName.push(item.project_name)
					if (item.one_c_name) this.multiSelects.oneCName.push(item.one_c_name)
				})
			})
	},
	mounted () {
		let obj = {}
		for (let key in this.filters) {
			this.$watch(['filters', key].join('.'), (newVal, oldVal) => {
				if (newVal === null) newVal = ''
				obj[key] = newVal
				localStorage.setItem('filtersPays', JSON.stringify(obj))
			})
		}
		if (localStorage.filtersPays) {
			var ls = JSON.parse(localStorage.filtersPays)
			if (ls) {
				Object.keys(this.filters).forEach(key => {
					Object.entries(ls).forEach((item) => {
						if (JSON.parse(localStorage.getItem('filtersPays'))[item[0]] && JSON.parse(localStorage.getItem('filtersPays'))[item[0]] !== 'null' && item[0] === key) {
							this.filters[item[0]] = JSON.parse(localStorage.getItem('filtersPays'))[item[0]]
						}
					})
				})
			}
		}
	}
}
</script>

<style scoped>
.models {
    word-break: break-all
}

.cursor_btn {
    cursor: pointer;
    touch-action: none;
}

.maxWidth {
    max-width: 100px !important;
}
</style>
