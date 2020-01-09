<template>
  <v-dialog width="400px" v-model="modal">
    <v-btn class="warning mr-3" flat slot="activator">Правка</v-btn>
    <v-card class="pa-3">
      <v-content grid-list-md>
        <v-layout row>
          <v-flex xs12>
            <v-card-title>
              <h2 class="text--primary">Правка карточки</h2>
            </v-card-title>
          </v-flex>
        </v-layout>
        <v-divider inset></v-divider>
        <v-layout row>
          <v-divider></v-divider>
          <v-flex xs12>
            <v-card-text>
              <v-text-field name="title" label="Заголовок" type="text" v-model="editedTitle"></v-text-field>
              <v-text-field
                name="desc"
                multi-line
                label="Опмсание"
                type="text"
                v-model="editedDesc"
              ></v-text-field>
            </v-card-text>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout row>
          <v-flex xs12>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="error" @click="onCancel">Отмена</v-btn>
              <v-btn class="success" @click="onSave">Сохранить</v-btn>
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
			editedTitle: this.ad.title,
			editedDesc: this.ad.desc
		}
	},
	methods: {
		onCancel () {
			this.editedTitle = this.ad.title
			this.editedDesc = this.ad.desc
			this.modal = false
		},
		onSave () {
			if (this.editedTitle !== '' && this.editedDesc !== '') {
				this.$store.dispatch('updateAd', {
					title: this.editedTitle,
					desc: this.editedDesc,
					id: this.ad.id
				})

				this.modal = false
			}
		}
	}
}
</script>
