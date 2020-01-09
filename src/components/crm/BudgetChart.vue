<template>
	<v-tabs centered v-model="active" fixed-tabs icons-and-text class="mt-3">
		<v-tabs-slider></v-tabs-slider>
		<v-tab href="#tab-curr">Текущий квартал
			<v-icon>list</v-icon>
		</v-tab>
		<v-tab href="#tab-prev">Предыдущий квартал
			<v-icon>list</v-icon>
		</v-tab>
		<v-tab href="#tab-period">Предыдущий период
			<v-icon>list</v-icon>
		</v-tab>
		<!--Текущий квартал -->
		<v-tab-item :value="'tab-curr'">
			<v-container fluid>
			<v-row
				align="center"
				justify="center"
				class="grey lighten-5"
			>
				<v-col cols="6">
					<ChartOct></ChartOct>
				</v-col>
				<v-col cols="6">
					<ChartOctSum></ChartOctSum>
				</v-col>
			</v-row>
			<v-row
				align="center"
				justify="center"
				class="grey lighten-5"
			>
				<v-col cols="6">
					<ChartNov></ChartNov>
				</v-col>
				<v-col cols="6">
					<ChartNovSum></ChartNovSum>
				</v-col>
			</v-row>
			<v-row
				align="center"
				justify="center"
				class="grey lighten-5"
			>
				<v-col cols="6">
					<ChartDec></ChartDec>
				</v-col>
				<v-col cols="6">
					<ChartDecSum></ChartDecSum>
				</v-col>
			</v-row>
		</v-container>
		</v-tab-item>
		<!-- Предыдущий квартал -->
		<v-tab-item :value="'tab-prev'">
			<v-container fluid>
			<v-row
				align="center"
				justify="center"
				class="grey lighten-5"
			>
				<v-col cols="9">
					<ChartJul></ChartJul>
				</v-col>
			</v-row>
			<v-row
				align="center"
				justify="center"
				class="grey lighten-5"
			>
				<v-col cols="9">
					<ChartAug></ChartAug>
				</v-col>
			</v-row>
			<v-row
				align="center"
				justify="center"
				class="grey lighten-5"
			>
				<v-col cols="9">
					<ChartSep></ChartSep>
				</v-col>
			</v-row>
		</v-container>
		</v-tab-item>
		<!--Предыдущий период-->
		<v-tab-item :value="'tab-period'">
			<v-container fluid>
				<v-row
				align="center"
				justify="center"
				class="grey lighten-5"
			>
				<v-col cols="9">
					<ChartPrev></ChartPrev>
				</v-col>
			</v-row>
			</v-container>
		</v-tab-item>
	</v-tabs>
</template>

<script>
import ChartJul from './BudgetCharts/Previous/ChartJul'
import ChartAug from './BudgetCharts/Previous/ChartAug'
import ChartSep from './BudgetCharts/Previous/ChartSep'
import ChartOct from './BudgetCharts/Current/ChartOct'
import ChartOctSum from './BudgetCharts/Current/ChartOctSum'
import ChartNov from './BudgetCharts/Current/ChartNov'
import ChartNovSum from './BudgetCharts/Current/ChartNovSum'
import ChartDec from './BudgetCharts/Current/ChartDec'
import ChartDecSum from './BudgetCharts/Current/ChartDecSum'
import ChartPrev from './BudgetCharts/Current/ChartPrev'

export default {
	data () {
		return {
			window: {
				width: 0,
				height: 0
			},
			active: 'tab-curr'
		}
	},
	computed: {
	},
	watch: {
	},
	created () {
		window.addEventListener('resize', this.handleResize)
		this.handleResize()
	},
	destroyed () {
		window.removeEventListener('resize', this.handleResize)
	},
	mounted () {
	},
	methods: {
		handleResize () {
			this.window.width = window.innerWidth
			this.window.height = window.innerHeight
		}
	},
	components: {
		ChartJul,
		ChartAug,
		ChartSep,
		ChartOct,
		ChartOctSum,
		ChartNov,
		ChartNovSum,
		ChartDec,
		ChartDecSum,
		ChartPrev
	}
}
</script>

<style lang="scss" scoped>

</style>
