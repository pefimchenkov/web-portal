<template>
	<div>
		<deals-list v-if="$route.name === 'deals_list'"></deals-list>
		<deals-list-no-bills v-if="$route.name === 'deals_list_no_bills'"></deals-list-no-bills>
	</div>
</template>

<script>

import DealsList from '../../components/crm/DealsList'
import DealsListNoBills from '../../components/crm/DealsListNoBills'

export default {
	data () {
		return {

		}
	},
	created () {

	},
	mounted () {
	},

	computed: {
	},
	components: {
		DealsList,
		DealsListNoBills
	},
	methods: {
	}
}
</script>

<style lang="scss" scoped>
</style>
