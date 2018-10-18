<template>
   <v-container>
    <div v-if="!loadings && myAds.length !== 0">
    <v-layout row>
      <v-flex xs12 sm6 offset-sm3>
        <h1 class="text--secondary mb-3">My Ads</h1>
        <v-card
        class="elevation-10 mb-3"
        v-for="ad of myAds"
        :key="ad.title"
        >
          <v-layout row>
            <v-flex xs4>
              <v-img
                :src="ad.imageSRC"
                height="155"
              >

              </v-img>
            </v-flex>
            <v-flex xs8>
              <v-card-text>
                <h2 class="text--secondary">{{ ad.title }}</h2>
                <p>{{ ad.desc }}</p>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn class="info"
                  :to="'/ad/' + ad.id"
                  >
                  Open

                  </v-btn>
                </v-card-actions>
              </v-card-text>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
    </div>
    <div v-else-if="!loadings && myAds.length === 0">
    <v-layout row>
      <v-flex xs12 sm6 offset-sm6>
        <h1 class="text--primary">У вас нет записей..</h1>
      </v-flex>
    </v-layout>
    </div>
    <div v-else>
    <v-layout row>
      <v-flex xs12 sm6 offset-sm6>
          <v-progress-circular
           :size="60"
            color="primary"
            indeterminate
        ></v-progress-circular>
      </v-flex>
    </v-layout>
    </div>
  </v-container>
</template>


<script>
export default {
  computed: {
    myAds () {
      return this.$store.getters.myAds
    },
    loadings () {
      return this.$store.getters.loadings
    }
  }
}
</script>
