<template>
		<v-row justify="center" align="center">
			<v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
			<template v-slot:activator="{ on }">
				<v-btn color="primary" dark v-on="on" class="mt-1">
					<v-icon>shopping_cart</v-icon>
				</v-btn>
			</template>

			<v-card>
				<v-toolbar dark color="primary">
				<v-spacer></v-spacer>
				<v-btn icon dark @click="dialog = false">
					<v-icon>mdi-close</v-icon>
				</v-btn>
				</v-toolbar>
				<v-toolbar-title class="text-center mt-5">Список заказов</v-toolbar-title>
				<v-container fluid v-for="Obj in Orders" :key="Obj['order'].marketid">
						<p class="py-3 text-center" :style="`background-color: #f1f1f1;`" v-html="`Заказ № ${Orders.indexOf(Obj) + 1}`"></p>
						<v-data-table
							:items="Market.filter(item => Obj.order.find(i => i.marketid === item.marketid))"
							:headers="Obj.headers"
							hide-default-footer
							class="elevation-2 mt-5"
							ref="order"
						>
						<template v-slot:item.Count="{ item }">
							{{ Obj.order.find(i => i.marketid === item.marketid).Count }}
						</template>
						<template v-slot:item.marketPRICE="{ item }">
						{{  item.marketPRICE ? parseFloat(item.marketPRICE * item.RATIO_2 * Obj.order.find(i => i.marketid === item.marketid).Count).toLocaleString('ru') : '' }}
							<v-icon color="warning" small v-if="item.CUR === '€'">mdi-currency-eur</v-icon>
							<v-icon color="success" small v-if="item.CUR === '$'">mdi-currency-usd</v-icon>
							<v-icon color="blue" small v-if="item.CUR === '₽'">mdi-currency-rub</v-icon>
						</template>
						<template v-slot:item.marketPARTNER="{ item }">
							{{  item.marketPRICE ? parseFloat((item.marketPRICE * item.RATIO_2) * 0.9 * Obj.order.find(i => i.marketid === item.marketid).Count).toLocaleString('ru') : '' }}
							<v-icon color="warning" small v-if="item.CUR === '€'">mdi-currency-eur</v-icon>
							<v-icon color="success" small v-if="item.CUR === '$'">mdi-currency-usd</v-icon>
							<v-icon color="blue" small v-if="item.CUR === '₽'">mdi-currency-rub</v-icon>
						</template>
						<template v-slot:item.marketOPT="{ item }">
							{{  item.marketPRICE ? parseFloat((item.marketPRICE * item.RATIO_2) * 0.8 * Obj.order.find(i => i.marketid === item.marketid).Count).toLocaleString('ru') : '' }}
							<v-icon color="warning" small v-if="item.CUR === '€'">mdi-currency-eur</v-icon>
							<v-icon color="success" small v-if="item.CUR === '$'">mdi-currency-usd</v-icon>
							<v-icon color="blue" small v-if="item.CUR === '₽'">mdi-currency-rub</v-icon>
						</template>
						<template v-slot:body.append="{ }">
						<tr>
							<v-btn text>
								<download-excel
								:fields="json_fields"
								:fetch="getExel(0)"
								class="btn btn-default"
								name="basket_list.xls"
							>
								<v-icon>save_alt</v-icon> excel
							</download-excel>
							</v-btn>
							<!-- <td colspan="5">
								Итого:
							</td>
							<td class="pt-3">
								<span>{{ PriceSum.toLocaleString('ru') }}<v-icon color="blue" small>mdi-currency-rub</v-icon></span>
							</td>
							<td class="pt-3">
								<span>{{ (PriceSum * 0.9).toLocaleString('ru') }}<v-icon color="blue" small>mdi-currency-rub</v-icon></span>
							</td>
							<td class="pt-3">
								<span>{{ (PriceSum * 0.8).toLocaleString('ru') }}<v-icon color="blue" small>mdi-currency-rub</v-icon></span>
							</td> -->
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
// import _ from 'lodash'

export default {
	data () {
		return {
			dialog: false,
			json_fields: {}
		}
	},
	watch: {
	},
	computed: {
		...mapState({
			Orders: state => state.market.Orders,
			Market: state => state.market.Market,
			Currency: state => state.currency.Currency
		}),
		loadings () {
			return this.$store.getters.loadings
		},
		computedHeaders () {
			return this.headers.filter(item => item.selected)
		}
		/* PriceSum () {
			const filteredPrice = this.$refs.Basket.$children[0].filteredItems.map((arr) => {
				if (arr.CUR === '₽') return arr.marketPRICE * arr.RATIO_2 * this.ItemCount(arr.marketid)
				else if (arr.CUR === '$') return arr.marketPRICE * arr.RATIO_2 * this.Currency.find(item => item.sign === arr.CUR).rate * this.ItemCount(arr.marketid)
				else if (arr.CUR === '€') return arr.marketPRICE * arr.RATIO_2 * this.Currency.find(item => item.sign === arr.CUR).rate * this.ItemCount(arr.marketid)
			})
			return _.sum(filteredPrice)
		} */
	},
	methods: {
		getExel (key) {
			console.log(key)
			/* this.Orders[0].headers.forEach(item => {
				this.json_fields[item.text] = item.value
			})
			return this.$refs.order[0].$children[0].filteredItems */
		}
	},
	created () {
		this.$store.dispatch('fetchMarket')
	},
	mounted () {
		console.log(this.Orders)
	}
}
</script>

<style lang="scss" scoped>

</style>
