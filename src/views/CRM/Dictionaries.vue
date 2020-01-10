<template>
	<div>
		<NofactLegpers></NofactLegpers>
		<NofactProjects></NofactProjects>
	</div>
</template>

<script>

import NofactLegpers from '@/views/CRM/components/nofact-legpers'
import NofactProjects from '@/views/CRM/components/nofact-projects'

export default {
	components: {
		NofactLegpers,
		NofactProjects
	},
	data () {
		return {
		}
	},
	created () {
	}
}
</script>

<style lang="scss" scoped>
</style>
