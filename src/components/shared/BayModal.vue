<template>
<v-dialog width="400px" v-model="modal">
  <v-btn class="primary mr-3" flat slot="activator">
    Покупка
  </v-btn>
  <v-card class="pa-3">
    <v-content grid-list-md>
      <v-layout row>
        <v-flex xs12>
          <v-card-title>
            <h2 class="texxt--primary">Вы действительно хотите приобрести это?</h2>
          </v-card-title>
        </v-flex>
      </v-layout>
      <v-divider inset></v-divider>
      <v-layout row>
        <v-divider></v-divider>
        <v-flex xs12>
          <v-card-text>
            <v-text-field
                      name="name"
                      label="Ваше имя"
                      type="text"
                      v-model="name"
                  >
                    </v-text-field>
                    <v-text-field
                      name="phone"
                      label="Ваш контакт"
                      type="text"
                      v-model="phone"
                  >
                    </v-text-field>
          </v-card-text>
        </v-flex>
      </v-layout>
      <v-divider ></v-divider>
      <v-layout row>
        <v-flex xs12>
          <v-card-actions>
            <v-spacer></v-spacer>
              <v-btn
              class="error"
              @click="onCancel"
              :disabled="localLoading"
              >
              Закрыть
              </v-btn>
              <v-btn
              class="success"
              @click="onSave"
              :disabled="localLoading"
              :loading="localLoading"
              >
              Купить
              </v-btn>

          </v-card-actions>
        </v-flex>
      </v-layout>
    </v-content>
  </v-card>
</v-dialog>
</template>

<script>
export default {
	props: ['ad'],
	data () {
		return {
			modal: false,
			name: '',
			phone: '',
			localLoading: false
		}
	},
	methods: {
		onCancel () {
			this.name = ''
			this.phone = ''
			this.modal = false
		},
		onSave () {
			if (this.name !== '' && this.phone !== '') {
				this.localLoading = true
				this.$store.dispatch('createOrder', {
					name: this.name,
					phone: this.phone,
					adId: this.ad.id,
					ownerId: this.ad.ownerId
				}).finally(() => {
					this.name = ''
					this.phone = ''
					this.localLoading = false
					this.modal = false
				})
			}
		}
	}
}
</script>
