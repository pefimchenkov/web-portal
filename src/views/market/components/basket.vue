<template>
	<div>
		<Confirm ref="confirm"></Confirm>
		<v-row justify="center" align="center">
			<v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
			<template v-slot:activator="{ on }">
				<v-btn color="primary" dark v-on="on" class="mt-1">
					<v-icon>shopping_cart</v-icon>
				</v-btn>
			</template>

			<v-card>
				<v-toolbar dark color="primary">
					<v-btn text @click="removeBasket">
						<v-icon>mdi-delete</v-icon>Очистить корзину
					</v-btn>
					<v-spacer></v-spacer>
				<v-btn text :disabled="columnPrice && columnPartner && columnOpt">
					<download-excel
					:fields="JsonFields()"
					:fetch="JsonData"
					class="btn btn-default"
					name="basket_list.xls"
				>
					<v-icon>save_alt</v-icon> excel
				</download-excel>
				</v-btn>
				<v-btn text @click="dialog = false">
					<v-icon>mdi-close</v-icon>Закрыть
				</v-btn>
				<v-spacer></v-spacer>
				<v-toolbar-items>
					<v-btn dark text @click="saveOrder" :disabled="columnPrice && columnPartner && columnOpt">Сохранить</v-btn>
				</v-toolbar-items>
				</v-toolbar>
				<v-toolbar-title class="text-center mt-5">Корзина:
					<v-edit-dialog
						large
						persistent
						ref="Comment"
						cancel-text="Отменить"
						save-text="Сохранить"
					>
					<span>Комментарий к заказу: </span>
					<span style="color: green">{{ Comment || ' __________ ' }}</span>
					{{ '(' }}<v-icon x-small class="ma-1">mdi-pencil</v-icon>{{ ')' }}
						<template v-slot:input>
							<v-text-field
								v-model="Comment"
								single-line
								counter
								label="( Введите свой комментарий )"
							></v-text-field>
						</template>
					</v-edit-dialog>
				</v-toolbar-title>
				<v-container fluid>
					<v-data-table
						:items="MarketItems"
						:headers="computedHeaders"
						hide-default-footer
						class="elevation-2 mt-5"
						ref="Basket"
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
					<template v-slot:item.marketPRICEPERONE="{ item }">
						<span v-if="checkPrice">{{ changeRatePerOne(item).toLocaleString('ru') }}</span>
						<span v-if="checkPartner">{{ changeRatePerOne(item).toLocaleString('ru') }}</span>
						<span v-if="checkOpt">{{ changeRatePerOne(item).toLocaleString('ru') }}</span>
						<v-icon color="blue" small>mdi-currency-rub</v-icon>
					</template>
					<template v-slot:item.marketSALE="{ item }">
						{{ changeRate(item).toLocaleString('ru') }}
						<v-icon color="blue" small>mdi-currency-rub</v-icon>
					</template>
					<template v-slot:item.marketPARTNER="{ item }">
						{{ (changeRate(item) * 0.9).toLocaleString('ru')  }}
						<v-icon color="blue" small>mdi-currency-rub</v-icon>
					</template>
					<template v-slot:item.marketOPT="{ item }">
						{{ (changeRate(item) * 0.8).toLocaleString('ru') }}
						<v-icon color="blue" small>mdi-currency-rub</v-icon>
					</template>
					<template v-slot:item.Count="{ item }">
						<v-edit-dialog
							large
							persistent
							ref="Count"
							@save="updateCount(item.marketid, item.Count)"
							cancel-text="Отмена"
							save-text="Сохранить"
						>
						<v-icon x-small class="mr-3">mdi-pencil</v-icon>{{ item.Count = ItemCount(item.marketid) }}
							<template v-slot:input>
								<v-text-field
									v-model="item.Count"
									label="Редактировать"
									single-line
								></v-text-field>
							</template>
						</v-edit-dialog>
					</template>
					<template v-slot:item.action="{ item }">
						<v-btn @click="del(item.marketid)" icon text><v-icon small color="red">cancel</v-icon></v-btn>
					</template>
					<template v-slot:body.append="{ }">
						<tr>
							<td :colspan="computedHeaders.length - 4" align="end" class="mr-3">
								Всего:
							</td>
							<td v-if="columnPrice" class="pt-3">
								<span v-if="$refs.Basket && !checkPrice">{{ PriceSum.toLocaleString('ru') }}<v-icon color="blue" small>mdi-currency-rub</v-icon></span>
								<span v-if="$refs.Basket && checkPrice">{{ PriceSum.toLocaleString('ru') }}<v-icon color="blue" small>mdi-currency-rub</v-icon></span>
								<v-checkbox hide-details dense v-model="checkPrice"></v-checkbox>
							</td>
							<td v-if="columnPartner" class="pt-3">
								<span v-if="$refs.Basket && !checkPartner">{{ (PriceSum * 0.9).toLocaleString('ru') }}<v-icon color="blue" small>mdi-currency-rub</v-icon></span>
								<span v-if="$refs.Basket && checkPartner">{{ PriceSum.toLocaleString('ru') }}<v-icon color="blue" small>mdi-currency-rub</v-icon></span>
								<v-checkbox hide-details dense v-model="checkPartner"></v-checkbox>
							</td>
							<td v-if="columnOpt" class="pt-3">
								<span v-if="$refs.Basket && !checkOpt">{{ (PriceSum * 0.8).toLocaleString('ru') }}<v-icon color="blue" small>mdi-currency-rub</v-icon></span>
								<span v-if="$refs.Basket && checkOpt">{{ PriceSum.toLocaleString('ru') }}<v-icon color="blue" small>mdi-currency-rub</v-icon></span>
								<v-checkbox hide-details dense v-model="checkOpt"></v-checkbox>
							</td>
						</tr>
					</template>
					</v-data-table>
				</v-container>
			</v-card>
			</v-dialog>
		</v-row>
	</div>
</template>

<script>

import Confirm from '@/components/shared/Confirm'
import { mapState } from 'vuex'
import _ from 'lodash'

export default {
	components: {
		Confirm
	},
	data () {
		return {
			dialog: false,
			checkPrice: false,
			checkPartner: false,
			checkOpt: false,
			Comment: '',
			json_fields: {},
			headers: [
				{ text: 'Макет ID',
					value: 'marketid',
					selected: true,
					divider: true,
					width: 100
				},
				{ text: 'Название',
					value: 'marketNAME',
					selected: true,
					divider: true,
					width: 300
				},
				{ text: 'Тип',
					value: 'marketTYPE',
					selected: true,
					divider: true,
					width: 100
				},
				{ text: 'Артикул',
					value: 'marketART',
					selected: true,
					divider: true,
					width: 100
				},
				{ text: 'Кол-во',
					value: 'Count',
					selected: true,
					divider: true,
					width: 50
				},
				{ text: 'Цена за штуку',
					value: 'marketPRICEPERONE',
					selected: false,
					divider: true,
					width: 130
				},
				{ text: 'Итого (продажа)',
					value: 'marketSALE',
					selected: true,
					divider: true,
					width: 130
				},
				{ text: 'Итого (партнёр)',
					value: 'marketPARTNER',
					selected: true,
					divider: true,
					width: 130
				},
				{ text: 'Итого (опт)',
					value: 'marketOPT',
					selected: true,
					divider: true,
					width: 130
				},
				{ text: 'Действие',
					value: 'action',
					selected: true,
					divider: true,
					width: 130
				}
			]
		}
	},
	watch: {
		checkPrice (value) {
			if (value) {
				this.headers[7].selected = false
				this.headers[8].selected = false
				this.headers[5].selected = true
			} else {
				this.headers[7].selected = true
				this.headers[8].selected = true
			}
		},
		checkPartner (value) {
			if (value) {
				this.headers[6].selected = false
				this.headers[8].selected = false
				this.headers[5].selected = true
			} else {
				this.headers[6].selected = true
				this.headers[8].selected = true
			}
		},
		checkOpt (value) {
			if (value) {
				this.headers[6].selected = false
				this.headers[7].selected = false
				this.headers[5].selected = true
			} else {
				this.headers[6].selected = true
				this.headers[7].selected = true
			}
		}
	},
	computed: {
		...mapState({
			Basket: state => state.market.Basket,
			Market: state => state.market.Market,
			Currency: state => state.currency.Currency
		}),
		MarketItems () {
			const MarketItems = this.Market.filter(item => this.Basket.find(basket => parseInt(basket.marketid) === parseInt(item.marketid)))
			MarketItems.map(item => {
				if (this.checkPartner) {
					if (item.CUR === '$') item.marketPRICEPERONE = item.marketPRICE * item.RATIO_2 * 0.9 * this.Currency.find(i => i.sign === item.CUR).rate
					if (item.CUR === '€') item.marketPRICEPERONE = item.marketPRICE * item.RATIO_2 * 0.9 * this.Currency.find(i => i.sign === item.CUR).rate
					if (item.CUR === '₽') item.marketPRICEPERONE = item.marketPRICE * item.RATIO_2 * 0.9
				} else if (this.checkOpt) {
					if (item.CUR === '$') item.marketPRICEPERONE = item.marketPRICE * item.RATIO_2 * 0.8 * this.Currency.find(i => i.sign === item.CUR).rate
					if (item.CUR === '€') item.marketPRICEPERONE = item.marketPRICE * item.RATIO_2 * 0.8 * this.Currency.find(i => i.sign === item.CUR).rate
					if (item.CUR === '₽') item.marketPRICEPERONE = item.marketPRICE * item.RATIO_2 * 0.8
				} else {
					if (item.CUR === '$') item.marketPRICEPERONE = item.marketPRICE * item.RATIO_2 * this.Currency.find(i => i.sign === item.CUR).rate
					if (item.CUR === '€') item.marketPRICEPERONE = item.marketPRICE * item.RATIO_2 * this.Currency.find(i => i.sign === item.CUR).rate
					if (item.CUR === '₽') item.marketPRICEPERONE = item.marketPRICE * item.RATIO_2
				}
			})
			return MarketItems
		},
		loadings () {
			return this.$store.getters.loadings
		},
		computedHeaders () {
			return this.headers.filter(item => item.selected)
		},
		PriceSum () {
			const filteredPrice = this.$refs.Basket.$children[0].filteredItems.map((arr) => {
				if (arr.CUR === '₽') return arr.marketPRICE * arr.RATIO_2 * this.ItemCount(arr.marketid)
				else if (arr.CUR === '$') return arr.marketPRICE * arr.RATIO_2 * this.Currency.find(item => item.sign === arr.CUR).rate * this.ItemCount(arr.marketid)
				else if (arr.CUR === '€') return arr.marketPRICE * arr.RATIO_2 * this.Currency.find(item => item.sign === arr.CUR).rate * this.ItemCount(arr.marketid)
			})
			if (this.checkPartner) return (_.sum(filteredPrice)) * 0.9
			else if (this.checkOpt) return (_.sum(filteredPrice)) * 0.8
			else return _.sum(filteredPrice)
		},
		columnPrice () {
			if (!this.checkPrice && !this.checkPartner && !this.checkOpt) return true
			else if (this.checkPrice) return true
			else return false
		},
		columnPartner () {
			if (!this.checkPartner && !this.checkPrice && !this.checkOpt) return true
			else if (this.checkPartner) return true
			else return false
		},
		columnOpt () {
			if (!this.checkOpt && !this.checkPartner && !this.checkPrice) return true
			else if (this.checkOpt) return true
			else return false
		}
	},
	methods: {
		changeRate (item) {
			if (item.CUR === '$') return parseFloat(item.marketPRICE * item.RATIO_2 * this.ItemCount(item.marketid) * this.Currency.find(cur => cur.sign === item.CUR).rate)
			if (item.CUR === '€') return parseFloat(item.marketPRICE * item.RATIO_2 * this.ItemCount(item.marketid) * this.Currency.find(cur => cur.sign === item.CUR).rate)
			if (item.CUR === '₽') return parseFloat(item.marketPRICE * item.RATIO_2) * this.ItemCount(item.marketid)
		},
		changeRatePerOne (item) {
			if (this.checkPrice) {
				if (item.CUR === '$') return parseFloat(item.marketPRICE * item.RATIO_2 * this.Currency.find(cur => cur.sign === item.CUR).rate)
				if (item.CUR === '€') return parseFloat(item.marketPRICE * item.RATIO_2 * this.Currency.find(cur => cur.sign === item.CUR).rate)
				if (item.CUR === '₽') return parseFloat(item.marketPRICE * item.RATIO_2)
			}
			if (this.checkPartner) {
				if (item.CUR === '$') return parseFloat(item.marketPRICE * item.RATIO_2 * 0.9 * this.Currency.find(cur => cur.sign === item.CUR).rate)
				if (item.CUR === '€') return parseFloat(item.marketPRICE * item.RATIO_2 * 0.9 * this.Currency.find(cur => cur.sign === item.CUR).rate)
				if (item.CUR === '₽') return parseFloat(item.marketPRICE * item.RATIO_2 * 0.9)
			}
			if (this.checkOpt) {
				if (item.CUR === '$') return parseFloat(item.marketPRICE * item.RATIO_2 * 0.8 * this.Currency.find(cur => cur.sign === item.CUR).rate)
				if (item.CUR === '€') return parseFloat(item.marketPRICE * item.RATIO_2 * 0.8 * this.Currency.find(cur => cur.sign === item.CUR).rate)
				if (item.CUR === '₽') return parseFloat(item.marketPRICE * item.RATIO_2 * 0.8)
			}
		},
		updateCount (id, count) {
			if (count) {
				this.$store.dispatch('updateCount', { id, count })
					.then(() => {
						this.$store.commit('setData', 'Количество успешно изменено.')
					})
			}
		},
		JsonFields () {
			const JsonFields = {}
			const headers = this.headers.filter(header => header.selected === true)
			headers.forEach(item => {
				if (item.text === 'Действие') item.text = 'Всего:'
				JsonFields[item.text] = item.value
			})
			return JsonFields
		},
		JsonData () {
			const Items = this.$refs.Basket.items.map(arr => {
				if (this.checkPrice) {
					if (arr.CUR === '₽') arr.marketSALE = arr.marketPRICE * arr.RATIO_2 * this.ItemCount(arr.marketid)
					if (arr.CUR === '$') arr.marketSALE = arr.marketPRICE * arr.RATIO_2 * this.Currency.find(item => item.sign === arr.CUR).rate * this.ItemCount(arr.marketid)
					if (arr.CUR === '€') arr.marketSALE = arr.marketPRICE * arr.RATIO_2 * this.Currency.find(item => item.sign === arr.CUR).rate * this.ItemCount(arr.marketid)
					return arr
				}
				if (this.checkPartner) {
					if (arr.CUR === '₽') arr.marketPARTNER = arr.marketPRICE * arr.RATIO_2 * 0.9 * this.ItemCount(arr.marketid)
					if (arr.CUR === '$') arr.marketPARTNER = arr.marketPRICE * arr.RATIO_2 * 0.9 * this.Currency.find(item => item.sign === arr.CUR).rate * this.ItemCount(arr.marketid)
					if (arr.CUR === '€') arr.marketPARTNER = arr.marketPRICE * arr.RATIO_2 * 0.9 * this.Currency.find(item => item.sign === arr.CUR).rate * this.ItemCount(arr.marketid)
					return arr
				}
				if (this.checkOpt) {
					if (arr.CUR === '₽') arr.marketOPT = arr.marketPRICE * arr.RATIO_2 * 0.8 * this.ItemCount(arr.marketid)
					if (arr.CUR === '$') arr.marketOPT = arr.marketPRICE * arr.RATIO_2 * 0.8 * this.Currency.find(item => item.sign === arr.CUR).rate * this.ItemCount(arr.marketid)
					if (arr.CUR === '€') arr.marketOPT = arr.marketPRICE * arr.RATIO_2 * 0.8 * this.Currency.find(item => item.sign === arr.CUR).rate * this.ItemCount(arr.marketid)
					return arr
				}
			})
			Items.push({ action: this.PriceSum })
			return Items
		},
		ItemCount (id) {
			return this.Basket.find(obj => obj.marketid === id).Count
		},
		del (id) {
			this.$store.dispatch('delFromBasket', id)
		},
		saveOrder () {
			this.$store.dispatch('saveOrders', {
				headers: this.computedHeaders,
				order: this.Basket,
				comment: this.Comment,
				date: new Date().toLocaleDateString('ru', { hour: 'numeric', minute: 'numeric' }),
				isOnSite: false
			}).then(() => {
				this.$store.commit('setData', 'Заказ успешно сохранён.')
				this.dialog = false
			})
		},
		async removeBasket () {
			if (await this.$refs.confirm.open('Очистка корзины', 'Вы уверены?', { color: 'orange' })) {
				this.$store.dispatch('removeBasket')
					.then(() => {
						this.dialog = false
					})
			} else {
				this.$store.commit('setInfo', 'Очистка отменена.')
			}
		}
	},
	created () {
		this.$store.dispatch('fetchMarket')
	}
}
</script>

<style lang="scss" scoped>

</style>
