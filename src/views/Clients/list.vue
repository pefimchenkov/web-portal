<template>
  <v-container v-if="!loadings && Clients.length !== 0" fluid>
	  <ProgressDialog :show="show" :infoText="infoText"></ProgressDialog>
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
			<v-flex xs3 sm3 md3 lg2 xl1>
				<v-btn width='95'>
					<download-excel :fields="json_fields" :fetch="getExel" class="btn btn-default xlsx_btn" name="clients_list.xls">
						<v-icon>save_alt</v-icon> excel
					</download-excel>
				</v-btn>
			</v-flex>
			<v-spacer></v-spacer>
			<v-flex xs3 sm3 md3 lg2 xl1>
				<v-menu bottom transition="scale-transition" :close-on-content-click="false" v-model="menu">
					<template v-slot:activator={on}>
						<v-btn v-on="on">
							<v-icon left>list</v-icon>
							Колонки
						</v-btn>
					</template>

					<v-list class="pa-3">
						<v-btn @click="saveColumnFB">
							<v-icon color="success" class="mr-1">save</v-icon>
							Сохранить
						</v-btn>
						<v-btn @click="showAllColumn">
							<v-icon color="warning" class="mr-1">mdi-eye</v-icon>
							Включить всё
						</v-btn>
							<v-list-item v-for="(header, i) in headerVisible" :key="i" dense>
								<v-checkbox :label="header.text" v-model="header.selected" :value="header.selected" hide-details>
								</v-checkbox>
							</v-list-item>
					</v-list>
				</v-menu>
			</v-flex>
			<v-spacer></v-spacer>
			<v-flex xs4 sm4 md4 lg2 xl2>
                            <v-menu v-model="menu_filter" :close-on-content-click="false" offset-y>
                                <template v-slot:activator="{ on }">
                                    <v-btn v-on="on">
                                        <v-icon dark class="mr-2">filter_list</v-icon>
                                        Фильтры
                                    </v-btn>
                                </template>
                                <v-card class="text-center">
                                    <v-menu bottom transition="scale-transition" :close-on-content-click="false">
                                    </v-menu>
                                    <v-list class="text-center">
                                        <v-list-item>
                                            <v-btn text @click="resetFilter">Сбросить фильтр</v-btn>
                                        </v-list-item>
                                    </v-list>
                                </v-card>
                            </v-menu>
                        </v-flex>
			<v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px" persistent >
		<template v-slot:activator=" { on } ">
          	<v-btn v-on="$acl.check('Financier') ? on : ''" color="primary" dark class="mb-2" :disabled="$acl.not.check('Financier')">
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
        :headers="computedHeaders"
        :items="Clients"
		ref="clientsListTable"
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
			<td v-for="(item, index) in computedHeaders" :key="index">
				<span v-if="item.value === 'PLAN'">ИТОГО (сум.):
					<v-text-field v-if="$refs.clientsListTable" v-model="planSum" type="text" readonly append-icon="mdi-currency-rub"></v-text-field>
				</span>
				<span v-if="item.value === 'MARJA_PLAN'">МП (сум.):
					<v-text-field v-if="$refs.clientsListTable" v-model="marjaPlanSum" type="text" readonly append-icon="mdi-currency-rub"></v-text-field>
				</span>
				<span v-if="item.value === 'FACT'">ФАКТ (сум.):
					<v-text-field v-if="$refs.clientsListTable" v-model="factSum" type="text" readonly append-icon="mdi-currency-rub"></v-text-field>
				</span>
				<span v-if="item.value === 'MARJA_FACT'">МФ (сум.):
					<v-text-field v-if="$refs.clientsListTable" v-model="marjaFactSum" type="text" readonly append-icon="mdi-currency-rub"></v-text-field>
				</span>
			</td>
		</tr>
        <tr>
          <td v-if="computedHeaders.find(header => header.value === 'ID')">
            <v-text-field clearable v-model="Filters.ID" type="number"></v-text-field>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'NAME')">
            <v-text-field clearable v-model="Filters.Name" type="text"></v-text-field>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'LEGPERS')">
            <v-text-field clearable v-model="Filters.Legpers" type="text"></v-text-field>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'HEAD_MANAGER')">
			<v-autocomplete
				v-model="Filters.HeadManager"
				multiple
				:items="HeadManager"
				deletable-chips
				clearable
				chips
			>
			</v-autocomplete>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'MANAGER')">
			<v-autocomplete
				v-model="Filters.Manager"
				multiple
				:items="Manager"
				deletable-chips
				clearable
				chips
			>
			</v-autocomplete>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'PLAN')">
			  <v-switch v-model="Filters.PLAN"></v-switch>
		  </td>
		  <td v-if="computedHeaders.find(header => header.value === 'MARJA_PLAN')" colspan="1"></td>
		  <td v-if="computedHeaders.find(header => header.value === 'FACT')">
			  <v-switch v-model="Filters.FACT"></v-switch>
		  </td>
		  <td v-if="computedHeaders.find(header => header.value === 'MARJA_FACT')" colspan="1"></td>
		  <td v-if="computedHeaders.find(header => header.value === 'PERCENT')" colspan="1"></td>
		  <td v-if="computedHeaders.find(header => header.value === 'OM_SALE')">
			<v-autocomplete
				v-model="Filters.OM_SALE"
				multiple
				:items="OM_SALE"
				deletable-chips
				clearable
				chips
			>
			</v-autocomplete>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'OM_SALE_ZIP')">
			<v-autocomplete
				v-model="Filters.OM_SALE_ZIP"
				multiple
				:items="OM_SALE_ZIP"
				deletable-chips
				clearable
				chips
			>
			</v-autocomplete>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'OM_SERV')">
			<v-autocomplete
				v-model="Filters.OM_SERV"
				multiple
				:items="OM_SERV"
				deletable-chips
				clearable
				chips
			>
			</v-autocomplete>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'OM_IT')">
			<v-autocomplete
				v-model="Filters.OM_IT"
				multiple
				:items="OM_IT"
				deletable-chips
				clearable
				chips
			>
			</v-autocomplete>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'PROJECT')">
            <v-text-field clearable v-model="Filters.Project" type="text"></v-text-field>
          </td>
		  <td v-if="computedHeaders.find(header => header.value === 'CRM')">
			<v-select
				v-model="Filters.CRM"
				:items="['есть', 'нет', 'приостановлен']"
				clearable
			>
			</v-select>
          </td>
          <td v-if="computedHeaders.find(header => header.value === 'action')" colspan="1"></td>
        </tr>
      </template>
	  <template v-slot:item.CRM="{ item }">
		  <v-icon :color="setColorCRM(item.CRM)">mdi-checkbox-marked-circle</v-icon>
	  </template>
	  <template v-slot:item.PLAN="{ item }">
		  {{ item.PLAN ? item.PLAN.toLocaleString('ru') + ' р.' : null }}
	  </template>
	  <template v-slot:item.MARJA_PLAN="{ item }">
		  {{ item.MARJA_PLAN ? item.MARJA_PLAN.toLocaleString('ru') + ' р.' : null }}
	  </template>
	  <template v-slot:item.FACT="{ item }">
		  {{ item.FACT ? item.FACT.toLocaleString('ru') + ' р.' : null }}
	  </template>
	  <template v-slot:item.MARJA_FACT="{ item }">
		  {{ item.MARJA_FACT ? item.MARJA_FACT.toLocaleString('ru') + ' р.' : null }}
	  </template>
	  <template v-slot:item.PERCENT="{ item }">
		  {{ item.FACT ? item.PERCENT + '%' : null}}
	  </template>
	  <template v-slot:item.marker="{ item }">
		  <template v-for="(data, index) in markerName(item.marker)">
			  <v-chip v-if="data" :key="index" label class="mr-2 my-1">{{ data }}</v-chip>
		  </template>
	  </template>
		<template v-slot:item.action="{ item }">
			<v-icon small @click="editItem(item)" :disabled="$acl.not.check('Financier')">edit</v-icon>
            <v-icon class="ml-3" small @click="deleteItem(item)" :disabled="$acl.not.check('Financier')">delete</v-icon>
			<v-btn text fab small left :to="'/clients/' + item.ID">
              	<v-icon>more_horiz</v-icon>
            </v-btn>
    	</template>
      </v-data-table>
	  </template>
	</v-flex>
    </v-layout>
  </v-container>
  <v-container v-else-if="!loadings && Clients.length === 0" fill-height fluid>
	  <v-layout row fill-height align-center>
        	<v-flex xs12 text-center>
          		<v-progress-circular :size="100" color="primary" indeterminate></v-progress-circular>
        	</v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Api from '@/services/Api'
// import { AclRule } from 'vue-acl'
import GetConfig from '@/services/GetConfig'
import _ from 'lodash'
import ProgressDialog from '@/components/shared/ProgressDialog'

export default {
	components: {
		ProgressDialog
	},
	data () {
		return {
			Clients: [],
			Filters: {
				ID: null,
				Name: '',
				Legpers: '',
				HeadManager: [],
				Manager: [],
				OM_SALE: [],
				OM_SALE_ZIP: [],
				OM_SERV: [],
				OM_IT: [],
				Project: '',
				CRM: '',
				PLAN: null,
				MARJA_PLAN: null,
				FACT: null,
				MARJA_FACT: null,
				PERCENT: null
			},
			multiSelects: {
				HeadManager: [],
				Manager: [],
				OM_SALE: [],
				OM_SALE_ZIP: [],
				OM_SERV: [],
				OM_IT: []
			},
			dialog: false,
			checkBox: false,
			menu_filter: false,
			menu: false,
			show: false,
			infoText: '',
			json_fields: {},
			headers: [
				{ text: 'ID',
					value: 'ID',
					selected: localStorage.paysColumn ? localStorage.paysColumn['ID'] : false,
					visible: true,
					filter: value => {
						if (!this.Filters.ID) return true
						return value === +this.Filters.ID
					},
					divider: true,
					width: '120px'
				},
				{ text: 'Бренд',
					value: 'NAME',
					selected: localStorage.paysColumn ? localStorage.paysColumn['NAME'] : false,
					divider: true,
					visible: true,
					filter: value => {
						if (!this.Filters.Name) return true
						return value.toLowerCase().includes(this.Filters.Name.toLowerCase())
					}
				},
				{ text: 'Юрлица',
					value: 'LEGPERS',
					selected: localStorage.paysColumn ? localStorage.paysColumn['LEGPERS'] : false,
					divider: true,
					visible: true,
					filter: value => {
						if (!this.Filters.Legpers) return true
						if (!value) return false
						return value.toLowerCase().includes(this.Filters.Legpers.toLowerCase())
					}
				},
				{ text: 'Куратор',
					value: 'HEAD_MANAGER',
					selected: localStorage.paysColumn ? localStorage.paysColumn['HEAD_MANAGER'] : false,
					divider: true,
					visible: true,
					filter: value => {
						if (this.Filters.HeadManager.length === 0) return true
						if (!value) return false
						return value.includes(this.Filters.HeadManager.find(item => item === value))
					}
				},
				{ text: 'Менеджер',
					value: 'MANAGER',
					selected: localStorage.paysColumn ? localStorage.paysColumn['MANAGER'] : false,
					divider: true,
					visible: true,
					filter: value => {
						if (this.Filters.Manager.length === 0) return true
						if (!value) return false
						return value.includes(this.Filters.Manager.find(item => item === value))
					}
				},
				{ text: 'План',
					value: 'PLAN',
					selected: localStorage.paysColumn ? localStorage.paysColumn['PLAN'] : false,
					divider: true,
					visible: this.$acl.check('Financier'),
					width: 150,
					filter: value => {
						if (!this.Filters.PLAN) return true
						if (!value) return false
						return value
					}
				},
				{ text: 'МП',
					value: 'MARJA_PLAN',
					selected: localStorage.paysColumn ? localStorage.paysColumn['MARJA_PLAN'] : false,
					divider: true,
					visible: this.$acl.check('Financier'),
					width: 150,
					filter: value => {
						if (!this.Filters.MARJA_PLAN) return true
						if (!value) return false
						return value.toLowerCase().includes(this.Filters.MARJA_PLAN.toLowerCase())
					}
				},
				{ text: 'Факт',
					value: 'FACT',
					selected: localStorage.paysColumn ? localStorage.paysColumn['FACT'] : false,
					divider: true,
					visible: this.$acl.check('Financier'),
					width: 150,
					filter: value => {
						if (!this.Filters.FACT) return true
						if (!value) return false
						return value
					}
				},
				{ text: 'Факт без плана',
					value: 'marker',
					selected: localStorage.paysColumn ? localStorage.paysColumn['marker'] : false,
					divider: true,
					visible: this.$acl.check('Financier'),
					width: 185,
					filter: value => {
						if (!this.Filters.marker) return true
						if (!value) return false
						return value.toLowerCase().includes(this.Filters.marker.toLowerCase())
					}
				},
				{ text: 'МФ',
					value: 'MARJA_FACT',
					selected: localStorage.paysColumn ? localStorage.paysColumn['MARJA_FACT'] : false,
					divider: true,
					visible: this.$acl.check('Financier'),
					width: 150,
					filter: value => {
						if (!this.Filters.MARJA_FACT) return true
						if (!value) return false
						return value.toLowerCase().includes(this.Filters.MARJA_FACT.toLowerCase())
					}
				},
				{ text: 'Прогресс',
					value: 'PERCENT',
					selected: localStorage.paysColumn ? localStorage.paysColumn['PERCENT'] : false,
					divider: true,
					visible: this.$acl.check('Financier'),
					width: 150,
					filter: value => {
						if (!this.Filters.PERCENT) return true
						if (!value) return false
						return value.toLowerCase().includes(this.Filters.PERCENT.toLowerCase())
					}
				},
				{ text: 'ОМ Продажи (новое)',
					value: 'OM_SALE',
					selected: localStorage.paysColumn ? localStorage.paysColumn['OM_SALE'] : false,
					divider: true,
					visible: true,
					filter: value => {
						if (this.Filters.OM_SALE.length === 0) return true
						if (!value) return false
						return value.includes(this.Filters.OM_SALE.find(item => item === value))
					}
				},
				{ text: 'ОМ Продажи (склад)',
					value: 'OM_SALE_ZIP',
					selected: localStorage.paysColumn ? localStorage.paysColumn['OM_SALE_ZIP'] : false,
					divider: true,
					visible: true,
					filter: value => {
						if (this.Filters.OM_SALE_ZIP.length === 0) return true
						if (!value) return false
						return value.includes(this.Filters.OM_SALE_ZIP.find(item => item === value))
					}
				},
				{ text: 'ОМ Сервис',
					value: 'OM_SERV',
					selected: localStorage.paysColumn ? localStorage.paysColumn['OM_SERV'] : false,
					divider: true,
					visible: true,
					filter: value => {
						if (this.Filters.OM_SERV.length === 0) return true
						if (!value) return false
						return value.includes(this.Filters.OM_SERV.find(item => item === value))
					}
				},
				{ text: 'ОМ IT',
					value: 'OM_IT',
					selected: localStorage.paysColumn ? localStorage.paysColumn['OM_IT'] : false,
					divider: true,
					visible: true,
					filter: value => {
						if (this.Filters.OM_IT.length === 0) return true
						if (!value) return false
						return value.includes(this.Filters.OM_IT.find(item => item === value))
					}
				},
				{ text: 'Тип',
					value: 'PROJECT',
					selected: localStorage.paysColumn ? localStorage.paysColumn['PROJECT'] : false,
					divider: true,
					visible: true,
					filter: value => {
						if (!this.Filters.Project) return true
						if (!value) return false
						return value.toLowerCase().includes(this.Filters.Project.toLowerCase())
					}
				},
				{ text: 'Статус CRM',
					value: 'CRM',
					selected: localStorage.paysColumn ? localStorage.paysColumn['CRM'] : false,
					divider: true,
					visible: true,
					filter: value => {
						if (!this.Filters.CRM) return true
						if (this.Filters.CRM === 'есть') return (value === 1)
						if (this.Filters.CRM === 'нет') return (value === null)
						if (this.Filters.CRM === 'приостановлен') return (value === 2)
					}
				},
				{ text: 'Ред. / Подробнее', value: 'action', sortable: false, align: 'center', visible: true }
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
	filters: {
		toLocale (item) {
			if (item) {
				return item.toLocaleString('ru')
			}
		}
	},
	computed: {
		computedHeaders () {
			return this.headers.filter(header => header.selected)
		},
		headerVisible () {
			return this.headers.filter(header => header.visible)
		},
		loadings () {
			return this.$store.getters.loadings
		},
		formTitle () {
			return this.editedIndex === -1 ? 'Новый клиент' : 'Редактировать клиента'
		},
		/* Financier () {
			return new AclRule('financier').or('admin').generate()
		}, */
		/* 	Financier () {
			return new AclRule('financier').or('admin').generate()
		}, */
		HeadManager () { return _.uniq(this.multiSelects.HeadManager) },
		Manager () { return _.uniq(this.multiSelects.Manager) },
		OM_SALE () { return _.uniq(this.multiSelects.OM_SALE) },
		OM_SALE_ZIP () { return _.uniq(this.multiSelects.OM_SALE_ZIP) },
		OM_SERV () { return _.uniq(this.multiSelects.OM_SERV) },
		OM_IT () { return _.uniq(this.multiSelects.OM_IT) },
		planSum () {
			const filteredSum = this.$refs.clientsListTable.$children[0].filteredItems.map(arr => arr.PLAN)
			return Math.round(_.sum(filteredSum)).toLocaleString('ru')
		},
		marjaPlanSum () {
			const filteredSum = this.$refs.clientsListTable.$children[0].filteredItems.map(arr => arr.MARJA_PLAN)
			return Math.round(_.sum(filteredSum)).toLocaleString('ru')
		},
		factSum () {
			const filteredSum = this.$refs.clientsListTable.$children[0].filteredItems.map(arr => arr.FACT)
			return Math.round(_.sum(filteredSum)).toLocaleString('ru')
		},
		marjaFactSum () {
			const filteredSum = this.$refs.clientsListTable.$children[0].filteredItems.map(arr => arr.MARJA_FACT)
			return Math.round(_.sum(filteredSum)).toLocaleString('ru')
		}
	},

	watch: {
		dialog (val) {
			val || this.close()
		}
	},
	async created () {
		await GetConfig.getColumn('clientsColumn')
			.then((data) => {
				if (data) {
					this.headers.forEach(header => {
						for (var key in data) {
							if (key === header.value) {
								header.visible ? header.selected = data[key] : header.selected = false
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
	},
	async mounted () {
		let obj = {}
		for (let key in this.Filters) {
			this.$watch(['Filters', key].join('.'), (newVal, oldVal) => {
				if (newVal === null) newVal = ''
				obj[key] = newVal
				localStorage.setItem('filtersClients', JSON.stringify(obj))
			})
		}
		if (localStorage.filtersClients) {
			var ls = JSON.parse(localStorage.filtersClients)
			if (ls) {
				Object.keys(this.Filters).forEach(key => {
					Object.entries(ls).forEach((item) => {
						if (JSON.parse(localStorage.getItem('filtersClients'))[item[0]] && JSON.parse(localStorage.getItem('filtersClients'))[item[0]] !== 'null' && item[0] === key) {
							this.Filters[item[0]] = JSON.parse(localStorage.getItem('filtersClients'))[item[0]]
						}
					})
				})
			}
		}
		await Api()
			.get('clients')
			.then(res => {
				this.Clients = Object.values(res.data)
				this.lastItemId = this.Clients[this.Clients.length - 1].ID
				this.Clients.forEach(client => {
					client.PLAN = (client.AIDC_SALE + client.AIDC_SALE_ZIP + client.AIDC_SERV + client.IT)
					client.FACT = (client.FACT_AIDC_SALE + client.FACT_AIDC_SALE_ZIP + client.FACT_AIDC_SERV + client.FACT_IT)
					client.MARJA_PLAN = (client.AIDC_SALE * client.P_SALE + client.AIDC_SALE_ZIP * client.P_SALE_ZIP + client.AIDC_SERV * client.P_SERV + client.IT * client.P_IT)
					if (client.FACT) client.MARJA_FACT = (client.FACT_AIDC_SALE * client.P_SALE + client.FACT_AIDC_SALE_ZIP * client.P_SALE_ZIP + client.FACT_AIDC_SERV * client.P_SERV + client.FACT_IT * client.P_IT)
					if (client.PLAN) client.PERCENT = Math.round((client.MARJA_FACT / client.MARJA_PLAN) * 100).toFixed(1)
					if (client.HEAD_MANAGER) this.multiSelects.HeadManager.push(client.HEAD_MANAGER)
					if (client.MANAGER) this.multiSelects.Manager.push(client.MANAGER)
					if (client.OM_SALE) this.multiSelects.OM_SALE.push(client.OM_SALE)
					if (client.OM_SALE_ZIP) this.multiSelects.OM_SALE_ZIP.push(client.OM_SALE_ZIP)
					if (client.OM_SERV) this.multiSelects.OM_SERV.push(client.OM_SERV)
					if (client.OM_IT) this.multiSelects.OM_IT.push(client.OM_IT)
				})
			})
			.catch(err => {
				console.log(err)
			})
	},
	methods: {
		async getExel () {
			const filtered = await this.headers.filter(header => header.selected === true)
			filtered.forEach(item => {
				this.json_fields[item.text] = item.value
			})
			return this.$refs.clientsListTable.$children[0].filteredItems
		},
		setColorCRM (item) {
			if (item === null) return 'grey'
			if (item === 1) return 'success'
			if (item === 2) return 'orange'
		},
		markerName (item) {
			return item.split(' ')
		},
		resetFilter () {
			for (let key in this.Filters) {
				if (typeof this.Filters[key] === 'object' && (this.Filters[key] instanceof Array)) {
					this.Filters[key] = []
				} else if (typeof this.Filters[key] === 'object' && this.Filters[key] !== null) {
					this.Filters[key] = {}
				} else {
					this.Filters[key] = ''
				}
			}
			this.menu_filter = false
			this.$router.replace({
				...this.$router.currentRoute,
				query: {}
			})
		},
		saveColumnFB () {
			let clientsColumn = {}
			let id = 'clientsColumn'
			this.headers.forEach(header => {
				header.selected === null || header.selected === undefined ? clientsColumn[header.value] = false : clientsColumn[header.value] = header.selected
			})
			this.menu = false
			this.$store.dispatch('createLocalStorage', [clientsColumn, id])
		},
		showAllColumn () {
			this.headers.forEach(header => {
				header.selected = true
			})
		},
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
				console.log(this.editedItem)
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

