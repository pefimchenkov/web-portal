<template>
	<v-container fluid>
		<div v-if="!loading && Stock1C.length === 0">
			<v-layout row wrap>
				<v-flex xs12 class="text-center pt-5">
					<v-progress-circular color="primary" indeterminate :size="100"></v-progress-circular>
				</v-flex>
			</v-layout>
		</div>
		<div v-else>
			<v-toolbar text color="white" class="text-lg-right elevation-2 mb-1">
				<v-toolbar-title>Склад 1С</v-toolbar-title>
				<v-divider class="mx-3" inset vertical></v-divider>
				<v-text-field
					class="mb-3"
					prepend-icon="search"
					label="Поиск"
					placeholder="Поиск"
					v-model="search"
					single-line
					clearable
				></v-text-field>
				<v-spacer></v-spacer>
			</v-toolbar>
			<v-data-table
				:headers="headers"
				:items="Stock1C"
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
				<template v-slot:item.date="{ item }">{{ formattedDate(item) }}</template>
				<template v-slot:no-data>
					<v-alert
					type="warning"
					outlined
					class="ma-3"
					>
					Позиции с Маркет ID равным нулю отстутствуют!
					</v-alert>
				</template>
			</v-data-table>
		</div>
	</v-container>
</template>

<script>
import moment from 'moment'
import { AclRule } from 'vue-acl'

export default {
	data () {
		return {
			Stock1C: [],
			search: '',
			dialog: false,
			headers: [
				{ text: '1С', value: '1c', align: 'center', divider: true },
				{ text: 'Основной', value: 'qty', align: 'center', divider: true },
				{ text: 'Сервисный', value: 'qtyser', align: 'center', divider: true },
				{ text: 'Готовой Прод.', value: 'qtygp', align: 'center', divider: true },
				{ text: 'Дата', value: 'date', align: 'center', divider: true }
			]
		}
	},

	computed: {
		loading () {
			return this.$store.getters.loading
		},
		Edit () {
			return new AclRule('user')
				.and('engineer')
				.or('admin')
				.generate()
		}
	},
	methods: {
		getSklad1C () {
			return Promise.resolve(this.$store.getters.Stock1C)
		},
		formattedDate (item) {
			return moment(new Date(item.date)).format('YYYY.MM.DD HH:mm')
		}
	},
	created () {
		this.$store.dispatch('setLoading', true)
		this.$store.dispatch('FETCH_STOCK_1C')
			.then(() => {
				this.getSklad1C()
					.then(res => {
						this.Stock1C = [...res]
					})
			})
	}
}
</script>
