<template>
	<v-container class="grey lighten-2">
		<v-row>
			<v-col
				cols="auto"
				offset-lg="1"
				offset-xl="3"
				v-for="url in urls"
				:key='url'
			>
				<img
					class="lazy"
					v-lazyload
					src='@/assets/img/placeholder.png'
					:data-src='url'
					data-err='@/assets/img/broken-image.jpg'
				>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
// import lazyload from '../../directives/lazyload'

export default {
	data () {
		return {
			urls: [
				'https://picsum.photos/1000/800?random=1',
				'https://picsum.photos/1000/800?random=2',
				'https://picsum.photos/1000/800?random=3',
				'https://picsum.photos/1000/800?random=4',
				'https://picsum.photos/1000/800?random=5',
				'https://picsum.photos/1000/800?random=6',
				'https://picsum.photos/1000/800?random=7',
				'https://picsum.photos/1000/800?random=8'
			]
		}
	},
	methods: {

	}
}
</script>

<style scoped>
	.lazy {
		display: block;
		margin: 1em auto;
		text-align: center;
}
</style>
