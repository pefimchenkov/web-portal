<template>
	<div>
		<v-tabs
			icons-and-text
			v-model="active"
			grow
			background-color="white lighten-3"
		>
    	<v-tabs-slider></v-tabs-slider>

			<v-tab href="#tab-nofact-legpers">Непопавший факт: Юрлица
				<v-icon color="blue darken-2">mdi-archive</v-icon>
			</v-tab>
			<v-tab href="#tab-nofact-projects">Непопавший факт: Проекты 1С
				<v-icon color="blue darken-2">mdi-archive</v-icon>
			</v-tab>
			<v-tab-item :value="`tab-nofact-legpers`">
				<NofactLegpers :Legpers="NoFactLegpers"></NofactLegpers>
			</v-tab-item>
			<v-tab-item :value="`tab-nofact-projects`">
				<NofactProjects :Projects="NoFactProjects"></NofactProjects>
			</v-tab-item>
		</v-tabs>
	</div>
</template>

<script>

import { mapGetters } from 'vuex'
import NofactLegpers from '@/views/CRM/components/nofact-legpers'
import NofactProjects from '@/views/CRM/components/nofact-projects'

export default {
	components: {
		NofactLegpers,
		NofactProjects
	},
	computed: {
		...mapGetters(['NoFactLegpers', 'NoFactProjects'])
	},
	data () {
		return {
			active: 'tab-nofact-legpers'
		}
	},
	created () {
		this.$store.dispatch('fetchNoFactLegpers')
		this.$store.dispatch('fetchNoFactProjects')
	}
}
</script>

<style lang="scss" scoped>
</style>
