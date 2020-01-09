<template>
	<div>
	<Confirm ref="confirm"></Confirm>
	<v-container v-if="client" fluid>
		<v-row v-if="statusCRM === null || statusCRM === 2" justify="center">
			<v-col justify="center">
				<p v-if="statusCRM === null" class="title text-center mt-5">Не активирован.</p>
				<p v-if="statusCRM === 2" class="title text-center mt-5">Деактивирован.</p>
				<p class="title text-center mt-5">
					<v-btn @click.prevent="activateCRM" color="primary"><v-icon>add</v-icon>Активировать</v-btn>
				</p>
			</v-col>
		</v-row>
		<v-row v-else justify="center">
				<v-col cols="12" v-if="statusCRM === 1" justify="center" class="text-center">
					<v-btn @click.prevent="deactivateCRM">Деактивировать</v-btn>
				</v-col>
				<v-col cols="6">
					<People :editable="editable" :readonly="readonly" :jirausers="jira_users" :id="id"></People>
				</v-col>
				<v-col cols="6">
					<Plans :editable="editable" :readonly="readonly" :jirausers="jira_users" :id="id" :typeCRM="typeCRM"></Plans>
				</v-col>
		</v-row>
		<v-row>
			<v-col cols="6">
					<Legpers :legpers="legpers" :id="id" :clientName="clientName"></Legpers>
			</v-col>
			<v-col cols="6">
					<Domains :domains="domains" :id="id"></Domains>
			</v-col>
		</v-row>
	</v-container>
	<v-container v-else>
		<v-row justify="center" align="center">
			<v-col cols="12" class="text-center">
				<v-progress-circular :size="100" color="primary" indeterminate></v-progress-circular>
			</v-col>
		</v-row>
	</v-container>

	</div>
</template>

<script>
	import { mapGetters } from 'vuex'
	import People from '../../components/people'
	import Plans from '../../components/plans'
	import Legpers from '../../components/legpers'
	import Domains from '../../components/domains'
	import Confirm from '@/components/shared/Confirm'
	export default {
		components: {
			People,
			Plans,
			Legpers,
			Domains,
			Confirm
		},
		computed: {
			...mapGetters([
				'editable',
				'readonly',
				'jira_users',
				'clients',
				'legpers',
				'domains'
			]),
			client () {
				return this.clients.find(client => parseInt(client.ID) === parseInt(this.id))
			},
			statusCRM () {
				return this.client.CRM
			},
			typeCRM () {
				return this.client.CRM_TYPE
			},
			clientName () {
				return this.client.NAME
			}
		},
		props: ['id'],
		data () {
			return {
			}
		},
		async created () {
			await this.$store.dispatch('fetchEditableCRM', parseInt(this.id))
			await this.$store.dispatch('fetchReadonlyCRM', parseInt(this.id))
			await this.$store.dispatch('fetchLegPers', parseInt(this.id))
			await this.$store.dispatch('fetchClientsDomains', parseInt(this.id))
			await this.$store.dispatch('fetchJiraUsers')
		},
		methods: {
			async activateCRM () {
				if (await this.$refs.confirm.open('АКТИВАЦИЯ:', 'Вы уверены?', { color: 'orange' })) {
					this.$store.dispatch('activateCRM', parseInt(this.id)).then(() => {
						this.$store.commit('setData', 'Активация прошла успешно.')
					})
				} else {
					this.$store.commit('setInfo', 'Активация отменена.')
				}
			},
			async deactivateCRM () {
				if (await this.$refs.confirm.open('ДЕАКТИВАЦИЯ:', 'Вы уверены?', { color: 'orange' })) {
					this.$store.dispatch('deactivateCRM', parseInt(this.id)).then(() => {
						this.$store.commit('setData', 'Деактивация прошла успешно.')
					})
				} else {
					this.$store.commit('setInfo', 'Деактивация отменена.')
				}
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>
