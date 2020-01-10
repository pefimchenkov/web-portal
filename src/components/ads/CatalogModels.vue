<template>
  <v-container
	  fluid
	  class="mt-5"
  >
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
    <v-flex xs6 class="text-right pr-4">
      <v-btn @click="goBack()" color="warning">Вернуться назад</v-btn>
    </v-flex>
	<v-flex xs6 class="text-left pl-4">
		<v-dialog width="500px" v-model="dialog" persistent>
			<template v-slot:activator="{on}">
				<v-btn v-on="$acl.check('Edit') ? on : ''" @click="addItem" color="primary" dark :disabled="$acl.not.check('Edit')">
				<v-icon dark left>add</v-icon>
				Добавить
			</v-btn>
			</template>
			<v-card class="pa-3">
				<v-card-title class="subheading">{{ infoText }}</v-card-title>
					<v-text-field
						v-model="editedItem.name"
						label="* Название"
						:rules="textRules"
						ref="name"
						clearable
						required
						validation
					></v-text-field>
					<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="green darken-1"
						text="text"
						@click="dialog=false"
					>
					Отменить
					</v-btn>
					<v-btn
						color="green darken-1"
						text="text"
						@click.native="save"
						:disabled="localloading"
						:loading="localloading"
					>
					Сохранить
					</v-btn>
					</v-card-actions>
			</v-card>
		</v-dialog>
	</v-flex>
	</v-layout>
    <v-tabs centered v-model="active" fixed-tabs icons-and-text class="mt-3">
      <v-tabs-slider></v-tabs-slider>

      <v-tab href="#tab-type">Типы оборудования
        <v-icon>list</v-icon>
      </v-tab>
      <v-tab href="#tab-vendor">Вендор
        <v-icon>list</v-icon>
      </v-tab>
	<!--TAB-1 -->
      <v-tab-item :value="'tab-type'">
		<div v-if="!loading && ModelsType.length > 0">
			<v-layout row wrap>
				<v-flex xs12 sm12 md12 lg8 offset-xs0 offset-sm0 offset-md0 offset-lg2 class="text-lg-right">
						<v-text-field
							class="mb-3"
							prepend-icon="search"
							label="Поиск"
							placeholder="Поиск"
							v-model="search"
							single-line
							clearable
						></v-text-field>
					<v-spacer></v-spacer>
					<v-data-table
						:headers="headers_type"
						:items="ModelsType"
						:search="search"
						fixed-header
						calculate-widths
						:items-per-page=10
						item-key="marketid"
						:mobile-breakpoint="550"
						sort-by='id'
						sort-desc
						class="elevation-2"
						:footer-props="{
							itemsPerPageAllText: 'Все',
							itemsPerPageOptions: [10,50,150,-1],
							showFirstLastPage: true,
							firstIcon: 'mdi-arrow-collapse-left',
							lastIcon: 'mdi-arrow-collapse-right',
							prevIcon: 'mdi-minus',
							nextIcon: 'mdi-plus'
						}"
					>
						<template v-slot:item="{ item }">
							<tr>
								<td class="text-center">{{ item.id }}</td>
								<td class="text-left">{{ item.name }}</td>
								<td class="justify-center layout">
									<v-icon small class="mr-2" @click="editItem(item)" :disabled="$acl.not.check('Edit')">edit</v-icon>
									<v-icon small @click="deleteItem(item)" :disabled="$acl.not.check('Edit')">delete</v-icon>
								</td>
							</tr>
						</template>
						</v-data-table>
				</v-flex>
			</v-layout>
		</div>
		<div v-else>
			<v-container fill-height>
          		<v-layout row justify-center align-center>
            		<v-progress-circular indeterminate :size="80" color="primary"></v-progress-circular>
          		</v-layout>
        	</v-container>
        </div>
      </v-tab-item>
	  <!--TAB-2 -->
      <v-tab-item :value="'tab-vendor'">
		<div v-if="!loading && ModelsVendor.length !== 0">
			<v-layout row wrap>
				<v-flex xs12 sm12 md12 lg8 offset-xs0 offset-sm0 offset-md0 offset-lg2 class="text-lg-right">
						<v-text-field
							class="mb-3"
							prepend-icon="search"
							label="Поиск"
							placeholder="Поиск"
							v-model="search"
							single-line
							clearable
						></v-text-field>
					<v-spacer></v-spacer>
					<v-data-table
						:headers="headers_vendor"
						:items="ModelsVendor"
						:search="search"
						fixed-header
						calculate-widths
						:items-per-page=10
						item-key="marketid"
						:mobile-breakpoint="550"
						sort-by='id'
						sort-desc
						class="elevation-2"
						:footer-props="{
							itemsPerPageAllText: 'Все',
							itemsPerPageOptions: [10,50,150,-1],
							showFirstLastPage: true,
							firstIcon: 'mdi-arrow-collapse-left',
							lastIcon: 'mdi-arrow-collapse-right',
							prevIcon: 'mdi-minus',
							nextIcon: 'mdi-plus'
						}"
					>
						<template v-slot:item="{item}">
							<tr>
								<td class="text-center">{{ item.id }}</td>
								<td class="text-left">{{ item.name }}</td>
								<td class="justify-center layout">
									<v-icon small class="mr-2" @click="editItem(item)" :disabled="$acl.not.check('Edit')">edit</v-icon>
									<v-icon small @click="deleteItem(item)" :disabled="$acl.not.check('Edit')">delete</v-icon>
								</td>
							</tr>
						</template>
						</v-data-table>
				</v-flex>
			</v-layout>
		</div>
		<div v-else>
			<v-container fill-height>
          		<v-layout row justify-center align-center>
            		<v-progress-circular indeterminate :size="80" color="primary"></v-progress-circular>
          		</v-layout>
        	</v-container>
        </div>
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import Api from '@/services/Api'
import { AclRule } from 'vue-acl'

export default {
	props: ['id'],
	data () {
		return {
			ModelsType: [],
			ModelsVendor: [],
			show: false,
			infoText: 'Добавление нового типа',
			imageWidth: '',
			search: '',
			localloading: false,
			dialog: false,
			localLoading: false,
			active: 'tab-type',
			tab: '',
			headers_type: [
				{ text: 'id', value: 'id', align: 'center' },
				{ text: 'Название', value: 'name', align: 'center' },
				{ text: 'Ред.', value: 'edit', align: 'center' }
			],
			headers_vendor: [
				{ text: 'id', value: 'id', align: 'center' },
				{ text: 'Название', value: 'name', align: 'center' },
				{ text: 'Ред.', value: 'edit', align: 'center' }
			],
			pagination: {
				'sortBy': 'id',
				'descending': true
			},
			textRules: [v => !!v || 'Обязательный параметр!'],
			editedItem: {
				id: null,
				name: ''
			}
		}
	},
	methods: {
		async init () {
			this.$store.commit('setLoading', false)
		},
		getType () {
			this.ModelsType = this.$store.getters.models_type
		},
		getVendor () {
			this.ModelsVendor = this.$store.getters.models_vendor
		},
		open () {
			this.dialog = true
			this.localLoading = true
		},
		close () {
			this.dialog = false
			this.localLoading = false
			this.selectedImage = null
			this.editedItem = Object.assign({})
			this.editedIndex = -1
		},
		goBack () {
			this.$router.go(-1)
		},
		addItem () {
			if (this.active === 'tab-type') this.infoText = 'Добавление нового типа'
			if (this.active === 'tab-vendor') this.infoText = 'Добавление нового вендора'
		},
		editItem (item) {
			if (this.active === 'tab-type') {
				this.infoText = 'Редактирование типа с id ' + item.id
				this.editedIndex = this.ModelsType.indexOf(item)
			}
			if (this.active === 'tab-vendor') {
				this.infoText = 'Редактирование вендора с id ' + item.id
				this.editedIndex = this.ModelsVendor.indexOf(item)
			}
			this.editedItem = Object.assign({}, item)
			this.dialog = true
		},
		deleteItem (item) {
			let index = null
			let conf = ''
			let url = ''
			let resultArr = []
			function SpliceFromArr (arr, i) {
				return arr.splice(i, 1)
			}
			if (this.active === 'tab-type') {
				index = this.ModelsType.indexOf(item)
				conf = 'Вы уверены, что хотите удалить этот тип?'
				url = 'models/del_type'
				resultArr = this.ModelsType
			}
			if (this.active === 'tab-vendor') {
				index = this.ModelsVendor.indexOf(item)
				conf = 'Вы уверены, что хотите удалить этого вендора?'
				url = 'models/del_vendor'
				resultArr = this.ModelsVendor
			}
			if (confirm(conf)) {
				this.$store.commit('clearError')
				this.show = true
				this.infoText = 'Внимание! Идёт удаление, дождитесь результата!'
				Api()
					.post(url, [item.id])
					.then(response => {
						if (response.data.success) {
							this.show = false
							SpliceFromArr(resultArr, index)
							this.$store.dispatch('setData', 'Элемент с id ' + item.id + ' успешно удалён')
						} else {
							this.show = false
							this.$store.dispatch('setError', response.data.error)
						}
					})
					.catch(error => {
						this.$store.commit('setLoading', false)
						this.$store.commit('setError', error)
					})
			} else {
				this.$store.commit('setLoading', false)
				this.$store.commit('setInfo', 'Удаление отменено')
			}
		},
		save () {
			if (this.$refs.name.validate()) {
				this.localloading = true
				let url = ''
				let success = ''
				let obj
				if (this.editedIndex > -1) {
					if (this.active === 'tab-type') {
						url = 'models/edit_type'
						success = 'Данные успешно обновлены'
						obj = this.ModelsType[this.editedIndex]
					}
					if (this.active === 'tab-vendor') {
						url = 'models/edit_vendor'
						success = 'Данные успешно обновлены'
						obj = this.ModelsVendor[this.editedIndex]
					}
					Api()
						.post(url, this.editedItem)
						.then(res => {
							if (res.data.success === true) {
								Object.assign(obj, this.editedItem)
								this.$store.dispatch('setData', success)
								this.localloading = false
								this.dialog = false
							} else {
								this.$store.dispatch('setError', res.data.error)
								this.localloading = false
							}
						})
						.catch(err => {
							this.$store.dispatch('setError', err.message)
						})
				} else {
					if (this.active === 'tab-type') {
						url = 'models/set_type'
						success = 'Новый тип успешно добавлен'
					}
					if (this.active === 'tab-vendor') {
						url = 'models/set_vendor'
						success = 'Новый вендор успешно добавлен'
					}
					Api()
						.post(url, [this.editedItem.name])
						.then(res => {
							if (res.data.success === true) {
								this.editedItem.id = res.data.lastId
								this.active === 'tab-type' ? this.ModelsType.push(this.editedItem) : this.ModelsVendor.push(this.editedItem)
								this.$store.dispatch('setData', success)
								this.localloading = false
								this.dialog = false
							} else {
								this.$store.dispatch('setError', res.data.error)
								this.localloading = false
							}
						})
						.catch(err => {
							this.$store.dispatch('setError', err.message)
						})
				}
			} else {
				this.$store.commit('setError', ' Не заполнено требуемое поле! ')
			}
		}
	},
	computed: {
		loading () {
			return this.$store.getters.loading
		},
		Edit () {
			return new AclRule('user').and('engineer').or('admin').generate()
		}
	},
	watch: {
		dialog (val) {
			val || this.close()
		},
		active (val) {
			if (val === 'tab-type') {
				this.infoText = 'Добавление нового типа'
			}
			if (val === 'tab-vendor') {
				this.infoText = 'Добавление нового вендора'
			}
		}
	},
	async created () {
		await this.$store.dispatch('fetchModelsType')
		await this.$store.dispatch('fetchModelsVendor')
		await this.getType()
		await this.getVendor()
		await this.init()
	}
}
</script>

<style scoped>
.cursor_btn {
	cursor: pointer
}
.text_center {
	text-align: center !important;
}
.overall {
	z-index: 0 !important;
}
</style>


