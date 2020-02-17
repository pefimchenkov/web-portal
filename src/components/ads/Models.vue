<template>
  <v-container fluid>
	<v-dialog
      v-model="show"
	  @click="show = false"
      width="600"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
			{{ infoText }}
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <div>
      	<v-app-bar :fixed="toggle" color="white" class="text-lg-right elevation-2 mb-1">
        	<v-toolbar-title>
				Модели
			</v-toolbar-title>
			<v-divider class="mx-3" inset vertical></v-divider>
			<v-checkbox
				v-model="toggle"
				:label="toggle ? 'Открепить' : 'Закрепить'"
				class="resizeCheckbox"
			></v-checkbox>
        <v-divider class="mx-3" inset vertical></v-divider>
        <v-spacer></v-spacer>
		<v-flex v-if="Models.length > 0" xs3 sm3 md3 lg2 xl1>
				<v-menu
					bottom
					transition="scale-transition"
					:close-on-content-click="false"
					v-model="menu"
					>
					<template v-slot:activator={on}>
						<v-btn  v-on="on">
						<v-icon left>list</v-icon>
						Колонки
					</v-btn>
					</template>

					<v-list class="pa-3">
						<v-btn
							@click="showAllColumn"
							><v-icon color="warning" class="mr-1">mdi-eye</v-icon>
							Включить всё
						</v-btn>
						<v-btn
							@click="saveColumnFB"
							><v-icon color="success" class="mr-1">save</v-icon>
							Сохранить
						</v-btn>
						<v-list-item
						v-for="(header, i) in headers"
						:key="i"
						dense
						>
							<v-checkbox
								:label="header.text"
								v-model="header.selected"
								:value="header.selected"
								v-if="header.visible"
								hide-details
							>
							</v-checkbox>
						</v-list-item>
					</v-list>
				</v-menu>
			</v-flex>
			<v-spacer></v-spacer>
		<v-dialog v-if="Models.length > 0" v-model="dialog" max-width="650px" persistent scrollable :disabled="$acl.not.check('Edit')">
			<template v-slot:activator="{ on }">
				<v-btn v-on="$acl.not.check('Edit') ? '' : on" color="primary" dark class="mb-1" :disabled="$acl.not.check('Edit')">
				<v-icon class="mr-2">add</v-icon>Добавить
			</v-btn>
			</template>
          <v-card>
            <v-card-title>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md text-center>
                <v-layout row wrap>
					<v-flex xs12>
                    <v-autocomplete
                      :items="ModelsType"
					  v-model="newItem.ModelsType"
					  item-text="name"
                      label="Тип устройства"
					  return-object
					  ref='type'
					  :rules="ReqRules"
                   	 validation
                    ></v-autocomplete>
                  </v-flex>
                  <v-flex xs12>
                    <v-autocomplete
                      :items="Brands"
					  v-model="newItem.Brands"
					  item-text="name"
                      label="Бренд"
					  return-object
					  ref='brands'
                    validation
					:rules="ReqRules"
                    ></v-autocomplete>
                  </v-flex>
				   <v-flex xs12>
					   <v-text-field
					   	label="Название модели"
						   v-model="newItem.Name"
						ref='name'
                    	validation
						:rules="ReqRules"
					   >
					</v-text-field>
				   </v-flex>
                  <v-flex xs12>
                    <v-autocomplete
                      :items="ModelsCategory"
					  v-model="newItem.ModelsCategory"
					  item-text="name"
                      label="Категория оборудования"
					  return-object
					  ref='category'
					  required
                    	validation
						:rules="ReqRules"
                    ></v-autocomplete>
                  </v-flex>
				  <v-flex xs12>
                    <v-autocomplete
                      :items="ModelsProfile"
					  v-model="newItem.ModelsProfile"
					  item-text="name"
                      label="Профильность оборудования"
					  return-object
					  ref='profile'
					  required
                    validation
					:rules="ReqRules"
                    ></v-autocomplete>
                  </v-flex>
				  <v-flex xs12>
                    <v-combobox
                      :items="ModelsEngineers"
					  v-model="newItem.ModelsEngineers"
					  item-text="engineer"
                      label="Ответственный инженер"
					  multiple
					  small-chips
						autocomplete
						deletable-chips
						hide-selected
					  return-object
					  ref='engineer'
                    ></v-combobox>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
			<v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue darken-1"
                text
                @click.native="close"
                :disabled="localLoading"
              ><v-icon class="mr-2">cancel</v-icon>
			  Отмена</v-btn>
              <v-btn
                color="blue darken-1"
                text
                @click.native="save"
                :disabled="localLoading"
                :loading="localLoading"
              ><v-icon class="mr-2">save</v-icon>Сохранить
			  </v-btn>
            </v-card-actions>
          </v-card>
		</v-dialog>
      </v-app-bar>
      <v-data-table
            :headers="computedHeaders"
            :items="Models"
            :search="search"
			fixed-header
			calculate-widths
			:items-per-page=50
			item-key="marketid"
			:mobile-breakpoint="550"
			sort-by='ID'
			sort-desc
          	class="elevation-2"
			:footer-props="{
				itemsPerPageAllText: 'Все',
				itemsPerPageOptions: [50,250,500,-1],
				showFirstLastPage: true,
				firstIcon: 'mdi-arrow-collapse-left',
				lastIcon: 'mdi-arrow-collapse-right',
				prevIcon: 'mdi-minus',
				nextIcon: 'mdi-plus'
			}"
          >
		  <template v-if="Models.length > 0" v-slot:body.prepend>
			  <tr>
				<td v-if="computedHeaders.find(header => header.value === 'ID')">
					<v-text-field clearable v-model="filters.ID" type="number"></v-text-field>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'TYPE')">
					<v-autocomplete
							v-model="filters.TYPE"
							multiple
							:items="TYPE"
							item-text="name"
							deletable-chips
							clearable
							chips
							>
						</v-autocomplete>
				</td>
				<td v-if="computedHeaders.find(header => header.value === 'VENDOR')">
						<v-autocomplete
							v-model="filters.VENDOR"
							multiple
							:items="VENDOR"
							item-text="name"
							deletable-chips
							clearable
							chips
							>
						</v-autocomplete>
					</td>
					<td v-if="computedHeaders.find(header => header.value === 'MODEL')">
						<v-text-field clearable v-model="filters.MODEL" type="text"></v-text-field>
					</td>
					<td v-if="computedHeaders.find(header => header.value === 'EMAIL')">
						<v-text-field clearable v-model="filters.EMAIL" type="text"></v-text-field>
					</td>
					<td v-if="computedHeaders.find(header => header.value === 'DATE')">
						<v-text-field clearable v-model="filters.DATE" type="text"></v-text-field>
					</td>
					<td v-if="computedHeaders.find(header => header.value === 'EDIT')"></td>
				</tr>
		  	</template>
			<template v-slot:item.ID="{ item }">
				<div class="text-left cursor_btn" @click="gotoMarket(item.ID)">
					<v-tooltip top>
					<template v-slot:activator="{ on }">
						<span v-on="on">{{ item.ID }}</span>
					</template>
					<span>Нажмите для перехода в Маркет</span>
				</v-tooltip>
				</div>
			</template>
			<template v-slot:item.EMAIL="{ item }">
				{{ item.EMAIL !== null ? item.EMAIL.split('@')[0] : item.EMAIL }}
			</template>
			<template v-slot:item.DATE="{ item }">
				{{ new Date(item.DATE).toLocaleDateString('ru') }}
			</template>
			<template v-slot:item.EDIT="{ item }">
				<td class="justify-center layout">
                <v-icon small class="mr-2" @click="editItem(item)" :disabled="$acl.not.check('Edit')">edit</v-icon>
				<v-icon small @click="deleteItem(item)" :disabled="$acl.not.check('Edit')">delete</v-icon>
				<v-btn text fab small left :to="'/model/' + item.ID">
              	<v-icon>more_horiz</v-icon>
            	</v-btn>
              </td>
			</template>
			<template v-slot:no-data>
				<div class="ma-5">
        			<v-progress-circular :size="80" :width="1" color="primary" indeterminate />
				</div>
      		</template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script>
import Api from '@/services/Api'
import moment from 'moment'
import { AclRule } from 'vue-acl'
// import { eventBus } from '../../main.js'
import GetConfig from '@/services/GetConfig'
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
	data () {
		return {
			filters: {
				ID: null,
				TYPE: [],
				VENDOR: [],
				MODEL: '',
				EMAIL: '',
				DATE: ''
			},
			multiSelects: {
				TYPE: [],
				VENDOR: []
			},
			search: '',
			menu: false,
			show: false,
			toggle: false,
			infoText: '',
			localLoading: false,
			dialog: false,
			headers: [
				{ text: 'id',
					value: 'ID',
					selected: localStorage.modelsColumn ? localStorage.modelsColumn['ID'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.ID) return true
						return value === +this.filters.ID
					}
				},
				{ text: 'Тип',
					value: 'TYPE',
					divider: true,
					visible: true,
					selected: localStorage.modelsColumn ? localStorage.modelsColumn['TYPE'] : false,
					filter: value => {
						if (this.filters.TYPE.length === 0) return true
						if (!value) return false
						return value.includes(this.filters.TYPE.find(item => item === value))
					}
				},
				{ text: 'Бренд',
					value: 'VENDOR',
					divider: true,
					visible: true,
					selected: localStorage.modelsColumn ? localStorage.modelsColumn['VENDOR'] : false,
					filter: value => {
						if (this.filters.VENDOR.length === 0) return true
						if (!value) return false
						return value.includes(this.filters.VENDOR.find(item => item === value))
					}
				},
				{ text: 'Название',
					value: 'MODEL',
					divider: true,
					visible: true,
					selected: localStorage.modelsColumn ? localStorage.modelsColumn['MODEL'] : false,
					filter: value => {
						if (!this.filters.MODEL) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.MODEL.toLowerCase())
					}
				},
				{ text: 'Автор',
					value: 'EMAIL',
					divider: true,
					visible: true,
					selected: localStorage.modelsColumn ? localStorage.modelsColumn['EMAIL'] : false,
					filter: value => {
						if (!this.filters.EMAIL) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.EMAIL.toLowerCase())
					}
				},
				{ text: 'Дата',
					value: 'DATE',
					divider: true,
					visible: true,
					selected: localStorage.modelsColumn ? localStorage.modelsColumn['DATE'] : false,
					filter: value => {
						if (!this.filters.DATE) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.DATE.toLowerCase())
					}
				},
				{ text: 'Ред.',
					value: 'EDIT',
					visible: true,
					selected: localStorage.modelsColumn ? localStorage.modelsColumn['EDIT'] : false,
					sortable: false,
					align: 'center',
					divider: true
				}
			],
			pagination: {sortBy: 'ID', descending: true},
			editedItem: {
			},
			editedIndex: -1,
			newItem: {
				ModelsCategory: {},
				Brands: {},
				ModelsProfile: {},
				ModelsEngineers: [],
				ModelsType: {},
				Name: ''
			},
			ReqRules: [
				v => !!v || 'Обязательный параметр!'
			]
		}
	},

	computed: {
		...mapGetters({
			Models: 'models',
			Brands: 'brands',
			ModelsCategory: 'models_category',
			ModelsProfile: 'models_profile',
			ModelsEngineers: 'models_engineers',
			ModelsType: 'models_type'
		}),
		computedHeaders () {
			return this.headers.filter(header => header.selected)
		},
		loadings () {
			return this.$store.getters.loadings
		},
		Edit () {
			return new AclRule('user').and('engineer').or('admin').generate()
		},
		TYPE () { return _.uniq(this.ModelsType) },
		VENDOR () { return _.uniq(this.Brands) }
	},
	methods: {
		getName (id) {
			var obj = {}
			obj = this.$store.getters.zip.find(x => x.ID === id)
			for (var key in obj) {
				if (key === 'NAME') {
					return obj[key] + ' {' + obj.ID + '}'
				}
			}
		},
		getClientName (id) {
			var obj = {}
			obj = this.$store.getters.clients.find(x => x.ID === id)
			for (var key in obj) {
				if (key === 'NAME') {
					return obj[key]
				}
			}
		},
		gotoMarket (id) {
			this.$router.replace('/zip_prices/#' + id)
		},
		init () {
			if (window.location.hash) {
				const id = window.location.hash.replace(/[^0-9]/gim, '')
				this.search = id
			}
		},
		showAllColumn () {
			this.headers.forEach(header => {
				header.selected = true
			})
		},
		saveColumnFB () {
			let modelsColumn = {}
			let id = 'modelsColumn'
			this.headers.forEach(header => {
				header.selected === null || header.selected === undefined ? modelsColumn[header.value] = false : modelsColumn[header.value] = header.selected
			})
			this.menu = false
			this.$store.dispatch('createLocalStorage', [modelsColumn, id])
		},
		/*  ----------------------------------------------- Добавление, редактирование, удаление модели  ------------------------------------------- */
		editItem (item) {
			this.editedIndex = this.Models.indexOf(item)
			this.newItem.ModelsType = this.ModelsType.find(obj => obj.name === item.TYPE)
			this.newItem.ModelsCategory = this.ModelsCategory.find(obj => obj.id === item.CATEGORY)
			this.newItem.ModelsProfile = this.ModelsProfile.find(obj => obj.id === item.PROFILE)
			this.newItem.Brands = this.Brands.find(obj => obj.name === item.VENDOR)
			this.newItem.Name = item.MODEL
			this.newItem.ID = item.ID
			console.log(item)
			Api()
				.post('models/get_data', [item.ID])
				.then(response => {
					this.dialog = true
					this.newItem.ModelsEngineers = response.data.engineers
					if (!this.newItem.ModelsCategory) {
						this.newItem.ModelsCategory = this.ModelsCategory.find(obj => obj.id === response.data.category[0].CAT_EQ)
					}
					if (!this.newItem.ModelsProfile) {
						this.newItem.ModelsProfile = this.ModelsProfile.find(obj => obj.id === response.data.profile[0].BASIC)
					}
					console.log(response.data)
				})
		},
		deleteItem (item) {
			console.log(item)
			const index = this.Models.indexOf(item)
			console.log(index)
			const userId = this.$store.getters.currentUser.email
			if (confirm('Вы уверены, что хотите удалить эту Модель?')) {
				this.$store.commit('clearError')
				this.show = true
				this.infoText = 'Внимание! Идёт удаление...'
				Api()
					.post('models/del', [item.ID, userId])
					.then(response => {
						this.show = false
						this.Models.splice(index, 1)
						this.$store.commit('setData', response.data)
					})
					.catch(error => {
						this.$store.commit('setLoading', false)
						this.$store.commit('setError', error.message)
					})
			} else {
				this.$store.commit('setLoading', false)
				this.$store.commit('setInfo', 'Удаление отменено')
			}
		},
		save () {
			if (this.$refs.name.validate() && this.$refs.type.validate() && this.$refs.brands.validate() && this.$refs.category.validate() &&
					this.$refs.profile.validate() && this.$refs.engineer.validate()) {
				this.newItem.email = this.$store.getters.currentUser.email
				let newModel = {}
				newModel.VENDOR = this.newItem.Brands.name
				newModel.TYPE = this.newItem.ModelsType.name
				newModel.MODEL = this.newItem.Name
				newModel.EMAIL = this.newItem.email
				newModel.DATE = moment(new Date()).format('YYYY.MM.DD HH:mm')
				if (this.editedIndex === -1) {
					Api()
						.post('models/add', this.newItem)
						.then(response => {
							newModel.ID = response.data.lastId
							this.Models.push(newModel)
							this.$store.dispatch('setData', response.data.success)
						})
						.catch(err => {
							console.log(err)
						})
				} else {
					Api()
						.post('models/edit', this.newItem)
						.then(response => {
							Object.assign(this.Models[this.editedIndex], newModel)
							this.$store.dispatch('setData', response.data)
						})
						.catch(err => {
							console.log(err)
						})
				}
				this.dialog = false
			} else {
				this.$store.dispatch('setError', 'Не заполнены обязательные поля!')
			}
		},
		close () {
			this.newItem = {}
			this.dialog = false
		}
		/*  -------------------------------------------------------------------------------------------------------------------------------------- */
	},
	mounted () {
		let obj = {}
		for (let key in this.filters) {
			this.$watch(['filters', key].join('.'), (newVal, oldVal) => {
				if (newVal === null) newVal = ''
				obj[key] = newVal
				localStorage.setItem('filtersModels', JSON.stringify(obj))
			})
		}
		if (localStorage.filtersModels) {
			var ls = JSON.parse(localStorage.filtersModels)
			if (ls) {
				Object.keys(this.filters).forEach(key => {
					Object.entries(ls).forEach((item) => {
						if (JSON.parse(localStorage.getItem('filtersModels'))[item[0]] && JSON.parse(localStorage.getItem('filtersModels'))[item[0]] !== 'null' && item[0] === key) {
							this.filters[item[0]] = JSON.parse(localStorage.getItem('filtersModels'))[item[0]]
						}
					})
				})
			}
		}
	},
	async created () {
		await this.$store.dispatch('fetchModels')
		await this.$store.dispatch('fetchBrands')
		await this.$store.dispatch('fetchModelsCategory')
		await this.$store.dispatch('fetchModelsProfile')
		await this.$store.dispatch('fetchModelsEngineers')
		await this.$store.dispatch('fetchModelsType')
		await this.init()
		/* чтение конфига */
		GetConfig.getColumn('modelsColumn')
			.then((data) => {
				if (data) {
					this.headers.forEach(header => {
						for (var key in data) {
							if (key === header.value) {
								header.selected = data[key]
							}
						}
					})
					console.log('Данные о сохранеённых колонках успешно загружены: ', data)
				}
			})
			.catch(error => {
				this.show = true
				this.infoText = error.message
			})
	}
}
</script>
<style scoped>
.cursor_btn {
	cursor: pointer;
	touch-action: none;
}
.resizeCheckbox {
    max-width: 120px !important;
	margin-top: 20px !important;
}
</style>

