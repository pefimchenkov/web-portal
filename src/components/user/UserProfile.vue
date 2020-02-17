<template>
	<v-container fluid>
		<v-row>
			<v-col>
				<user-card />
			</v-col>
		</v-row>
	</v-container>
</template>
<script>

// import EditProfileForm from './EditProfileForm'
import UserCard from './UserCard'

export default {
	components: {
		UserCard
	}
}
</script>
