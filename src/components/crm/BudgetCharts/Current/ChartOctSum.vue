<template>
	<canvas ref="canvas"></canvas>
</template>

<script>
import { HorizontalBar } from 'vue-chartjs'

export default {
	extends: HorizontalBar,
	data () {
		return {
			dynHeight: 50,
			Budget: [],
			Income: [],
			Fact: [],
			Plans: [],
			clientHeigh: null,
			Category: ['Итого:']
		}
	},
	computed: {
		DataGrey () {
			return Object.values(this.Plans[0]).reduce((v, i) => (v + i))
		},
		DataRed () {
			const green = Object.entries(this.Income[0]).filter(item => item[0].includes('_red')).map((item) => item[1])
			return green.reduce((v, i) => (v + i))
		},
		DataGreen () {
			const green = Object.entries(this.Income[0]).filter(item => item[0].includes('_green')).map((item) => item[1])
			return green.reduce((v, i) => (v + i))
		},
		DataYellow () {
			return Object.values(this.Fact[0]).reduce((v, i) => (v + i))
		}
	},
	async created () {
		const plans = this.$store.dispatch('FETCH_PLANS', 10)
		const income = this.$store.dispatch('FETCH_INCOME', 10)
		const fact = this.$store.dispatch('FETCH_FACT', 10)

		this.Plans = [...await plans]
		this.Income = [...await income]
		this.Fact = [...await fact]

		await this.init()
	},
	updated () {
	},
	methods: {
		handle (point, event) {
			const item = event[0]
			const props = {
				index: item._index,
				backgroundColor: item._view.backgroundColor,
				value: item._chart.data.datasets[0].data[item._index]
			}
			this.$store.commit('setInfo', props.value)
		},
		init () {
			this.renderChart({
				labels: this.Category,
				datasets: [
					{
						label: 'Планы',
						backgroundColor: '#ddd',
						borderWidth: 1,
						data: [Math.round(this.DataGrey)]
					},
					{
						label: 'В оплате',
						backgroundColor: 'red',
						strokeColor: 'black',
						borderWidth: 1,
						data: [Math.round(this.DataRed)]
					},
					{
						label: 'Оплачено',
						backgroundColor: 'green',
						borderWidth: 1,
						data: [Math.round(this.DataGreen)]
					},
					{
						label: 'Фактические расходы',
						backgroundColor: 'yellow',
						borderWidth: 1,
						data: [Math.round(this.DataYellow)]
					}
				]}, {
				title: {
					display: true,
					text: 'Суммарно за Октябрь'
				},
				scales: {
					xAxes: [{
						stacked: false,
						ticks: {
							callback: function (value, index, values) {
								return '₽ ' + value.toLocaleString('ru')
							},
							beginAtZero: true,
							max: 60000000
						}
					}],
					yAxes: [ {
						stacked: false,
						categoryPercentage: 0.5,
						barPercentage: 0.5
					}]
				},
				responsive: true,
				aspectRatio: 1,
				maintainAspectRatio: false,
				onClick: this.handle
			})
		}
	}
}
</script>

<style lang="scss" scoped>

</style>
