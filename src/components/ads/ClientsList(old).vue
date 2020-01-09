<template>
  <v-container>

    <div v-if="!loadings && Clients.length !== 0">

       <v-flex xs12 md6 offset-sm3>
        <h1 class="text--secondary mb-3">Список клиентов</h1>

            <v-text-field class="mb-3"
                  prepend-icon="search"
                  label="Фильтр"
                  placeholder="Введите название клиента"
                  v-model="search"
                  append-icon="cancel"  single-line
            >
            </v-text-field>

            <v-card color="primary" class="white--text mb-3 elevation-5"
              v-for="client of filteredClients"
              :key="client.ID"
            >
              <v-layout row>

                <v-flex xs12>
                  <v-img class="mt-2"
                    src="https://cdn.dribbble.com/users/342059/screenshots/1132717/shot-003.jpg"
                    height="115px"
                    contain
                  ></v-img>
                </v-flex>

                <v-flex xs12>
                  <v-card-title primary-title>
                    <div>
                      <div class="title mb-3">
                        <label style="color: #000" for="">Название:</label>
                         {{ client.NAME }}
                        </div>
                      <div>Куратор: {{ client.MANAGER }}</div>
                      <div>Тип: {{ client.PROJECT }}</div>
                    </div>
                  </v-card-title>
                </v-flex>

              </v-layout>
              <v-divider light></v-divider>
              <v-card-actions class="pa-3">
                 <v-spacer></v-spacer>
                  <v-btn
                  :to="'/client/' + client.ID"

                  >
                  Подробнее

                  </v-btn>
              </v-card-actions>
            </v-card>

      </v-flex>

    </div>
    <div v-else-if="!loadings && Clients.length === 0">
      <v-layout row>
      <v-flex xs12 class="text-xs-center pt-5">
        <v-progress-circular
          :size="70"
          :width="6"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </v-flex>
      </v-layout>
    </div>

  </v-container>
</template>

<script>
import axios from 'axios'

export default {
	data () {
		return {
			Clients: [],
			search: ''
		}
	},
	computed: {
		/* myZip () {
      return this.$store.getters.myZip
    }, */
		filteredClients: function () {
			var self = this
			return this.Clients.data.filter(function (client) {
				return (
					client.NAME.toLowerCase().indexOf(self.search.toLowerCase()) !== -1
				)
			})
		},
		loadings () {
			return this.$store.getters.loadings
		}
	},
	mounted () {
		axios
			.get('http://localhost:3000/clients')
			.then(res => {
				this.Clients = res.data
				console.log(this.Clients)
			})
			.catch(err => {
				console.log(err)
			})
	},
	methods: {}
}
</script>
