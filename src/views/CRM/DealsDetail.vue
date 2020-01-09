<template>
	<v-container fluid grid-list-md class="grey lighten-4">
		<v-container>
			<v-layout row wrap>
			<v-flex xs6 class="text-left">
					<h3 v-if="true" class="headline mt-2 py-2">
						Счёт: <span class="red--text">{{ bill_1c }}</span>
						<v-divider></v-divider>
					</h3>
					<v-progress-linear
						v-else
						indeterminate
						color="primary"
						height="2"
						value="15"
				></v-progress-linear>
			</v-flex>
    		<v-flex xs6 class="text-right">
      			<v-btn @click="goBack()" color="warning">Вернуться назад</v-btn>
    		</v-flex>
		</v-layout>
		</v-container>
		<v-tabs centered v-model="Active" fixed-tabs icons-and-text class="mt-2">
      		<v-tabs-slider></v-tabs-slider>

			<v-tab href="#tab-debit">Расход
				<v-icon>mdi-currency-usd-off</v-icon>
			</v-tab>
			<v-tab-item :value="'tab-debit'">
				<v-container class="justify-center" fluid>
					<v-layout row wrap width="100">
						<v-flex>
							<v-card
								class="mx-auto"
							>
								<v-card-title>
									<v-icon
										large
										:style="`position:relative; left:-30px; top: -65px; `"
										class="group pa-2 warning elevation-3"
										dark
									>mdi-currency-usd
									</v-icon>
									 	<v-progress-circular v-if="!Deal" :size="60" color="primary" indeterminate></v-progress-circular>
										 <v-card v-else flat>
											 <v-card-text class="headline">
												Сумма: <span class="red--text ml-1"> {{ Deal.bill_sum }} </span>
												<v-icon>mdi-currency-rub</v-icon>
											</v-card-text>
											<v-card-text class="headline">
												Остаток: <span class="red--text ml-1"> {{ (Math.sign(sumProjects) === -1) ? 0 : ((Deal.bill_sum - sumProjects) - Balance).toFixed(CountFloat) }} </span>
												<v-icon>mdi-currency-rub</v-icon>
											</v-card-text>
										 </v-card>
								</v-card-title>
							</v-card>
						</v-flex>
						<v-flex v-for="(item, i) in DebitList" :key="i">
							<v-card class="mx-auto">
								<v-card-text :class="(item.date && item.sum) ? `success lighten-2 text-center subtitle-1 pa-2` : `grey lighten-2 text-center subtitle-1 pa-2`">
									{{ item.name }}
									<v-icon v-if="item.date && item.sum" @click="deleteDebit(item)">delete</v-icon>
								</v-card-text>
								<v-card-text >
									Период: {{ item.date }}
								</v-card-text>
								<v-card-text>
									Сумма: {{ item.sum }}
									<v-icon small>mdi-currency-rub</v-icon>
								</v-card-text>
							</v-card>
						</v-flex>
					</v-layout>
					<v-row align='center' justify="center">
						<v-col cols="9">
							<v-card
								class="mx-auto justify-center pa-3"
							>
									<v-row>
										<v-col cols="12">
											<v-select
												:items="DebitList.filter(debit => debit.sum === null || debit.sum === 0)"
												v-model="Debit"
												item-text="name"
												label="Статья расходов *"
												required
												validate
												ref="DebitList"
												:rules="ReqRule"
											>
											</v-select>
										</v-col>
										<v-col class="align-self-end" cols="11">
											<v-slider
												label="Процент %"
												v-model="Percent"
          										thumb-label="always"
												:readonly="Enable"
												:disabled="Enable"
											>
											</v-slider>
										</v-col>
										<v-col class="align-self-end" cols="1">
											<v-text-field
												label="Процент (число)"
												v-model="Percent"
          										type="number"
												:readonly="Enable"
												:disabled="Enable"
											>
											</v-text-field>
										</v-col>
										<v-col cols="11">
											<v-text-field
												v-model="Balance"
												label="Сумма"
												:readonly="!Enable"
												:disabled="!Enable"
												required
												validate
												ref="Balance"
												:rules="BalanceRule"
											>
											</v-text-field>
										</v-col>
										<v-col cols="1">
											<v-switch
												v-model="Enable"
											>
											</v-switch>
										</v-col>
										<v-col cols="12">
											<v-select
												label="Период *"
												:items="WeeksList"
												:item-text="formattedWeeks"
												v-model="Weeks"
												required
												validate
												return-object
												ref="WeeksList"
												:rules="ReqRule"
											>
											</v-select>
										</v-col>
										<v-col cols="12" class="text-center">
											<v-btn
											@click="save"
											>
												<v-icon color="success">save</v-icon><span class="ml-2">Сохранить</span>
											</v-btn>
										</v-col>
									</v-row>
							</v-card>
						</v-col>
					</v-row>
				</v-container>
			</v-tab-item>
		</v-tabs>
	</v-container>
</template>

<script>
	// import mapGetters from 'vuex'

	export default {
		props: ['id', 'bill_1c'],
		data () {
			return {
				Active: 'tab-debit',
				Enable: false,
				Balance: 0,
				Percent: 0,
				Debit: '',
				Weeks: '',
				DealSum: null,
				DebitList: [
					{ name: 'Зарплата', sum: null, date: null },
					{ name: 'Закупка', sum: null, date: null },
					{ name: 'Кредит', sum: null, date: null },
					{ name: 'Другое', sum: null, date: null }
				],
				WeeksList: [],
				ReqRule: [
					v => !!v || 'Обязательный параметр!'
				],
				BalanceRule: [
					v => !!v || 'Обязательный параметр!',
					v => this.checkBalance(v) || 'Эта сумма не может быть больше чем остаток!',
					function (v) {
						if (Math.sign(v) !== -1) return true
						else return 'Число не может быть отрицательным!'
					}
				]
			}
		},
		watch: {
			Percent (val) {
				if (this.sumProjects) {
					return (this.Balance = ((this.Deal.bill_sum - this.sumProjects) * (val / 100)).toFixed(this.CountFloat))
				} else {
					return (this.Balance = (this.Deal.bill_sum * (val / 100)).toFixed(this.CountFloat))
				}
			}
		},
		methods: {
			goBack () {
				this.$router.go(-1)
			},
			Reset () {
				this.Balance = 0
				this.Percent = null
				this.Debit = ''
				this.Weeks = ''
			},
			checkBalance (val) {
				if (!this.Deal) return
				if (parseInt(val) <= ((this.Deal.bill_sum - this.sumProjects) - parseInt(this.Balance)) + parseInt(this.Balance)) return true
			},
			formattedWeeks (item) {
				return item.DATE + ' (' + item.ID + '-я неделя)'
			},
			save () {
				if (this.$refs.DebitList.validate() && this.$refs.WeeksList.validate() && this.$refs.Balance.validate()) {
					this.$store.dispatch('ADD_BUDGET', { BILL: this.Deal.bill_1c, PROJECT: this.Debit, BALANCE: this.Balance, DATE: this.Weeks })
						.then(res => {
							if (res.success) {
								let DebitItem = this.DebitList.find(item => item.name === this.Debit)
								DebitItem.sum = this.Balance
								DebitItem.date = this.Weeks.DATE
								this.$store.dispatch('setData', 'Данные успешно добавлены.')
								this.Reset()
							} else {
								this.$store.dispatch('setError', 'Не был получен ответ от сервера, обратитесь к администратору портала.')
							}
						})
				} else {
					this.$store.dispatch('setError', 'Не выполнены необходимые условия!')
				}
			},
			deleteDebit (debit) {
				if (confirm('Удаляем эту статью расходов?')) {
					this.$store.dispatch('DELETE_DEBIT', { BILL: this.Deal.bill_1c, DEBIT: debit })
						.then(res => {
							if (res.success) {
								let Debit = this.DebitList.find(item => item.name === debit.name)
								Debit.sum = null
								Debit.date = null
							} else {
								this.$store.dispatch('setError', 'Удаление невыполнимо! Обратитесь к администратору портала.')
							}
						})
				} else {
					this.$store.dispatch('setInfo', 'Удаление отменено.')
				}
			}
		},
		computed: {
			Deal () {
				let Deal = this.$store.getters.Deals.find(item => item.id === parseInt(this.id))
				if (!Deal) {
					this.$store.dispatch('FETCH_DEALS')
						.then(response => {
							return this.$store.getters.Deals.find(item => item.id === parseInt(this.id))
						})
				} else return Deal
			},
			CountFloat () {
				return ~(this.Deal.bill_sum + '').indexOf('.') ? (this.Deal.bill_sum + '').split('.')[1].length : 0
			},
			sumProjects () {
				let initialValue = 0
				let sumProjects = this.DebitList.reduce((accumulator, currentValue) => {
					if (currentValue.sum === null) currentValue.sum = 0
					return accumulator + parseInt(currentValue.sum)
				}, initialValue)
				return sumProjects
			}
		},
		async created () {
			await this.$store.dispatch('FETCH_WEEKS')
				.then(res => {
					this.WeeksList = [...res]
				})
			await this.$store.dispatch('FETCH_BUDGET')
				.then(response => {
					let Obj = this.$store.getters.Budget.find(item => item.bill_1c === this.bill_1c)
					if (!Obj) return false
					this.DebitList.forEach(debit => {
						if (debit.name === 'Зарплата') {
							debit.sum = Obj.zp_sum
							const week = this.WeeksList.find(week => week.ID === Obj.zp_date)
							if (week) debit.date = week.DATE
						}
						if (debit.name === 'Закупка') {
							debit.sum = Obj.zakupka_sum
							const week = this.WeeksList.find(week => week.ID === Obj.zakupka_date)
							if (week) debit.date = week.DATE
						}
						if (debit.name === 'Кредит') {
							debit.sum = Obj.credit_sum
							const week = this.WeeksList.find(week => week.ID === Obj.credit_date)
							if (week) debit.date = week.DATE
						}
						if (debit.name === 'Другое') {
							debit.sum = Obj.other_sum
							const week = this.WeeksList.find(week => week.ID === Obj.other_date)
							if (week) debit.date = week.DATE
						}
					})
				})
		}
	}
</script>

<style scoped>

</style>
