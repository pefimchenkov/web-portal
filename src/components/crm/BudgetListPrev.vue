<template>
    <v-container v-if="!loadings && BudgetListPrev.length !== 0" container--fluid>
		<ProgressDialog :show="show" :infoText="infoText"></ProgressDialog>
		<!-- <BudgetDialog @closeDialog="close" :dialog='dialog' :item="editItem" :weeks="Weeks" :user="user"></BudgetDialog> -->
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
							:label="checkBox1 ? 'Открепить' : 'Закрепить'"
							></v-checkbox>
						</v-flex>
						<v-flex sm2 md2 lg1 xl1 class="hidden-sm-and-down">
							<v-checkbox
							hide-details
							v-model="checkBox2"
							:label="checkBox2 ? 'Разтянуть' : 'Сжать'"
							></v-checkbox>
						</v-flex>
					</v-layout>
					<v-flex xs4 sm2>
						<p class="headline">Прошлый реестр</p>
					</v-flex>
				<v-spacer></v-spacer>
			<v-flex xs3 sm3 md3 lg2 xl1>
				<v-btn width='95'>
					<download-excel
					:fields="json_fields"
					:fetch="getExel"
					class="btn btn-default xlsx_btn"
					name="budget_list_prev.xls"
				>
					<v-icon>save_alt</v-icon> excel
				</download-excel>
				</v-btn>
			</v-flex>
			<v-flex xs3 sm3 md3 lg2 xl1>
				<v-menu
					bottom
					transition="scale-transition"
					:close-on-content-click="false"
					v-model="menu"
					>
					<template v-slot:activator={on}>
						<v-btn  v-on="on">
						<v-icon left>list</v-icon>
						Колонки
					</v-btn>
					</template>

					<v-list class="pa-3">
						<v-btn
							@click="saveColumnFB"
							><v-icon color="success" class="mr-1">save</v-icon>
							Сохранить
						</v-btn>
						<v-btn
							@click="showAllColumn"
							><v-icon color="warning" class="mr-1">mdi-eye</v-icon>
							Включить всё
						</v-btn>
						<v-list-item
						v-for="(header, i) in headers"
						:key="i"
						dense
						>
						<v-checkbox
							:label="header.text"
							v-model="header.selected"
							:value="header.selected"
							v-if="header.visible"
							hide-details
						>
						</v-checkbox>
						</v-list-item>
					</v-list>
				</v-menu>
			</v-flex>
			<v-flex xs4 sm4 md4 lg2 xl2>
				<v-menu
					v-model="menu_filter"
					:close-on-content-click="false"
					offset-y
				>
				<template v-slot:activator="{ on }">
					<v-btn  v-on="on">
					<v-icon dark class="mr-2">filter_list</v-icon>
					Фильтры
				</v-btn>
				</template>
				<v-card class="text-center">
					<v-menu
						bottom
						transition="scale-transition"
						:close-on-content-click="false"
						>
					</v-menu>
					<v-list class="text-center">
						<v-list-item>
							<v-btn  text @click="resetFilter">Сбросить фильтр</v-btn>
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
          	:headers="computedHeaders"
          	:items="BudgetListPrev"
			:items-per-page=50
			item-key="id"
			:mobile-breakpoint="1050"
			sort-by='id'
			:dense="checkBox2"
			sort-desc
			ref="dataTable"
			:footer-props="{
				itemsPerPageAllText: 'Все',
				itemsPerPageOptions: [50,250,500,-1],
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
				<td><span>ИТОГО:</span></td>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td>
					<v-text-field v-if="$refs.dataTable" v-model="budgetSum" type="text" readonly append-icon="mdi-currency-rub"></v-text-field>
				</td>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td colspan="1"></td>
			</tr>
			<tr>
				<td v-if="computedHeaders.find(header => header.value === 'id')" colspan="1"></td>
				<td v-if="computedHeaders.find(header => header.value === 'client_1c')">
					<v-text-field clearable v-model="filters.client1C" type="text"></v-text-field>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'project_1c')">
					<v-autocomplete
						v-model="filters.project1C"
						multiple
						:items="project1C"
						deletable-chips
						clearable
						chips
					>
					</v-autocomplete>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'name')">
					<v-text-field clearable v-model="filters.name" type="text"></v-text-field>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'bill_1c')">
					<v-text-field clearable v-model="filters.bill1C" type="text"></v-text-field>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'bill_date')">
					<v-menu
						v-model="menuBillDate"
						:close-on-content-click="false"
						transition="scale-transition"
						ref="menuBillDate"
					>
						<template v-slot:activator="{ on }">
								<v-icon v-on="on" :color="filters.billDate !== null && filters.billDate.length > 0 ? `green darken-2` : ``">event</v-icon>
						</template>
						<v-date-picker v-model="filters.billDate" multiple no-title>
							<div class="flex-grow-1"></div>
							<v-btn text color="primary" @click="menuBillDate = false">Отмена</v-btn>
							<v-btn text color="primary" @click="$refs.menuBillDate.save(filters.billDate)">OK</v-btn>
						</v-date-picker>
					</v-menu>
					<v-icon v-if="filters.billDate !== null && filters.billDate.length > 0" @click="filters.billDate = []">clear</v-icon>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'firm')">
					<v-autocomplete
						v-model="filters.firm"
						multiple
						:items="firm"
						deletable-chips
						clearable
						chips
					>
					</v-autocomplete>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'rnh')" colspan="1"></td>
				<td v-if="computedHeaders.find(header => header.value === 'bill_sum')" colspan='1'>
					<v-text-field clearable v-model="filters.billSum" type="text"></v-text-field>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'bill_pay')">
					<v-select
					v-model="filters.billPay"
					clearable
					:items="['не оплачено', 'частично оплачено', 'полностью оплачено']"
				></v-select>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'Dolg')">
					<v-switch v-model="filters.Dolg"></v-switch>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'DolgSR')">
					<v-switch v-model="filters.DolgSR"></v-switch>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'Wait')">
					<v-switch v-model="filters.Wait"></v-switch>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'Jira')" colspan="1"></td>
				<td v-if="computedHeaders.find(header => header.value === 'action')" colspan='1'></td>
			</tr>
      	</template>
		<template v-slot:item.bill_sum="{ item }">
			{{ item.bill_sum.toLocaleString('ru') }}<v-icon color="primary" small v-if="item.bill_sum">mdi-currency-rub</v-icon>
		</template>
		<template v-slot:item.Dolg="{ item }">
			<span :style="(item.K === 'bold') ? 'font-weight: bold' : ''">{{ item.Dolg.toLocaleString('ru') }}</span><v-icon color="primary" small v-if="item.Dolg">mdi-currency-rub</v-icon>
		</template>
		<template v-slot:item.DolgSR="{ item }">
			{{ item.DolgSR.toLocaleString('ru') }}<v-icon color="primary" small v-if="item.DolgSR">mdi-currency-rub</v-icon>
		</template>
		<template v-slot:item.Wait="{ item }">
			{{ item.Wait.toLocaleString('ru') }}<v-icon color="primary" small v-if="item.Wait">mdi-currency-rub</v-icon>
		</template>
		<template v-slot:item.bill_date="{ item }">
			{{ new Date(item.bill_date).toLocaleDateString('ru') }}
		</template>
		<template v-slot:item.rnh="{ item }">
			{{ item.rnh | formatRNH }}
		</template>
		<template v-slot:item.bill_pay="{ item }">
			<v-chip dark :class="getColorSum(item.bill_pay)">{{ item.bill_pay }}<v-icon x-small>mdi-percent</v-icon></v-chip>
		</template>
		<template v-slot:item.Jira="{ item }">
			<span :class="setColor()">{{ item.Jira }}</span>
		</template>
		<template v-slot:item.action="{ item }">
            <v-icon small @click="edit(item)">edit</v-icon>
    	</template>
        </v-data-table>
      </div>
    </v-container>

    <v-container v-else-if="!loadings && BudgetListPrev.length === 0" fill-height fluid>
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
import BudgetDialog from '../crm/BudgetDialog'
import _ from 'lodash'

export default {
	data () {
		return {
			filters: {
				client1C: '',
				project1C: [],
				name: '',
				bill1C: '',
				firm: [],
				billSum: null,
				billPay: null,
				billDate: [],
				Dolg: null,
				DolgSR: null
			},
			multiSelects: {
				project1C: [],
				firm: []
			},
			show: false,
			menu: false,
			dialog: false,
			menuBillDate: false,
			localloading: false,
			menu_filter: false,
			checkBox1: false,
			checkBox2: false,
			Filters: [],
			BudgetListPrev: [],
			Weeks: [],
			showForFilter: false,
			infoText: '',
			editItem: {},
			headers: [
				{ text: 'id',
					value: 'id',
					selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['id'] : false,
					visible: true,
					divider: true
				},
				{ text: 'Код контрагента',
					value: 'client_1c',
					selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['client_1c'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.client1C) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.client1C.toLowerCase())
					}
				},
				{ text: 'Проект 1С',
					value: 'project_1c',
					selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['project_1c'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (this.filters.project1C.length === 0) return true
						if (!value) return false
						return value.includes(this.filters.project1C.find(item => item === value))
					}
				},
				{ text: 'Клиент',
					value: 'name',
					selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['name'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.name) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.name.toLowerCase())
					}
				},
				{ text: 'Счёт',
					value: 'bill_1c',
					selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['bill_1c'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.bill1C) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.bill1C.toLowerCase())
					}
				},
				{ text: 'Дата счёта',
					value: 'bill_date',
					selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['bill_date'] : false,
					visible: true,
					divider: true,
					width: 120,
					filter: value => {
						if (!this.filters.billDate || this.filters.billDate.length === 0) return true
						if (!value || isNaN(Date.parse(value))) return false
						let Arr = this.filters.billDate.map(item => moment(item).unix())
						let first = Math.min(...Arr)
						let last = Math.max(...Arr)
						return (moment(value).unix() >= first && moment(value).unix() <= last)
					}
				},
				{ text: 'Фирма',
					value: 'firm',
					selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['firm'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (this.filters.firm.length === 0) return true
						if (!value) return false
						return value.includes(this.filters.firm.find(item => item === value))
					}
				},
				{ text: 'РНХ',
					value: 'rnh',
					divider: true,
					selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['rnh'] : false,
					visible: true
				},
				{ text: 'Cумма (р.)',
					value: 'bill_sum',
					selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['bill_sum'] : false,
					visible: true,
					divider: true,
					width: 160,
					filter: value => {
						if (!this.filters.billSum) return true
						if (!value) return false
						return value.toString().includes(this.filters.billSum.toString())
					}
				},
				{ text: 'Оплата (%)',
					value: 'bill_pay',
					selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['bill_pay'] : false,
					visible: true,
					divider: true,
					width: 100,
					filter: value => {
						if (!this.filters.billPay) return true
						if (this.filters.billPay === 'не оплачено') return (value === 0 || value <= 5)
						if (this.filters.billPay === 'полностью оплачено') return ((parseInt(value) + 5) >= 100)
						if (this.filters.billPay === 'частично оплачено') return (parseInt(value) <= 94 && parseInt(value) >= 6)
					}
				},
				{ text: 'Долг',
					value: 'Dolg',
					selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['Dolg'] : false,
					visible: true,
					divider: true,
					width: 135,
					filter: value => {
						if (!this.filters.Dolg) return true
						if (this.filters.Dolg) {
							return value !== 0
						}
					}
				},
				{ text: 'Долг СР',
					value: 'DolgSR',
					selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['DolgSR'] : false,
					visible: true,
					divider: true,
					width: 135,
					filter: value => {
						if (!this.filters.DolgSR) return true
						if (this.filters.DolgSR) {
							return value !== 0
						}
					}
				},
				{ text: 'Теория',
					value: 'Wait',
					selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['Wait'] : false,
					visible: true,
					divider: true,
					width: 135,
					filter: value => {
						if (!this.filters.Wait) return true
						if (this.filters.Wait) {
							return value !== 0
						}
					}
				},
				{ text: 'JIRA',
					value: 'Jira',
					selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['Jira'] : false,
					visible: true,
					divider: true,
					width: 300
				},
				{ text: 'Ред.',
					value: 'action',
					selected: true,
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

	watch: {
		'$route.params.dolg': {
			deep: true,
			immediate: true,
			handler (val) {
				if (val) return (this.filters.Dolg = true)
			}
		},
		'$route.params.teoria': {
			deep: true,
			immediate: true,
			handler (val) {
				if (val) return (this.filters.Wait = true)
			}
		}
	},

	filters: {
		formatRNH: (value) => {
			return parseInt(value)
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
			case 'xs': return false
			case 'sm': return false
			default: return true
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
		},
		project1C () { return _.uniq(this.multiSelects.project1C) },
		firm () { return _.uniq(this.multiSelects.firm) },
		budgetSum () {
			const filteredSum = this.$refs.dataTable.$children[0].filteredItems.map(arr => arr.bill_sum)
			return Math.round(_.sum(filteredSum)).toLocaleString('ru')
		}
	},

	methods: {
		async getExel () {
			const filtered = await this.headers.filter(header => header.selected === true)
			filtered.forEach(item => {
				this.json_fields[item.text] = item.value
			})
			return this.$refs.dataTable.$children[0].filteredItems
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
			let budgetPrevColumn = {}
			let id = 'budgetPrevColumn'
			this.headers.forEach(header => {
				header.selected === null || header.selected === undefined ? budgetPrevColumn[header.value] = false : budgetPrevColumn[header.value] = header.selected
			})
			this.menu = false
			this.$store.dispatch('createLocalStorage', [budgetPrevColumn, id])
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
			this.editItem = { ...item }
			this.dialog = true
		}
	},

	components: {
		ProgressDialog,
		BudgetDialog
	},

	async created () {
		await this.$store.dispatch('FETCH_BUDGET_PREV')
		await GetConfig.getColumn('budgetPrevColumn')
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
				this.BudgetListPrev = this.$store.getters.BudgetPrev
				this.BudgetListPrev.forEach((item, index) => {
					if (item.bill_pay === null) {
						item.bill_pay = 0
					} else {
						if (item.bill_sum === 0) item.bill_pay = 0
						else item.bill_pay = ((parseFloat(item.bill_pay) / parseFloat(item.bill_sum)) * 100).toFixed()
					}
					if (item.bill_date) item.bill_date = formatDate(item.bill_date)
					if (item.project_1c) this.multiSelects.project1C.push(item.project_1c)
					if (item.firm) this.multiSelects.firm.push(item.firm)
				})
			})
	},
	mounted () {
		let obj = {}
		for (let key in this.filters) {
			this.$watch(['filters', key].join('.'), (newVal, oldVal) => {
				if (newVal === null) newVal = ''
				obj[key] = newVal
				localStorage.setItem('filtersBudgetPrev', JSON.stringify(obj))
			})
		}
		if (localStorage.filtersBudgetPrev) {
			var ls = JSON.parse(localStorage.filtersBudgetPrev)
			if (ls) {
				Object.keys(this.filters).forEach(key => {
					Object.entries(ls).forEach((item) => {
						if (JSON.parse(localStorage.getItem('filtersBudgetPrev'))[item[0]] && JSON.parse(localStorage.getItem('filtersBudgetPrev'))[item[0]] !== 'null' && item[0] === key) {
							this.filters[item[0]] = JSON.parse(localStorage.getItem('filtersBudgetPrev'))[item[0]]
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
