<template>
  <div v-if="!loading">
    <v-container fluid grid-list-lg fill-height style="min-height: 450px">
      <v-layout row>
        <v-flex xs12>
          <v-carousel class="limit_W">
            <v-carousel-item v-for="img in marketImg" :key="img.ID" :src="img.URL">
              <div class="img-link">
                <v-btn :to="'/zip_prices/' + img.JIRA_MARKET_ID" class="error">Перейти к данной позиции</v-btn>
              </div>
            </v-carousel-item>
          </v-carousel>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container grid-list-lg>
      <v-layout row wrap>
		  <v-flex xs12>
			  <v-card color="blue-grey darken-1" class="white--text">
				  <v-card-title class="subtitle-1">
						  Последние 6 добавленных фото к блоку Маркета:
				  </v-card-title>
				</v-card>
		  </v-flex>
        <v-flex xs12 sm6 md4 v-for="img in marketImg" :key="img.ID">
          <v-card>
            <v-img :src="img.URL" aspect-ratio="2.75"></v-img>
            <v-card-title primary-title>
              <div>
                <h3 class="headline mb-0">{{ img.NAME }}</h3>
                <div>{{ img.NAME }}</div>
              </div>
            </v-card-title>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
  <div v-else>
    <v-container>
      <v-layout row>
        <v-flex xs12 class="text-xs-center pt-5">
          <v-progress-circular :size="80" color="primary" indeterminate></v-progress-circular>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>



<script>
export default {
	computed: {
		marketImg () {
			return this.$store.getters.loadMarketImg
		},
		loading () {
			return this.$store.getters.loading
		}
	},
	created () {
	}
}
</script>

<style scoped>
.limit_W {
	height: 450px
}
.img-link {
	position: absolute;
	bottom: 50px;
	left: 50%;
	background: rgb(0, 0, 0, 0.5);
	transform: translate(-50%, 0);
	padding: 10px 20px;
	border-radius: 5px;
}
</style>
