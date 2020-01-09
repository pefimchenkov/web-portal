<template>
  <v-container v-if="!loadings && Clients.length !== 0" container--fluid>
    <v-layout row>
	<v-flex xs12>
      <v-app-bar :fixed="checkBox" flat color="white" class="text-lg-right elevation-2 mb-1">
        <v-toolbar-title>Список клиентов</v-toolbar-title>
		<v-divider class="mx-3" inset vertical></v-divider>
		<v-checkbox
				v-model="checkBox"
				:label="checkBox ? 'Открепить' : 'Закрепить'"
				class="resizeCheckbox"
		></v-checkbox>
        <v-divider class="mx-3" inset vertical></v-divider>
		<v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px" persistent >
		<template v-slot:activator=" { on } ">
          	<v-btn v-on="$acl.check('Edit') ? on : ''" color="primary" dark class="mb-2" :disabled="$acl.not.check('Edit')">
				<v-icon class="mr-3">add</v-icon>
			Добавить
			</v-btn>
		</template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12>
                    <v-text-field
						v-model="editedItem.NAME"
						label="Бренд"
						:rules="textRules"
						required
						validation
						ref="name"
					>
					</v-text-field>
                  </v-flex>
				  <v-flex xs12>
						<v-select
							v-if="editedIndex === -1"
                    		v-model="editedItem.LP_TYPE"
                    		:items="['ООО', 'ЗАО', 'ОАО', 'ПАО', 'АО', 'ИП']"
                    		label="Тип юрлица"
							required
							validation
							:rules="textRules"
							ref="lp_type"
                    	></v-select>
				  </v-flex>
                  <v-flex xs12>
                    <v-text-field
						v-if="editedIndex === -1"
						v-model="editedItem.LP_NAME"
						label="Название Юрлица"
						required
						validation
						:rules="textRules"
						ref="lp_name"
					></v-text-field>
                  </v-flex>
				  <v-flex xs12>
                    <v-text-field
						v-if="editedIndex === -1"
						v-model="editedItem.ART_1C"
						label="Код Юрлица по 1С"
						required
						validation
						:rules="artRules"
						ref="art"
					></v-text-field>
                  </v-flex>
                  <v-flex xs12>
                    <v-select
                      v-model="editedItem.PROJECT"
                      :items="['КЛИЕНТЫ', 'ПАРТНЁРЫ', 'ДИСТРИБЬЮТОРЫ', 'Поставщик', 'ИНВЕНТ', 'ИНДАСТРИ']"
                      label="Тип контрагента"
					  :rules="textRules"
					  validation
					  required
					  ref="project"
                    ></v-select>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
				  <v-btn color="blue darken-1" text @click.native="close"><v-icon class="mr-2">cancel</v-icon>Отмена</v-btn>
				  <v-btn color="blue darken-1" text @click.native="save"><v-icon class="mr-2">save</v-icon>Сохранить</v-btn>
            </v-card-actions>

          </v-card>
        </v-dialog>
      </v-app-bar>
	  <template>
      <v-data-table
        :headers="headers"
        :items="Clients"
		fixed-header
		calculate-widths
		:items-per-page=50
		item-key="ID"
		:mobile-breakpoint="550"
		sort-by='ID'
		sort-desc
		:footer-props="{
			itemsPerPageAllText: 'Все',
			itemsPerPageOptions: [50,250,500,-1],
      		showFirstLastPage: true,
      		firstIcon: 'mdi-arrow-collapse-left',
      		lastIcon: 'mdi-arrow-collapse-right',
      		prevIcon: 'mdi-minus',
      		nextIcon: 'mdi-plus'
    	}"
        class="elevation-2"
      >
	  <template v-slot:body.prepend>
        <tr>
          <td>
            <v-text-field clearable v-model="Filters.searchClientID" type="number"></v-text-field>
          </td>
		  <td>
            <v-text-field clearable v-model="Filters.searchClientName" type="text"></v-text-field>
          </td>
		  <td>
            <v-text-field clearable v-model="Filters.searchClientLegpers" type="text"></v-text-field>
          </td>
		  <td>
            <v-text-field clearable v-model="Filters.searchClientManager" type="text"></v-text-field>
          </td>
		  <td>
            <v-text-field clearable v-model="Filters.searchClientProject" type="text"></v-text-field>
          </td>
          <td colspan="1"></td>
        </tr>
      </template>
		<template v-slot:item.action="{ item }">
			<v-icon small @click="editItem(item)" :disabled="$acl.not.check('Edit')">edit</v-icon>
            <v-icon class="ml-3" small @click="deleteItem(item)" :disabled="$acl.not.check('Edit')">delete</v-icon>
			<v-btn text fab small left :to="'/clients/' + item.ID">
              	<v-icon>more_horiz</v-icon>
            </v-btn>
    	</template>
      </v-data-table>
	  </template>
	</v-flex>
    </v-layout>
  </v-container>
  <v-container v-else-if="!loadings && Clients.length === 0" fill-height containet--fluid>
	  <v-layout row fill-height align-center>
        	<v-flex xs12 text-center>
          		<v-progress-circular :size="100" color="primary" indeterminate></v-progress-circular>
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
			Clients: [],
			Filters: {
				searchClientID: null,
				searchClientName: '',
				searchClientLegpers: '',
				searchClientManager: '',
				searchClientProject: ''
			},
			dialog: false,
			checkBox: false,
			headers: [
				{ text: 'ID',
					value: 'ID',
					filter: value => {
						if (!this.Filters.searchClientID) return true
						return value === +this.Filters.searchClientID
					},
					width: '120px'
				},
				{ text: 'Бренд',
					value: 'NAME',
					filter: value => {
						if (!this.Filters.searchClientName) return true
						return value.toLowerCase().includes(this.Filters.searchClientName.toLowerCase())
					}
				},
				{ text: 'Юрлица',
					value: 'LEGPERS',
					filter: value => {
						if (!this.Filters.searchClientLegpers) return true
						if (!value) return false
						return value.toLowerCase().includes(this.Filters.searchClientLegpers.toLowerCase())
					}
				},
				{ text: 'Куратор',
					value: 'MANAGER',
					filter: value => {
						if (!this.Filters.searchClientManager) return true
						if (!value) return false
						return value.toLowerCase().includes(this.Filters.searchClientManager.toLowerCase())
					}
				},
				{ text: 'Тип',
					value: 'PROJECT',
					filter: value => {
						if (!this.Filters.searchClientProject) return true
						if (!value) return false
						return value.toLowerCase().includes(this.Filters.searchClientProject.toLowerCase())
					}
				},
				{ text: 'Ред. / Подробнее', value: 'action', sortable: false, align: 'center' }
			],
			artRules: [
				v => !!v || 'Обязательный параметр!',
				v => /^[Т0-9.]{8,8}$/.test(v) || 'Правильно: Буква ` Т ` кириллицей и 7 цифр!'
			],
			textRules: [v => !!v || 'Обязательный параметр!'],
			editedIndex: -1,
			lastItemId: null,
			editedItem: {
				ID: null,
				NAME: '',
				PROJECT: '',
				TYPE_TABLE: '',
				SPEC_TABLE: '',
				SHORT_PROJ: '',
				GROUP: '',
				ART_1C: ''
			},
			defaultItem: {
				ID: null,
				NAME: '',
				PROJECT: '',
				TYPE_TABLE: '',
				SPEC_TABLE: '',
				SHORT_PROJ: '',
				GROUP: '',
				ART_1C: ''
			}
		}
	},
	computed: {
		loadings () {
			return this.$store.getters.loadings
		},
		formTitle () {
			return this.editedIndex === -1 ? 'Новый клиент' : 'Редактировать клиента'
		},
		Edit () {
			return new AclRule('user').and('engineer').or('admin').generate()
		}
	},

	watch: {
		dialog (val) {
			val || this.close()
		},
		'Filters.searchClientID': (val) => {
			localStorage.searchClientID = val
		},
		'Filters.searchClientName': (val) => {
			localStorage.searchClientName = val
		},
		'Filters.searchClientLegpers': (val) => {
			localStorage.searchClientLegpers = val
		},
		'Filters.searchClientManager': (val) => {
			localStorage.searchClientManager = val
		},
		'Filters.searchClientProject': (val) => {
			localStorage.searchClientProject = val
		}
	},

	async mounted () {
		await Api()
			.get('clients')
			.then(res => {
				this.Clients = Object.values(res.data)
				this.lastItemId = this.Clients[this.Clients.length - 1].ID
			})
			.catch(err => {
				console.log(err)
			})
		localStorage.clientsSearch !== null ? this.search = localStorage.clientsSearch : this.search = ''
	},
	created () {
		Object.keys(this.Filters).forEach(key => {
			Object.entries(localStorage).forEach((item) => {
				if (localStorage.getItem(item[0]) && localStorage.getItem(item[0]) !== 'null' && item[0] === key) {
					this.Filters[item[0]] = localStorage[item[0]]
				}
			})
		})
	},
	methods: {
		editItem (item) {
			this.editedIndex = this.Clients.indexOf(item)
			this.editedItem = Object.assign({}, item)
			this.dialog = true
		},

		deleteItem (item) {
			const index = this.Clients.indexOf(item)
			confirm('Вы уверены, что хотите удалить этого клиента?') &&
			Api()
				.post('clients/del', [item.ID])
				.then(response => {
					this.Clients.splice(index, 1)
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
				this.editedItem.ZAKUPKA = null
				if (this.editedItem.PROJECT === 'КЛИЕНТЫ') {
					this.editedItem.TYPE_TABLE = 'client'
					this.editedItem.SPEC_TABLE = 'not'
					this.editedItem.SHORT_PROJ = 'КЛ'
					this.editedItem.GROUP = null
				}
				if (this.editedItem.PROJECT === 'ПАРТНЁРЫ') {
					this.editedItem.TYPE_TABLE = 'partner'
					this.editedItem.SPEC_TABLE = 'not'
					this.editedItem.SHORT_PROJ = 'ПАР'
					this.editedItem.GROUP = null
				}
				if (this.editedItem.PROJECT === 'ДИСТРИБЬЮТОРЫ') {
					this.editedItem.TYPE_TABLE = 'dealer'
					this.editedItem.SPEC_TABLE = 'not'
					this.editedItem.SHORT_PROJ = 'ДИС'
					this.editedItem.GROUP = null
				}
				if (this.editedItem.PROJECT === 'Поставщик') {
					this.editedItem.TYPE_TABLE = 'client'
					this.editedItem.SPEC_TABLE = 'not'
					this.editedItem.SHORT_PROJ = 'Пос'
					this.editedItem.GROUP = null
					this.editedItem.ZAKUPKA = 1
				}
				if (this.editedItem.PROJECT === 'ИНВЕНТ') {
					this.editedItem.PROJECT = 'КЛИЕНТЫ'
					this.editedItem.TYPE_TABLE = 'client'
					this.editedItem.SPEC_TABLE = 'not'
					this.editedItem.SHORT_PROJ = 'Инв'
					this.editedItem.GROUP = '10910'
				}
				if (this.editedItem.PROJECT === 'ИНДАСТРИ') {
					this.editedItem.TYPE_TABLE = 'client'
					this.editedItem.SPEC_TABLE = 'not'
					this.editedItem.SHORT_PROJ = 'Инд'
					this.editedItem.GROUP = '10911'
				}
				Api()
					.post('clients/edit', this.editedItem)
					.then(res => {
						Object.assign(this.Clients[this.editedIndex], this.editedItem)
						this.$store.dispatch('setData', res.data)
						this.close()
					})
					.catch(err => {
						console.log(err)
					})
			} else {
				if (this.$refs.name.validate() && this.$refs.lp_type.validate() && this.$refs.lp_name.validate() && this.$refs.art.validate() && this.$refs.project.validate()) {
					if (this.editedItem.LP_TYPE === 'ИП') {
						this.editedItem.LEGPERS = this.editedItem.LP_TYPE + ' ' + this.editedItem.LP_NAME
					} else {
						this.editedItem.LEGPERS = this.editedItem.LP_TYPE + ' «' + this.editedItem.LP_NAME + '»'
					}
					this.editedItem.ZAKUPKA = null
					if (this.editedItem.PROJECT === 'КЛИЕНТЫ') {
						this.editedItem.TYPE_TABLE = 'client'
						this.editedItem.SPEC_TABLE = 'not'
						this.editedItem.SHORT_PROJ = 'КЛ'
						this.editedItem.GROUP = null
					}
					if (this.editedItem.PROJECT === 'ПАРТНЁРЫ') {
						this.editedItem.TYPE_TABLE = 'partner'
						this.editedItem.SPEC_TABLE = 'not'
						this.editedItem.SHORT_PROJ = 'ПАР'
						this.editedItem.GROUP = null
					}
					if (this.editedItem.PROJECT === 'ДИСТРИБЬЮТОРЫ') {
						this.editedItem.TYPE_TABLE = 'dealer'
						this.editedItem.SPEC_TABLE = 'not'
						this.editedItem.SHORT_PROJ = 'ДИС'
						this.editedItem.GROUP = null
					}
					if (this.editedItem.PROJECT === 'Поставщик') {
						this.editedItem.TYPE_TABLE = 'Supplier'
						this.editedItem.SPEC_TABLE = 'not'
						this.editedItem.SHORT_PROJ = 'Пос'
						this.editedItem.GROUP = null
						this.editedItem.ZAKUPKA = 1
					}
					if (this.editedItem.PROJECT === 'ИНВЕНТ') {
						this.editedItem.PROJECT = 'КЛИЕНТЫ'
						this.editedItem.TYPE_TABLE = 'client'
						this.editedItem.SPEC_TABLE = 'not'
						this.editedItem.SHORT_PROJ = 'Инв'
						this.editedItem.GROUP = '10910'
					}
					if (this.editedItem.PROJECT === 'ИНДАСТРИ') {
						this.editedItem.TYPE_TABLE = 'client'
						this.editedItem.SPEC_TABLE = 'not'
						this.editedItem.SHORT_PROJ = 'Инд'
						this.editedItem.GROUP = '10911'
					}
					Api()
						.post('clients/add', this.editedItem)
						.then(res => {
							this.$store.dispatch('setData', res.data.success)
							this.Clients.push(this.editedItem)
							this.lastItemId = this.editedItem.ID = res.data.MaxId[0].ID
							this.close()
						})
						.catch(err => {
							console.log(err)
						})
				} else {
					this.$store.commit('setError', ' Заполните соответствующие поля! ')
				}
			}
		}
	}
}
</script>
<style scoped>
.resizeCheckbox {
    max-width: 120px !important;
	margin-top: 20px !important;
}
</style>

