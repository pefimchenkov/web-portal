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
	<v-dialog v-model="showFilterName" width="500px">
		<v-card class="pa-3">
        <v-card-title class="headline">Введите название для фильтра</v-card-title>
        <v-text-field v-model="filterName"></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text="text"
            @click="showFilterName = false"
          >
            Отменить
          </v-btn>
          <v-btn
            color="green darken-1"
            text="text"
            @click="createFilter(filterName)"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
	</v-dialog>
	<v-dialog v-model="dialogImg" :max-width="imageWidth">
		<v-img width="100%" v-if="selectedImage" :src="selectedImage" @click.stop="closeImg()"></v-img>
	</v-dialog>
    <div v-if="!loadings && ZipList.length !== 0">
		<v-app-bar :fixed="checkBox1" text color="white" class="elevation-2 mb-1">
			<v-container fluid>
			<v-layout row>
			<v-flex xs12>
				<v-layout>
					<v-layout column>
						<v-flex sm2 md2 lg1 xl1 class="hidden-sm-and-down">
							<v-checkbox
							hide-details
							v-model="checkBox1"
							:label="checkBox1 ? 'Открепить' : 'Закрепить'"
							></v-checkbox>
						</v-flex>
						<v-flex sm2 md2 lg1 xl1 class="hidden-sm-and-down">
							<v-checkbox
							hide-details
							v-model="checkBox2"
							:label="checkBox2 ? 'Разтянуть' : 'Сжать'"
							></v-checkbox>
						</v-flex>
					</v-layout>
				<v-spacer></v-spacer>
			<v-flex xs3 sm3 md3 lg2 xl1 v-if="$acl.check('Edit')">
				<v-btn width='95'>
					<download-excel
					:fields="json_fields"
					:fetch="getExel"
					class="btn btn-default xlsx_btn"
					name="zip_list.xls"
				>
					<v-icon>save_alt</v-icon> excel
				</download-excel>
				</v-btn>
			</v-flex>
			<v-flex xs3 sm3 md3 lg2 xl1>
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
			<v-flex xs4 sm4 md4 lg2 xl2>
				<v-menu
					v-model="menu_filter"
					:close-on-content-click="false"
					offset-y
				>
				<template v-slot:activator={on}>
					<v-btn  v-on="on">
					<v-icon dark class="mr-2">filter_list</v-icon>
					Фильтры
				</v-btn>
				</template>
				<v-card class="text-center">
					<v-menu
						bottom
						transition="scale-transition"
						:close-on-content-click="false"
						>
					</v-menu>
					<v-list class="text-center">
							<v-list-item
								v-for="(filter, i) of Filters"
								:key="i"
								v-model="Filters"
							>
								<v-btn
									small
									color="blue lighten-2"
									dark
									block
									:loading="loadings"
									:disabled="loadings"
									v-model="filter.name"
									@click="loadFilter(filter.name)"
								>
								{{ filter.name }}
								</v-btn>
							</v-list-item>
							<v-list-item>
								<v-btn class="text-center" text @click="showFilterName = true" :disabled="$acl.not.check('Edit')">Создать фильтр</v-btn>
							</v-list-item>
							<v-list-item>
								<v-btn  text @click="resetFilter">Сбросить фильтр</v-btn>
							</v-list-item>
						</v-list>
				</v-card>
				</v-menu>
			</v-flex>
			<v-flex xs4 sm4 md4 lg2 xl1>
				<v-dialog v-model="dialog" :fullscreen="editedIndex === -1" :persistent="editedIndex === -1" max-width="700px" scrollable>
					<template v-slot:activator="{on}">
						<v-btn  v-on="$acl.check('Edit') ? on : ''" color="primary" :disabled="$acl.not.not.check('Edit')" dark>
							<v-icon dark left>add</v-icon>
							Добавить
						</v-btn>
					</template>
					<v-card>
						<v-card-text>
						<v-container grid-list-md>
							<v-subheader class="title pa-0 font-weight-bold">{{ formTitle }}</v-subheader>
						<v-layout wrap>
							<v-flex xs6>
							<v-autocomplete
								v-model="editedItem.zipCLASS"
								:items="ProductsClass"
								label="* Класс ЗИПа"
								required
								validation
								:rules="textRules"
								item-text = 'name'
								ref="class"
								return-object
								clearable
							></v-autocomplete>
							</v-flex>
							<v-flex xs6>
							<v-autocomplete
								v-model="editedItem.zipTYPE"
								:items="ProductsType"
								label="* Тип ЗИПа"
								required
								validation
								:rules="textRules"
								item-text = 'name'
								ref="type"
								return-object
								clearable
							></v-autocomplete>
					</v-flex>
					<v-flex xs12>
						<v-text-field
							v-model="editedItem.SHORTNAME"
							label="* Название ЗИП"
							:rules="textRules"
							ref="shortname"
							clearable
						></v-text-field>
					</v-flex>
					<v-flex xs12>
						<v-text-field
							v-model="editedItem.zipTIME"
							:label="editedItem.zipCLASS && editedItem.zipCLASS.name === 'Услуга' ? 'Время на установку (мин.)' : '* Время на установку (мин.)'"
							:rules="digitRules"
							:required="editedItem.zipCLASS && editedItem.zipCLASS.name === 'Услуга' ? true : false"
							:validation="editedItem.zipCLASS && editedItem.zipCLASS.name === 'Услуга' ? true : false"
							ref="time"
							clearable
						></v-text-field>
					</v-flex>
						<v-subheader class="title font-weight-bold">Совместимости</v-subheader>
					<v-flex xs12>
						<v-combobox
							v-model="editedItem.zipMODELS"
								:items="Models"
								:label="editedItem.zipCLASS && editedItem.zipCLASS.name === 'Услуга' ? 'Модели' : '* Модели'"
								:required="editedItem.zipCLASS && editedItem.zipCLASS.name === 'Услуга' ? true : false"
								:validation="editedItem.zipCLASS && editedItem.zipCLASS.name === 'Услуга' ? true : false"
								:rules="modelRules"
								item-text = 'MODEL'
								ref="models"
								return-object
								multiple
								autocomplete
								small-chips
								deletable-chips
								clearable
								hide-selected
							>
							</v-combobox>
							</v-flex>
							<v-flex xs12>
								<v-subheader v-if="editedIndex == -1" class="title font-weight-bold">Маркет</v-subheader>
							</v-flex>

						<v-flex xs6>
							<v-select
							v-if="editedIndex == -1"
								v-model="editedItem.zipSUPPLIERS"
								:items="Suppliers"
								label="Производитель"
								item-text = 'name'
								ref="supp"
								return-object
								clearable
								validation
								:rules="customRules"
							></v-select>
					</v-flex>
					<v-flex xs6>
							<v-select
								v-if="editedIndex == -1"
								v-model="editedItem.zipCONDITIONS"
								:items="Conditions"
								label="Состояние"
								item-text = 'name_ru'
								ref="cond"
								return-object
								clearable
								validation
								:rules="customRules"
							></v-select>
					</v-flex>
					<v-flex xs6>
						<v-text-field
							v-if="editedIndex == -1"
							v-model="editedItem.zipPN"
							label="Партномер"
							:rules="customRules"
							ref="pn"
							clearable
							validation
						></v-text-field>
					</v-flex>
					<v-flex xs6>
						<v-text-field
							v-if="editedIndex == -1"
							v-model="editedItem.zipART"
							label="Артикул 1С"
							:rules="artRules"
							ref="art"
							clearable
							validation
						></v-text-field>
					</v-flex>
					<v-flex xs12>
						<v-text-field
							v-if="editedIndex == -1"
							v-model="editedItem.zipPack"
							label="Кол-во в упаковке"
							:rules="packRules"
							ref="pack"
							clearable
							validation
						></v-text-field>
					</v-flex>
					<v-flex xs12>
							<v-combobox
							v-if="editedIndex === -1"
							v-model="Parts"
							:items="Market"
							:item-text="idNameTypeArtPNModels"
							label="СОСТАВ"
							:search-input.sync="search"
								multiple
								small-chips
								deletable-chips
								clearable
								hide-selected
							return-object
							:allow-overflow="true"
							class="font-weight-medium"
							>
								<template v-slot:no-data>
									<v-list-item>
										<v-list-item-content>
										<v-list-item-title>
											Результат поиска "<strong>{{ search }}</strong>" отсутствует. Пожалуйста, вводите правильные данные!
										</v-list-item-title>
										</v-list-item-content>
									</v-list-item>
								</template>
								<template v-slot:selection="{ item, parent}">
									<v-chip
										color="blue lighten-4"
										label
										small
									>
									{{ idNameTypeArtPNModels(item) }}
									</v-chip>
									<v-icon
									small
									@click="parent.selectItem(item)"
									>close</v-icon>
								</template>
							</v-combobox>
						</v-flex>
					</v-layout>
				</v-container>
				<div class="ml-4">* - Поля обязательные к заполнению</div>
				</v-card-text>
				<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn  color="blue darken-1" text @click.native="close"><v-icon class="mr-2">cancel</v-icon>Отмена</v-btn>
				<v-btn
				color="blue darken-1"
				text
				@click.native="save"
				:disabled="localloading"
				:loading="localloading"
				>
				<v-icon class="mr-2">save</v-icon>Сохранить
				</v-btn>
				</v-card-actions>
			</v-card>
			</v-dialog>
			</v-flex>
		</v-layout>
	  </v-flex>
	</v-layout>
	</v-container>
	</v-app-bar>
    <v-spacer></v-spacer>
		<h4 v-if="activeFilterName" class="text-lg-center mb-2">Применён фильтр: <span class="success--text">{{ activeFilterName }} </span> </h4>
      <div class="data_table_wrapper">
        <v-data-table
          	:headers="computedHeaders"
          	:items="ZipList"
			fixed-header
			calculate-widths
			:items-per-page=50
			item-key="zipID"
			:mobile-breakpoint="550"
			sort-by='zipID'
			:dense="checkBox2"
			sort-desc
			ref="dataTable"
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
		<template v-slot:body.prepend v-if="mobileView">
        <tr>
			<td v-if="computedHeaders.find(header => header.value === 'zipPHOTO')">
				<v-switch
					v-model="filters.searchZipPhoto"
				>
				</v-switch>
          </td>
          <td v-if="computedHeaders.find(header => header.value === 'zipID')">
            <v-text-field clearable v-model="filters.searchZipID" type="number"></v-text-field>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'zipNAME')">
            <v-text-field clearable v-model="filters.searchZipName" type="text"></v-text-field>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'zipCLASS')">
				<v-autocomplete
					v-model="filters.searchZipClass"
					multiple
					:items="zipClass"
					deletable-chips
					clearable
					chips
					>
				</v-autocomplete>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'zipTYPE')">
            <v-autocomplete
				v-model="filters.searchZipType"
				multiple
				:items="zipType"
				deletable-chips
				clearable
				chips
				>
			</v-autocomplete>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'zipMODELS')">
            <v-autocomplete
				v-model="filters.searchZipModel"
				multiple
				item-text="MODEL"
				:items="Models"
				deletable-chips
				clearable
				chips
				>
			</v-autocomplete>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'zipPN')">
            <v-text-field clearable v-model="filters.searchZipPN" type="text"></v-text-field>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'zipART')">
            <v-text-field clearable v-model="filters.searchZipART" type="text"></v-text-field>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'zipTIME')" colspan="1"></td>
		  <td v-if="computedHeaders.find(header => header.value === 'zipemail')">
            <v-text-field clearable v-model="filters.searchZipEmail" type="text"></v-text-field>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'zipdate')">
					<v-menu
						v-model="menuZipDate"
						:close-on-content-click="false"
						transition="scale-transition"
						ref="menuZipDate"
					>
						<template v-slot:activator="{ on }">
								<v-icon v-on="on" :color="filters.searchZipDate !== null && filters.searchZipDate.length > 0 ? `green darken-2` : ``">event</v-icon>
						</template>
						<v-date-picker v-model="filters.searchZipDate" multiple no-title>
							<div class="flex-grow-1"></div>
							<v-btn text color="primary" @click="menuZipDate = false">Отмена</v-btn>
							<v-btn text color="primary" @click="$refs.menuZipDate.save(filters.searchZipDate)">OK</v-btn>
						</v-date-picker>
					</v-menu>
					<v-icon v-if="filters.searchZipDate !== null && filters.searchZipDate.length > 0" @click="filters.searchZipDate = []">clear</v-icon>
			</td>
          <td v-if="computedHeaders.find(header => header.value === 'action')" colspan="1"></td>
        </tr>
      </template>
	  <template v-slot:item.zipPHOTO="{ item }">
			<img
				v-lazyload
				v-if="loadPhoto(item.zipID)"
				src='../../assets/img/placeholder.png'
				:data-src='loadPhoto(item.zipID)'
				data-err='../../assets/img/broken-image.jpg'
				@click="zoom($event, loadPhoto(item.zipID))"
				class="cursor_btn maxWidth">
    	</template>
		<template v-slot:item.zipID="{ item }">
			<span class="cursor_btn" @click="gotoMarket(item.zipID)">{{ item.zipID }}</span>
		</template>
		<template v-slot:item.zipemail="{ item }">
			{{ item.zipemail !== null ? item.zipemail.split('@')[0] : item.zipemail }}
    	</template>
		<template v-slot:item.zipdate="{ item }">
			{{ new Date(item.zipdate).toLocaleDateString('ru') }}
    	</template>
		<template v-slot:item.action="{ item }">
				<v-icon small class="mr-2" @click="editItem(item)" :disabled="$acl.not.check('Edit')">edit</v-icon>
              	<v-icon small @click="deleteItem(item)" :disabled="$acl.not.check('Edit')">delete</v-icon>
			  	<v-btn  text fab small left :to="'/zip/' + item.zipID">
              		<v-icon>more_horiz</v-icon>
            	</v-btn>
    	</template>
        </v-data-table>
      </div>
    </div>

    <div v-else-if="!loadings && ZipList.length === 0">
      <v-layout row>
        <v-flex xs12 class="text-center pt-5">
          <v-progress-circular :size="100" color="primary" indeterminate></v-progress-circular>
        </v-flex>
      </v-layout>
    </div>
  </v-container>
</template>

<script>
import Api from '@/services/Api'
import moment from 'moment'
import { formatDate } from '../../services/helpers'
import GetConfig from '@/services/GetConfig'
import { AclRule } from 'vue-acl'
import _ from 'lodash'

export default {
	data () {
		return {
			filters: {
				searchZipPhoto: false,
				searchZipID: null,
				searchZipName: '',
				searchZipClass: [],
				searchZipModel: [],
				searchZipType: [],
				searchZipPN: '',
				searchZipART: '',
				searchZipEmail: '',
				searchZipDate: []
			},
			multiSelects: {
				zipClass: [],
				zipType: []
			},
			show: false,
			menu: false,
			menuZipDate: false,
			localloading: false,
			checkBox1: false,
			checkBox2: false,
			Filters: [],
			ZipList: [],
			Market: [],
			Parts: [],
			ZipImg: [],
			showForFilter: false,
			filterName: '',
			showFilterName: false,
			activeFilterName: '',
			menu_filter: false,
			selectedImage: null,
			imageWidth: '',
			ProductsClass: [],
			ProductsType: [],
			Models: [],
			Suppliers: [],
			Conditions: [],
			search: '',
			infoText: '',
			dialog: false,
			dialogImg: false,
			headers: [
				{ text: 'Фото',
					value: 'zipPHOTO',
					selected: localStorage.zipColumn ? localStorage.zipColumn['zipPHOTO'] : false,
					divider: true,
					visible: true,
					filter: value => {
						if (!this.filters.searchZipPhoto) return true
						return value === this.filters.searchZipPhoto
					}
				},
				{ text: 'id',
					value: 'zipID',
					selected: localStorage.zipColumn ? localStorage.zipColumn['zipID'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchZipID) return true
						return value === +this.filters.searchZipID
					}
				},
				{ text: 'Имя',
					value: 'zipNAME',
					selected: localStorage.zipColumn ? localStorage.zipColumn['zipNAME'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchZipName) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.searchZipName.toLowerCase())
					}
				},
				{ text: 'Класс',
					value: 'zipCLASS',
					selected: localStorage.zipColumn ? localStorage.zipColumn['zipCLASS'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (this.filters.searchZipClass.length === 0) return true
						if (!value) return false
						return value.includes(this.filters.searchZipClass.find(item => item === value))
					}
				},
				{ text: 'Тип',
					value: 'zipTYPE',
					selected: localStorage.zipColumn ? localStorage.zipColumn['zipTYPE'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (this.filters.searchZipType.length === 0) return true
						if (!value) return false
						return value.includes(this.filters.searchZipType.find(item => item === value))
					}
				},
				{ text: 'Модели',
					value: 'zipMODELS',
					selected: localStorage.zipColumn ? localStorage.zipColumn['zipMODELS'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (this.filters.searchZipModel.length === 0) return true
						if (!value) return false
						return value.split(', ').includes(this.filters.searchZipModel.find(item => value.includes(item)))
					}
				},
				{ text: 'PN',
					value: 'zipPN',
					selected: localStorage.zipColumn ? localStorage.zipColumn['zipPN'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchZipPN) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.searchZipPN.toLowerCase())
					}
				},
				{ text: 'Артикул',
					value: 'zipART',
					selected: localStorage.zipColumn ? localStorage.zipColumn['zipART'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchZipART) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.searchZipART.toLowerCase())
					}
				},
				{ text: 'Время установки',
					value: 'zipTIME',
					selected: localStorage.zipColumn ? localStorage.zipColumn['zipTIME'] : false,
					visible: true,
					divider: true
				},
				{ text: 'Редактор',
					value: 'zipemail',
					selected: localStorage.zipColumn ? localStorage.zipColumn['zipemail'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchZipEmail) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.searchZipEmail.toLowerCase())
					}
				},
				{ text: 'Изменён',
					value: 'zipdate',
					selected: localStorage.zipColumn ? localStorage.zipColumn['zipdate'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchZipDate || this.filters.searchZipDate.length === 0) return true
						if (!value || isNaN(Date.parse(value))) return false
						let Arr = this.filters.searchZipDate.map(item => moment(item).unix())
						let first = Math.min(...Arr)
						let last = Math.max(...Arr)
						return (moment(value).unix() >= first && moment(value).unix() <= last)
					}
				},
				{ text: 'Действия',
					value: 'action',
					divider: true,
					selected: localStorage.zipColumn ? localStorage.zipColumn['action'] : false,
					visible: true,
					width: '120px'
				}
			],
			editedIndex: -1,
			lastItemId: null,
			editedItem: {
				zipMODELS: [],
				MODELS_STR: ''
			},
			defaultItem: {
				zipCLASS: '',
				MODELS_STR: ''
			},
			textRules: [v => !!v || 'Обязательный параметр!'],
			modelRules: [
				v => !!v || 'Обязательный параметр!',
				v => this.checkModels(v) || 'В выбранных моделях есть недопустимые значения или поле пустое!'
			],
			artRules: [
				function (v) {
					if (v === undefined || v === '' || v === null) {
						return true
					} else {
						return /^[Т0-9.]{8,8}$/.test(v) || 'Правильно: Буква ` Т ` кириллицей и 7 цифр!'
					}
				}
			],
			packRules: [
				function (v) {
					if (v === undefined || v === '' || v === null) {
						return true
					} else {
						return /^[0-9]+$/.test(v) || 'Допускаются только числа!'
					}
				}
			],
			customRules: [
				function (v) {
					if (v === undefined || v === '' || v === null) {
						return true
					} else {
						return true
					}
				}
			],
			digitRules: [
				v => !!v || 'Обязательный параметр!',
				v => /^[0-9]+$/.test(v) || 'Допускаются только числа!'
			],
			json_fields: {}
		}
	},

	computed: {
		computedHeaders () {
			return this.headers.filter(header => header.selected)
		},
		mobileView () {
			switch (this.$vuetify.breakpoint.name) {
			case 'xs': return false
			case 'sm': return false
			default: return true
			}
		},
		loadings () {
			return this.$store.getters.loadings
		},
		formTitle () {
			return this.editedIndex === -1 ? 'Новый ЗИП' : 'Редактировать ЗИП'
		},
		Edit () {
			return new AclRule('user').and('engineer').or('admin').generate()
		},
		zipCheckFields () {
			if (this.editedItem.zipCLASS !== undefined && this.editedItem.zipCLASS.name === 'Услуга') {
				return this.$refs.shortname.validate() && this.$refs.type.validate() && this.$refs.class.validate()
			} else {
				return this.$refs.shortname.validate() && this.$refs.type.validate() && this.$refs.class.validate() && this.$refs.time.validate() && this.$refs.models.validate()
			}
		},
		zipClass () { return _.uniq(this.multiSelects.zipClass) },
		zipType () { return _.uniq(this.multiSelects.zipType) }
	},

	watch: {
		dialog (val) {
			val || this.close()
		},
		dialogImg (val) {
			val || this.closeImg()
		}
	},

	mounted () {
		let obj = {}
		for (let key in this.filters) {
			this.$watch(['filters', key].join('.'), (newVal, oldVal) => {
				if (newVal === null) newVal = ''
				obj[key] = newVal
				localStorage.setItem('filtersZip', JSON.stringify(obj))
			})
		}
		if (localStorage.filtersZip) {
			var ls = JSON.parse(localStorage.filtersZip)
			if (ls) {
				Object.keys(this.filters).forEach(key => {
					Object.entries(ls).forEach((item) => {
						if (JSON.parse(localStorage.getItem('filtersZip'))[item[0]] && JSON.parse(localStorage.getItem('filtersZip'))[item[0]] !== 'null' && item[0] === key) {
							this.filters[item[0]] = JSON.parse(localStorage.getItem('filtersZip'))[item[0]]
						}
					})
				})
			}
		}
	},

	methods: {
		async getExel () {
			const filtered = await this.headers.filter(header => header.selected === true)
			filtered.forEach(item => {
				this.json_fields[item.text] = item.value
			})
			return this.$refs.dataTable.$children[0].filteredItems
		},
		checkModels (arr) {
			if (arr === undefined) {
				return false
			}
			if (arr && arr.length === 0) {
				return false
			}
			let newArr = [...arr]
			let lastItem = newArr.pop()
			let checker = false

			arr.forEach(a => {
				if (typeof (a) !== 'object') {
					checker = true
				}
			})
			if (lastItem.MODEL) {
				let obj = this.Models.filter(m => lastItem.MODEL === m.MODEL)
				if (obj.length !== 0 && checker === false) {
					return true
				} else {
					return false
				}
			} else {
				return false
			}
		},
		showTableCol (name) {
			let obj = this.headers.filter(h => h.text === name)
			return obj[0].selected
		},
		gotoMarket (id) {
			this.$router.replace('/zip_prices/#' + id)
		},
		idNameTypeArtPNModels (item) {
			return '(' + item.marketid + ') ' + '[' + item.marketART + ', ' + item.marketCOND + ', ' + item.marketSUPPLIER + '] ' + item.marketNAME + ' (' + item.marketPN + ') - ' + item.marketMODELS
		},
		replaceArt (item) {
			if (item && item.includes(',')) {
				return item.replace(/,/g, '<br />')
			} else return item
		},
		init () {
			if (window.location.hash) {
				const id = window.location.hash.replace(/[^0-9]/gim, '')
				this.filters.searchZipID = id
			}
		},
		saveColumnFB () {
			let zipColumn = {}
			let id = 'zipColumn'
			this.headers.forEach(header => {
				header.selected === null || header.selected === undefined ? zipColumn[header.value] = false : zipColumn[header.value] = header.selected
			})
			this.menu = false
			this.$store.dispatch('createLocalStorage', [zipColumn, id])
		},
		showAllColumn () {
			this.headers.forEach(header => {
				header.selected = true
			})
		},
		async createFilter (name) {
			this.showFilterName = false
			const id = 'ЗИП'
			let zipColumn = {}
			await this.headers.forEach(header => {
				header.selected === null ? zipColumn[header.value] = false : zipColumn[header.value] = header.selected
			})
			await this.$store.dispatch('createFilter', [ name, id, { Data: this.filters, Columns: zipColumn } ])
				.then(() => {
					this.Filters.push({ name: name, payload: { Data: this.filters, Columns: zipColumn } })
					this.$store.dispatch('setData', 'Фильтр успешно создан.')
				})
		},
		loadFilter (name) {
			this.Filters.forEach(filter => {
				if (filter.name.toString() === name.toString()) {
					this.filters = Object.assign(this.filters, filter.payload.Data)
					this.headers.forEach(header => {
						for (var key in filter.payload.Columns) {
							if (key.toString() === header.value.toString()) {
								header.selected = filter.payload.Columns[key]
							}
						}
					})
					this.activeFilterName = '" ' + name + ' "'
				}
				this.menu_filter = false
				this.show = true
				this.$router.replace({
					...this.$router.currentRoute,
					query: {}
				})
				this.infoText = 'Ждите, идёт загрузка фильтра'
				setTimeout(() => {
					this.show = false
				}, 2000)
			})
		},
		resetFilter () {
			for (let key in this.filters) {
				if (typeof this.filters[key] === 'object' && (this.filters[key] instanceof Array)) {
					this.filters[key] = []
				} else if (typeof this.filters[key] === 'object' && this.filters[key] !== null) {
					this.filters[key] = {}
				} else {
					this.filters[key] = ''
				}
			}
			this.menu_filter = false
			this.$router.replace({
				...this.$router.currentRoute,
				query: {}
			})
		},
		getZip () {
			Api()
				.get('zip')
				.then(res => {
					this.ZipList = Object.values(res.data)
					this.ZipImg.forEach(img => {
						this.ZipList.find(zip => {
							if (+zip.zipID === +img.id) {
								zip.zipPHOTO = true
							}
						})
					})
				})
				.then(() => {
					this.ZipList.forEach((item, index) => {
						if (item.zipdate) item.zipdate = formatDate(item.zipdate)
						if (item.zipCLASS) this.multiSelects.zipClass.push(item.zipCLASS)
						if (item.zipTYPE) this.multiSelects.zipType.push(item.zipTYPE)
					})
				})
				.catch(err => {
					console.log(err)
				})
		},
		getZipImg () {
			this.ZipImg = this.$store.getters.zipImg
		},
		loadPhoto (id) {
			let obj = this.ZipImg.find(img => parseInt(img.id) === parseInt(id))
			return obj ? obj.url : false
		},
		zoom (e, url) {
			e.preventDefault()
			this.openImg()
			this.selectedImage = url
			this.ZipImg.forEach(photo => {
				if (photo.url === url) {
					this.imageWidth = parseInt(photo.width)
				}
			})
		},
		openImg () {
			this.dialogImg = true
			this.localLoading = true
		},
		closeImg () {
			this.dialogImg = false
			this.localLoading = false
			this.selectedImage = null
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
		getMarket () {
			this.Market = this.$store.getters.Market.filter(item => item.elementTYPE === 1)
		},
		editItem (item) {
			this.editedIndex = this.ZipList.indexOf(item)
			this.editedItem = Object.assign({}, item)
			if (typeof (this.editedItem.zipMODELS) === 'string') {
				let arr = []
				this.editedItem.MODELS_STR = this.editedItem.zipMODELS
				this.editedItem.zipMODELS = item.zipMODELS.split(', ')
				this.editedItem.zipMODELS.forEach(m => {
					arr.push(this.Models.filter(item => item.MODEL === m)[0])
				})
				this.editedItem.zipMODELS = arr
			} else {
				this.editedItem.zipMODELS = []
			}
			if (this.editedIndex !== -1) {
				for (var key in this.editedItem) {
					if (key === 'zipART' || key === 'zipPN' || key === 'zipCONDITIONS' || key === 'zipSUPPLIERS' || key === 'zipPack') {
						delete this.editedItem[key]
					}
				}
			}
			this.dialog = true
		},
		deleteItem (item) {
			const index = this.ZipList.indexOf(item)
			const userId = this.$store.getters.currentUser.email
			if (confirm('Вы уверены, что хотите удалить этот ЗИП?')) {
				this.$store.commit('clearError')
				this.show = true
				this.infoText = 'Внимание! Идёт удаление, дождитесь результата!'
				Api()
					.post('ziplist/del', [item.zipID, userId])
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
			this.editedItem = Object.assign({})
			this.editedIndex = -1
		},
		save () {
			let arr1 = []
			let arr2 = []
			this.editedItem.EMAIL = this.$store.getters.currentUser.email
			Object.entries(this.editedItem).forEach(([key, value]) => {
				if (key === 'zipMODELS' && this.$refs.models.validate()) {
					this.editedItem.zipMODELS.forEach(m => {
						if (typeof (m) === 'object') {
							arr1.push(m)
						} else {
							arr1.push(this.Models.filter(t => t.MODEL === m)[0])
						}
					})
					this.editedItem.zipMODELS = arr1
					arr1.forEach(a => {
						arr2.push(a.MODEL)
					})
					this.editedItem.MODELS_STR = arr2.join(', ')
				}
			})
			if (typeof (this.editedItem.zipTYPE) === 'string') {
				let newArr = this.ProductsType.filter(t => t.name === this.editedItem.zipTYPE)
				this.editedItem.zipTYPE = newArr[0]
			}
			if (typeof (this.editedItem.zipCLASS) === 'string') {
				let newArr = this.ProductsClass.filter(t => t.name === this.editedItem.zipCLASS)
				this.editedItem.zipCLASS = newArr[0]
			}
			if (typeof (this.editedItem.zipSUPPLIERS) === 'string' && this.editedItem.zipSUPPLIERS) {
				let newArr = this.Suppliers.filter(t => t.name === this.editedItem.zipSUPPLIERS)
				this.editedItem.zipSUPPLIERS = newArr[0]
			}
			if (typeof (this.editedItem.zipCONDITIONS) === 'string' && this.editedItem.zipCONDITIONS) {
				let newArr = this.Conditions.filter(t => t.name_ru === this.editedItem.zipCONDITIONS)
				this.editedItem.zipCONDITIONS = newArr[0]
			}
			if (typeof (this.editedItem.zipMODELS) === 'string') {
				let newArr = this.Models.filter(t => t.MODEL === this.editedItem.zipMODELS)
				this.editedItem.zipMODELS = newArr[0]
			}
			let Item = {}
			this.editedItem.zipTYPE ? Item.zipNAME = this.editedItem.zipTYPE.name + ' ' + this.editedItem.SHORTNAME : delete Item.zipNAME
			Item.SHORTNAME = this.editedItem.SHORTNAME
			this.editedItem.zipCLASS ? Item.zipCLASS = this.editedItem.zipCLASS.name : delete Item.zipCLASS
			this.editedItem.zipTYPE ? Item.zipTYPE = this.editedItem.zipTYPE.name : delete Item.zipTYPE
			this.editedItem.zipPN || this.editedItem.zipPN === '' ? Item.zipPN = this.editedItem.zipPN : delete Item.zipPN
			this.editedItem.zipART ? Item.zipART = this.editedItem.zipART : Item.zipART = this.editedItem.zipART = null
			this.editedItem.zipTIME ? Item.zipTIME = this.editedItem.zipTIME : this.editedItem.zipTIME = Item.zipTIME = 0
			Item.zipemail = this.editedItem.EMAIL
			Item.zipdate = moment(new Date()).format('YYYY.MM.DD HH:mm')
			this.editedItem.zipSUPPLIERS ? Item.zipSUPPLIERS = this.editedItem.zipSUPPLIERS.name : delete Item.zipSUPPLIERS
			this.editedItem.zipCONDITIONS ? Item.zipCONDITIONS = this.editedItem.zipCONDITIONS.name_ru : delete Item.zipCONDITIONS
			this.editedItem.zipPack ? Item.zipPack = this.editedItem.zipPack : delete Item.zipPack
			Item.zipMODELS = this.editedItem.MODELS_STR
			if (this.editedIndex > -1) {
				if (this.zipCheckFields) {
					this.localloading = true
					if (!this.editedItem.zipPack) this.editedItem.zipPack = 1
					Api()
						.post('ziplist/edit', this.editedItem)
						.then(res => {
							Object.assign(this.ZipList[this.editedIndex], Item)
							this.$store.dispatch('setData', res.data.success)
								.then(() => {
									this.localloading = false
									this.close()
								})
						})
						.catch(err => {
							console.log(err)
						})
				} else {
					this.$store.commit('setError', ' Заполните соответствующие поля! ')
				}
			} else {
				if (this.zipCheckFields) {
					if (this.Parts.length > 0) {
						this.editedItem.Parts = this.Parts
					}
					this.localloading = true
					Api()
						.post('ziplist/add', this.editedItem)
						.then(res => {
							if (res.data.success !== false) {
								this.$store.dispatch('setData', res.data.success)
								this.editedItem.zipID = res.data.lastItemId
								Item.zipID = res.data.lastItemId
								this.ZipList.push(Item)
								this.localloading = false
								this.close()
							} else {
								this.$store.dispatch('setError', res.data.error)
								this.localloading = false
							}
						})
						.catch(err => {
							console.log(err)
						})
				} else {
					this.$store.commit('setError', ' Заполните соответствующие поля! ')
					this.localLoading = false
				}
			}
		},
		changeSort (column) {
			if (this.pagination.sortBy === column) {
				this.pagination.descending = !this.pagination.descending
			} else {
				this.pagination.sortBy = column
				this.pagination.descending = false
			}
		}
	},
	async created () {
		this.$store.dispatch('fetchProductsClass')
		this.$store.dispatch('fetchProductsType')
		this.$store.dispatch('fetchModels')
		this.$store.dispatch('fetchMarket')
		this.$store.dispatch('fetchConditions')
		this.$store.dispatch('fetchSuppliers')
		this.$store.dispatch('fetchZipImg')
		/* чтение конфига */
		await GetConfig.getColumn('zipColumn')
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
		await GetConfig.getMyFilters(this.$route.query.userID, this.$route.query.filterName, this.$route.query.payload)
			.then((filters) => {
				if (filters === undefined) return false
				if (filters['ЗИП'] !== undefined) {
					Object.entries(filters['ЗИП']).forEach(filter => {
						this.Filters.push({ name: filter[0], payload: filter[1] })
						if (this.$route.query.zip === filter[0]) {
							return this.loadFilter(filter[0])
						}
					})
				}
				if (this.$route.query.userID && this.$route.query.filterName && this.$route.query.payload) {
					let existence = Object.keys(filters).filter((key, value) => key === this.$route.query.userID)
					this.showForFilter = true
					this.infoText = 'Ждите, идёт загрузка фильтра'
					let arr = []
					if (existence.length > 0) {
						arr = filters[existence]
					} else {
						arr = filters
					}
					arr.forEach(el => {
						if (typeof el === 'object') {
							this.filters = Object.assign(this.filters, el.Data)
						}
					})
					this.activeFilterName = `пользователь: " ` + this.$route.query.userID + ` ", название: " ` + this.$route.query.filterName + ` "`
					setTimeout(() => {
						this.showForFilter = false
					}, 2000)
				}
			})
			.catch(error => {
				console.log(error)
			})
			.finally(async () => {
				this.getProductsType()
				this.getProductsClass()
				this.getConditions()
				this.getMarket()
				this.getModels()
				this.getZipImg()
				this.getSuppliers()
				await this.getZip()
				this.init()
			})
	}
}
</script>

<style scoped>
.models {
	word-break: break-all
}
.cursor_btn {
	cursor: pointer;
	touch-action: none;
}
.maxWidth {
	max-width: 100px !important;
}
</style>
