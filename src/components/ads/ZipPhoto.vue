<template>
  <v-container grid-list-md text-center class="mt-4">
		<v-dialog
     		v-model="show"
      		persistent
     		 width="300"
    	>
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          Пожалуйста, дождитесь выполнения
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
	<v-layout row wrap>
	<input
		ref="fileInput"
		type="file"
		style="display:none"
		accept="image/*"
		@change="onFileChange"
	>
	<v-flex xs12>
		<img :src="imageSRC" height="350" v-if="imageSRC">
	</v-flex>
	<v-flex xs12>
        <v-btn color="blue-grey" class="white--text" @click="triggerUpload" :disabled="$acl.not.check('Edit')">Выберите фото
            <v-icon right dark>cloud_upload</v-icon>
        </v-btn>
	</v-flex>
	<v-flex xs12>
		<v-btn
			class="success"
			@click="uploadPhoto()"
			:disabled="!image || loading"
			:visible="false"
			:loading="loading"
		>Загрузить
		</v-btn>
	</v-flex>
	</v-layout>
  </v-container>
</template>

<script>
import Api from '@/services/Api'
import { AclRule } from 'vue-acl'
export default {
	data () {
		return {
			formData: new FormData(),
			image: null,
			imageSRC: '',
			show: false
		}
	},
	props: [
		'ID',
		'NAME',
		'photos',
		'photosWidth'
	],
	methods: {
		uploadPhoto () {
			if (this.imageSRC) {
				this.show = true
				Api()
					.post('zip/uploadphoto', this.formData)
					.then(response => {
						delete response.data.success
						setTimeout(() => {
							this.photos.push(response.data.url)
							this.photosWidth.push(response.data)
							console.log(response.data)
							this.$store.dispatch('setData', response.data.success)
							this.$router.push('/zip/' + this.ID)
							this.show = false
							console.log(this.photos)
							this.reset()
						}, 1000)
					})
					.catch(() => {})
			}
		},
		triggerUpload () {
			this.$refs.fileInput.click()
		},
		onFileChange (event) {
			const file = event.target.files[0]
			console.log(file)
			if (file.size > 2048 * 2048) {
				event.preventDefault()
				this.$store.dispatch('setError', 'Размер файла превышает допустимый порог в 4 МБ!')
				return
			} else if (!file.type.match('image.*')) {
				event.preventDefault()
				this.$store.dispatch('setError', 'Выбранный файл не является изображением!')
				return
			}
			const reader = new FileReader()
			reader.onload = e => {
				this.imageSRC = reader.result
			}
			reader.readAsDataURL(file)
			this.image = file
			this.formData.append('id', this.ID)
			this.formData.append('image', this.image)
		},
		reset () {
			this.formData = new FormData()
			this.image = null
			this.imageSRC = ''
			this.imageWidth = ''
		}
	},
	computed: {
		loading () {
			return this.$store.getters.loading
		},
		Edit () {
			return new AclRule('user').and('engineer').or('admin').generate()
		}
	}
}
</script>
