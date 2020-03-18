<template>
	<div>
		<v-dialog v-model="dialog">
			<bonusDialog :name="name" :email="JiraUser.email ? JiraUser.email : this.email"></bonusDialog>
		</v-dialog>
		<v-row justify="center">
			<v-col cols="4">
				<v-autocomplete
					v-model="JiraUser"
					@change="reloadAllBonus(JiraUser.email)"
					:items="Jira_Users"
					item-text="display_name"
					label="Выберите пользователя"
					return-object
				></v-autocomplete>
			</v-col>
		</v-row>
		<v-row>
			<v-col v-for="item in items" :key="item.name" class="mx-4">
				<v-card max-width="480" outlined>
					<v-list-item three-line>
						<v-list-item-content>
							<div class="overline mb-4">{{ item.name }}</div>
							<v-list-item-title class="headline my-3">{{ item.titleX }} - 
								<v-progress-circular 
									v-if="!item.pointsX && loading"
									:width="2"
									color="green"
									indeterminate
								></v-progress-circular>
								<span v-else>{{ item.pointsX }}</span>
							</v-list-item-title>
							<v-list-item-subtitle v-if="item.name === 'Продажи' || item.name === 'Доходность'" class="title my-3">{{ item.title }} - 
								<v-progress-circular 
									v-if="!item.points && loading"
									:width="2"
									color="green"
									indeterminate
								></v-progress-circular>
								<span v-else>{{ item.points }}</span>
							</v-list-item-subtitle>
							<v-list-item-subtitle class="my-3">Нажмите "Подробнее" чтобы увидеть детализацию</v-list-item-subtitle>
						</v-list-item-content>

						<v-icon x-large>mdi-sale</v-icon>
					</v-list-item>

					<v-card-actions>
						<v-row>
							<v-col class="text-end">
								<v-btn @click="loadUserBonus(item)" text>Подробнее</v-btn>
							</v-col>
						</v-row>
					</v-card-actions>
				</v-card>
			</v-col>
		</v-row>
	</div>
</template>

<script>
import bonusDialog from './bonusDialog'
import { mapState } from 'vuex'

export default {
	components: {
		bonusDialog
	},
	computed: {
		loading () {
			return this.$store.getters.loading
		},
		...mapState({
			BonusSaleSum: state => state.user.BonusSaleSum,
			BonusProfitSum: state => state.user.BonusProfitSum,
			Jira_Users: state => state.jira_users.JIRA_USERS
		}),
		pointsXSale () {
			return this.BonusSaleSum ? Math.round(this.BonusSaleSum.pointsX) : null
		},
		pointsXProfit () {
			return this.BonusProfitSum ? Math.round(this.BonusProfitSum.pointsX) : null
		},
		pointsSale () {
			return this.BonusSaleSum ? Math.round(this.BonusSaleSum.points) : null
		},
		pointsProfit () {
			return this.BonusProfitSum ? Math.round(this.BonusProfitSum.points) : null
		},
		email () {
			const user = this.$store.getters.currentUser
			if (user) return user.email
		},
		items () {
			return [
				{ name: 'Продажи', titleX: 'Бонусы с продаж', title: 'Сумма баллов в теории', pointsX: this.pointsXSale, points: this.pointsSale },
				{ name: 'Доходность', titleX: 'Бонусы с доходности', title: 'Сумма баллов в теории', pointsX: this.pointsXProfit, points: this.pointsProfit },
				{ name: 'Прочие', titleX: 'Прочие бонусы', title: 'Сумма баллов в теории', pointsX: 'xxx', points: 'xxx' }
			]
		}
	},
	data () {
		return {
			dialog: false,
			name: '',
			JiraUser: {}
		}
	},
	methods: {
		loadUserBonus (item) {
			this.dialog = true
			this.name = item.name
		},
		async reloadAllBonus (email) {
			await this.$store.dispatch('getBonusSaleSum', { email: email })
			await this.$store.dispatch('getBonusProfitSum', { email: email })
			this.$store.dispatch('getBonusSale', email)
			this.$store.dispatch('getBonusProfit', email)
		}
	},
	async created () {
		await this.$store.dispatch('getBonusSaleSum', { email: this.email })
		await this.$store.dispatch('getBonusProfitSum', { email: this.email })
		this.$store.dispatch('getBonusSale', this.email)
		this.$store.dispatch('getBonusProfit', this.email)
		this.$store.dispatch('fetchJiraUsers')
	}
}
</script>

<style lang="scss" scoped></style>
