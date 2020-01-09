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
          Пожалуйста, дождитесь выполнения
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
	<v-dialog v-model="dialog" :max-width="imageWidth">
		<v-img width="100%" v-if="selectedImage" :src="selectedImage" @click.stop="close()"></v-img>
	</v-dialog>
	<v-container container--fluid>
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
				></v-progress-linear>
			</v-flex>
    		<v-flex xs6 class="text-right">
      			<v-btn @click="goBack()" color="warning">Вернуться назад</v-btn>
    		</v-flex>
		</v-layout>
	</v-container>
    <v-tabs centered v-model="active" fixed-tabs icons-and-text class="mt-3">
      <v-tabs-slider></v-tabs-slider>

      <v-tab href="#tab-1">Фото
        <v-icon>photo_album</v-icon>
      </v-tab>
      <v-tab href="#tab-2">Состав
        <v-icon>list</v-icon>
      </v-tab>
	  <v-tab href="#tab-3">Оценка качества
        <v-icon>rate_review</v-icon>
      </v-tab>
	  <v-tab href="#tab-4" @click="getAvailability(id)">Наличие
        <v-icon>store</v-icon>
      </v-tab>
	  <v-tab href="#tab-5">Тех. характеристики
        <v-icon>list</v-icon>
      </v-tab>
	<!--TAB-1 -->
      <v-tab-item :value="'tab-1'">
        <div v-if="loadings">
          <v-layout row>
            <v-flex xs12 class="text-center pt-5">
              <v-progress-circular color="primary" indeterminate :size="100"></v-progress-circular>
            </v-flex>
          </v-layout>
        </div>
		<div v-else-if="!loadings && photos.length === 0">
			<p class="mt-5 mb-3" align="center">У данной позиции отсутствуют фотографии</p>
			<app-market-photo :ID = 'id' :photos = 'photos' :photosWidth = 'photosWidth'></app-market-photo>
    	</div>
      	<div v-else class="mt-5">
			<template>
  				<v-layout>
					<v-flex xs12 sm8 offset-sm2>
					<v-card>
						<v-container grid-list-sm container--fluid>
							<v-layout row wrap>
								<v-flex
									v-for="photo in photos"
									:key="photo"
									xs3
									d-flex
								>
									<v-card text tile class="d-flex pa-1">
										<v-icon :slot="$acl.check('Edit') ? 'badge' : ''" @click="deleteImg($event)" class="cursor_btn" dark :data-photoname="getPhotoName(photo)" size="19">delete_forever</v-icon>
											<v-img
											:src="photo"
											:lazy-src="photo"
											aspect-ratio="1"
											class="grey lighten-2"
											@click="zoom(photo)"
											>
											<template v-slot:placeholder>
												<v-layout
												fill-height
												align-center
												justify-center
												ma-0
												>
												<v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
												</v-layout>
											</template>
											<span style="color: transparent">{{ photo }}</span>
										</v-img>
										<v-badge class="zIndex" overlap color="transoarent">
										<template v-slot:badge>
											<v-icon :slot="$acl.check('Edit') ? 'badge' : ''" @click="deleteImg($event)" class="cursor_btn error" dark :data-photoname="getPhotoName(photo)" size="25">delete_forever</v-icon>
										</template>
										</v-badge>
									</v-card>
								</v-flex>
							</v-layout>
						</v-container>
					</v-card>
				</v-flex>
  			</v-layout>
				</template>
			<app-market-photo :ID = 'id' :photos = 'photos' :photosWidth = 'photosWidth'></app-market-photo>
        </div>
      </v-tab-item>
	  <!--TAB-2 -->
      <v-tab-item :value="'tab-2'" class="mt-3">
        <div v-if="loadings">
          <v-layout row>
            <v-flex xs12 class="text-center pt-5">
              <v-progress-circular color="primary" indeterminate :size="100"></v-progress-circular>
            </v-flex>
          </v-layout>
        </div>
		<div v-else-if="!loadings">
			<v-layout>
			<v-flex xs4>
              <v-text-field
			  	v-if="PartsId.length > 0"
                prepend-icon="search"
                label="Поиск"
                placeholder="Введите данные для поиска"
                v-model="searchParts"
                single-line
                clearable
              ></v-text-field>
            </v-flex>
			<v-spacer></v-spacer>
			<v-btn color="error" v-if="showSaveBtn" @click.native="closeParts" :loading="localLoading" :disabled="localLoading" class="mr-2">
				<v-icon class="mr-2">cancel</v-icon>Отмена</v-btn>
			<v-btn v-if="showSaveBtn" color="success" dark @click.native="saveParts(Parts, deletedParts)"  :loading="localLoading" :disabled="localLoading">
				<v-icon class="mr-2">save</v-icon>Сохранить
			</v-btn>
			<v-flex xs12 sm12 md2 lg2 xl2 class="text-right">
			<v-dialog v-model="dialogParts" max-width="1100px" persistent>
					<v-spacer></v-spacer>
					<template v-slot:activator="{ on }">
						<v-btn v-if="PartsId.length > 0" v-on="$acl.check('Edit') ? on : ''" @click="deletedParts.length = 0" color="primary" dark :loading="localLoading" :disabled="localLoading || $acl.not.check('Edit')">
						<v-icon class="mr-2">edit</v-icon>Редактировать
					</v-btn>
					<v-btn v-else v-on="$acl.check('Edit') ? on : ''" @click="deletedParts.length = 0" color="primary" dark :loading="localLoading" :disabled="localLoading || $acl.not.check('Edit')">
						<v-icon class="mr-2">add</v-icon>Добавить
					</v-btn>
					</template>
				<v-card>
					<v-card-title>
					<span class="headline">{{ formTitleParts }} для {{ ParentName }}</span>
					</v-card-title>
					<v-card-text>
					<v-container grid-list-md>
						<v-layout wrap>
						<v-flex xs12>
							<v-combobox
								v-model="Parts"
								:items="ElementType === 2 ? ModelMarketList : MarketList"
								:item-text="idNameTypeArtPNModels"
								label="СОСТАВ"
								:search-input.sync="search"
								@change="search = ''"
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
					</v-card-text>
					<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="blue darken-1" text @click.native="closeParts"><v-icon class="mr-2">cancel</v-icon>Отмена</v-btn>
					<v-btn color="blue darken-1" text @click.native="approveParts"><v-icon class="mr-2">list</v-icon>Предварительный просмотр</v-btn>
					</v-card-actions>
				</v-card>
        </v-dialog>
		</v-flex>
		</v-layout>

          <v-data-table
		  	v-if="PartsId.length > 0 || Parts.length > 0"
            :headers="headers_parts"
            :items="Parts"
            fixed-header
			calculate-widths
			:items-per-page=10
			item-key="id"
			:mobile-breakpoint="550"
			sort-by='id'
			sort-desc
			class="elevation-2 mt-5"
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
          >
            <template v-slot:item="{item}">
			<tr :class="item.id ? '' : 'green accent-1'">
			<td class="text-left">{{ item.id }}</td>
			<td class="text-left">{{ item.marketid }}</td>
              <td class="text-left">{{ item.marketNAME }}</td>
              <td class="text-left">{{ item.marketART }}</td>
              <td class="text-left">{{ item.marketSUPPLIER }}</td>
			  <td class="text-left">{{ item.marketCOND }}</td>
			  <td class="text-left">{{ item.marketPN }}</td>
			  <td class="justify-center">
            	<v-icon class="ml-3" small @click="deleteItemParts(item)" :disabled="$acl.not.check('Edit')">delete</v-icon>
          	</td>
			</tr>
            </template>

            <template v-slot:no-data>
              <p class="mt-5" align="center">У данной позиции отсутствуют составные части</p>
            </template>
          </v-data-table>
		  <p class="mt-5" align="center" v-else>У данной позиции отсутствуют составные части</p>
        </div>
      </v-tab-item>
	  <!--TAB-3 -->
	  <v-tab-item :value="'tab-3'">
        <div v-if="loadings">
          <v-layout row>
            <v-flex xs12 class="text-center pt-5">
              <v-progress-circular color="primary" indeterminate :size="100"></v-progress-circular>
            </v-flex>
          </v-layout>
        </div>
        <div v-else>
		<v-layout row wrap>
			<v-flex xs12 md6 lg4 xl4 pa-2>
			<v-card
				class="elevation-5 mx-auto mt-5 grey--text text--darken-3"
			>
				<v-card-title
				class="title"
				primary-title
				>
				Оцените качество данного элемента:
				</v-card-title>
				<v-card-text>
				Если требуется убрать оценку - нажмите `Сбросить` и затем `Сохранить`
				<p class="pt-3 mt-0 mb-0"><span class='green--text'>5</span> - отличное</p>
				<p class="mt-0 mb-0"><span class='lime--text'>4</span> - хорошее</p>
				<p class="mt-0 mb-0"><span class='yellow--text'>3</span> - удовлетворительное</p>
				<p class="mt-0 mb-0"><span class='orange--text'>2</span> - плохое</p>
				<p class="mt-0 mb-0"><span class='red--text'>1</span> - неприемлемое</p>
				<div class="text-center mt-2">
					<v-rating
					v-model="marketRating"
					color="yellow darken-3"
					background-color="grey darken-1"
					large
					clearable
					></v-rating>
				</div>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions class="justify-center">
				<v-btn
					color="primary"
					text
					@click="marketRating = 0"
				>
					Сбросить
				</v-btn>
				<v-spacer></v-spacer>
				<v-btn
					color="primary"
					text
					@click="saveRate"
					:disabled="localLoading"
					:loading="localLoading"
				>
					Сохранить
				</v-btn>
				</v-card-actions>
			</v-card>
			</v-flex>
			<v-spacer></v-spacer>
			<v-flex xs12 md6 lg8 xl8 pa-2>
			<v-card
				class="elevation-5 mx-auto mt-5 grey--text text--darken-3"
			>
				<p class="text_center title pt-4">Оставьте комментарий по качеству элемента (выставленной оценке).</p>
				<v-card-text>
				<p class="text_center">ВНИМАНИЕ! Комментарий перезаписывается.</p>
				<div class="text-center mt-4">
					<v-textarea
					filled
					name="input-7-4"
					label="Введите текст и нажмите 'Cохранить'"
					clearable
					:value="marketComment"
					v-model="marketComment"
					></v-textarea>
				</div>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions class="justify-center">
				<v-btn
					color="primary"
					text
					@click="saveComment"
					:disabled="localLoading"
					:loading="localLoading"
				>
					Сохранить
				</v-btn>
				</v-card-actions>
			</v-card>
			</v-flex>
		</v-layout>
        </div>
      </v-tab-item>
	  <!--TAB-4 -->
      <v-tab-item :value="'tab-4'">
         <div v-if="loadings">
          <v-layout row>
            <v-flex xs12 class="text-center pt-5">
              <v-progress-circular color="primary" indeterminate :size="100"></v-progress-circular>
            </v-flex>
          </v-layout>
        </div>
        <div v-else>
		<v-card
				class="elevation-3 mx-auto mt-5 mr-2 grey--text text--darken-3"
			>
		<v-container container--fluid grid-list-sm>
		<v-layout row wrap fill-height>
			<v-flex xs12 md12 lg6 xl6>
				<v-card-title>Склад</v-card-title>
				<template>
					<v-data-table
						:headers="headers_SKLAD"
						:items="SKLAD"
						class="elevation-2"
						hide-default-footer
					>
						<template v-slot:item="{item}">
						<td class="text-center">{{ item.LINK }}</td>
						<td class="text-center">{{ item.OSN }}</td>
						<td class="text-center">{{ item.SER }}</td>
						<td class="text-center">{{ item.GP }}</td>
						</template>
					</v-data-table>
				</template>
			</v-flex>
			<v-flex xs12 md12 lg6 xl6>
				<v-card-title>Заказ</v-card-title>
				<template>
					<v-data-table
						:headers="headers_SKLAD"
						:items="ZAKUPKA"
						class="elevation-2"
						hide-default-footer
					>
						<template v-slot:item="{item}">
						<td class="text-center"><a :href="'http://support.tsd-group.ru/browse/' + item.LINK"  target="_blank">{{ item.LINK }}</a></td>
						<td class="text-center">{{ item.OSN }}</td>
						<td class="text-center">{{ item.SER }}</td>
						<td class="text-center">{{ item.GP }}</td>
						</template>
					</v-data-table>
				</template>
			</v-flex>
		</v-layout>
		<v-layout row wrap fill-height>
			<v-flex xs12 md12 lg6 xl6>
				<v-card-title>Склад в составе:</v-card-title>
				<template>
					<v-data-table
						:headers="headers_SKLAD"
						:items="SKLAD_IN"
						class="elevation-2"
						hide-default-footer
					>
						<template v-slot:item="{item}">
						<td class="text-center">{{ item.LINK }}</td>
						<td class="text-center">{{ item.OSN_IN }}</td>
						<td class="text-center">{{ item.SER_IN }}</td>
						<td class="text-center">{{ item.GP_IN }}</td>
						</template>
					</v-data-table>
				</template>
			</v-flex>
			<v-flex xs12 md12 lg6 xl6>
				<v-card-title>Заказ в составе:</v-card-title>
				<template>
					<v-data-table
						:headers="headers_SKLAD"
						:items="ZAKUPKA_IN"
						class="elevation-2"
						hide-default-footer
					>
						<template v-slot:item="{item}">
						<td class="text-center"><a :href="'http://support.tsd-group.ru/browse/' + item.LINK"  target="_blank">{{ item.LINK }}</a></td>
						<td class="text-center">{{ item.OSN_IN }}</td>
						<td class="text-center">{{ item.SER_IN }}</td>
						<td class="text-center">{{ item.GP_IN }}</td>
						</template>
					</v-data-table>
				</template>
			</v-flex>
		</v-layout>
		</v-container>
		</v-card>
        </div>
      </v-tab-item>
	  <!--TAB-5 Технические характеристики -->
	  	<v-tab-item :value="'tab-5'">
         	<v-container v-if="loadings" fluid>
          		<v-layout row>
            		<v-flex xs12 class="text-center pt-5">
              			<v-progress-circular color="primary" indeterminate :size="100"></v-progress-circular>
            		</v-flex>
          		</v-layout>
        	</v-container>
        	<v-container v-else fluid>
				<v-layout row wrap>
					<v-flex xl12>
						<v-data-table
						:headers="headers_TechProps"
						:items="TechProps"
						class="elevation-2 mt-5"
						:items-per-page='50'
						item-key="id"
						:mobile-breakpoint="550"
						sort-by='id'
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
					>
						<template v-slot:body.prepend="{ items }">
							<v-dialog v-model="dialogTechPropValue" max-width="550px" persistent :disabled="$acl.not.check('Edit')">
								<v-card>
									<v-card-title>Выбор значения для &nbsp;<span class="red--text"> {{ TechPropName(items) }} </span></v-card-title>

										<v-autocomplete
											class="ml-3 pa-2"
											v-model="TechPropValue"
											:items="TechPropValuesList"
											item-text = 'name'
											autocomplete
											return-object
											clearable
											hide-details
										></v-autocomplete>

									<v-card-actions>
										<v-spacer></v-spacer>
										<v-btn
											color="green darken-1"
											text
											@click="dialogTechPropValue=false"
										>
											Отменить
										</v-btn>
										<v-btn
											color="green darken-1"
											text
											@click.native="saveTechPropValue(items.find(item => item.mainID === TechPropItemID))"
											:disabled="localLoading"
											:loading="localLoading"
										>
											Сохранить
										</v-btn>
									</v-card-actions>
								</v-card>
							</v-dialog>
						</template>
						<template v-slot:item.TH2="{ item }">
							<span v-if="item.TH2">
								{{ item.TH2 }}
								&nbsp;&nbsp;[<v-icon small class="ma-2" @click="deleteTechPropFit(item)" :disabled="$acl.not.check('Edit')">delete</v-icon>]
							</span>

						</template>
						<template v-slot:item.action="{ item }">
							<td class="justify-center layout">
								<v-icon small class="mr-2" @click="editTechPropValue(item)" :disabled="$acl.not.check('Edit')">edit</v-icon>
							</td>
						</template>
					</v-data-table>
					</v-flex>
			</v-layout>
        	</v-container>
    	</v-tab-item>
	</v-tabs>
	</v-container>
</template>

<script>
import EditAdModal from './EditAdModal'
import MarketPhoto from './MarketPhoto'
import Api from '@/services/Api'
import { AclRule } from 'vue-acl'
// import _ from 'lodash'

export default {
	props: ['id', 'name'],
	data () {
		return {
			show: false,
			marketRating: 0,
			marketComment: '',
			selectedImage: null,
			formTitleParts: 'Редактирование состава',
			imageWidth: '',
			showSaveBtn: false,
			ParentName: '',
			ParentType: '',
			TechPropValue: [],
			TechPropValuesList: [],
			TechPropItemID: null,
			ElementType: null,
			ModelMarketList: [],
			photos: [],
			photosWidth: [],
			window: 0,
			search: '',
			searchParts: '',
			dialog: false,
			dialogParts: false,
			dialogTechPropValue: false,
			localLoading: false,
			active: 'tab-1',
			tab: '',
			Zip: [],
			PartsId: [],
			Parts: [],
			SKLAD: [],
			SKLAD_IN: [],
			ZAKUPKA: [],
			ZAKUPKA_IN: [],
			deletedParts: [],
			MarketList: [],
			textRules: [v => !!v || 'Обязательный параметр!'],
			pagination: {'sortBy': 'id', 'descending': true},
			editedItemParts: {
				NAME: '',
				ART: '',
				SUPP: '',
				COND: '',
				PN: '',
				MODELS: {}
			},
			headers_parts: [
				{ text: 'id', value: 'id', divider: true },
				{ text: 'Маркет ID', value: 'marketid', divider: true },
				{ text: 'Имя', value: 'NAME', divider: true },
				{ text: 'Артикул', value: 'ART', divider: true },
				{ text: 'Производитель', value: 'SUPP', divider: true },
				{ text: 'Состояние', value: 'COND', divider: true },
				{ text: 'PN', value: 'PN' },
				{ text: 'Ред', value: 'actions', sortable: false, align: 'center', divider: true }
			],
			headers_SKLAD: [
				{ text: 'Название', align: 'center', value: 'link', divider: true },
				{ text: 'Основной', align: 'center', value: 'base', divider: true },
				{ text: 'Серисный', align: 'center', value: 'service', divider: true },
				{ text: 'Г.П.', align: 'center', value: 'gp' }
			],
			headers_TechProps: [
				{ text: 'id', align: 'center', value: 'mainID', divider: true },
				{ text: 'Название', align: 'center', value: 'TH1', divider: true },
				{ text: 'Значение', align: 'center', value: 'TH2', divider: true },
				{ text: 'Действие', align: 'center', value: 'action', divider: true }
			]
		}
	},
	methods: {
		async init () {
			this.$store.commit('setLoading', true)
			console.log(this.id)
			await Api()
				.post('market/getimages', [this.id])
				.then(response => {
					if (!response.data.error && response.data.length !== 0) {
						response.data.forEach(data => {
							this.photos.push(data.url)
						})
						this.photosWidth = response.data
						this.$store.commit('setLoading', false)
					} else if (response.data.length === 0) {
						this.$store.commit('setLoading', false)
					} else {
						this.$store.commit('setLoading', false)
						this.$store.commit('setInfo', 'Директория с фото ЗИП ещё не создана')
					}
				})
			await Api()
				.post('market/quality', [this.id])
				.then(response => {
					this.marketRating = response.data[0].Market_Rating
					this.marketComment = response.data[0].Comment
				})
		},
		async getMarketList () {
			return Promise.resolve(
				Api()
					.get('zip_prices')
					.then(res => {
						this.MarketList = Object.values(res.data)
					})
			)
		},
		async getCurrentParts (id) {
			this.Parts.length = 0
			await Api()
				.post('market/get_current_market_parts', [id])
				.then(res => {
					res.data.forEach(item => {
						this.Parts.push(item)
					})
				})
		},
		getParts () {
			this.PartsId = this.$store.getters.Parts.filter(part => parseInt(part.mid) === parseInt(this.id))
		},
		getParentParams () {
			let obj = this.MarketList.find(item => parseInt(item.marketid) === parseInt(this.id))
			this.ParentTypeID = obj.marketTypeID
			this.ParentName = obj.marketNAME + ' (' + obj.marketART + ', ' + obj.marketPN + ')'
			this.ElementType = obj.elementTYPE
		},
		getModelMarketList (elemID) {
			Api()
				.post('market/get_parts', [elemID])
				.then(res => {
					this.ModelMarketList = res.data
				})
				.catch(error => {
					if (error) throw error
				})
		},
		async getAvailability (elemID) {
			await Api()
				.post('market/get_sklad', [elemID])
				.then(res => {
					res.data.dataSklad ? this.SKLAD = res.data.dataSklad : this.SKLAD = []
					res.data.dataSkladIn ? this.SKLAD_IN = res.data.dataSkladIn : this.SKLAD_IN = []
				})
				.catch(error => {
					if (error) throw error
				})
			await Api()
				.post('market/get_zakupka', [elemID])
				.then(res => {
					res.data.dataZakupka ? this.ZAKUPKA = res.data.dataZakupka : this.ZAKUPKA = []
					res.data.dataZakupkaIn ? this.ZAKUPKA_IN = res.data.dataZakupkaIn : this.ZAKUPKA_IN = []
				})
				.catch(error => {
					if (error) throw error
				})
		},
		idNameTypeArtPNModels (item) {
			return '(' + item.marketid + ') ' + '[' + item.marketART + ', ' + item.marketCOND + ', ' + item.marketSUPPLIER + '] ' + item.marketNAME + ' (' + item.marketPN + ')'
		},
		zoom (url) {
			this.open()
			this.selectedImage = url
			this.photosWidth.forEach(photo => {
				if (photo.url === url) {
					this.imageWidth = parseInt(photo.width)
				}
			})
		},
		open () {
			this.dialog = true
			this.localLoading = true
		},
		close () {
			this.dialog = false
			this.localLoading = false
			this.selectedImage = null
		},
		openParts () {
			this.dialogParts = true
			this.deletedParts.length = 0
		},
		closeParts () {
			this.dialogParts = false
			this.localLoading = false
			this.showSaveBtn = false
			this.getCurrentParts(this.id)
			this.deletedParts.length = 0
		},
		approveParts () {
			this.dialogParts = false
			this.localLoading = false
			this.showSaveBtn = true
			console.log(this.deletedParts)
		},
		deleteImg (e) {
			if (confirm('Вы действительно хотите удалить это фото?')) {
				this.show = true
				const photoName = e.currentTarget.attributes['data-photoname'].value
				Api()
					.post('market/delImg', [this.id, photoName])
					.then(response => {
						this.photos.forEach((photo, index) => {
							if (photo === response.data.url) {
								setTimeout(() => {
									this.photos.splice(index, 1)
									this.show = false
									this.$store.commit('setData', 'Изображение ' + photoName + ' успешно удалёно!')
								}, 1000)
							}
						})
					})
			} else {
				this.$store.commit('setInfo', 'Удаление отменено')
			}
		},
		deleteItemParts (item) {
			if (!item.id) {
				let index = this.Parts.indexOf(item)
				this.Parts.splice(index, 1)
				this.Parts.find(part => !part.id) ? this.showSaveBtn = true : this.showSaveBtn = false
				return false
			}
			if (confirm('Вы действительно хотите удалить эту составную часть?')) {
				this.show = true
				const index = this.Parts.indexOf(item)
				Api()
					.post('market/delParts', [item.id])
					.then(response => {
						if (response.data.success) {
							this.show = false
							this.Parts.splice(index, 1)
							this.$store.commit('setData', 'Составная часть c id ' + item.id + ' успешно удалена')
						} else {
							this.show = false
							this.Parts.splice(index, 1)
							this.$store.commit('setInfo', response.data.error)
							this.Parts.find(part => !part.id) ? this.showSaveBtn = true : this.showSaveBtn = false
						}
					})
					.finally(() => {
						this.deletedParts.length = 0
					})
			} else {
				this.$store.commit('setInfo', 'Удаление отменено')
			}
		},
		deleteTechPropFit (item) {
			if (confirm('Вы действительно хотите отвязать ТХ от Маркета?')) {
				let id = this.TechPropsFit.find(fit => fit.th === item.elementID).id
				this.show = true
				this.$store.dispatch('deleteTechPropFit', {id: id})
					.then(result => {
						if (result.success) {
							item.TH2 = null
							this.$store.commit('setData', result.text)
							this.show = false
						} else {
							this.$store.commit('setError', 'Ошибка в процессе удаления значения, обратитесь к администратору!')
							this.show = false
						}
					})
			} else {
				this.$store.commit('setInfo', 'Удаление отменено')
			}
		},
		getPhotoName (data) {
			return data.split('/').pop()
		},
		goBack () {
			this.$router.go(-1)
		},
		editTechPropValue (item) {
			this.dialogTechPropValue = true
			this.TechPropItemID = item.mainID
			this.$store.dispatch('fetchTechPropValues', item.mainID)
				.then(res => {
					this.TechPropValuesList = res
					this.TechPropValue = this.TechProps.find(prop => prop.mainID === item.mainID).TH2
					this.editedIndex = this.TechProps.indexOf(item)
					console.log(res)
				})
		},
		TechPropName (items) {
			let name = items.find(item => item.mainID === this.TechPropItemID)
			if (!name) return false
			else return name.TH1
		},
		saveRate () {
			this.localLoading = true
			Api()
				.post('market/save_rating', [this.id, this.marketRating])
				.then(res => {
					if (res.data.success) {
						setTimeout(() => {
							this.localLoading = false
							this.$store.dispatch('setData', 'Оценка успешно зафиксированна в БД')
						}, 1000)
					} else {
						this.$store.dispatch('setError', 'Произошла непредвиденная ошибка при добавлении оценки: ' + res.data.error)
					}
				})
				.catch(err => {
					this.$store.commit('setError', err.message)
				})
		},
		saveComment () {
			this.localLoading = true
			Api()
				.post('market/save_comment', [this.id, this.marketComment])
				.then(res => {
					if (res.data.success) {
						setTimeout(() => {
							this.localLoading = false
							this.$store.dispatch('setData', 'Комментарий успешно добавлен!')
						}, 1000)
					} else {
						this.$store.dispatch('setError', 'Произошла непредвиденная ошибка при добавлении комментария: ' + res.data.error)
					}
				})
				.catch(err => {
					this.$store.commit('setError', err.message)
				})
		},
		async saveParts (Items) {
			this.localLoading = true
			this.show = true
			if (this.deletedParts.length > 0) {
				await Api()
					.post('market/delParts', this.deletedParts)
					.then(res => {
						if (res.data.success) {
							this.deletedParts.length = 0
							this.$store.dispatch('setInfo', res.data.message)
						}
					})
					.catch(err => {
						this.localLoading = false
						this.show = false
						this.$store.commit('setError', err.message)
					})
			}
			if (this.Parts.find(part => !part.id)) {
				Api()
					.post('market/add_current_parts', [this.id, Items])
					.then(async res => {
						if (res.data.success) {
							this.Parts = this.PartsId = res.data.payload

							this.$store.dispatch('setData', 'Данные успешно сохранены')
						} else {
							this.$store.dispatch('setError', 'Произошла ошибка при добавлении состава: ' + res.data.error)
						}
					})
					.catch(err => {
						this.$store.commit('setError', err)
					})
					.finally(() => {
						this.deletedParts.length = 0
						this.localLoading = false
						this.show = false
						this.showSaveBtn = false
					})
			} else {
				this.localLoading = false
				this.show = false
				this.showSaveBtn = false
			}
		},
		saveTechPropValue (item) {
			if (this.TechPropValue === undefined) {
				this.$store.commit('setInfo', 'Не выбрано ни одного значения!')
			} else {
				this.localLoading = true
				this.$store.dispatch('addTechPropValue', { TechPropValue: this.TechPropValue, marketID: this.id, item: item })
				this.dialogTechPropValue = false
				this.localLoading = false
			}
		}
	},
	computed: {
		loadings () {
			return this.$store.getters.loading
		},
		Edit () {
			return new AclRule('user').and('engineer').or('admin').generate()
		},
		TechProps () {
			return this.$store.getters.TechProps
		},
		TechPropsFit () {
			return this.$store.getters.techPropertiesFit
		}
	},
	watch: {
		dialog (val) {
			val || this.close()
		},
		Parts: {
			handler: function (after, before) {
				if (after.filter(i => typeof i !== 'object').length > 0) {
					this.$nextTick(() => after.pop())
				}
				if (before.filter(e => !~after.indexOf(e))[0] === undefined) {
					return false
				} else if (after.length > 0) {
					this.deletedParts.push(before.filter(e => !~after.indexOf(e))[0])
					console.log(this.deletedParts)
				} else if (after.length === 0) {
					if (this.deletedParts.length === 0) {
						this.deletedParts = before
					} else {
						this.deletedParts.push(before[0])
					}
					console.log(this.deletedParts)
				}
			}
		},
		deletedParts (val) {
			val.forEach(obj => {
				if (typeof obj !== 'object') {
					this.$nextTick(() => val.pop())
				}
			})
		}
	},
	components: {
		appEditAdModal: EditAdModal,
		appMarketPhoto: MarketPhoto

	},
	async created () {
		await this.$store.dispatch('fetchParts')
		await this.getParts()
		await this.getMarketList()
			.then(res => {
				this.getParentParams()
			})
			.then(() => {
				this.getModelMarketList(this.MarketList.find(item => parseInt(item.marketid) === parseInt(this.id)).marketID)
				this.$store.dispatch('fetchTechProps', { id: this.id, typeID: this.ParentTypeID, element: this.ElementType })
				this.$store.dispatch('fetchTechPropertiesFit')
			})
		await this.getCurrentParts(this.id)
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
.maxWidth {
	max-width: 200px !important;
}
.zIndex {
	z-index:1;
}
</style>


