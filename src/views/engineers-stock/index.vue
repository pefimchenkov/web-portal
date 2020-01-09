<template>
	<div v-if="EngineersStock.length > 0">
		<list :EngineersStock="EngineersStock" :EngineersStockArchive="EngineersStockArchive" :EngineersStockGood="EngineersStockGood"></list>
	</div>
	<div v-else>
		<v-container fluid>
			<v-row>
				<v-col class="text-center">
					<v-progress-circular color="primary" indeterminate :size="100"></v-progress-circular>
				</v-col>
			</v-row>
		</v-container>
	</div>
</template>

<script>
	import list from '@/views/engineers-stock/components/list'
	import { mapGetters } from 'vuex'
	export default {
		components: {
			list
		},
		computed: {
			...mapGetters(['EngineersStock', 'EngineersStockArchive', 'EngineersStockGood'])
		},
		async created () {
			await this.$store.dispatch('fetchEngineersStock')
			await this.$store.dispatch('fetchEngineersStockGood')
			await this.$store.dispatch('fetchEngineersStockArchive')
			await this.$store.dispatch('fetchJiraUsers')
		}
	}
</script>

<style lang="scss" scoped>

</style>
