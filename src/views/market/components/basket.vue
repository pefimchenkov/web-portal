<template>
		<v-row justify="center" align="center">
			<v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
			<template v-slot:activator="{ on }">
				<v-btn color="primary" dark v-on="on" class="mt-1">
					<v-icon>shopping_basket</v-icon>
				</v-btn>
			</template>

			<v-card>
				<v-toolbar dark color="primary">
				<v-btn icon dark @click="dialog = false">
					<v-icon>mdi-close</v-icon>
				</v-btn>
				<v-spacer></v-spacer>
				<v-btn text>
					<download-excel
					:fields="json_fields"
					:fetch="getExel"
					class="btn btn-default"
					name="basket_list.xls"
				>
					<v-icon>save_alt</v-icon> excel
				</download-excel>
				</v-btn>
				<v-spacer></v-spacer>
				<v-toolbar-items>
					<v-btn dark text @click="saveOrder" :disabled="columnPrice && columnPartner && columnOpt">Сохранить</v-btn>
				</v-toolbar-items>
				</v-toolbar>
				<v-toolbar-title class="text-center mt-5">Корзина - текущий заказ</v-toolbar-title>
				<v-container fluid>
					<v-data-table
						:items="MarketItems"
						:headers="computedHeaders"
						hide-default-footer
						class="elevation-2 mt-5"
						ref="Basket"
					>
					<template v-slot:item.marketPRICE="{ item }">
						{{  item.marketPRICE ? parseFloat(item.marketPRICE * item.RATIO_2 * ItemCount(item.marketid)).toLocaleString('ru') : '' }}
						<v-icon color="warning" small v-if="item.CUR === '€'">mdi-currency-eur</v-icon>
						<v-icon color="success" small v-if="item.CUR === '$'">mdi-currency-usd</v-icon>
						<v-icon color="blue" small v-if="item.CUR === '₽'">mdi-currency-rub</v-icon>
					</template>
					<template v-slot:item.marketPARTNER="{ item }">
						{{  item.marketPRICE ? parseFloat((item.marketPRICE * item.RATIO_2) * 0.9 * ItemCount(item.marketid)).toLocaleString('ru') : '' }}
						<v-icon color="warning" small v-if="item.CUR === '€'">mdi-currency-eur</v-icon>
						<v-icon color="success" small v-if="item.CUR === '$'">mdi-currency-usd</v-icon>
						<v-icon color="blue" small v-if="item.CUR === '₽'">mdi-currency-rub</v-icon>
					</template>
					<template v-slot:item.marketOPT="{ item }">
						{{  item.marketPRICE ? parseFloat((item.marketPRICE * item.RATIO_2) * 0.8 * ItemCount(item.marketid)).toLocaleString('ru') : '' }}
						<v-icon color="warning" small v-if="item.CUR === '€'">mdi-currency-eur</v-icon>
						<v-icon color="success" small v-if="item.CUR === '$'">mdi-currency-usd</v-icon>
						<v-icon color="blue" small v-if="item.CUR === '₽'">mdi-currency-rub</v-icon>
					</template>
					<template v-slot:item.Count="{ item }">
						{{ ItemCount(item.marketid) }}
					</template>
					<template v-slot:item.action="{ item }">
						<v-btn @click="del(item.marketid)" icon text><v-icon small color="red">cancel</v-icon></v-btn>
					</template>
					<template v-slot:body.append="{ }">
						<tr>
							<td colspan="5">
								Итого:
							</td>
							<td v-if="columnPrice" class="pt-3">
								<span v-if="$refs.Basket">{{ PriceSum.toLocaleString('ru') }}<v-icon color="blue" small>mdi-currency-rub</v-icon></span>
								<v-checkbox hide-details dense v-model="checkPrice" :value="checkPrice"></v-checkbox>
							</td>
							<td v-if="columnPartner" class="pt-3">
								<span v-if="$refs.Basket">{{ (PriceSum * 0.9).toLocaleString('ru') }}<v-icon color="blue" small>mdi-currency-rub</v-icon></span>
								<v-checkbox hide-details dense v-model="checkPartner"></v-checkbox>
							</td>
							<td v-if="columnOpt" class="pt-3">
								<span v-if="$refs.Basket">{{ (PriceSum * 0.8).toLocaleString('ru') }}<v-icon color="blue" small>mdi-currency-rub</v-icon></span>
								<v-checkbox hide-details dense v-model="checkOpt"></v-checkbox>
							</td>
						</tr>
					</template>
					</v-data-table>
				</v-container>
			</v-card>
			</v-dialog>
		</v-row>
</template>

<script>

import { mapState } from 'vuex'
import _ from 'lodash'

export default {
	data () {
		return {
			dialog: false,
			checkPrice: false,
			checkPartner: false,
			checkOpt: false,
			widgets: false,
			json_fields: {},
			headers: [
				{ text: 'Макет ID',
					value: 'marketid',
					selected: true,
					divider: true
				},
				{ text: 'Название',
					value: 'marketNAME',
					selected: true,
					divider: true
				},
				{ text: 'Тип',
					value: 'marketTYPE',
					selected: true,
					divider: true
				},
				{ text: 'Артикул',
					value: 'marketART',
					selected: true,
					divider: true
				},
				{ text: 'Кол-во',
					value: 'Count',
					selected: true,
					divider: true
				},
				{ text: 'Цена продажи',
					value: 'marketPRICE',
					selected: true,
					divider: true
				},
				{ text: 'Цена партнёра',
					value: 'marketPARTNER',
					selected: true,
					divider: true
				},
				{ text: 'Цена оптовая',
					value: 'marketOPT',
					selected: true,
					divider: true
				},
				{ text: 'Действие',
					value: 'action',
					selected: true,
					divider: true
				}
			]
		}
	},
	watch: {
		checkPrice (value) {
			if (value) {
				this.headers[6].selected = false
				this.headers[7].selected = false
			} else {
				this.headers[6].selected = true
				this.headers[7].selected = true
			}
		},
		checkPartner (value) {
			if (value) {
				this.headers[5].selected = false
				this.headers[7].selected = false
			} else {
				this.headers[5].selected = true
				this.headers[7].selected = true
			}
		},
		checkOpt (value) {
			if (value) {
				this.headers[5].selected = false
				this.headers[6].selected = false
			} else {
				this.headers[5].selected = true
				this.headers[6].selected = true
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
			return this.Market.filter(item => this.Basket.find(basket => parseInt(basket.marketid) === parseInt(item.marketid)))
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
			return _.sum(filteredPrice)
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
		getExel () {
			const filtered = this.headers.filter(header => header.selected === true)
			filtered.forEach(item => {
				this.json_fields[item.text] = item.value
			})
			return this.$refs.Basket.$children[0].filteredItems
		},
		ItemCount (id) {
			return this.Basket.find(obj => obj.marketid === id).Count
		},
		del (id) {
			this.$store.dispatch('delFromBasket', id)
		},
		saveOrder () {
			let Order = []
			if (localStorage.getItem('marketOrders')) Order = JSON.parse(localStorage.getItem('marketOrders'))
			Order.push({ headers: this.computedHeaders, order: this.Basket })
			localStorage.setItem('marketOrders', JSON.stringify(Order))
			this.$store.commit('setData', 'Заказ успешно сохранён.')
		}
	},
	created () {
		this.$store.dispatch('fetchMarket')
	}
}
</script>

<style lang="scss" scoped>

</style>
