<template>
  <v-container>
    <v-layout row>
      <v-flex xs12>
        <h1>AD</h1>
        <v-card v-if="!loading">
          <v-card-media :src="ad.imageSRC" height="300"></v-card-media>
          <v-card-text>
            <h1 class="text--primary">{{ad.title}}</h1>
            <p>{{ad.desc}}</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <appEditAdModal :ad="ad" v-if="isOwner"></appEditAdModal>
            <app-buy-modal :ad="ad"></app-buy-modal>
          </v-card-actions>
        </v-card>
        <div v-else class="text-xs-center">
          <v-progress-circular :size="60" color="primary" indeterminate></v-progress-circular>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import EditAdModal from './EditAdModal'
export default {
	props: ['id'],
	computed: {
		ad () {
			const id = this.id
			return this.$store.getters.adsById(id)
		},
		loading () {
			return this.$store.getters.loading
		},
		isOwner () {
			return this.ad.ownerId === this.$store.getters.user.id
		}
	},
	components: {
		appEditAdModal: EditAdModal
	}
}
</script>
