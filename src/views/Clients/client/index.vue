<template>
  <v-container fluid>
	<v-card class="mx-auto pa-5 mb-3">
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
					>
					</v-progress-linear>
				</v-flex>
				<v-flex xs6 class="text-right">
					<v-btn @click="goBack()" color="warning">Вернуться назад</v-btn>
				</v-flex>
			</v-layout>
		</v-container>
	</v-card>
    <v-tabs
		icons-and-text
		v-model="active"
		grow
		background-color="grey lighten-3"
	>
      <v-tabs-slider></v-tabs-slider>

      <v-tab href="#tab-2" @click="search = ''">Договоры
		  <v-icon color="blue darken-2">mdi-file-document</v-icon>
      </v-tab>
      <v-tab href="#tab-3" @click="search = ''">Спеццены
		  <v-icon color="blue darken-2">mdi-currency-rub</v-icon>
      </v-tab>
	  <v-tab href="#tab-1" @click="search = ''">Серийные номера
		  <v-icon color="blue darken-2">mdi-numeric</v-icon>
      </v-tab>
	  <v-tab href="#tab-crm" @click="search = ''">CRM
		  <v-icon color="blue darken-2">mdi-account-card-details</v-icon>
      </v-tab>
		<!-- таб № 1 -->
      <v-tab-item :value="'tab-1'" class="">

        <div v-if="loading">
          <v-layout row>
            <v-flex xs12 class="text-center pt-5">
              <v-progress-circular color="primary" indeterminate :size="100"></v-progress-circular>
            </v-flex>
          </v-layout>
        </div>

        <div v-else-if="SerialNumbers.length !== 0 && !loading">
			<v-layout>
			<v-flex xs4>
              <v-text-field
                prepend-icon="search"
                label="Поиск"
                placeholder="Введите данные для поиска"
                v-model="searchSN"
                single-line
                clearable
              ></v-text-field>
            </v-flex>

			<v-spacer></v-spacer>

			<v-flex xs4 sm2 md1 class="text-right">
			<v-dialog v-model="dialogSN" max-width="500px" persistent>
				<template v-slot:activator="{ on }">
					<v-btn v-on="$acl.check('Edit') ? on : ''" color="primary" dark :disabled="$acl.check('Edit')">
						<v-icon class="mr-2">add</v-icon>Добавить
					</v-btn>
				</template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitleSN }}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12>
                    <v-text-field
						v-model="editedItemSN.Model"
						label="Модель"
						:rules="textRules"
						required
						validation
						ref="modelSN"
					>
					</v-text-field>
                  </v-flex>
				  <v-flex xs12>
                    <v-text-field
						v-model="editedItemSN.SN"
						label="SN"
						:rules="textRules"
						required
						validation
						ref="SN"
					>
					</v-text-field>
                  </v-flex>
				  <v-flex xs12>
                    <v-text-field
						v-model="editedItemSN.Contract"
						label="№ договора"
						:rules="textRules"
						required
						validation
						ref="contractSN"
					>
					</v-text-field>
                  </v-flex>
				  <v-flex xs12 v-if="editedIndexSN === -1">
                    <v-combobox
						v-if="editedIndexSN === -1"
						v-model="editedItemSN.SPEC"
						:items="contracts"
						:item-text="IKEYPlusSumm"
						ref="specSN"
						label="* Спецификация"
						small-chips
						solo
						required
						validation
						:rules="textRules"
						clearable
						return-object
                    ></v-combobox>
                  </v-flex>
				  <v-flex xs12>
					<v-menu
						ref="menu"
						v-model="menu"
						:close-on-content-click="false"
						:nudge-right="40"
						lazy
						transition="scale-transition"
						offset-y
						full-width
						min-width="290px"
					>
						<span slot="activator">
						<v-text-field
							v-model="editedItemSN.ENDDATE"
							ref="enddateSN"
							label="Срок окончания"
							prepend-icon="event"
							readonly
						></v-text-field>
						</span>
						<v-date-picker scrollable locale="ru" v-model="editedItemSN.ENDDATE" @input="menu = false"></v-date-picker>
					</v-menu>
					</v-flex>
				  <v-flex xs12>
                    <v-text-field
						v-model="editedItemSN.TSDN"
						label="Доп.инфо"
						:rules="textRules"
						required
						validation
						ref="tsdnSN"
					>
					</v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click.native="close">Отмена</v-btn>
              <v-btn color="blue darken-1" text @click.native="saveSN">Сохранить</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
		</v-flex>
		</v-layout>

          <v-data-table
            :headers="headers_sn"
            :items="SerialNumbers"
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
        class="elevation-2 mb-2"
          >
            <template v-slot:items=" { item } ">
			<td class="text-left">{{ item.ID }}</td>
              <td class="text-left">{{ item.Model }}</td>
              <td class="text-left">{{ item.SN }}</td>
              <td class="text-left">{{ item.Contract }}</td>
			  <td class="text-left">{{ item.SPEC }}</td>
			  <td class="text-left">{{ getDateSN(item.ENDDATE, 'ENDDATE') }}</td>
			  <td class="text-left">{{ item.TSDN }}</td>
			  <td class="text-left">{{ item.EMAIL !== null ? item.EMAIL.split('@')[0] : item.EMAIL }}</td>
			  <td class="text-left">{{ getDateSN(item.DATE, 'DATE') }}</td>
			  <td class="justify-center layout px-0">
            	<v-icon small @click="editItemSN(item)" :disabled="$acl.not.check('Edit')">edit</v-icon>
            	<v-icon class="ml-3" small @click="deleteItemSN(item)" :disabled="$acl.not.check('Edit')">delete</v-icon>
          	</td>
            </template>

            <template slot="no-data">
              <v-btn color="primary">Сброс</v-btn>
            </template>
          </v-data-table>
        </div>

        <div v-else-if="SerialNumbers.length === 0 && !loading">
		   <v-container>
    			<v-row justify="center" align="center" style="height: 300px;">
        			У клиента отсутствуют серийные номера
    			</v-row>
			</v-container>
        </div>
      </v-tab-item>

	  <!-- таб № 2 -->

      <v-tab-item :value="'tab-2'" class="mt-3">

		<div v-if="ClientContracts.length > 0 && loading">
			<v-container fill-height>
				<v-layout row>
            		<v-flex xs12 class="text-center pt-5">
              			<v-progress-circular color="primary" indeterminate :size="100"></v-progress-circular>
            		</v-flex>
          		</v-layout>
			</v-container>
        </div>
        <div v-else>
          <v-data-table
            :headers="headers_contr"
            :items="ClientContracts"
            fixed-header
			calculate-widths
			:search="search"
			:items-per-page=50
			:mobile-breakpoint="550"
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
        class="elevation-2 mt-4"
          >
            <template v-slot:item="{ item }">
              <tr class="cursor_btn" v-if="item.DOG_TYPE === 'Спецификация (разовый ремонт)'" @click="goToTab(item.ISSUEKEY, item.SUMMARY, 'tab-3')">
                <td class="text-left grey--text pl-5">
                  <v-icon>subdirectory_arrow_right</v-icon>
                  <img v-if="item.DOG_TYPE === 'Спецификация (разовый ремонт)'"
                    class="pl-2"
                    src="http://support.tsd-group.ru/secure/viewavatar?size=xsmall&avatarId=14702&avatarType=issuetype"
                  >
                  {{ item.DOG_TYPE }}
                </td>
                <td class="text-left grey--text">{{ item.ISSUEKEY }}</td>
                <td class="text-left grey--text">{{ item.NOM_DOG }}</td>
                <td class="text-left grey--text">{{ item.STATUS }}</td>
                <td class="text-left grey--text">{{ item.SUMMARY }}</td>
              </tr>
			  <tr class="cursor_btn" v-else-if="item.DOG_TYPE === 'Спецификация (контракт)'" @click="goToTab(item.ISSUEKEY, item.SUMMARY, 'tab-1')">
                <td class="text--left grey--text pl-5">
                  <v-icon>subdirectory_arrow_right</v-icon>
				  <img v-if="item.DOG_TYPE === 'Спецификация (контракт)'"
                    class="pl-2"
                    src="http://support.tsd-group.ru/secure/viewavatar?size=xsmall&avatarId=11506&avatarType=issuetype"
                  >
                  {{ item.DOG_TYPE }}
                </td>
                <td class="text-left grey--text">{{ item.ISSUEKEY }}</td>
                <td class="text-left grey--text">{{ item.NOM_DOG }}</td>
                <td class="text-left grey--text">{{ item.STATUS }}</td>
                <td class="text-left grey--text">{{ item.SUMMARY }}</td>
              </tr>
              <tr v-else>
                <td class="text--left">
                  <img
                    class="pr-2"
                    src="http://support.tsd-group.ru/secure/viewavatar?size=xsmall&avatarId=11507&avatarType=issuetype"
                  >
                  {{ item.DOG_TYPE }}
                </td>
                <td class="text-left">{{ item.ISSUEKEY }}</td>
                <td class="text-left">{{ item.NOM_DOG }}</td>
                <td class="text-left">{{ item.STATUS }}</td>
                <td class="text-left">{{ item.SUMMARY }}</td>
              </tr>
            </template>
			<template v-slot:no-data>
        		ДОГОВОРЫ ОТСТУТСТВУЮТ.
      		</template>
          </v-data-table>
        </div>
      </v-tab-item>

		<!-- таб № 3 -->

      <v-tab-item :value="'tab-3'" class="mt-3">
        <div v-if="loading">
          <v-layout row>
            <v-flex xs12 class="text-center pt-5">
              <v-progress-circular color="primary" indeterminate :size="80"></v-progress-circular>
            </v-flex>
          </v-layout>
        </div>

        <div v-else-if="Specprices.length > 0 && !loading">
          <v-layout>
            <v-flex xs4>
              <v-text-field
                class="mb-2"
                prepend-icon="search"
                label="Поиск"
                placeholder="Введите данные для поиска"
                v-model="search"
                single-line
                clearable
              ></v-text-field>
            </v-flex>

            <v-spacer></v-spacer>

            <v-flex xs4 sm2 md1>
              <v-dialog v-model="dialog" max-width="500px" persistent>
				  <template v-slot:activator=" { on } ">
					    <v-btn v-on="$acl.check('Edit') ? on : ''" color="primary" dark :disabled="$acl.check('Edit')">
							<v-icon class="mr-2">add</v-icon>Добавить
						</v-btn>
				  </template>
                <v-card>
                  <v-card-title>
                    <span
                      class="headline info--text"
                    >{{ formTitle }}: {{ editedItem.ZIPNAME }} {{ editedItem.ART }}</span>
                  </v-card-title>
                  <v-card-text>
                    <v-container grid-list-md text-center>
                      <v-layout wrap row>
                        <v-flex xs12>
                        	<v-autocomplete
								:items="Zip"
								v-model="objZip"
								:item-text="namePlusArt"
								label="* ЗИП"
								ref="zip"
								required
								validation
								:rules="textRules"
								clearable
								return-object
							>
							</v-autocomplete>
                        </v-flex>
                        <v-flex xs12>
                          <v-combobox
                            v-if="editedIndex === -1"
                            v-model="editedItem.SPEC"
                            :items="contractKey"
                            label="* Спецификация"
                            small-chips
                            solo
                            required
                            validation
                            :rules="textRules"
                            clearable
                          ></v-combobox>
                        </v-flex>
                        <v-flex xs12>
                          <v-text-field
                            v-model="editedItem.alias"
                            label="* Псевдоним"
                            ref="alias"
                            required
                            validation
                            :rules="textRules"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs9>
                          <v-text-field
                            v-model="editedItem.price"
                            label="* Цена"
                            ref="price"
                            :rules="priceRules"
                            required
                            validation
                          ></v-text-field>
                        </v-flex>
						<v-flex xs3>
							<v-combobox
								v-model="objCur.name"
								label="Валюта"
								:items="Currency"
								item-text = 'name'
								single-line
								required
							>
							</v-combobox>
						</v-flex>
						<v-flex xs6>
                    		<v-switch
							v-if="editedIndex !== -1"
							readonly
							label="Цена с НДС"
							v-model="editedItem.nds"
							color="info">
							</v-switch>
                  		</v-flex>
						<v-flex xs6>
                    		<v-switch
							label="Дубликат"
							v-model="editedItem.duplicate"
							color="info">
							</v-switch>
                  		</v-flex>
                      </v-layout>
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="blue darken-1"
                      text
                      :disabled="localLoading"
                      @click.native="close"
                    >Отмена</v-btn>
                    <v-btn
                      color="blue darken-1"
                      text
                      :disabled="localLoading"
                      :loading="localLoading"
                      @click.native="save"
                    >Сохранить</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-flex>
          </v-layout>

          <v-data-table
            :headers="headers_specprices"
            :items="Specprices"
            fixed-header
			calculate-widths
			:search="search"
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
			class="elevation-2 mb-2"
          >
            <template v-slot:item="{ item }">
			<tr>
              <td>{{ item.ID }}</td>
              <td>{{ item.SPEC }}</td>

              <td
                class="text--left"
                v-if="typeof(item.product) === 'number'"
              >{{ getName(item.product) }}</td>
              <td v-else>{{ item.product }}</td>
              <td>{{ item.alias }}</td>
              <td>{{ item.ART }}</td>
              <td>{{ item.price }}
                <v-icon v-if="item.currency === 1 && item.price" color="blue" small>mdi-currency-rub</v-icon>
				<v-icon v-else-if="item.currency === 2 && item.price" color="yellow darken-2" small>mdi-currency-eur</v-icon>
				<v-icon v-else-if="item.currency === 3 && item.price" color="green" small>mdi-currency-usd</v-icon>
              </td>
			  <td>{{ item.pricends }}
                <v-icon v-if="item.currency === 1 && item.pricends" color="blue" small>mdi-currency-rub</v-icon>
				<v-icon v-else-if="item.currency === 2 && item.pricends" color="yellow darken-2" small>mdi-currency-eur</v-icon>
				<v-icon v-else-if="item.currency === 3 && item.pricends" color="green" small>mdi-currency-usd</v-icon>
              </td>
			  <td>{{ item.duplicate }}</td>
              <td>{{ item.EMAIL !== null ? item.EMAIL.split('@')[0] : item.EMAIL }}</td>
              <td>{{ getDate(item.DATE, 'Specprices') }}</td>

              <td class="justify-center layout px-0">
                <v-icon small @click="editItem(item)" :disabled="$acl.not.check('Edit')">edit</v-icon>
                <v-icon class="ml-3" small @click="deleteItem(item)" :disabled="$acl.not.check('Edit')">delete</v-icon>
              </td>
			  </tr>
            </template>
          </v-data-table>
        </div>

        <div v-else-if="Specprices.length === 0 && !loading">
          <v-layout>
            <v-flex xs12 class="text-center">
              <v-spacer></v-spacer>

              <v-dialog v-model="dialog" max-width="500px" persistent>
				  <template v-slot:activator=" { on } ">
					  	<v-btn v-on="$acl.check('Edit') ? on : ''" color="primary" dark class="mt-5" :disabled="$acl.not.check('Edit')">
							<v-icon class="mr-2">add</v-icon>Добавить
						</v-btn>
				  </template>
                <v-card>
                  <v-card-title>
                    <span
                      class="headline info--text"
                    >{{ formTitle }}: {{ editedItem.ZIPNAME }} {{ editedItem.ART }}</span>
                  </v-card-title>
                  <v-card-text>
                    <v-container grid-list-md text-center>
                      <v-layout wrap row>
						  <v-flex xs12>
                        	<v-autocomplete
								:items="Zip"
								v-model="objZip"
								:item-text="namePlusArt"
								label="* ЗИП"
								required
								validation
								:rules="textRules"
								clearable
								return-object
							>
								<!-- <template slot="selection" slot-scope="data">
 									 {{ data.item.NAME }} - {{ data.item.ART }}
								</template> -->
							</v-autocomplete>
                        </v-flex>
                        <v-flex xs12>
                          <v-combobox
                            v-if="editedIndex === -1"
                            v-model="editedItem.SPEC"
                            :items="contractKey"
                            label="* Спецификация"
                            small-chips
                            solo
                            required
                            validation
                            :rules="textRules"
                            clearable
                          ></v-combobox>
                        </v-flex>
                        <v-flex xs12>
                          <v-text-field
                            v-model="editedItem.alias"
                            label="* Псевдоним"
                            ref="alias"
                            required
                            validation
                            :rules="textRules"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs9>
                          <v-text-field
                            v-model="editedItem.price"
                            label="* Цена"
                            ref="price"
                            :rules="priceRules"
                            required
                            validation
                          ></v-text-field>
                        </v-flex>
						<v-flex xs3>
							<v-combobox
								v-model="objCur.name"
								label="Валюта"
								:items="Currency"
								item-text = 'name'
								single-line
								required
							>
							</v-combobox>
						</v-flex>
                      </v-layout>
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="blue darken-1"
                      text
                      :disabled="localLoading"
                      @click.native="close"
                    >Отмена</v-btn>
                    <v-btn
                      color="blue darken-1"
                      text
                      :disabled="localLoading"
                      :loading="localLoading"
                      @click.native="save"
                    >Сохранить</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-flex>
          </v-layout>
          <v-container>
    			<v-row justify="center" align="center" style="height: 300px;">
        			У клиента отсутствуют спеццены.
    			</v-row>
			</v-container>
        </div>
      </v-tab-item>
	  <!-- карточка CRM клиента -->
	  <v-tab-item :value="'tab-crm'" >
		  <Crm v-if="crmAccess" :id="id" :statusCRM="statusCRM"></Crm>
		  <v-container v-else-if="!crmAccess && !userRole">
    			<v-row justify="center" align="center" style="height: 300px;">
        			<v-progress-circular :size="100" color="primary" indeterminate></v-progress-circular>
    			</v-row>
			</v-container>
			<v-container v-else>
    			<v-row justify="center" align="center" style="height: 300px;">
        			У вас нет доступа к содержимому этого раздела! Обратитесь к вашему руководителю.
    			</v-row>
			</v-container>
	  </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import moment from 'moment'
import Api from '@/services/Api'
// import ClientList from '../list'
import Crm from './crm/index'
import { AclRule } from 'vue-acl'

export default {
	props: ['id'],
	data () {
		return {
			window: 0,
			search: '',
			searchSN: '',
			menu: false,
			dialog: false,
			dialogSN: false,
			localLoading: false,
			active: 'tab-2',
			tab: '',
			items: [{ title: 'Псевдонимы' }, { title: 'Договора' }],
			headers_sn: [
				{ text: 'ID', value: 'ID' },
				{ text: 'Модель', value: 'Model' },
				{ text: 'SN', value: 'SN' },
				{ text: '№ договора', value: 'Contract' },
				{ text: 'Спецификация', value: 'SPEC' },
				{ text: 'Срок действия', value: 'ENDDATE' },
				{ text: 'Доп.инфо', value: 'TSDN' },
				{ text: 'Авт', value: 'EMAIL' },
				{ text: 'Изм', value: 'DATE' },
				{ text: 'Ред', value: 'actions', sortable: false, align: 'center' }
			],
			headers_contr: [
				{ text: 'Тип', value: 'DOG_TYPE', sortable: false },
				{ text: 'Ключ', value: 'ISSUEKEY', sortable: false },
				{ text: '№ договора', value: 'NOM_DOG', sortable: false },
				{ text: 'Статус', value: 'STATUS', sortable: false },
				{ text: 'Описание', value: 'SUMMARY', sortable: false }
			],
			headers_specprices: [
				{ text: 'ID', value: 'ID' },
				{ text: 'Спецификация', value: 'SPEC' },
				{ text: 'ЗИП', value: 'ZIPNAME' },
				{ text: 'Псевдоним', value: 'alias' },
				{ text: 'Артикул 1С', value: 'ART' },
				{ text: 'Спеццена', value: 'price', align: 'rigth' },
				{ text: 'Спеццена (с НДС)', value: 'pricends', align: 'rigth' },
				{ text: 'Дубль', value: 'duplicate' },
				{ text: 'Автор', value: 'EMAIL' },
				{ text: 'Дата изменения', value: 'DATE' },
				{ text: 'Ред', value: 'actions' }
			],
			priceRules: [
				v => !!v || 'Цена - обязательный параметр!',
				v => /^[0-9.]+$/.test(v) || 'Допускаются только цифры c точкой!'
			],
			textRules: [v => !!v || 'Псевдоним - обязательный параметр!'],
			pagination: {'sortBy': 'ID', 'descending': true},
			SerialNumbers: [],
			Specprices: [],
			Currency: [],
			ClientList: [],
			objZip: {},
			objCur: {},
			ContractKey: [],
			editedIndex: -1,
			editedIndexSN: -1,
			lastItemId: null,
			editedItem: {
				ID: null,
				price: '',
				currency: '',
				client: null,
				product: '',
				ART: '',
				SPEC: '',
				duplicate: false
			},
			editedItemSN: {},
			defaultItem: {
				product: '',
				price: '',
				currency: '',
				ART: '',
				SPEC: '',
				client: null,
				duplicate: false
			}
		}
	},
	methods: {
		getSerialNumbers (clientId) {
			try {
				this.SerialNumbers = this.$store.getters.sn.filter(
					a => a.Client === parseInt(clientId)
				)
			} catch (error) {
				this.$store.commit('setError', error.message)
			}
		},
		getName (id) {
			var obj = {}

			obj = this.$store.getters.zip.find(x => x.zipID === id)
			for (var key in obj) {
				if (key === 'zipNAME') {
					return obj[key] + ' {' + obj.zipID + '}'
				}
			}
		},
		getCur (id) {
			var obj = {}

			obj = this.$store.getters.currency.find(x => x.id === id)

			for (var key in obj) {
				if (key === 'name') {
					return obj[key]
				}
			}
		},
		getZipId (name) {
			var obj = {}

			obj = this.$store.getters.zip.find(x => x.zipNAME === name)
			console.log(obj)
			for (var key in obj) {
				if (key === 'zipID') {
					return obj.zipID
				}
			}
		},
		/* getContracts (clientId) {
			this.Contracts = this.$store.getters.contracts.filter(a => a.client === parseInt(clientId))
		}, */
		getSpecprices (clientId) {
			try {
				this.Specprices = this.$store.getters.specprices.filter(
					a => a.client === parseInt(clientId)
				)
				let i = this.$store.getters.specprices.length - 1
				this.lastItemId = this.$store.getters.specprices[i].ID
			} catch (error) {
				this.$store.commit('setError', error.message)
			}
		},
		getDateSN (date, item) {
			if (item === 'DATE') {
				var dt = this.SerialNumbers.find(a => a.DATE === date).DATE
				return moment(new Date(dt)).format('YYYY.MM.DD HH:mm')
			} else {
				dt = this.SerialNumbers.find(a => a.ENDDATE === date).ENDDATE
				return moment(new Date(dt)).format('YYYY.MM.DD')
			}
		},
		getDate (date, array) {
			if (array === 'Specprices') {
				var dt = this.Specprices.find(a => a.DATE === date).DATE
				return moment(new Date(dt)).format('YYYY.MM.DD HH:mm')
			}
		},
		close () {
			this.dialog = false
			this.dialogSN = false
			this.localLoading = false

			setTimeout(() => {
				this.editedItem = Object.assign({}, this.defaultItem)
				this.editedItemSN = Object.assign({}, this.defaultItemSN)
				this.editedIndex = -1
				this.editedIndexSN = -1
			}, 300)
		},
		save () {
			const myDate = moment(new Date()).format('YYYY.MM.DD HH:mm')
			if (this.editedIndex > -1) {
				if (this.$refs.price.validate() && this.$refs.alias.validate() && this.$refs.zip.validate()) {
					this.localLoading = true
					this.deleteProps(this.editedItem, [
						'ART',
						'SPEC',
						'ZIPNAME',
						'EMAIL',
						'DATE'
					])
					this.editedItem.price = parseFloat(this.editedItem.price)
					this.editedItem.email = this.$store.getters.currentUser.email
					this.editedItem.product = this.objZip.zipID
					if (typeof (this.objCur.name) === 'object') {
						this.editedItem.currency = this.objCur.name.id
					} else {
						let obj = this.$store.getters.currency.find(c => c.name === this.objCur.name)
						this.editedItem.currency = obj.id
					}
					Api()
						.post('specprices/edit', this.editedItem)
						.then(response => {
							this.$store.commit('setData', response.data)

							this.editedItem.DATE = moment(new Date()).format(
								'YYYY.MM.DD HH:mm'
							)
							if (this.editedItem.nds && this.editedItem.nds === true) {
								this.editedItem.pricends = parseFloat(this.editedItem.price)
								this.editedItem.price = parseFloat((this.editedItem.price / 1.2).toFixed(2))
							} else {
								this.editedItem.pricends = parseFloat((this.editedItem.price * 1.2).toFixed(2))
							}
							this.editedItem.ART = this.objZip.zipART
							this.editedItem.EMAIL = this.$store.getters.currentUser.email
							this.editedItem.duplicate ? this.editedItem.duplicate = 1 : this.editedItem.duplicate = ''
							this.objCur.name = this.objCur.name.name
							Object.assign(this.Specprices[this.editedIndex], this.editedItem)
							this.localLoading = false
							this.close()
						})
						.catch(error => {
							this.$store.commit('setError', error.message)
						})
				} else {
					this.$store.commit('setError', ' Заполните соответствующие поля! ')
				}
			} else {
				if (this.$refs.price.validate() && this.$refs.alias.validate()) {
					this.localLoading = true
					let userId = this.$store.getters.currentUser.email
					let spec = this.$store.getters.contractkey.find(
						x =>
							x.IKEY.trim() ===
								this.editedItem.SPEC.replace(/\{.*\}/gm, '').trim()
					)
					Api()
						.post('specprices/nds', [spec.IKEY])
						.then(response => {
							let editedItem = []
							if (Object.values(response.data.nds[0])[0] !== null) {
								this.editedItem.pricends = parseFloat(this.editedItem.price)
								this.editedItem.price = parseFloat((this.editedItem.price / 1.2).toFixed(2))
							} else {
								this.editedItem.pricends = this.editedItem.price * 1.2
							}
							editedItem.push(
								parseInt(this.id),
								parseInt(this.objZip.zipID),
								parseInt(spec.SPECID),
								this.editedItem.alias,
								this.editedItem.pricends,
								this.editedItem.price,
								parseInt(this.objCur.name.id),
								userId,
								myDate
							)
							Api()
								.post('specprices/new', editedItem)
								.then(response => {
									this.$store.commit('setData', response.data)
									this.$store.commit('setLoading', false)

									this.editedItem.DATE = moment(new Date()).format(
										'YYYY.MM.DD HH:mm'
									)
									this.editedItem.EMAIL = this.$store.getters.currentUser.email
									this.editedItem.ART = this.objZip.zipART
									this.editedItem.product = this.objZip.zipNAME
									this.editedItem.SPEC = spec.IKEY
									this.editedItem.ID = parseInt(response.data.lastItemId)
									this.editedItem.client = parseInt(this.id)
									this.editedItem.currency = this.objCur.name.id
									this.editedItem.duplicate ? this.editedItem.duplicate = 1 : this.editedItem.duplicate = ''

									this.Specprices.push(this.editedItem)
									this.$store.commit('setData', response.data.success)
									// this.lastItemId = parseInt(id)

									this.close()
								})
								.catch(error => {
									this.localLoading = false
									this.$store.commit('setError', error.message)
								})
						})
				} else {
					this.$store.commit('setError', ' Заполните соответствующие поля! ')
				}
			}
		},
		saveSN () {
			if (this.editedIndexSN > -1) {
				if (this.$refs.modelSN.validate() && this.$refs.SN.validate() && this.$refs.contractSN.validate() && this.$refs.tsdnSN.validate()) {
					Api()
						.post('serial_numbers/edit', this.editedItemSN)
						.then(response => {
							this.$store.commit('setData', response.data)
							this.editedItemSN.DATE = moment(new Date()).format('YYYY-MM-DD HH:mm')
							Object.assign(this.SerialNumbers[this.editedIndexSN], this.editedItemSN)
							this.localLoading = false
							this.close()
						})
						.catch(error => {
							this.localLoading = false
							this.$store.commit('setError', error.message)
						})
				} else {
					this.$store.commit('setError', ' Заполните соответствующие поля! ')
				}
			} else {
				if (this.$refs.modelSN.validate() && this.$refs.SN.validate() && this.$refs.enddateSN.validate() && this.$refs.specSN.validate() && this.$refs.contractSN.validate() && this.$refs.tsdnSN.validate()) {
					this.editedItemSN.EMAIL = this.$store.getters.currentUser.email
					this.editedItemSN.CLIENT = parseInt(this.id)
					Api()
						.post('serial_numbers/add', this.editedItemSN)
						.then(response => {
							this.$store.commit('setData', response.data.success)
							this.editedItemSN.DATE = moment(new Date()).format('YYYY-MM-DD HH:mm')
							this.editedItemSN.ID = response.data.lastId
							this.editedItemSN.SPEC = this.editedItemSN.SPEC.IKEY
							this.SerialNumbers.push(this.editedItemSN)
							this.localLoading = false
							this.close()
						})
						.catch(error => {
							this.localLoading = false
							this.$store.commit('setError', error.message)
						})
				} else {
					this.$store.commit('setError', ' Заполните соответствующие поля! ')
				}
			}
		},
		editItem (item) {
			this.dialog = true
			Api()
				.post('specprices/nds', [item.SPEC])
				.then(response => {
					this.editedIndex = this.Specprices.indexOf(item)
					this.editedItem = Object.assign({}, item)
					this.editedItem.product = item.ZIPNAME
					typeof item.product === 'number' ? this.objZip = this.Zip.find(z => z.zipID === item.product) : this.objZip = this.Zip.find(z => z.zipNAME === item.product)
					this.objCur.name = this.getCur(item.currency)
					this.editedItem.email = this.$store.getters.currentUser.email
					if (Object.values(response.data.nds[0])[0] !== null) {
						this.editedItem.nds = true
						this.editedItem.price = this.editedItem.pricends
					}
				})
		},
		editItemSN (item) {
			this.editedIndexSN = this.SerialNumbers.indexOf(item)
			this.editedItemSN = Object.assign({}, item)
			this.editedItemSN.ENDDATE = moment(new Date(this.editedItemSN.ENDDATE)).format('YYYY-MM-DD')
			this.editedItemSN.EMAIL = this.$store.getters.currentUser.email
			this.dialogSN = true
		},
		deleteItem (item) {
			this.$store.commit('clearError')
			this.$store.commit('setLoading', true)
			var index = this.Specprices.indexOf(item)
			if (
				confirm('Вы уверены, что хотите удалить этот элемент ' + item.ID + ' ?')
			) {
				Api()
					.post('specprices/del', [item.ID])
					.then(response => {
						this.Specprices.splice(index, 1)
						this.$store.commit('setData', response.data)
						this.$store.commit('setLoading', false)
					})
					.catch(error => {
						this.$store.commit('setLoading', false)
						this.$store.commit('setError', error.message)
					})
			} else {
				this.$store.commit('setLoading', false)
				this.$store.commit('setData', 'Удаление отменено')
			}
		},
		deleteItemSN (item) {
			this.$store.commit('clearError')
			this.$store.commit('setLoading', true)
			let indexSN = this.SerialNumbers.indexOf(item)
			let email = this.$store.getters.currentUser.email
			if (
				confirm('Вы уверены, что хотите удалить этот элемент ' + item.ID + ' ?')
			) {
				Api()
					.post('serial_numbers/del', [item.ID, email])
					.then(response => {
						this.SerialNumbers.splice(indexSN, 1)
						this.$store.commit('setData', response.data)
						this.$store.commit('setLoading', false)
					})
					.catch(error => {
						this.$store.commit('setLoading', false)
						this.$store.commit('setError', error.message)
					})
			} else {
				this.$store.commit('setLoading', false)
				this.$store.commit('setData', 'Удаление отменено')
			}
		},
		deleteProps (obj, prop) {
			for (let p of prop) {
				p in obj && delete obj[p]
			}
		},
		goToTab (issuekey, summary, tab) {
			if (tab === 'tab-3') {
				this.active = 'tab-3'
				this.search = issuekey
				this.editedItem.SPEC = this.defaultItem.SPEC =
				issuekey + ' {' + summary + '}'
			}
			if (tab === 'tab-1') {
				this.active = 'tab-1'
				this.searchSN = issuekey
				this.editedItemSN.SPEC = issuekey + ' {' + summary + '}'
			}
		},
		init () {
			if (window.location.hash === '#tab-3') {
				this.active = 'tab-3'
			}
		},
		clearSearch () {
			this.search = ''
		},
		goBack () {
			this.$router.go(-1)
		},
		getCurrency () {
			this.Currency = this.$store.getters.currency
		},
		namePlusArt: item => item.zipNAME + ' — ' + item.zipART,
		IKEYPlusSumm: item => item.IKEY + ' — ' + item.SUMMARY
	},
	computed: {
		clients () {
			return this.$store.getters.clients
		},
		ClientContracts () {
			return this.$store.getters.contracts.filter(a => a.client === parseInt(this.id))
		},
		Zip () {
			return this.$store.getters.zip
		},
		zipName () {
			return this.$store.getters.zip.map(function (o) {
				return o['zipNAME'] + ' {' + o['zipART'] + '}'
			})
		},
		contractKey () {
			return this.$store.getters.contractkey

				.filter(a => a.ID === parseInt(this.id))
				.map(function (o) {
					return o['IKEY'] + ' {' + o['SUMMARY'] + '}'
				})
		},
		contracts () {
			return this.$store.getters.contractkey.filter(a => a.ID === parseInt(this.id))
		},
		loading () {
			return this.$store.getters.loading
		},
		formTitle () {
			return this.editedIndex === -1 ? 'Новая позиция' : 'Редактирование'
		},
		formTitleSN () {
			return this.editedIndexSN === -1 ? 'Новая позиция' : 'Редактирование'
		},
		Edit () {
			return new AclRule('user').and('engineer').or('admin').generate()
		},
		userRole () {
			return this.$store.getters.userRole
		},
		crmAccess () {
			const Arr = this.userRole.split('&')
			if (Arr.find(item => item === 'admin') || Arr.find(item => item === 'crm')) {
				return true
			} else return false
		},
		ParentName () {
			const obj = this.clients.find(item => parseInt(item.ID) === parseInt(this.id))
			if (obj) return obj.NAME + ' (' + obj.PROJECT + ')'
		},
		statusCRM () {
			const obj = this.clients.find(item => parseInt(item.ID) === parseInt(this.id))
			if (obj) return !!obj.CRM
		}
	},
	watch: {
		dialog (val) {
			val || this.close()
		},
		search (val) {
			if (!val) {
				this.defaultItem.SPEC = ''
				this.editedItem.SPEC = ''
			}
		}
	},
	components: {
		Crm
	},
	async created () {
		await this.$store.dispatch('fetchContracts')
		await this.$store.dispatch('fetchZip')
		await this.$store.dispatch('fetchSpecprices')
		await this.$store.dispatch('fetchCurrency')
		await this.$store.dispatch('fetchSerialNumbers')
		await this.$store.dispatch('fetchClients')
		this.getSpecprices(this.id)
		this.getCurrency()
		this.getSerialNumbers(this.id)
		this.init()
	}
}
</script>

<style scoped>
.cursor_btn {
	cursor: pointer
}
</style>


