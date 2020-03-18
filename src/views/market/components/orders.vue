<template>
	<div>
		<Confirm ref="confirm"></Confirm>
		<v-row justify="center" align="center">
			<v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
			<template v-slot:activator="{ on }">
				<v-btn color="success" dark v-on="on" class="mt-1">
					<v-icon>shopping_basket</v-icon>
				</v-btn>
			</template>
			<v-card>
				<v-toolbar dark color="primary" class="px-5">
					<v-btn text @click="delOrders">
						<v-icon>mdi-delete</v-icon>Удалить всё
					</v-btn>
					<v-spacer></v-spacer>
					<v-btn text @click="dialog = false">
						<v-icon>mdi-close</v-icon>Закрыть
					</v-btn>
				</v-toolbar>
				<v-toolbar-title class="text-center mt-5">Список заказов</v-toolbar-title>
				 <v-text-field
					class="mb-3"
					prepend-icon="search"
					label="Поиск"
					placeholder="Поиск"
					v-model="Search"
					single-line
					clearable
				></v-text-field>
				<v-container fluid v-for="Obj in filteredAndSorted.slice().reverse()" :key="Orders.indexOf(Obj)">
						<v-row class="green lighten-4">
							<v-col cols="2">
								<v-btn text @click="moveToBasket(Orders.indexOf(Obj))" color="grey darken-1">
									<v-icon>mdi-undo-variant</v-icon>
									В корзину для редактирования
								</v-btn>
							</v-col>
							<v-col align="center" align-self="center">
								<v-edit-dialog
									large
									persistent
									ref="Comment"
									@save="updateComment(Orders.indexOf(Obj), Orders[Orders.indexOf(Obj)].comment)"
									cancel-text="Отменить"
									save-text="Сохранить"
								>{{ `Заказ № ${Orders.indexOf(Obj) + 1}  :`}}
								{{ Orders[Orders.indexOf(Obj)].comment ? Orders[Orders.indexOf(Obj)].comment : '( ваш комментарий ) ' }}
								{{ '(' }}<v-icon x-small class="mx-1">mdi-pencil</v-icon>{{ ')' }}
									<template v-slot:input>
										<v-text-field
											v-model="Orders[Orders.indexOf(Obj)].comment"
											single-line
											counter
											label="( Введите свой комментарий )"
										></v-text-field>
									</template>
								</v-edit-dialog>
							</v-col>
							<v-col cols="1" align="center" align-self="center">
								{{ Orders[Orders.indexOf(Obj)].date ? Orders[Orders.indexOf(Obj)].date : 'Дата отсутствует' }}
							</v-col>
							<v-col cols="1" align="center">
								<v-btn v-if="!Orders[Orders.indexOf(Obj)].isOnSite" text @click="sendOrderToSite(Orders.indexOf(Obj))" color="grey darken-1">
									<v-icon small class="mr-1">mdi-send</v-icon>
									На сайт
								</v-btn>
								<template v-else>
									<v-icon small class="mr-1">mdi-alert</v-icon>Уже на сайте
								</template>
							</v-col>
							<v-col cols="1" align="end">
								<v-btn text @click="delOrderFromList(Orders.indexOf(Obj))" color="grey darken-1">
									<v-icon small class="mr-1">mdi-delete</v-icon>
									Удалить
								</v-btn>
							</v-col>
						</v-row>
						<v-data-table
							:items="Market.filter(item => Obj.order.find(i => i.marketid === item.marketid))"
							:headers="Obj.headers"
							dense
							calculate-widths
							hide-default-footer
							class="elevation-2 mt-5"
							ref="order"
						>
						<template v-slot:item.Count="{ item }">
							<v-edit-dialog
								large
								persistent
								ref="Count"
								@save="updateCount(Orders.indexOf(Obj), item.marketid, item.Count)"
								cancel-text="Отмена"
								save-text="Сохранить"
							>
							<v-icon x-small class="mr-3">mdi-pencil</v-icon>{{ Obj.order.find(i => i.marketid === item.marketid).Count }}
								<template v-slot:input>
									<v-text-field
										v-model="item.Count"
										label="Редактировать"
										single-line
										counter
										autofocus
									></v-text-field>
								</template>
							</v-edit-dialog>
						</template>
						<template v-slot:item.marketPRICEPERONE="{ item }">
							{{ pricePerOne(Obj.headers, item).toFixed(2) }}
							<v-icon color="blue" small>mdi-currency-rub</v-icon>
						</template>
						<template v-slot:item.marketSALE="{ item }">
							{{  (changeRate(item) * Obj.order.find(i => i.marketid === item.marketid).Count).toFixed(2).toLocaleString('ru') }}
							<v-icon color="blue" small>mdi-currency-rub</v-icon>
						</template>
						<template v-slot:item.marketPARTNER="{ item }">
							{{  (changeRate(item) * Obj.order.find(i => i.marketid === item.marketid).Count * 0.9).toFixed(2).toLocaleString('ru') }}
							<v-icon color="blue" small>mdi-currency-rub</v-icon>
						</template>
						<template v-slot:item.marketOPT="{ item }">
							{{ (changeRate(item) * Obj.order.find(i => i.marketid === item.marketid).Count * 0.8).toFixed(2).toLocaleString('ru') }}
							<v-icon color="blue" small>mdi-currency-rub</v-icon>
						</template>

						<template v-slot:top>
							<div class="text-right">
								<v-btn text color="success">
									<download-excel
										:title="Orders[Orders.indexOf(Obj)].comment + ' / ' + Orders[Orders.indexOf(Obj)].date"
										:fields="JsonFields(`${Orders.indexOf(Obj)}`)"
										:data="JsonData(`${Orders.indexOf(Obj)}`).MarketItems"
										class="btn btn-default"
										name="orders_list.xls"
										:footer="JsonData(`${Orders.indexOf(Obj)}`).Summ"
									>
									<v-icon>save_alt</v-icon> excel
									</download-excel>
								</v-btn>
							</div>
						</template>
						<template v-slot:body.append>
							<td :colspan="8" :style="`text-align: right`">
								{{ ((JsonData(`${Orders.indexOf(Obj)}`).Summ).toFixed(2)) + ' ₽' }}
							</td>
						</template>
					</v-data-table>
				</v-container>
			</v-card>
			</v-dialog>
		</v-row>
	</div>
</template>

<script>

import { mapState } from 'vuex'
import _ from 'lodash'
import Confirm from '@/components/shared/Confirm'

export default {
	components: {
		Confirm
	},
	data () {
		return {
			dialog: false,
			Comment: '',
			Search: ''
		}
	},
	watch: {
	},
	computed: {
		...mapState({
			Orders: state => state.market.Orders,
			Basket: state => state.market.Basket,
			Market: state => state.market.Market,
			Currency: state => state.currency.Currency
		}),
		loadings () {
			return this.$store.getters.loadings
		},
		filteredAndSorted () {
			return this.Orders.filter(order => {
				if (this.Search) {
					if (order.comment) {
						return order.comment.toLowerCase().includes(this.Search.toLowerCase())
					} else return false
				} else return true
			})
		}
	},
	methods: {
		changeRate (item) {
			return item.marketPRICE * item.RATIO_2 * this.Currency.find(cur => cur.sign === item.CUR).rate
		},
		pricePerOne (header, item) {
			if (header.find(item => item.value === 'marketPARTNER')) return item.marketPRICE * item.RATIO_2 * 0.9 * this.Currency.find(cur => cur.sign === item.CUR).rate
			if (header.find(item => item.value === 'marketOPT')) return item.marketPRICE * item.RATIO_2 * 0.8 * this.Currency.find(cur => cur.sign === item.CUR).rate
			if (header.find(item => item.value === 'marketSALE')) return item.marketPRICE * item.RATIO_2 * this.Currency.find(cur => cur.sign === item.CUR).rate
		},
		updateCount (objId, id, count) {
			if (count) {
				this.$store.dispatch('updateCount', { objId, id, count })
					.then(() => {
						this.$store.commit('setData', 'Количество успешно изменено.')
					})
			}
		},
		updateComment (objId, comment) {
			if (comment) {
				this.$store.dispatch('updateComment', { objId, comment })
					.then(() => {
						this.$store.commit('setData', 'Комментарий успешно добавлен / изменён.')
					})
			}
		},
		JsonFields (key) {
			const JsonFields = {}
			this.Orders[parseInt(key)].headers.forEach(item => {
				if (item.value === 'marketPRICE') item.value = 'marketSALE'
				if (item.text === 'Действие') item.text = 'ИТОГО:'
				JsonFields[item.text] = item.value
			})
			return JsonFields
		},
		JsonData (key) {
			let Summ = []
			const Order = this.Orders[parseInt(key)].order
			const Headers = this.Orders[parseInt(key)].headers
			const MarketItems = this.Market.filter(item => Order.find(i => i.marketid === item.marketid))

			if (_.find(Headers, header => header.value === 'marketOPT')) {
				MarketItems.forEach(obj => {
					obj.Count = Order.find(item => item.marketid === obj.marketid).Count
					obj.marketOPT = obj.marketPRICE * obj.RATIO_2 * obj.Count * 0.8 * this.Currency.find(cur => cur.sign === obj.CUR).rate
					obj.marketPRICEPERONE = obj.marketOPT / obj.Count
					Summ.push(obj.marketOPT)
				})
				return { MarketItems: MarketItems, Summ: _.sum(Summ) }
			}
			if (_.find(Headers, header => header.value === 'marketPARTNER')) {
				MarketItems.forEach(obj => {
					obj.Count = Order.find(item => item.marketid === obj.marketid).Count
					obj.marketPARTNER = obj.marketPRICE * obj.RATIO_2 * obj.Count * 0.9 * this.Currency.find(cur => cur.sign === obj.CUR).rate
					obj.marketPRICEPERONE = obj.marketPARTNER / obj.Count
					Summ.push(obj.marketPARTNER)
				})
				return { MarketItems: MarketItems, Summ: _.sum(Summ) }
			}
			if (_.find(Headers, header => header.value === 'marketSALE')) {
				MarketItems.forEach(obj => {
					obj.Count = Order.find(item => item.marketid === obj.marketid).Count
					obj.marketSALE = obj.marketPRICE * obj.RATIO_2 * obj.Count * this.Currency.find(cur => cur.sign === obj.CUR).rate
					obj.marketPRICEPERONE = obj.marketSALE / obj.Count
					Summ.push(obj.marketSALE)
				})
				return { MarketItems: MarketItems, Summ: _.sum(Summ) }
			}
		},
		async delOrders () {
			if (await this.$refs.confirm.open('Удаление заказов', 'Вы уверены?', { color: 'orange' })) {
				this.$store.dispatch('removeOrders')
					.then(() => {
						this.dialog = false
					})
			} else {
				this.$store.commit('setInfo', 'Удаление отменено')
			}
		},
		moveToBasket (orderId) {
			if (this.Basket && this.Basket.length === 0) {
				if (orderId !== undefined) {
					// const Item = this.Orders[orderId]
					const Order = this.Orders[orderId].order
					/* const index = this.Orders.indexOf(Item)
					this.Orders.splice(index, 1) */
					this.$store.dispatch('moveToBasket', Order)
						.then(() => {
							this.$store.commit('setData', 'Заказ успешно перемещён в корзину')
						})
				} else {
					this.$store.commit('setError', 'Не верный номер заказа или заказ не существует')
				}
			} else {
				this.$store.commit('setError', 'Корзина не пустая! Для начала очистите корзину')
			}
		},
		async delOrderFromList (index) {
			if (await this.$refs.confirm.open('Удаление заказа', 'Вы уверены?', { color: 'orange' })) {
				this.$store.dispatch('removeOrderFromList', index)
					.then(() => {
						this.$store.commit('setData', 'Удаление прошло успешно')
					})
			} else {
				this.$store.commit('setInfo', 'Удаление отменено')
			}
		},
		async sendOrderToSite (index) {
			if (await this.$refs.confirm.open('Отправка на сайт', 'Вы уверены?', { color: 'orange' })) {
				this.$store.dispatch('sendOrderToSite', index)
					.then(() => {
						this.$store.commit('setData', 'Заказа успешно отправлен!')
					})
			} else {
				this.$store.commit('setInfo', 'Отправка отменена')
			}
		}
	},
	created () {
		this.$store.dispatch('fetchMarket')
	},
	mounted () {
	}
}
</script>

<style lang="scss" scoped>

</style>
