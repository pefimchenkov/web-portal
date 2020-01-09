<template>
  <v-container>
    <v-layout row>
      <v-flex xs12 sm6 offset-sm3>
        <h1 class="text--secondary sm3">Create New Ad</h1>
        <v-form ref="form" v-model="valid" validation class="mb-3">
          <v-text-field
            name="title"
            label="Заголовок рекламы"
            type="text"
            v-model="title"
            required
            :rules="[ v => !!v || 'Название необходимо заполнить!' ]"
          ></v-text-field>
          <v-textarea
            name="desc"
            label="Описание рекламы"
            type="text"
            v-model="desc"
            :rules="[ v => !!v || 'Описание необходимо заполнить!' ]"
          ></v-textarea>
        </v-form>
        <v-layout row>
          <v-flex xs12>
            <v-btn color="blue-grey" class="white--text" @click="triggerUpload">Загрузить
              <v-icon right dark>cloud_upload</v-icon>
            </v-btn>
            <input
              ref="fileInput"
              type="file"
              style="display:none"
              accept="image/*"
              @change="onFileChange"
            >

            <v-layout row class="pt-4">
              <v-flex xs12>
                <img :src="imageSRC" height="250" v-if="imageSRC">
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12>
                <v-switch label="Ad to promo?" v-model="promo"></v-switch>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12>
                <v-spacer></v-spacer>
                <v-btn
                  class="success"
                  @click="createAd()"
                  :disabled="!valid || !image || loading"
                  :loading="loading"
                >Create Ad</v-btn>
              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
	data () {
		return {
			title: '',
			desc: '',
			promo: false,
			valid: false,
			image: null,
			imageSRC: ''
		}
	},
	methods: {
		createAd () {
			if (this.$refs.form.validate() && this.imageSRC) {
				// logic
				const ad = {
					title: this.title,
					desc: this.desc,
					promo: this.promo,
					imageSRC: this.imageSRC,
					image: this.image
				}
				this.$store
					.dispatch('createAd', ad)
					.then(() => {
						this.$router.push('/list')
					})
					.catch(() => {})
			}
		},
		triggerUpload () {
			this.$refs.fileInput.click()
		},
		onFileChange (event) {
			const file = event.target.files[0]

			const reader = new FileReader()
			reader.onload = e => {
				this.imageSRC = reader.result
			}
			reader.readAsDataURL(file)
			this.image = file
		}
	},
	computed: {
		loading () {
			return this.$store.getters.loading
		}
	}
}
</script>
