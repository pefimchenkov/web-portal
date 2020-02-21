<template>
  <v-dialog width="400px" v-model="modal">
	  <template v-slot:activator="{on}">
		  <v-btn v-on="on" class="info mr-3 elevation-2" v-if="$acl.check('Edit')" text :small="$vuetify.breakpoint.name === 'lg'" @click="getRate()">
				Задать
		</v-btn>
	  </template>
    <v-card class="pa-3">
        <v-layout>
          <v-flex xs12>
			  <v-card-title>Задать курс:</v-card-title>
            <v-card-text>
              <v-text-field name="dollar" label="Доллар" type="text" v-model="editedDollar"></v-text-field>
              <v-text-field name="euro" label="Евро" type="text" v-model="editedEuro"></v-text-field>
            </v-card-text>
          </v-flex>
        </v-layout>
        <v-layout row>
          <v-flex xs12>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="error" @click="onCancel">Отмена</v-btn>
              <v-btn class="success" @click="onSave">Сохранить</v-btn>
            </v-card-actions>
          </v-flex>
        </v-layout>
    </v-card>
  </v-dialog>
</template>

<script>
import Api from '@/services/Api'
import { eventBus } from '@/main.js'
import { AclRule } from 'vue-acl'
export default {
	data () {
		return {
			modal: false,
			editedDollar: '',
			editedEuro: ''
		}
	},
	methods: {
		getRate () {
			this.$store.getters.currency.forEach(c => {
				if (c.id === 2) {
					this.editedEuro = c.rate
				}
				if (c.id === 3) {
					this.editedDollar = c.rate
				}
			})
		},
		onCancel () {
			this.editedDollar = ''
			this.editedEuro = ''
			this.modal = false
		},
		onSave () {
			if (this.editedDollar !== '' && this.editedEuro !== '') {
				Api()
					.post('zip_prices/setrate', [
						parseFloat(this.editedEuro),
						parseFloat(this.editedDollar)
					])
					.then(response => {
						eventBus.$emit('Rate', [
							{ name: 'Dollar', value: this.editedDollar },
							{ name: 'Euro', value: this.editedEuro }
						])
						this.$store.commit('setData', response.data)
						this.modal = false
						setTimeout(() => {
							window.location.replace('/zip_prices')
						}, 2000)
					})
					.catch(error => {
						this.$store.commit('setError', error.message)
					})
			}
		}
	},
	computed: {
		Edit () {
			return new AclRule('admin').generate()
		}
	}
}
</script>
