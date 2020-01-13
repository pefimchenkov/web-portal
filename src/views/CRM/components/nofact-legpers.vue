<template>
	<v-container fluid>
		<div v-if="!loading && Legpers.length === 0">
			<v-layout row wrap>
				<v-flex xs12 class="text-center pt-5">
					<v-progress-circular color="primary" indeterminate :size="100"></v-progress-circular>
				</v-flex>
			</v-layout>
		</div>
		<div v-else>
			<v-toolbar text color="white" class="text-lg-right elevation-2 mb-1">
				<v-toolbar-title>Непопавший факт: Юрлица</v-toolbar-title>
				<v-divider class="mx-3" inset vertical></v-divider>
				<v-spacer></v-spacer>
			</v-toolbar>
			<v-data-table
				:headers="headers"
				:items="Legpers"
				:search="search"
				:items-per-page=50
				item-key="1c"
				:mobile-breakpoint="850"
				sort-by="1c"
				sort-desc
				:footer-props="{
					itemsPerPageAllText: 'Все',
					itemsPerPageOptions: [50,250,500,-1],
					showFirstLastPage: true,
					firstIcon: 'mdi-arrow-collapse-left',
					lastIcon: 'mdi-arrow-collapse-right',
					prevIcon: 'mdi-minus',
					nextIcon: 'mdi-plus'
				}"
			>
			<template v-slot:item.Sum="{item}">
				{{ item.Sum.toLocaleString('ru') + ' р.' }}
			</template>
			</v-data-table>
		</div>
	</v-container>
</template>

<script>
import { AclRule } from 'vue-acl'

export default {
	props: ['Legpers'],
	data () {
		return {
			search: '',
			dialog: false,
			headers: [
				{ text: 'Артикул в документе', value: 'client_1c', align: 'left', divider: true },
				{ text: 'Артикул в 1C', value: '1c_id', align: 'left', divider: true },
				{ text: 'Клиент в 1С', value: 'name', align: 'left', divider: true },
				{ text: 'Кол-во вхождений', value: 'qty', align: 'left', divider: true },
				{ text: 'Сумма', value: 'Sum', align: 'left', divider: true },
				{ text: 'Проекты 1С', value: 'Projects', align: 'left', divider: true }
			]
		}
	},

	computed: {
		loading () {
			return this.$store.getters.loading
		},
		Edit () {
			return new AclRule('user').and('engineer').or('admin').generate()
		}
	},
	methods: {
	},
	created () {
		this.$store.dispatch('FETCH_STOCK_1C')
	}
}
</script>

<style scoped>

</style>