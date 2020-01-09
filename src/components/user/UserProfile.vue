<template>
	<v-container container--fluid>
		<v-layout wrap>
			<v-flex xs12 sm12 md6 lg6 class="pr-2">
				<edit-profile-form></edit-profile-form>
			</v-flex>
			<v-flex xs12 sm12 md6 lg6>
				<user-card></user-card>
			</v-flex>
		</v-layout>
	</v-container>
</template>
<script>

import EditProfileForm from './EditProfileForm'
import UserCard from './UserCard'

export default {
	components: {
		EditProfileForm,
		UserCard
	}
}
</script>
