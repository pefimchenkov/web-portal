<template>
	<div>
		<budget-list v-if="$route.name === 'budget_list'"></budget-list>
		<budget-list-prev v-if="$route.name === 'budget_list_prev'"></budget-list-prev>
		<pays-list v-if="$route.name === 'pays_list'"></pays-list>
		<budget-chart v-if="$route.name === 'budget_plans'"></budget-chart>
	</div>
</template>

<script>

import BudgetList from '../../components/crm/BudgetList'
import BudgetListPrev from '../../components/crm/BudgetListPrev'
import PaysList from '../../components/crm/PaysList'
import BudgetChart from '../../components/crm/BudgetChart'

export default {
	data () {
		return {
		}
	},
	created () {
	},
	beforeCreate () {
	},
	components: {
		BudgetList,
		BudgetListPrev,
		PaysList,
		BudgetChart
	}
}
</script>

<style lang="scss" scoped>
</style>
