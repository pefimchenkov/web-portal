<template>
  <v-container container--fluid>
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
	<v-dialog v-model="dialog" :max-width="imageWidth">
		<v-img width="100%" v-if="selectedImage" :src="selectedImage" @click.stop="close()"></v-img>
	</v-dialog>
	<v-container fluid>
		<v-layout row wrap>
			<v-flex xs6 class="text-left">
					<h3 v-if="ParentName" class="headline mt-1 py-2">
					{{ ParentName }}
					</h3>
					<v-progress-linear
						v-else
						indeterminate
						color="primary"
						height="2"
						value="15"
				></v-progress-linear>
			</v-flex>
    		<v-flex xs6 class="text-right">
      			<v-btn @click="goBack()" color="warning">Вернуться назад</v-btn>
    		</v-flex>
		</v-layout>
	</v-container>
    <v-tabs centered v-model="active" icons-and-text class="mb-3">
       <v-tabs-slider></v-tabs-slider>

      <v-tab href="#tab-1">Фото
        <v-icon>photo_album</v-icon>
      </v-tab>
	<!--TAB-1 -->
      <v-tab-item :value="'tab-1'">
        <div v-if="loadings">
          <v-layout row wrap>
            <v-flex xs12 class="text-center pt-5">
              <v-progress-circular color="primary" indeterminate :size="100"></v-progress-circular>
            </v-flex>
          </v-layout>
        </div>
		<div v-else-if="!loadings && photos.length === 0">
				<p class="mt-5 mb-3" align="center">У данного клиента отсутствуют фотографии</p>
				<app-zip-photo :ID = 'id' :photos = 'photos' :photosWidth = 'photosWidth'></app-zip-photo>
    	</div>
      	<div v-else>
			<template>
			<v-layout class="mt-3">
				<v-flex xs12 sm8 offset-sm2>
				<v-card>
					<v-container grid-list-sm container--fluid>
					<v-layout wrap>
						<v-flex
						xs3
						d-flex
						v-for="photo in photos"
						:key="photo"
						>
						<v-card flat tile class="d-flex">
							<v-img
							:src="photo"
							:lazy-src="photo"
							aspect-ratio="1"
							class="grey lighten-2"
							@click="zoom(photo)"
							>
							<template v-slot:placeholder>
								<v-layout
								fill-height
								align-center
								justify-center
								ma-0
								>
								<v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
								</v-layout>
							</template>
							<span style="color: transparent">{{ photo }}</span>
							</v-img>
							<v-badge class="zIndex" overlap color="transoarent">
							<template v-slot:badge>
								<v-icon :slot="$acl.check('Edit') ? 'badge' : ''" @click="deleteImg($event)" class="cursor_btn error" dark :data-photoname="getPhotoName(photo)" size="25">delete_forever</v-icon>
							</template>
							</v-badge>
						</v-card>
						</v-flex>
					</v-layout>
					</v-container>
				</v-card>
				</v-flex>
			</v-layout>
			</template>
			<app-zip-photo :ID = 'id' :photos = 'photos' :photosWidth = 'photosWidth'></app-zip-photo>
        </div>
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import ZipPhoto from './ZipPhoto'
import Api from '@/services/Api'
import { AclRule } from 'vue-acl'

export default {
	props: ['id'],
	data () {
		return {
			show: false,
			selectedImage: null,
			ParentName: '',
			imageWidth: '',
			photos: [],
			photosWidth: [],
			window: 0,
			search: '',
			dialog: false,
			localLoading: false,
			active: 'tab-1',
			tab: '',
			Zip: []
		}
	},
	methods: {
		async init () {
			this.$store.commit('setLoading', true)
			await Api()
				.post('zip/get_images', [this.id])
				.then(response => {
					if (!response.data.error && response.data.length !== 0) {
						response.data.forEach(data => {
							this.photos.push(data.url)
						})
						this.photosWidth = response.data
					} else {
						this.$store.commit('setInfo', 'Директория с фото ЗИП ещё не создана')
					}
					this.$store.commit('setLoading', false)
				})
		},
		getParentName () {
			let obj = this.Zip.find(item => parseInt(item.zipID) === parseInt(this.id))
			this.ParentName = obj.zipNAME + ' (' + obj.zipART + ', ' + obj.zipPN + ')'
		},
		zoom (url) {
			this.open()
			this.selectedImage = url
			this.photosWidth.forEach(photo => {
				if (photo.url === url) {
					this.imageWidth = parseInt(photo.width)
					console.log(this.imageWidth)
				}
			})
		},
		open () {
			this.dialog = true
			this.localLoading = true
		},
		close () {
			this.dialog = false
			this.localLoading = false
			this.selectedImage = null
		},
		deleteImg (e) {
			if (confirm('Вы действительно хотите удалить это фото?')) {
				this.show = true
				const photoName =	e.currentTarget.attributes['data-photoname'].value
				Api()
					.post('zip/delImg', [this.id, photoName])
					.then(response => {
						this.photos.forEach((photo, index) => {
							if (photo === response.data.url) {
								setTimeout(() => {
									this.photos.splice(index, 1)
									this.show = false
									this.$store.commit('setData', 'Изображение ' + photoName + ' успешно удалёно!')
								}, 1000)
							}
						})
					})
			} else {
				this.$store.commit('setInfo', 'Удаление отменено')
			}
		},
		getPhotoName (data) {
			return data.split('/').pop()
		},
		goBack () {
			this.$router.go(-1)
		},
		getZip () {
			return Promise.resolve(
				this.Zip = this.$store.getters.zip
			)
		},
		namePlusArt: item => item.NAME + ' — ' + item.ART
	},
	computed: {
		loadings () {
			return this.$store.getters.loading
		},
		Edit () {
			return new AclRule('user').and('engineer').or('admin').generate()
		}
	},
	watch: {
		dialog (val) {
			val || this.close()
		}
	},
	components: {
		appZipPhoto: ZipPhoto

	},
	async mounted () {
		await this.$store.dispatch('fetchZip')
		await this.getZip()
			.then(res => {
				this.getParentName()
			})
		await this.init()
	}
}
</script>

<style scoped>
.cursor_btn {
	cursor: pointer
}
.zIndex {
	z-index:1;
}
</style>


