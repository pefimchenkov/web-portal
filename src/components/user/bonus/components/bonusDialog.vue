<template>
	<div>
	<v-app-bar
	dense
	fixed
	>
	Пользователь: {{ jira_users.find(user => user.email === this.email).display_name }}
	<v-spacer></v-spacer>
		<v-btn color="primary">
			<download-excel
			:fields="getJsonFields"
			:data="BonusPerManager"
			class="btn btn-default xlsx_btn"
			name="bonus.xls"
			>Excell
			</download-excel>
		</v-btn>
	</v-app-bar>
	<v-data-table
		:headers="computedHeaders"
		:items="BonusPerManager"
		fixed-header
		calculate-widths
		:items-per-page="15"
		item-key="id"
		sort-by="id"
		sort-desc
		dense
		class="pa-4"
		:footer-props="{
				itemsPerPageAllText: 'Все',
				itemsPerPageText: 'Строк на странице:',
				itemsPerPageOptions: [15,50,150,-1],
				showFirstLastPage: true,
				firstIcon: 'mdi-arrow-collapse-left',
				lastIcon: 'mdi-arrow-collapse-right',
				prevIcon: 'mdi-minus',
				nextIcon: 'mdi-plus'
			}"
		>
		<template v-slot:item.HeadManager="{item}">
			{{ UserName(item.HeadManager) }}
		</template>
		<template v-slot:item.Manager="{item}">
			{{ UserName(item.Manager) }}
		</template>
		<template v-slot:item.LocalManager="{item}">
			{{ UserName(item.LocalManager) }}
		</template>
	</v-data-table>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
	props: {
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		}
	},
	data () {
		return {
			headers: [
				{ text: 'Счёт 1С',
					value: 'bill_1c',
					selected: true,
					divider: true
				},
				{ text: 'Проект 1С',
					value: 'project_1c',
					selected: true,
					divider: true
				},
				{ text: 'Номер отгрузки',
					value: 'doc_num',
					selected: true,
					divider: true
				},
				{ text: 'Дата отгрузки',
					value: 'doc_date',
					selected: true,
					divider: true
				},
				{ text: 'Арт клиента счёт',
					value: 'client_1c',
					selected: true,
					divider: true
				},
				{ text: 'Клиент счёт',
					value: 'client_name',
					selected: true,
					divider: true
				},
				{ text: 'Сумма отгрузки',
					value: 'doc_sum',
					selected: true,
					divider: true
				},
				{ text: 'Куратор',
					value: 'HeadManager',
					selected: true,
					divider: true
				},
				{ text: 'Менеджер',
					value: 'Manager',
					selected: true,
					divider: true
				},
				{ text: 'Отв. менеджер',
					value: 'LocalManager',
					selected: true,
					divider: true
				},
				{ text: 'Задача',
					value: 'Key',
					selected: true,
					divider: true
				},
				{ text: 'Статус',
					value: 'Status',
					selected: true,
					divider: true
				},
				{ text: 'Клиент задача',
					value: 'Client',
					selected: true,
					divider: true
				},
				{ text: '% Куратора',
					value: 'hmp',
					selected: true,
					divider: true
				},
				{ text: '% Менеджера',
					value: 'mp',
					selected: true,
					divider: true
				},
				{ text: '% Отв. менеджера',
					value: 'lmp',
					selected: true,
					divider: true
				},
				{ text: '% ОМ факт',
					value: 'lmpX',
					selected: true,
					divider: true
				},
				{ text: 'Тип',
					value: 'Type',
					selected: true,
					divider: true
				}
			]
		}
	},
	computed: {
		...mapState({
			BonusSale: state => state.user.BonusSale,
			BonusProfit: state => state.user.BonusProfit
		}),
		...mapGetters(['currentUser', 'jira_users']),
		computedHeaders () {
			return this.headers.filter(header => header.selected)
		},
		getJsonFields () {
			let obj = {}
			this.headers.forEach(item => {
				obj[item.text] = item.value
			})
			return obj
		},
		BonusPerManager () {
			if (this.name === 'Продажи') {
				return this.BonusSale.filter(item => (item.HeadManager === this.email || item.Manager === this.email || item.LocalManager === this.email))
			}
			if (this.name === 'Доходность') {
				return this.BonusProfit.filter(item => (item.HeadManager === this.email || item.Manager === this.email || item.LocalManager === this.email))
			}
		}
	},
	watch: {
		name (value) {
			if (value === 'Доходность') {
				this.headers.forEach(header => {
					if (header.text === 'Куратор') header.text = 'Вед. инженер'
					if (header.text === 'Менеджер') header.text = 'Отв. инженер'
					if (header.text === 'Отв. менеджер') header.text = 'Отв. бухгалтер'
					if (header.text === '% Куратора') header.text = '% Вед. инженера'
					if (header.text === '% Менеджера') header.text = '% Отв. инженера'
					if (header.text === '% Отв. менеджера') header.text = '% Отв. бухгалтера'
				})
			}
			if (value === 'Продажи') {
				this.headers.forEach(header => {
					if (header.text === 'Вед. инженер') header.text = 'Куратор'
					if (header.text === 'Отв. инженер') header.text = 'Менеджер'
					if (header.text === 'Отв. бухгалтер') header.text = 'Отв. менеджер'
					if (header.text === '% Вед. инженера') header.text = '% Куратора'
					if (header.text === '% Отв. инженера') header.text = '% Менеджера'
					if (header.text === '% Отв. бухгалтера') header.text = '% Отв. менеджера'
				})
			}
		}
	},
	methods: {
		UserName (email) {
			const Item = this.jira_users.find(item => item.email === email)
			if (Item) return Item.display_name
			else return null
		}
		/* getJsonData () {
			return this.BonusSalePerManager.map(item => (item.doc_date = new Date(item.doc_date).toLocaleDateString('ru')))
		} */
	},
	created () {
		this.$store.dispatch('fetchJiraUsers')
	}
}
</script>

<style lang="scss" scoped></style>
