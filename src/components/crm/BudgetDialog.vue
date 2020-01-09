<template>
		<v-dialog :value="show" fullscreen hide-overlay transition="dialog-bottom-transition">
			<v-card flat class="ma-3">
				<v-toolbar dark color="primary" class="mb-3">
					<v-btn icon dark @click.native="show=false">
						<v-icon>mdi-close</v-icon>
					</v-btn>
					 <v-spacer></v-spacer>
					<v-toolbar-title>Сумма по счёту: {{ item.bill_sum }}<v-icon small>mdi-currency-rub</v-icon></v-toolbar-title>
					<v-spacer></v-spacer>
					<v-toolbar-title>Оплата: {{ item.bill_pay }}<v-icon small>mdi-percent</v-icon></v-toolbar-title>
					<v-spacer></v-spacer>
					<v-toolbar-title>Счёт: {{ item.bill_1c }}</v-toolbar-title>
						<div class="flex-grow-1"></div>
					<v-toolbar-items>
						<v-btn dark text @click.native="save(item)">Сохранить</v-btn>
					</v-toolbar-items>
				</v-toolbar>
				<v-alert
					v-if="checkFullDone(item)"
					type="success"
					class="text-center ma-3"
					elevation="3"
					dense
				>
     				 Расход полностью освоен!
    			</v-alert>
				<v-alert
					v-if="isBillPay(item)"
					type="error"
					class="text-center ma-3"
					elevation="3"
					dense
				>
     				 ВНИМАНИЕ! Нет прихода по счёту. Не возможно будет закрыть статьи расходов.
    			</v-alert>
				<v-alert
					v-if="isPartlyPay(item)"
					type="warning"
					class="text-center ma-3"
					elevation="3"
					dense
				>
     				Внимание, частичная оплата! Будьте внимательны при закрытии статей расходов.
    			</v-alert>
				<v-card class="ma-3">
					<v-card-title :class="item.zp_done ? `green lighten-3` : `grey lighten-3`">Зарплата</v-card-title>
					<v-card-text class="black--text">
						<v-row justify="center" align="center">
							<v-col cols="2" class="text-right">
								<span>Сумма:</span>
							</v-col>
							<v-col cols="2" class="text-right">
								<span>{{ item.zp_sum ? item.zp_sum : 0 }}</span><v-icon small>mdi-currency-rub</v-icon>
							</v-col>
							<v-col cols="3" class="text-right">
								<span>Неделя:</span>
							</v-col>
							<v-col cols="3" class="text-center">
								<span>{{ item.zp_date  ? formatDate(item.zp_date) : 0 }}</span>
							</v-col>
							<v-col cols="1" class="text-right">
								<span>Закрыть:</span>
							</v-col>
							<v-col cols="1">
								<v-checkbox
									v-model="item.zp_done"
									class="mt-0 align-center justify-left"
								 	hide-details
								 	success
									:disabled="(item.zp_sum === 0 || !item.zp_sum || isBillPay(item) || isDebitMoreThenPay(item, item.zp_sum)) ? true : false"
								></v-checkbox>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
				<v-card class="ma-3">
					<v-card-title :class="item.zakupka_done ? `green lighten-3` : `grey lighten-3`">
						<span>Закупки</span>
						<v-spacer></v-spacer>
						<span :class="isDebitMoreThenPay(item, item.zakupka_sum) ? `body-2 py-1 px-2 error--text` : ``" v-if="isDebitMoreThenPay(item, item.zakupka_sum)">Статья превышает оплату, закрытие не возможно</span>
					</v-card-title>
					<v-card-text class="black--text">
						<v-row justify="center" align="center">
							<v-col cols="2" class="text-right">
								<span>Сумма:</span>
							</v-col>
							<v-col cols="2" class="text-right">
								<span>{{ item.zakupka_sum ? item.zakupka_sum : 0 }}</span><v-icon small>mdi-currency-rub</v-icon>
							</v-col>
							<v-col cols="3" class="text-right">
								<span>Неделя:</span>
							</v-col>
							<v-col cols="3" class="text-center">
								<span>{{ item.zakupka_date  ? formatDate(item.zakupka_date) : 0 }}</span>
							</v-col>
							<v-col cols="1" class="text-right">
								<div>Закрыть:</div>
							</v-col>
							<v-col cols="1">
								<v-checkbox
								v-model="item.zakupka_done"
								class="mt-0 align-center justify-left"
								 hide-details
								 success
								 :disabled="(item.zakupka_sum === 0 || !item.zakupka_sum || isBillPay(item) || isDebitMoreThenPay(item, item.zakupka_sum)) ? true : false"
								 ></v-checkbox>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
				<v-card class="ma-3">
					<v-card-title :class="item.credit_done ? `green lighten-3` : `grey lighten-3`">Кредиты</v-card-title>
					<v-card-text class="black--text">
						<v-row justify="center" align="center">
							<v-col cols="2" class="text-right">
								<span>Сумма:</span>
							</v-col>
							<v-col cols="2" class="text-right">
								<span>{{ item.credit_sum ? item.credit_sum : 0 }}</span><v-icon small>mdi-currency-rub</v-icon>
							</v-col>
							<v-col cols="3" class="text-right">
								<span>Неделя:</span>
							</v-col>
							<v-col cols="3" class="text-center">
								<span>{{ item.credit_date ? formatDate(item.credit_date) : 0 }}</span>
							</v-col>
							<v-col cols="1" class="text-right">
								<span>Закрыть:</span>
							</v-col>
							<v-col cols="1">
								<v-checkbox
								v-model="item.credit_done"
								class="mt-0 align-center justify-left"
								 hide-details
								 success
								 :disabled="(item.credit_sum === 0 || !item.credit_sum || isBillPay(item) ) ? true : false"
								 ></v-checkbox>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
				<v-card class="ma-3">
					<v-card-title :class="item.other_done ? `green lighten-3` : `grey lighten-3`">Другие расходы</v-card-title>
					<v-card-text class="black--text">
						<v-row justify="center" align="center">
							<v-col cols="2" class="text-right">
								<span>Сумма:</span>
							</v-col>
							<v-col cols="2" class="text-right">
								<span>{{ item.other_sum ? item.other_sum : 0 }}</span><v-icon small>mdi-currency-rub</v-icon>
							</v-col>
							<v-col cols="3" class="text-right">
								<span>Неделя:</span>
							</v-col>
							<v-col cols="3" class="text-center">
								<span>{{ item.other_date ? formatDate(item.other_date) : 0 }}</span>
							</v-col>
							<v-col cols="1" class="text-right">
								<span>Закрыть:</span>
							</v-col>
							<v-col cols="1">
								<v-checkbox
								v-model="item.other_done"
								class="mt-0 align-center justify-left"
								 hide-details
								 success
								 :disabled="(item.other_sum === 0 || !item.other_sum || isBillPay(item) ) ? true : false"
								 ></v-checkbox>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
			</v-card>
		</v-dialog>
</template>

<script>
import moment from 'moment'
export default {
	props: ['dialog', 'title', 'item', 'weeks', 'user'],
	data () {
		return {
		}
	},
	computed: {
		show: {
			get: function () {
				return this.dialog
			},
			set: function (value) {
				this.$emit('closeDialog', value)
			}
		}
	},
	methods: {
		formatDate (id) {
			return this.weeks.find(week => parseInt(week.ID) === id).DATE
		},
		save (item) {
			item.responsible = this.user.email
			item.date = moment(new Date()).format('YYYY-MM-DD')
			this.$store.dispatch('DEBIT_DONE', item)
				.then(res => {
					if (res.success) {
						this.$store.dispatch('setData', 'Данные успешно обновлены.')
					} else {
						this.$store.dispatch('setError', 'Данные не были обновлены! Обратитесь к администратору портала.')
					}
					this.show = false
				})
		},
		checkFullDone (item) {
			let sum = 0
			Object.entries(item).forEach(el => {
				if (el[0] === 'zp_done' && el[1] === 1) sum = sum + item['zp_sum']
				if (el[0] === 'zakupka_done' && el[1] === 1) sum = sum + item['zakupka_sum']
				if (el[0] === 'credit_done' && el[1] === 1) sum = sum + item['credit_sum']
				if (el[0] === 'other_done' && el[1] === 1) sum = sum + item['other_sum']
			})
			if (sum === item.bill_sum) return true
			else return false
		},
		isBillPay (item) {
			if (parseInt(item.bill_pay) === 0 || item.bill_pay === null) return true
			else return false
		},
		isPartlyPay (item) {
			if (parseInt(item.bill_pay) > 0 && item.bill_pay < 100) return true
			else return false
		},
		isDebitMoreThenPay (item, debit) {
			const pay = item.bill_sum * (parseInt(item.bill_pay) / 100)
			if (debit > pay) return true
			else return false
		}
	}
}
</script>

<style scoped>
</style>
