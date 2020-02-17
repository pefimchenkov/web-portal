
<template>
<div>
	<v-layout row wrap>
	<v-chip v-if="file" class="mr-5">
            Имя файла: {{ file.name }}
    </v-chip>
	<v-chip v-else-if="xls2json">
           Файл загружен на сервер!
    </v-chip>
	<v-flex class="mr-2">
	<v-btn :color="color"
	 	class="white--text"
	 	ref="fileBtn"
	  	@click="triggerUpload()"
		:disabled="localLoading"
        :loading="localLoading"
	>
    		{{ text }}
    	<v-icon right dark>cloud_upload</v-icon>
  	</v-btn>
	<form id="form">
  	<input
    	ref='file'
    	type='file'
		name="file"
    	id='file'
    	style='display:none'
    	accept='msword/*'
    	@change='handleFileUpload($event)'
  	>
	</form>
	</v-flex>
</v-layout>
</div>
</template>
<script>
import Api from '@/services/Api'
export default {
	props: [
		'ID'
	],
	data () {
		return {
			formData: new FormData(),
			file: null,
			xls2json: null,
			text: 'Файл для импорта',
			color: 'blue-grey',
			localLoading: false
		}
	},
	methods: {
		triggerUpload () {
			let urlUpload = ''
			let urlXls2json = ''
			// let location = ''
			if (this.ID === 'ALIASES') {
				urlUpload = '/specprices/upload_file'
				urlXls2json = '/specprices/json_to_db'
				// location = 'aliases'
			}
			if (this.ID === 'SN') {
				urlUpload = '/serial_numbers/upload_file'
				urlXls2json = '/serial_numbers/json_to_db'
				// location = '/sn'
			}
			if (this.file && this.ID) {
				this.localLoading = true
				Api()
					.post(urlUpload, this.formData, {
						headers: { 'Content-Type': 'multipart/form-data' }
					})
					.then((response) => {
						if (response.data.filename) {
							setTimeout(() => {
								this.xls2json = response.data.filename
								this.file = null
								this.localLoading = false
								this.text = 'Импорт Excel в БД'
								this.color = 'warning'
							}, 2000)
						} else {
							setTimeout(() => {
								this.$store.commit('setData', response.data.mess)
								this.formData.delete('file')
								this.localLoading = false
								this.file = null
								this.text = 'Файл для импорта'
								this.color = 'blue-grey'
							}, 2000)
						}
					})
					.catch((error) => {
						this.$store.commit('setError', error.message)
					})
			} else if (this.xls2json) {
				this.localLoading = true
				let email = this.$store.getters.currentUser.email
				Api()
					.post(urlXls2json, [this.xls2json, email])
					.then((response) => {
						if (response.data.success === false) {
							this.$store.commit('setError', response.data.error)
						} else {
							this.$store.commit('setData', response.data)
							setTimeout(() => {
								this.localLoading = false
								window.location.reload()
								// this.$router.replace(location)
							}, 2000)
						}
					})
					.catch((error) => {
						this.$store.commit('setError', error.message)
					})
			} else {
				this.$refs.file.click()
			}
		},
		handleFileUpload () {
			this.file = this.$refs.file.files[0]
			if (this.file) {
				this.text = 'Загрузить'
				this.color = 'success'
				this.formData.append('file', this.file)
			}
		}
	}
}
</script>
