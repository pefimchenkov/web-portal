<template>
<div>
	<Confirm ref="confirm"></Confirm>
	<v-dialog width="500px" v-model="dialog" persistent>
		<v-card class="pa-3 mx-auto" outlined>
			<v-card-title class="subheading">Редактирование {{ label }}</v-card-title>
				<v-text-field
					v-model="plan"
					label="* Сумма (план)"
					type="number"
					ref="plan"
					validation
					:rules="numberRule"
				>
				</v-text-field>
				<v-autocomplete
					:items="jirausers"
					v-model="manager"
					label="* Ответственный менеджер"
					item-text="display_name"
					return-object
				>
				</v-autocomplete>
				<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn
					color="green darken-1"
					text="text"
					@click="close"
				>
				Отменить
				</v-btn>
				<v-btn
					color="green darken-1"
					text="text"
					@click.native="save"
					:disabled="localloading"
					:loading="localloading"
				>
				Сохранить
				</v-btn>
				</v-card-actions>
		</v-card>
	</v-dialog>
    <v-card v-if="editable && readonly" class="mx-auto mt-3">
        <v-toolbar class="elevation-2 grey lighten-3">

            <v-toolbar-title><span :style="`color: #1976d2`">Планы</span></v-toolbar-title>
			<v-spacer></v-spacer>
			<v-toolbar-title>ПЛАН:
				<span :style="`color: orange`">{{Sum ? toLocale(Sum) : 'нет данных' }}</span>
			</v-toolbar-title>
			<v-spacer></v-spacer>
			<v-toolbar-title>ФАКТ:
				<span :style="`color: orange`">{{this.editable.Fact ? toLocale(this.editable.Fact) : 'нет данных' }}</span>
			</v-toolbar-title>
			<v-spacer></v-spacer>
			<v-toolbar-title>МАРЖА:
				<span :style="`color: orange`">{{ Marja ? toLocale(Marja) : 'нет данных' }}</span>
			</v-toolbar-title>
        </v-toolbar>

         <v-list two-line>
			<template v-for="(item, index) in Plans">

				<v-divider
				:key="index"
				></v-divider>

				<v-list-item
					:key="item.title"
				>
				<v-list-item-avatar>
					<v-icon
						:class="[item.iconClass]"
						v-text="item.icon"
          			></v-icon>
				</v-list-item-avatar>

				<v-list-item-content>
					<v-list-item-title v-html="item.title"></v-list-item-title>
				</v-list-item-content>

				<v-list-item-content v-if="item.plan">
					<v-list-item-title class="text-center" v-model="plan">{{ toLocale(item.plan) }}</v-list-item-title>
					<v-icon v-if="item.plan" @click="delItem(item, 'plan')">mdi-delete-circle-outline</v-icon>
				</v-list-item-content>
				<v-list-item-content v-else>
					<v-list-item-title class="text-center grey--text">Не задан</v-list-item-title>
				</v-list-item-content>

				<v-list-item-content class="text-center">
					<v-edit-dialog
						:return-value.sync="item.percent"
						large
						persistent
						ref="custom"
						@save="saveCustomPercent(item.percent, item.title)"
						cancel-text="Отмена"
						save-text="Сохранить"
					>{{ Math.round(item.percent * 100) }} % {{ item.type === 'manual' ? ' *' : '' }}
					<template v-slot:input>
						<v-text-field
							v-model="item.percent"
							label="Редактирование"
							single-line
							counter
							autofocus
						></v-text-field>
					</template>
					</v-edit-dialog>
					<v-icon v-if="item.type === 'manual'" @click="delCustomPercent(item.value)">mdi-delete-circle-outline</v-icon>
				</v-list-item-content>

				<v-list-item-content>
					<v-list-item-title v-html="item.curator" class="text-center"></v-list-item-title>
					<v-icon v-if="item.curator && item.curator.includes('*')" @click="delItem(item, 'curator')">mdi-delete-circle-outline</v-icon>
				</v-list-item-content>

				<v-list-item-action @click="open(item)">
                    <v-btn icon>
                        <v-icon color="grey lighten-1" class="text-center">{{ item.editable ? 'mdi-pencil' : '' }}</v-icon>
                    </v-btn>
                </v-list-item-action>

				</v-list-item>
			</template>
			<v-list-item>
				<v-row justify="center" align="center">
					<v-col cols="9">
						<v-select
							:items="percents"
							item-text="crm_name"
							label="Тип процента"
							return-object
							v-model="percent"
							color="success"
							hide-details
							outlined
							dense
							:value.sync="type"
							prepend-icon="mdi-percent"
							@change="show = true"
						>
						</v-select>
					</v-col>
					<v-col cols="3">
						<v-btn @click.prevent="savePercent" color="success" :disabled="!show">
							<v-icon small class="mr-2">save</v-icon>
							Сохранить
						</v-btn>
					</v-col>
				</v-row>
			</v-list-item>
			<v-list-item>
				<v-list-item-title>* - установлено вручную</v-list-item-title>
				<v-list-item-title><v-icon>mdi-delete-circle-outline</v-icon> - можно удалить</v-list-item-title>
			</v-list-item>
    	</v-list>
    </v-card>
	<v-progress-circular v-else :size="120" indeterminate></v-progress-circular>
</div>
</template>

<script>
import { validNumber, validNumberWithPoint } from '@/utils/validate'
import Confirm from '@/components/shared/Confirm'

export default {
	props: ['editable', 'readonly', 'jirausers', 'id', 'typeCRM'],
	components: {
		Confirm
	},
	computed: {
		Plans () {
			return [
				{ icon: 'mdi-currency-usd',
					iconClass: 'grey lighten-1 white--text',
					title: 'Продажи (новое)',
					value: 'AIDC_SALE',
					plan: parseInt(this.editable.AIDC_SALE),
					curator: this.editable.OM_SALE,
					percent: this.editable.P_SALE,
					type: this.editable.P_SALE_type,
					editable: true
				},
				{ icon: 'mdi-currency-usd',
					iconClass: 'grey lighten-1 white--text',
					title: 'Продажи (склад)',
					value: 'AIDC_SALE_ZIP',
					plan: parseInt(this.editable.AIDC_SALE_ZIP),
					curator: this.editable.OM_SALE_ZIP,
					percent: this.editable.P_SALE_ZIP,
					type: this.editable.P_SALE_ZIP_type,
					editable: true
				},
				{ icon: 'mdi-currency-usd',
					iconClass: 'grey lighten-1 white--text',
					title: 'Сервис',
					value: 'AIDC_SERV',
					plan: parseInt(this.editable.AIDC_SERV),
					curator: this.editable.OM_SERV,
					percent: this.editable.P_SERV,
					type: this.editable.P_SERV_type,
					editable: true
				},
				{ icon: 'mdi-currency-usd',
					iconClass: 'grey lighten-1 white--text',
					title: 'IT',
					value: 'IT',
					plan: parseInt(this.editable.IT),
					curator: this.editable.OM_IT,
					percent: this.editable.P_IT,
					type: this.editable.P_IT_type,
					editable: true
				}
			]
		},
		percents () {
			return this.$store.getters.percents.filter(item => item.crm_name !== null)
		},
		type () {
			this.percent = this.percents.find(item => item.crm_id === this.typeCRM)
		},
		Marja () {
			return this.editable.AIDC_SALE * this.editable.P_SALE + this.editable.AIDC_SALE_ZIP * this.editable.P_SALE_ZIP + this.editable.AIDC_SERV * this.editable.P_SERV + this.editable.IT * this.editable.P_IT
		},
		Sum () {
			return (this.editable.AIDC_SALE * 1 + this.editable.AIDC_SALE_ZIP * 1 + this.editable.AIDC_SERV * 1 + this.editable.IT * 1)
		}
	},
	data () {
		return {
			dialog: false,
			localloading: false,
			manager: {},
			plan: null,
			percent: {},
			customPercent: null,
			url: '',
			label: '',
			show: false,
			numberRule: [
				v => validNumber(v) || 'Допускаются только цифры!'
			],
			floatPointRule: [
				v => validNumberWithPoint(v) || 'Допускаются только цифры c плавающей точкой!'
			]
		}
	},
	beforeCreate () {
		this.$store.dispatch('fetchPercentCRM')
	},
	methods: {
		validate (item) {
			return /^[0-9.]+$/.test(item)
		},
		toLocale (item) {
			if (item) return item.toLocaleString('ru') + ' р.'
		},
		getUrl (data) {
			if (data === 'Продажи (новое)') this.url = 'updateAIDC_SALE'
			if (data === 'Продажи (склад)') this.url = 'updateAIDC_SALE_ZIP'
			if (data === 'Сервис') this.url = 'updateAIDC_SERV'
			if (data === 'IT') this.url = 'updateIT'
		},
		open (item) {
			this.dialog = true
			this.label = item.title
			this.getUrl(item.title)
			this.plan = item.plan
		},
		close () {
			this.dialog = false
			this.manager = {}
			this.plan = null
		},
		save () {
			if (Object.keys(this.manager).length !== 0 && this.$refs.plan.validate()) {
				this.$store.dispatch(this.url, { id: this.id, manager: this.manager.user_name, plan: this.plan })
					.then(() => {
						this.$store.commit('setData', 'Данные успешно обновлены.')
						this.close()
					})
			} else {
				this.$store.commit('setError', 'Не все необходимые поля заполнены, что будем сохранять то?')
			}
		},
		async savePercent () {
			if (await this.$refs.confirm.open('Изменение типа процента', 'Вы точно уверены?', { color: 'orange' })) {
				let payload = {
					id: this.id,
					type: this.percent.crm_id,
					AIDC_SALE: this.percent.AIDC_SALE,
					AIDC_SALE_ZIP: this.percent.AIDC_SALE_ZIP,
					AIDC_SERV: this.percent.AIDC_SERV,
					IT: this.percent.IT
				}
				this.$store.dispatch('setPercent', payload)
					.then(() => {
						this.$store.commit('setData', 'Процент применён.')

						this.show = false
					})
			} else {
				this.$store.commit('setInfo', 'Действие отменено.')
			}
		},
		saveCustomPercent (percent, title) {
			if (this.validate(percent)) {
				console.log(percent)
				this.$store.dispatch('setCustomPercent', { id: this.id, name: this.Plans.find(item => item.title === title).value, percent: percent })
					.then(() => {
						this.$store.commit('setData', 'Процент успешно установлен.')
						this.show = false
					})
			} else {
				this.$store.commit('setError', 'Введите корректные данные!')
			}
		},
		async delItem (item, type) {
			if (await this.$refs.confirm.open('Удаление', 'Вы уверены?', { color: 'red' })) {
				let payload
				this.getUrl(item.title)
				if (type === 'plan') payload = { id: this.id, manager: item.curator, plan: null }
				if (type === 'curator') payload = { id: this.id, manager: null, plan: item.plan }
				this.$store.dispatch(this.url, payload)
					.then(() => {
						this.$store.commit('setData', 'Данные успешно удалены.')
						this.close()
					})
			} else {
				this.$store.commit('setInfo', 'Удаление отменено.')
			}
		},
		async delCustomPercent (value) {
			if (await this.$refs.confirm.open('Удаление', 'Вы уверены?', { color: 'red' })) {
				this.$store.dispatch('deleteCustomPercent', { id: this.id, value: value })
			} else {
				this.$store.commit('setInfo', 'Удаление отменено.')
			}
		}
	},
	mounted () {
	}
}
</script>

<style lang="scss" scoped>
</style>
