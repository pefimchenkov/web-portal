<template>
	<v-container v-if="loading && TechProperties.length === 0" fill-height fluid>
		<v-layout row fill-height align-center>
			<v-flex text-center>
				<v-progress-circular indeterminate :size="120" color="primary"></v-progress-circular>
			</v-flex>
		</v-layout>
	</v-container>
	<v-container v-else fluid class="mt-3">
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
		<v-layout row>
			<v-flex xs6 class="text-right pr-4">
			<v-btn @click="goBack()" color="warning">Вернуться назад</v-btn>
			</v-flex>
			<v-flex xs6 class="text-left pl-4">
				<v-dialog width="500px" v-model="dialog" persistent>
					<template v-slot:activator="{on}">
						<v-btn v-on="$acl.check('Edit') ? on : ''" color="primary" dark :disabled="$acl.not.check('Edit')">
						<v-icon dark>add</v-icon>
						Добавить
					</v-btn>
					</template>
					<v-card class="pa-3">
						<v-card-title class="subheading">{{ formText }}</v-card-title>
							<v-text-field
								class="ml-3"
								v-model="nameTechProp"
								label="* Название"
								:rules="textRules"
								ref="nameTechProp"
								clearable
								required
								validation
							></v-text-field>
							<v-combobox
								class="ml-3"
								v-model="typeTechProp"
								:items="AllTypes"
								item-text='name'
								label="Тип"
								return-object
								multiple
								autocomplete
								small-chips
							>
								<template v-slot:selection="{ item, selected, parent }">
									<v-chip
										v-if="item === Object(item)"
										:color="`blue lighten-3`"
										label
										:input-value="selected"
									>
										<span class="pr-2">
										{{ item.name }}
										</span>
										<v-icon
										small
										@click="deleteTechType(item, idTechProp)"
										>close</v-icon>
									</v-chip>
								</template>
							</v-combobox>
							<v-card-actions>
							<v-spacer></v-spacer>
							<v-btn
								color="green darken-1"
								text="text"
								@click="close()"
							>
							Отменить
							</v-btn>
							<v-btn
								color="green darken-1"
								text="text"
								@click.native="save()"
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
	<v-layout row wrap>
		<v-flex xs12 sm12 md12 lg10 xl10 offset-xs1 class="text-lg-right">
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
				:headers="headers"
				:items="TechProperties"
				:search="search"
				show-expand
				:expanded.sync="expanded"
				:single-expand="true"
				:items-per-page='50'
				item-key="id"
				:mobile-breakpoint="550"
				sort-by='id'
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
				<template v-slot:top>
					<v-app-bar color="white">
						<v-toolbar-title>Технические характеристики:</v-toolbar-title>
					</v-app-bar>
				</template>
				<template v-slot:item.types="{ item }">
      				<v-chip @click="editItem(item)" v-if="item.types" color="green" dark>{{ item.types }}</v-chip>
   				</template>
				<template v-slot:item.action="{ item }">
					<td class="justify-center layout">
						<v-icon small class="mr-2" @click="editItem(item)" :disabled="$acl.not.check('Edit')">edit</v-icon>
						<v-icon small @click="deleteItem(item)" :disabled="$acl.not.check('Edit')">delete</v-icon>
					</td>
				</template>
				<template v-slot:expanded-item="{ headers, item }">
					<td :colspan="headers.length" class="text-left">

						<v-chip class="ml-2"
							color="primary"
							label
							outlined
							v-for="obj in TPV(item)"
							:key="obj.id"
						>
							<v-tooltip top>
								<template v-slot:activator={on}>
								<span @click="editItemValue(obj)" v-on="on" class="pr-3"><span class="px-1 red white--text"> {{ obj.id }}</span>&nbsp;&nbsp;{{ obj.name }}</span><v-icon small @click="deleteItemValue(obj)">delete</v-icon>
							</template>
							<span>нажмите для редактирования</span>
							</v-tooltip>

						</v-chip>
						<v-dialog v-model="dialogValue" max-width="550px"  :disabled="$acl.not.check('Edit')">
							<template v-slot:activator="{ on }">
								<v-btn @click="initItemValue()" fab x-small v-on="$acl.not.check('Edit') ? '' : on" color="primary" dark class="ml-5" :disabled="$acl.not.check('Edit')">
									<v-icon>mdi-plus</v-icon>
								</v-btn>
							</template>
							<v-card>
								<v-card-title>{{ formTextValue }} &nbsp;<span class="red--text"> {{ item.name }} </span></v-card-title>
								<v-container grid-list-md text-center>
									<v-layout row wrap>
										<v-flex xs12>
											<v-text-field
												class="ml-3"
												v-model="nameTechPropValue"
												label="введите значение"
												:rules="textRules"
												ref="nameTechPropValue"
												clearable
												required
												validation
											></v-text-field>
										</v-flex>
									</v-layout>
								</v-container>
								<v-card-actions>
									<v-spacer></v-spacer>
									<v-btn
										color="green darken-1"
										text
										@click="dialogValue=false"
									>
									Отменить
									</v-btn>
									<v-btn
										color="green darken-1"
										text
										@click.native="saveValue(item.id)"
										:disabled="localloading"
										:loading="localloading"
									>
									Сохранить
									</v-btn>
								</v-card-actions>
							</v-card>
						</v-dialog>

					</td>
				</template>
				</v-data-table>
		</v-flex>
	</v-layout>
	</v-container>
</template>

<script>
import { AclRule } from 'vue-acl'
import { mapGetters } from 'vuex'

export default {
	props: ['id'],
	data () {
		return {
			AllTypes: [],
			nameTechPropValue: '',
			nameTechProp: '',
			typeTechProp: [],
			idTechProp: null,
			idTechPropValue: null,
			formTextValue: 'Добавление значения к свойству',
			formText: 'Добавление нового свойства',
			expanded: [],
			show: false,
			singleExpand: false,
			infoText: 'Добавление нового свойства',
			search: '',
			localloading: false,
			dialog: false,
			dialogValue: false,
			headers: [
				{ text: 'Название', value: 'name', align: 'left' },
				{ text: 'Связанные Типы', value: 'types', align: 'left' },
				{ text: 'id', value: 'id', align: 'left' },
				{ text: 'Ред.', value: 'action', align: 'center' }
			],
			textRules: [v => !!v || 'Обязательный параметр!'],
			itemIndex: -1,
			editedItem: {
				id: null,
				name: ''
			},
			editedItemValue: {
				name: ''
			}
		}
	},
	methods: {
		getAllTypes () {
			return new Promise((resolve, reject) => {
				let ProductsType = this.$store.getters.productstype
				let ModelsType = this.$store.getters.models_type
				ProductsType.forEach(item => {
					item.element = 1
				})
				ModelsType.forEach(item => {
					item.element = 2
				})
				return resolve(ProductsType.concat(ModelsType))
			})
		},
		TPV (item) {
			return this.$store.getters.techPropertiesValues.filter(value => value.parent_id === item.id)
		},
		open () {
			this.dialog = true
			this.localloading = true
		},
		close () {
			this.dialog = false
			this.localloading = false
			this.editedItem = Object.assign({})
			this.itemIndex = -1
			this.typeTechProp = []
			this.nameTechProp = ''
			this.formText = 'Добавление нового свойства'
		},
		closeValue () {
			this.dialogValue = false
			this.localloading = false
			this.editedItem = Object.assign({})
			this.itemIndex = -1
			this.nameTechPropValue = ''
			this.formTextValue = 'Добавление значения к свойству'
		},
		goBack () {
			this.$router.go(-1)
		},
		editItem (item) {
			console.log(item)
			this.itemIndex = this.$store.getters.techProperties.indexOf(item)
			this.nameTechProp = item.name
			this.idTechProp = item.id
			this.formText = 'Редактирование свойства - ' + item.name
			this.$store.dispatch('fetchTechPropertiesTypes', item.id)
				.then(res => {
					this.AllTypes.filter(item => {
						return res.forEach(r => {
							if (r.zip === item.id && item.element === r.element) {
								this.typeTechProp.push(item)
							}
						})
					})
				})
			this.dialog = true
		},
		initItemValue () {
			this.nameTechPropValue = ''
			this.formTextValue = 'Добавление значения свойства'
		},
		editItemValue (item) {
			this.itemIndex = this.$store.getters.techPropertiesValues.indexOf(item)
			console.log(this.itemIndex)
			this.nameTechPropValue = item.name
			this.idTechPropValue = item.id
			this.formTextValue = 'Редактирование значения свойства'
			this.dialogValue = true
		},
		deleteTechType (item, id) {
			this.$store.dispatch('checkUseTypeInProp', { item: item, id: id })
				.then(res => {
					if (res.length > 0) {
						this.$store.commit('setError', 'Этот тип привязан где то еще!')
					} else {
						let index = this.typeTechProp.indexOf(item)
						this.typeTechProp.splice(index, 1)
					}
				})
		},
		deleteItem (item) {
			console.log(item)
			if (confirm('Вы уверены, что хотите удалить свойство ' + item.name + '?')) {
				this.$store.dispatch('checkUseValueInProp', { parent_id: item.parent_id, tpv: this.TechPropertiesValues.filter(tpv => item.id === tpv.parent_id) })
					.then(res => {
						console.log(res)
						if (res && res.length > 0) {
							this.$store.commit('setError', 'Характеристика привязана в Маркете. Для начала удалите эти связи.')
						} else {
							this.$store.commit('clearError')
							this.show = true
							this.infoText = 'Внимание! Идёт удаление...'
							this.$store.dispatch('deleteTechProperty', item)
							this.show = false
						}
					})
			} else {
				this.$store.commit('setLoading', false)
				this.$store.commit('setInfo', 'Удаление отменено')
			}
		},
		deleteItemValue (item) {
			console.log(item)
			if (confirm('Вы уверены, что хотите удалить значение ' + item.name + '?')) {
				this.$store.dispatch('checkUseValueInProp', { parent_id: item.parent_id, id: item.id })
					.then(res => {
						if (res && res.length > 0) {
							this.$store.commit('setError', 'Характеристика привязана в Маркете. Для начала удалите эти связи.')
						} else {
							this.$store.commit('clearError')
							this.show = true
							this.infoText = 'Внимание! Идёт удаление...'
							this.$store.dispatch('deleteTechPropertyValue', item)
							this.show = false
						}
					})
			} else {
				this.$store.commit('setLoading', false)
				this.$store.commit('setInfo', 'Удаление отменено')
			}
		},
		save () {
			if (this.$refs.nameTechProp.validate()) {
				this.localloading = true
				if (this.itemIndex === -1) {
					this.$store.dispatch('createTechProperty', this.typeTechProp.length === 0
						? { name: this.nameTechProp }
						: { name: this.nameTechProp, types: this.typeTechProp })
					this.$store.dispatch('setData', 'Свойство успешно добавлено!')
				} else {
					this.$store.dispatch('updateTechProperty', this.typeTechProp.length === 0
						? { name: this.nameTechProp, id: this.idTechProp }
						: { name: this.nameTechProp, types: this.typeTechProp, id: this.idTechProp })
					this.$store.dispatch('setData', 'Свойство успешно обновлено!')
				}
				this.close()
			} else {
				this.$store.dispatch('setError', 'Заполните обязательное поле!')
			}
		},
		saveValue (itemId) {
			if (this.$refs.nameTechPropValue.validate()) {
				this.localloading = true
				if (this.itemIndex === -1) {
					this.$store.dispatch('createTechPropertyValue', {
						name: this.nameTechPropValue,
						parent_id: itemId
					})
					this.$store.dispatch('setData', 'Значение для свойства `' + this.nameTechProp + '` успешно добавлено!')
				} else {
					this.$store.dispatch('updateTechProperty', {
						name: this.nameTechPropValue,
						id: this.idTechPropValue,
						parent_id: true
					})
					this.$store.dispatch('setData', 'Значение для свойства `' + this.nameTechProp + '` успешно обновлено!')
				}
				this.closeValue()
			} else {
				this.$store.dispatch('setError', 'Заполните обязательное поле!')
			}
		}
	},
	computed: {
		loading () {
			return this.$store.getters.loading
		},
		Edit () {
			return new AclRule('user').and('engineer').or('admin').generate()
		},
		...mapGetters({
			TechProperties: 'techProperties',
			TechPropertiesValues: 'techPropertiesValues'
		})
	},
	watch: {
		dialog (val) {
			val || this.close()
		}
	},
	async created () {
		await this.$store.dispatch('fetchTechProperties')
		await this.$store.dispatch('fetchTechPropertiesValues')
		await this.$store.dispatch('fetchProductsType')
		await this.$store.dispatch('fetchModelsType')
		await this.getAllTypes()
			.then(data => {
				this.AllTypes = data
			})
		if (this.TechProperties.length === 0 && this.TechPropertiesValues.length === 0) this.$store.commit('setLoading', false)
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


