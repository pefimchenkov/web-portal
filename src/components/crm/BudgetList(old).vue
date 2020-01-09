<template>
    <v-container v-if="!loadings && Budget.length !== 0" container--fluid>
		<ProgressDialog :show="show" :infoText="infoText"></ProgressDialog>
		<BudgetDialog @closeDialog="close" :dialog='dialog' :item="editItem" :weeks="Weeks" :user="user"></BudgetDialog>
		<v-app-bar :fixed="checkBox1" text color="white" class="elevation-2 mb-1">
			<v-container container--fluid>
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
				<v-spacer></v-spacer>
			<v-flex xs3 sm3 md3 lg2 xl1>
				<v-btn width='95'>
					<download-excel
					:fields="json_fields"
					:fetch="getExel"
					class="btn btn-default xlsx_btn"
					name="zip_list.xls"
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
          	:items="Budget"
			:items-per-page=50
			item-key="id"
			:mobile-breakpoint="1050"
			sort-by='id'
			:dense="checkBox2"
			sort-desc
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
				<td v-if="computedHeaders.find(header => header.value === 'id')" colspan="1"></td>
				<td v-if="computedHeaders.find(header => header.value === 'bill_1c')">
					<v-text-field clearable v-model="filters.bill1C" type="text"></v-text-field>
				</td>
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
				<td v-if="computedHeaders.find(header => header.value === 'zp_sum')">
					<v-select
					v-model="filters.zpDone"
					clearable
					:items="['не закрыт', 'закрыт']"
					small-chips
				></v-select>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'zp_date')" colspan='1'></td>
				<td v-if="computedHeaders.find(header => header.value === 'zakupka_sum')">
					<v-select
					v-model="filters.zakupkaDone"
					clearable
					:items="['не закрыт', 'закрыт']"
					small-chips
				></v-select>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'zakupka_date')" colspan='1'></td>
				<td v-if="computedHeaders.find(header => header.value === 'credit_sum')">
					<v-select
					v-model="filters.creditDone"
					clearable
					:items="['не закрыт', 'закрыт']"
					small-chips
				></v-select>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'credit_date')" colspan='1'></td>
				<td v-if="computedHeaders.find(header => header.value === 'other_sum')">
					<v-select
					v-model="filters.otherDone"
					clearable
					:items="['не закрыт', 'закрыт']"
					small-chips
				></v-select>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'other_date')" colspan='1'></td>
				<td v-if="computedHeaders.find(header => header.value === 'responsible')">
					<v-text-field clearable v-model="filters.responsible" type="text"></v-text-field>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'date')">
					<v-text-field clearable v-model="filters.date" type="text"></v-text-field>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'action')" colspan='1'></td>
			</tr>
      	</template>
		<template v-slot:item.bill_sum="{ item }">
			{{ item.bill_sum }}<v-icon small>mdi-currency-rub</v-icon>
		</template>
		<template v-slot:item.bill_pay="{ item }">
			<v-chip outlined :color="getColorSum(item.bill_pay)">{{ item.bill_pay }}<v-icon x-small>mdi-percent</v-icon></v-chip>
		</template>
		<template v-slot:item.zp_sum="{ item }">
			<v-chip small :color="getColor(item.zp_done)">{{ item.zp_sum }} <v-icon small v-if="item.zp_sum">mdi-currency-rub</v-icon></v-chip>
		</template>
		<template v-slot:item.zakupka_sum="{ item }">
			<v-chip light small :color="getColor(item.zakupka_done)">{{ item.zakupka_sum }} <v-icon small v-if="item.zakupka_sum">mdi-currency-rub</v-icon></v-chip>
		</template>
		<template v-slot:item.credit_sum="{ item }">
			<v-chip light small :color="getColor(item.credit_done)">{{ item.credit_sum }} <v-icon small v-if="item.credit_sum">mdi-currency-rub</v-icon></v-chip>
		</template>
		<template v-slot:item.other_sum="{ item }">
			<v-chip light small :color="getColor(item.other_done)">{{ item.other_sum }} <v-icon small v-if="item.other_sum">mdi-currency-rub</v-icon></v-chip>
		</template>
		<template v-slot:item.action="{ item }">
            <v-icon small @click="edit(item)">edit</v-icon>
    	</template>
        </v-data-table>
      </div>
    </v-container>

    <v-container v-else-if="!loadings && Budget.length === 0" fill-height containet--fluid>
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

import ProgressDialog from '../shared/ProgressDialog'
import BudgetDialog from '../crm/BudgetDialog'

export default {
	data () {
		return {
			filters: {
				bill1C: '',
				billSum: null,
				billPay: '',
				zpDone: null,
				zakupkaDone: null,
				creditDone: null,
				otherDone: null,
				responsible: '',
				date: ''
			},
			show: false,
			menu: false,
			dialog: false,
			localloading: false,
			menu_filter: false,
			checkBox1: false,
			checkBox2: false,
			Filters: [],
			Budget: [],
			Weeks: [],
			showForFilter: false,
			infoText: '',
			editItem: {},
			headers: [
				{ text: 'id',
					value: 'id',
					selected: localStorage.budgetColumn ? localStorage.budgetColumn['id'] : false,
					visible: true
				},
				{ text: 'Счёт',
					value: 'bill_1c',
					selected: localStorage.budgetColumn ? localStorage.budgetColumn['bill_1c'] : false,
					visible: true,
					filter: value => {
						if (!this.filters.bill1C) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.bill1C.toLowerCase())
					}
				},
				{ text: 'Cумма',
					value: 'bill_sum',
					selected: localStorage.budgetColumn ? localStorage.budgetColumn['bill_sum'] : false,
					visible: true,
					width: 100,
					filter: value => {
						if (!this.filters.billSum) return true
						if (!value) return false
						return value.toString().includes(this.filters.billSum.toString())
					}
				},
				{ text: 'Оплата',
					value: 'bill_pay',
					selected: localStorage.budgetColumn ? localStorage.budgetColumn['bill_pay'] : false,
					visible: true,
					width: 100,
					filter: value => {
						if (!this.filters.billPay) return true
						// if (!value) return false
						if (this.filters.billPay === 'не оплачено') return (value === 0 || value <= 5)
						if (this.filters.billPay === 'полностью оплачено') return ((parseInt(value) + 5) >= 100)
						if (this.filters.billPay === 'частично оплачено') return (parseInt(value) <= 94 && parseInt(value) >= 6)
					}
				},
				{ text: 'ЗП (сум.)',
					value: 'zp_sum',
					selected: localStorage.budgetColumn ? localStorage.budgetColumn['zp_sum'] : false,
					visible: true,
					width: 100,
					filter: (value, search, item) => {
						if (!this.filters.zpDone) return true
						if (this.filters.zpDone === 'закрыт') {
							if (item.zp_done === 1) {
								return value
							}
						}
						if (this.filters.zpDone === 'не закрыт') {
							if (item.zp_done === 0 || item.zp_done === null) {
								return value.toString()
							}
						}
					}
				},
				{ text: 'ЗП (неделя)',
					value: 'zp_date',
					selected: localStorage.budgetColumn ? localStorage.budgetColumn['zp_date'] : false,
					visible: true
				},
				{ text: 'Закупка (сум.)',
					value: 'zakupka_sum',
					selected: localStorage.budgetColumn ? localStorage.budgetColumn['zakupka_sum'] : false,
					visible: true,
					width: 100,
					filter: (value, search, item) => {
						if (!this.filters.zakupkaDone) return true
						if (this.filters.zakupkaDone === 'закрыт') {
							if (item.zakupka_done === 1) {
								return value
							}
						}
						if (this.filters.zakupkaDone === 'не закрыт') {
							if (item.zakupka_done === 0 || item.zakupka_done === null) {
								return value.toString()
							}
						}
					}
				},
				{ text: 'Закупка (неделя)',
					value: 'zakupka_date',
					selected: localStorage.budgetColumn ? localStorage.budgetColumn['zakupka_date'] : false,
					visible: true
				},
				{ text: 'Кредит (сум.)',
					value: 'credit_sum',
					selected: localStorage.budgetColumn ? localStorage.budgetColumn['credit_sum'] : false,
					visible: true,
					width: 100,
					filter: (value, search, item) => {
						if (!this.filters.creditDone) return true
						if (this.filters.creditDone === 'закрыт') {
							if (item.credit_done === 1) {
								return value
							}
						}
						if (this.filters.creditDone === 'не закрыт') {
							if (item.credit_done === 0 || item.credit_done === null) {
								return value.toString()
							}
						}
					}
				},
				{ text: 'Кредит (неделя)',
					value: 'credit_date',
					selected: localStorage.budgetColumn ? localStorage.budgetColumn['credit_date'] : false,
					visible: true
				},
				{ text: 'Другое (сум.)',
					value: 'other_sum',
					selected: localStorage.budgetColumn ? localStorage.budgetColumn['other_sum'] : false,
					visible: true,
					width: 100,
					filter: (value, search, item) => {
						if (!this.filters.otherDone) return true
						if (this.filters.otherDone === 'закрыт') {
							if (item.other_done === 1) {
								return value
							}
						}
						if (this.filters.otherDone === 'не закрыт') {
							if (item.other_done === 0 || item.other_done === null) {
								return value.toString()
							}
						}
					}
				},
				{ text: 'Другое (неделя)',
					value: 'other_date',
					selected: localStorage.budgetColumn ? localStorage.budgetColumn['other_date'] : false,
					visible: true
				},
				{ text: 'Ответственный',
					value: 'responsible',
					selected: localStorage.budgetColumn ? localStorage.budgetColumn['responsible'] : false,
					visible: true,
					filter: value => {
						if (!this.filters.responsible) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.responsible.toLowerCase())
					}
				},
				{ text: 'Дата',
					value: 'date',
					selected: localStorage.budgetColumn ? localStorage.budgetColumn['date'] : false,
					visible: true,
					filter: value => {
						if (!this.filters.date) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.date.toLowerCase())
					}
				},
				{ text: 'Ред.',
					value: 'action',
					selected: true,
					visible: true,
					divider: true
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
		formatDate: (value) => {
			if (value) {
				if (typeof moment(new Date(value)).toISOString() !== 'object') {
					return moment(new Date(value)).format('YYYY-MM-DD')
				} else {
					return moment(new Date(value.toString())).format('YYYY-MM-DD')
				}
			} else {
				return null
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
		}
	},

	/* watch: {
		dialog (val) {
			val || this.close()
		}
	}, */
	methods: {
		async getExel () {
			const filtered = this.headers.filter(header => header.selected === true)
			filtered.forEach(item => {
				this.json_fields[item.text] = item.value
			})
			return this.$refs.dataTable.$children[0].filteredItems
		},
		getColor (done) {
			if (done === 1) return 'green lighten-3'
			else return 'grey lighten-3'
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
			let budgetColumn = {}
			let id = 'budgetColumn'
			this.headers.forEach(header => {
				header.selected === null || header.selected === undefined ? budgetColumn[header.value] = false : budgetColumn[header.value] = header.selected
			})
			this.menu = false
			this.$store.dispatch('createLocalStorage', [budgetColumn, id])
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
		await this.$store.dispatch('FETCH_WEEKS')
		await GetConfig.getColumn('budgetColumn')
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
				this.Budget = this.$store.getters.Budget
				this.Weeks = this.$store.getters.Weeks
				this.Budget.forEach((item, index) => {
					if (item.bill_pay === null) {
						item.bill_pay = 0
					} else {
						item.bill_pay = ((parseFloat(item.bill_pay) / parseFloat(item.bill_sum)) * 100).toFixed()
					}
					if (item.zp_sum === null) item.zp_sum = 0
					if (item.zakupka_sum === null) item.zakupka_sum = 0
					if (item.credit_sum === null) item.credit_sum = 0
					if (item.other_sum === null) item.other_sum = 0
				})
			})
	},
	mounted () {
		let obj = {}
		for (let key in this.filters) {
			this.$watch(['filters', key].join('.'), (newVal, oldVal) => {
				if (newVal === null) newVal = ''
				obj[key] = newVal
				localStorage.setItem('filtersBudget', JSON.stringify(obj))
			})
		}
		if (localStorage.filtersBudget) {
			var ls = JSON.parse(localStorage.filtersBudget)
			if (ls) {
				Object.keys(this.filters).forEach(key => {
					Object.entries(ls).forEach((item) => {
						if (JSON.parse(localStorage.getItem('filtersBudget'))[item[0]] && JSON.parse(localStorage.getItem('filtersBudget'))[item[0]] !== 'null' && item[0] === key) {
							this.filters[item[0]] = JSON.parse(localStorage.getItem('filtersBudget'))[item[0]]
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
