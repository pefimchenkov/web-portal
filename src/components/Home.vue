<template>
  <div v-if="!loading">
  <v-container
    fluid
    grid-list-lg
    fill-height
    style="min-height: 450px"
  >
    <v-layout row>
      <v-flex xs12>
        <v-carousel class="limit_W">
         <v-carousel-item
          v-for="ad in promoAds"
          :key="ad.id"
          :src="ad.imageSRC"
        >
        <div class="img-link">
          <v-btn :to="'/ad/' + ad.id" class="error">{{ ad.title }}</v-btn>
        </div>
          </v-carousel-item>
        </v-carousel>
      </v-flex>
    </v-layout>
  </v-container>

  <v-container grid-list-lg>
    <v-layout row wrap>
      <v-flex
      xs12
      sm6
      md4
      v-for="ad in ads"
      :key="ad.id"
      >
        <v-card>
        <v-img
          :src="ad.imageSRC"
          aspect-ratio="2.75"
        ></v-img>

        <v-card-title primary-title>
          <div>
            <h3 class="headline mb-0">{{ ad.title }}</h3>
            <div>{{ ad.desc }}</div>
          </div>
        </v-card-title>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat :to="'/ad/' + ad.id">Открыть</v-btn>
          <app-buy-modal :ad="ad"></app-buy-modal>
        </v-card-actions>
      </v-card>
      </v-flex>
    </v-layout>
  </v-container>

  </div>
  <div v-else>
    <v-container>
      <v-layout row>
        <v-flex xs12 class="text-xs-center pt-5">
          <v-progress-circular
            :size="50"
            color="primary"
            indeterminate
          ></v-progress-circular>
        </v-flex>

      </v-layout>
    </v-container>
  </div>

</template>



<script>
export default {
  computed: {
    promoAds () {
      return this.$store.getters.promoAds
    },
    ads () {
      return this.$store.getters.ads
    },
    loading () {
      return this.$store.getters.loading
    }
  }
}
</script>

<style scoped>
.limit_W {
  height: 450px;
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
