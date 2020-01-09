<template>
  <v-container fluid>
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
          Внимание! Идёт удаление...
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <div v-if="!loadings && ZipList.length !== 0">
      <v-toolbar flat color="white">
        <v-toolbar-title>Список ЗИП</v-toolbar-title>
        <v-divider class="mx-3" inset vertical></v-divider>
        <v-text-field
			v-model="search"
			prepend-icon="search"
			label="Поиск"
			clearable
			single-line
			@input="filterSearch"
			>
		</v-text-field>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <v-btn slot="activator" color="primary" dark class="mb-2 mr-5">
			  <v-icon dark left>add</v-icon>
			  Добавить новый</v-btn>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs6>
						<v-select
                    		v-model="editedItem.CLASS"
                    		:items="ProductsClass"
                    		label="Класс ЗИПа"
							required
							validation
							:rules="textRules"
							item-text = 'name'
							ref="class"
							return-object
                    	></v-select>
				  </v-flex>
				  <v-flex xs6>
						<v-autocomplete
                    		v-model="editedItem.TYPE"
                    		:items="ProductsType"
                    		label="Тип ЗИПа"
							required
							validation
							:rules="textRules"
							item-text = 'name'
							ref="type"
							return-object
                    	></v-autocomplete>
				  </v-flex>
                  <v-flex xs12>
                    <v-text-field
						v-model="editedItem.SHORTNAME"
						label="Название ЗИП"
						:rules="textRules"
						ref="shortname"
					></v-text-field>
                  </v-flex>
				  <v-flex xs12>
                    <v-text-field
						v-model="editedItem.TIME"
						label="Время на установку (мин.)"
						:rules="digitRules"
						ref="time"
					></v-text-field>
                  </v-flex>
                  <v-flex xs12>
                    <v-combobox
						v-model="editedItem.MODELS"
                    		:items="Models"
                    		label="Совместимые модели"
							required
							validation
							:rules="modelRules"
							item-text = 'MODEL'
							ref="models"
							return-object
							multiple
							browser-autocomplete="on"
							small-chips
							deletable-chips
							clearable
							cache-items
							hide-selected
						>
					</v-combobox>
                  </v-flex>
				  <v-flex xs6>
						<v-select
                    		v-model="editedItem.SUPPLIERS"
                    		:items="Suppliers"
                    		label="Производитель"
							required
							validation
							:rules="textRules"
							item-text = 'name'
							ref="supp"
							return-object
                    	></v-select>
				  </v-flex>
				  <v-flex xs6>
						<v-select
                    		v-model="editedItem.CONDITIONS"
                    		:items="Conditions"
                    		label="Состояние"
							required
							validation
							:rules="textRules"
							item-text = 'name_ru'
							ref="cond"
							return-object
                    	></v-select>
				  </v-flex>
				  <v-flex xs6>
                    <v-text-field
						v-model="editedItem.PN"
						label="Партномер"
						:rules="textRules"
						ref="pn"
					></v-text-field>
                  </v-flex>
				  <v-flex xs6>
                    <v-text-field
						v-model="editedItem.ART"
						label="Артикул 1С"
						:rules="artRules"
						ref="art"
					></v-text-field>
                  </v-flex>
				  <v-flex xs12>
                    <v-text-field
						v-model="editedItem.Pack"
						label="Кол-во в упаковке"
						:rules="digitRules"
						ref="pack"
					></v-text-field>
                  </v-flex>
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
		<v-flex xs1>
			<v-menu
				bottom
				transition="scale-transition"
				:close-on-content-click="false"
				>
				<v-btn
					slot="activator"
					color="grey"
					dark
				>
				<v-icon dark left>list</v-icon>
					Колонки
				</v-btn>

				<v-list>
					<v-list-tile
					v-for="(header, i) in headers"
					:key="i"
					>
					<v-checkbox :label="header.text" v-model="header.selected" :value="header.selected" v-if="header.visible"></v-checkbox>
					</v-list-tile>
				</v-list>
			</v-menu>
        </v-flex>
      </v-toolbar>
      <div class="data_table_wrapper">
        <v-data-table
          :headers="headers"
          :items="ZipList"
          :search="search"
		  :pagination.sync="pagination"
          :rows-per-page-items="[50,250,500,{'text':'Все','value':-1}]"
          class="elevation-2"
        >
		<template slot="headers" slot-scope="props">
			<tr>
				<th
					v-for="header in props.headers"
					:key="header.text"
					:class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
					@click="changeSort(header.value)"
					v-if="header.selected"
			>
					<v-icon small>arrow_upward</v-icon>
					{{ header.text }}
					</th>
			</tr>
    	</template>
        <template slot="items" slot-scope="props">
			<td v-if="showTableCol('id')">{{ props.item.ID }}</td>
            <td v-if="showTableCol('Имя')">{{ props.item.NAME }}</td>
            <td v-if="showTableCol('Класс')" class="text-xs-left">{{ props.item.CLASS }}</td>
            <td v-if="showTableCol('Совместимые модели')" class="text-xs-left models">{{ props.item.MODELS }}</td>
			<td v-if="showTableCol('PN')" class="text-xs-left models">{{ props.item.PN }}</td>
            <td v-if="showTableCol('Артикул')" class="text-xs-left models">{{ props.item.ART }}</td>
            <td v-if="showTableCol('Ред')" class="justify-center layout px-0">
              <v-icon small class="mr-2" @click="editItem(props.item)">edit</v-icon>
              <v-icon small @click="deleteItem(props.item)">delete</v-icon>
            </td>
        </template>
          <v-alert
            slot="no-results"
            :value="true"
            color="error"
            icon="warning"
          >Вы искали "{{ search }}", результат не найден!.</v-alert>
        </v-data-table>
      </div>
    </div>

    <div v-else-if="!loadings && ZipList.length === 0">
      <v-layout row>
        <v-flex xs12 class="text-xs-center pt-5">
          <v-progress-circular :size="70" color="primary" indeterminate></v-progress-circular>
        </v-flex>
      </v-layout>
    </div>
  </v-container>
</template>

<script>
import Api from '@/services/Api'

export default {
	data () {
		return {
			show: false,
			ZipList: [],
			ProductsClass: [],
			ProductsType: [],
			Models: [],
			Suppliers: [],
			Conditions: [],
			search: '',
			dialog: false,
			headers: [
				{
					text: 'id',
					value: 'ID',
					selected: true,
					visible: true,
					sortable: false
				},
				{
					text: 'Имя',
					sortable: false,
					value: 'NAME',
					selected: true,
					visible: true
				},
				{ text: 'Класс', value: 'CLASS', selected: true, visible: true, sortable: false },
				{ text: 'Совместимые модели', value: 'MODELS', 'overflow-x': 'hidden', selected: true, visible: true, sortable: false },
				{ text: 'PN', value: 'PN', selected: true, visible: true, sortable: false },
				{ text: 'Артикул', value: 'ART', selected: true, visible: true, sortable: false },
				{ text: 'Ред', value: 'Edit', sortable: false, selected: true, visible: false }
			],
			editedIndex: -1,
			lastItemId: null,
			editedItem: {
				SHORTNAME: '',
				NAME: '',
				CLASS: '',
				MODELS: [],
				MODELS_STR: '',
				ART: '',
				PN: '',
				Pack: null
			},
			defaultItem: {
				SHORTNAME: '',
				NAME: '',
				CLASS: '',
				MODELS: [],
				ART: '',
				PN: '',
				Pack: null
			},
			pagination: {'sortBy': 'ID', 'descending': true},
			textRules: [v => !!v || 'Обязательный параметр!'],
			modelRules: [
				v => !!v || 'Обязательный параметр!',
				v => this.checkModels(v) || 'В выбранных моделях есть недопустимые значения'
			],
			artRules: [
				v => !!v || 'Обязательный параметр!',
				v => /^[Т0-9.]{8,8}$/.test(v) || 'Правильно: Буква ` Т ` кириллицей и 7 цифр!'
			],
			digitRules: [
				v => !!v || 'Цена - обязательный параметр!',
				v => /^[0-9]+$/.test(v) || 'Допускаются только числа!'
			]
		}
	},

	computed: {
		loadings () {
			return this.$store.getters.loadings
		},
		formTitle () {
			return this.editedIndex === -1 ? 'Новый ЗИП' : 'Редактировать ЗИП'
		}
	},

	watch: {
		dialog (val) {
			val || this.close()
		}
	},

	mounted () {

	},
	methods: {
		checkModels (arr) {
			if (arr.length === 0 || arr === 'undefined') {
				return true
			}
			let newArr = [...arr]
			let lastItem = newArr.pop()
			let checker = false

			arr.forEach(a => {
				if (typeof (a) !== 'object') {
					checker = true
				}
			})
			let obj = this.Models.filter(m => lastItem.MODEL === m.MODEL)
			if (obj.length !== 0 && checker === false) {
				return true
			} else {
				return false
			}
		},
		showTableCol (name) {
			let obj = this.headers.filter(h => h.text === name)
			return obj[0].selected
		},
		getZip () {
			Api()
				.get('zip')
				.then(res => {
					this.ZipList = Object.values(res.data)
				})
				.catch(err => {
					console.log(err)
				})
		},
		getProductsClass () {
			this.ProductsClass = this.$store.getters.productsclass
		},
		getProductsType () {
			this.ProductsType = this.$store.getters.productstype
		},
		getModels () {
			this.Models = this.$store.getters.models
		},
		getConditions () {
			this.Conditions = this.$store.getters.conditions
		},
		getSuppliers () {
			this.Suppliers = this.$store.getters.suppliers
		},
		editItem (item) {
			this.editedIndex = this.ZipList.indexOf(item)
			this.editedItem = Object.assign({}, item)
			if (typeof (this.editedItem.MODELS) === 'string') {
				let arr = []
				this.editedItem.MODELS_STR = this.editedItem.MODELS
				this.editedItem.MODELS = item.MODELS.split(', ')
				this.editedItem.MODELS.forEach(m => {
					arr.push(this.Models.filter(item => item.MODEL === m)[0])
				})
				this.editedItem.MODELS = arr
			}
			this.dialog = true
		},

		deleteItem (item) {
			const index = this.ZipList.indexOf(item)
			if (confirm('Вы уверены, что хотите удалить этот ЗИП?')) {
				this.$store.commit('clearError')
				this.show = true
				Api()
					.post('ziplist/del', [item.ID])
					.then(response => {
						this.show = false
						this.ZipList.splice(index, 1)
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

		close () {
			this.dialog = false
			setTimeout(() => {
				this.editedItem = Object.assign({}, this.defaultItem)
				this.editedIndex = -1
			}, 300)
		},

		save () {
			if (this.$refs.shortname.validate() && this.$refs.type.validate() && this.$refs.class.validate() &&
			this.$refs.art.validate() && this.$refs.pn.validate() && this.$refs.models.validate() &&
			this.$refs.time.validate() && this.$refs.supp.validate() && this.$refs.cond.validate() && this.$refs.pack.validate()) {
				let arr1 = []
				let arr2 = []
				Object.entries(this.editedItem).forEach(([key, value]) => {
					if (key === 'MODELS') {
						this.editedItem.MODELS.forEach(m => {
							if (typeof (m) === 'object') {
								arr1.push(m)
							} else {
								arr1.push(this.Models.filter(t => t.MODEL === m)[0])
							}
						})
						this.editedItem.MODELS = arr1
						arr1.forEach(a => {
							arr2.push(a.MODEL)
						})
						this.editedItem.MODELS_STR = arr2.join(', ')
					}
				})
				console.log(this.editedItem)
				if (typeof (this.editedItem.TYPE) === 'string') {
					let newArr = this.ProductsType.filter(t => t.name === this.editedItem.TYPE)
					this.editedItem.TYPE = newArr[0]
				}
				if (typeof (this.editedItem.CLASS) === 'string') {
					let newArr = this.ProductsClass.filter(t => t.name === this.editedItem.CLASS)
					this.editedItem.CLASS = newArr[0]
				}
				if (typeof (this.editedItem.SUPPLIERS) === 'string') {
					let newArr = this.Suppliers.filter(t => t.name === this.editedItem.SUPPLIERS)
					this.editedItem.SUPPLIERS = newArr[0]
				}
				if (typeof (this.editedItem.CONDITIONS) === 'string') {
					let newArr = this.Conditions.filter(t => t.name_ru === this.editedItem.CONDITIONS)
					this.editedItem.CONDITIONS = newArr[0]
				}
				if (typeof (this.editedItem.MODELS) === 'string') {
					let newArr = this.Models.filter(t => t.MODEL === this.editedItem.MODELS)
					this.editedItem.MODELS = newArr[0]
				}
				let Item = {}
				Item.NAME = this.editedItem.TYPE.name + ' ' + this.editedItem.SHORTNAME
				Item.SHORTNAME = this.editedItem.SHORTNAME
				Item.CLASS = this.editedItem.CLASS.name
				Item.TYPE = this.editedItem.TYPE.name
				Item.PN = this.editedItem.PN
				Item.ART = this.editedItem.ART
				Item.TIME = this.editedItem.TIME
				Item.SUPPLIERS = this.editedItem.SUPPLIERS.name
				Item.CONDITIONS = this.editedItem.CONDITIONS.name_ru
				Item.Pack = this.editedItem.Pack
				Item.MODELS = this.editedItem.MODELS_STR
				if (this.editedIndex > -1) {
					Api()
						.post('ziplist/edit', this.editedItem)
						.then(res => {
							Object.assign(this.ZipList[this.editedIndex], Item)
							this.$store.dispatch('setData', res.data.success)
							this.close()
						})
						.catch(err => {
							console.log(err)
						})
				} else {
					Api()
						.post('ziplist/add', this.editedItem)
						.then(res => {
							this.ZipList.push(Item)
							this.$store.dispatch('setData', res.data.success)
							this.lastItemId = this.editedItem.ID = res.data.MaxId[0].ID
							Item.ID = this.editedItem.ID = this.lastItemId
							this.close()
						})
						.catch(err => {
							console.log(err)
						})
				}
				this.close()
			} else {
				this.$store.commit('setError', ' Заполните соответствующие поля! ')
			}
		},
		changeSort (column) {
			if (this.pagination.sortBy === column) {
				this.pagination.descending = !this.pagination.descending
			} else {
				this.pagination.sortBy = column
				this.pagination.descending = false
			}
		},
		filterSearch (val) {
			this.filters = this.$MultiFilters.updateFilters(this.filters, {
				search: val
			})
		}
	},
	async created () {
		await this.$store.dispatch('fetchProductsClass')
		await this.getProductsClass()
		await this.$store.dispatch('fetchProductsType')
		await this.getProductsType()
		await this.$store.dispatch('fetchModels')
		await this.getModels()
		await this.$store.dispatch('fetchConditions')
		await this.getConditions()
		await this.$store.dispatch('fetchSuppliers')
		await this.getSuppliers()
		await this.getZip()
	}
}
</script>

<style scoped>
.models {
	word-break: break-all
}
</style>
