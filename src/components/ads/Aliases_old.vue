<template>
  <v-container fluid>
    <div v-if="!loadings && Aliases.length !== 0">
      <v-toolbar flat color="white">
        <v-toolbar-title>Псевдонимы</v-toolbar-title>
        <v-divider class="mx-3" inset vertical></v-divider>
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
        <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
          <v-btn slot="activator" color="primary" dark class="mb-2">Добавить новый</v-btn>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-layout wrap>
                  <v-combobox
                    v-model="editedItem.product"
                    :items="objNamePlusId('zip')"
                    label="ЗИП"
                    small-chips
                    solo
                  ></v-combobox>
                </v-layout>
                <v-layout>
                  <v-text-field v-model="editedItem.name" label="Псевдоним"></v-text-field>
                </v-layout>

                <v-layout wrap>
                  <v-combobox
                    v-model="editedItem.client"
                    :items="objNamePlusId('clients')"
                    label="Организация"
                    small-chips
                    solo
                  ></v-combobox>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="close">Отмена</v-btn>
              <v-btn color="blue darken-1" flat @click.native="save">Сохранить</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
		<app-upload-file></app-upload-file>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="Aliases"
        :search="search"
        class="elevation-2"
		:rows-per-page-items="[10,50,150,{'text':'Все','value':-1}]"
      >
        <template slot="items" slot-scope="props">
          <td class="text-xs-left">{{ props.item.name }}</td>
          <td class="text-xs-left">{{ props.item.product }}</td>
          <td class="text-xs-left">{{ props.item.client }}</td>
          <td class="text-xs-left">{{ props.item.email }}</td>
          <td class="text-xs-left">{{ props.item.date }}</td>
          <td class="justify-center layout px-0">
            <v-icon small class="mr-2" @click="editItem(props.item)">edit</v-icon>
            <v-icon small class="mr-3" @click="deleteItem(props.item.id, props.item)">delete</v-icon>
          </td>
        </template>
		<template slot="footer">
     			<td :colspan="headers.length" class="text-xs-right">
        			<a href="/static/example.xls">Пример XLS файла для импорта</a>
      			</td>
    		</template>

        <template slot="no-data">
          <v-btn color="primary">Сброс</v-btn>
          <!-- <v-btn color="primary" @click="initialize">Сброс</v-btn> -->
        </template>
      </v-data-table>
    </div>

    <div v-else-if="!loadings && Aliases.length === 0">
      <v-layout row>
        <v-flex xs12 class="text-xs-center pt-5">
          <v-progress-circular color="primary" indeterminate :size="80"></v-progress-circular>
        </v-flex>
      </v-layout>
    </div>
  </v-container>
</template>

<script>
import Api from '@/services/Api'
import moment from 'moment'
import UploadFile from './UploadFile'
// import { eventBus } from '../../main.js'

export default {
	data () {
		return {
			Aliases: [],
			search: '',
			dialog: false,
			headers: [
				{ text: 'Псевдоним', value: 'name' },
				{
					text: 'ЗИП',
					align: 'left',
					sortable: true,
					value: 'product'
				},
				{ text: 'Организация', value: 'client' },
				{ text: 'Автор записи', value: 'email' },
				{ text: 'Дата изменения', value: 'date' },
				{ text: 'Дейстия', value: 'name' }
			],
			editedIndex: -1,
			lastItemId: '',
			editedItem: {
				id: '',
				product: '',
				name: '',
				client: '',
				email: '',
				date: ''
			},
			defaultItem: {
				id: '',
				product: '',
				name: '',
				client: '',
				email: '',
				date: ''
			}
		}
	},

	computed: {
		loadings () {
			return this.$store.getters.loadings
		},
		formTitle () {
			return this.editedIndex === -1
				? 'Новый псевдоним'
				: 'Редактировать данные'
		}
	},

	watch: {
		dialog (val) {
			val || this.close()
		}
	},

	mounted () {},

	methods: {
		getAliases () {
			this.$store.commit('clearError')
			this.$store.commit('setLoading', true)
			Api()
				.get('/aliases')
				.then(res => {
					this.$store.commit('setLoading', false)
					this.Aliases = Object.values(res.data)
					this.lastItemId = this.Aliases[this.Aliases.length - 1].id

					for (var i = 0; i < this.Aliases.length; i++) {
						this.Aliases[i].product = this.getObjName(
							this.Aliases[i].product,
							'zip'
						)
						this.Aliases[i].client = this.getObjName(
							this.Aliases[i].client,
							'clients'
						)
						this.Aliases[i].date = moment(this.Aliases[i].date).format(
							'YYYY-MM-DD HH:mm:ss'
						)
					}
				})
				.catch(error => {
					this.$store.commit('setLoading', false)
					this.$store.commit('setError', error.message)
				})
		},
		getObjName (id, name) {
			var obj = {}
			if (name === 'zip') {
				obj = this.$store.getters.zip.find(x => x.ID === id)
			}
			if (name === 'clients') {
				obj = this.$store.getters.clients.find(x => x.ID === id)
			}

			for (var key in obj) {
				if (key === 'NAME') {
					return obj[key] + ' {' + obj.ID + '}'
				}
			}
		},
		objNamePlusId: function (name) {
			if (name === 'zip') {
				return this.$store.getters.zip.map(function (o) {
					return o['NAME'] + ' {' + o['ID'] + '}'
				})
			}
			if (name === 'clients') {
				return this.$store.getters.clients.map(function (o) {
					return o['NAME'] + ' {' + o['ID'] + '}'
				})
			}
		},

		editItem (item) {
			this.editedIndex = this.Aliases.indexOf(item)
			this.editedItem = Object.assign({}, item)
			this.editedItem.email = this.$store.getters.currentUser.email
			this.dialog = true
		},

		deleteItem (id, item) {
			this.$store.commit('clearError')
			this.$store.commit('setLoading', true)
			var index = this.Aliases.indexOf(item)
			confirm('Вы уверены, что хотите удалить этот псевдоним?') &&
				Api()
					.post('aliases/del', [id])
					.then(response => {
						// console.log(response)
						this.Aliases.splice(index, 1)
						this.$store.commit('setData', response.data)
						this.$store.commit('setLoading', false)
					})
					.catch(error => {
						this.$store.commit('setLoading', false)
						this.$store.commit('setError', error.message)
					})
		},

		close () {
			this.dialog = false
			setTimeout(() => {
				this.editedItem = Object.assign({}, this.defaultItem)
				this.editedIndex = -1
			}, 300)
		},

		save () {
			if (this.editedIndex > -1) {
				Api()
					.post('aliases/edit', this.editedItem)
					.then(response => {
						this.$store.commit('setData', response.data)
						this.$store.commit('setLoading', false)

						this.editedItem.date = moment(new Date()).format(
							'YYYY-MM-DD HH:mm:ss'
						)
						Object.assign(this.Aliases[this.editedIndex], this.editedItem)
						console.log(response)

						this.close()
					})
					.catch(error => {
						this.$store.commit('setLoading', false)
						this.$store.commit('setError', error.message)
					})
			} else {
				this.$store.commit('clearError')
				this.$store.commit('setLoading', true)
				this.editedItem['id'] = this.lastItemId + 1
				this.editedItem['email'] = this.$store.getters.currentUser.email

				Api()
					.post('aliases/new', this.editedItem)
					.then(response => {
						this.$store.commit('setData', response.data)
						this.$store.commit('setLoading', false)

						this.editedItem.date = moment(new Date()).format(
							'YYYY-MM-DD HH:mm:ss'
						)
						this.Aliases.push(this.editedItem)
						this.lastItemId = this.editedItem['id']

						this.close()
					})
					.catch(error => {
						this.$store.commit('setLoading', false)
						this.$store.commit('setError', error.message)
					})
			}
		}
	},
	components: {
		appUploadFile: UploadFile
	},
	async created () {
		await this.$store.dispatch('fetchZip')
		await this.$store.dispatch('fetchClients')
		await this.getAliases()
	}
}
</script>
