<template>
  <v-container fluid>
	  <v-dialog
    	v-model="showForFilter"
    	width="600"
		@click="showForFilter = false"
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
			<v-layout row wrap>
				<v-flex xs12>
					<v-layout>
						<v-flex sm2 md2 lg1 xl1 class="hidden-sm-and-down" align-self-center>
						<v-layout column>
							<v-flex>
								<v-checkbox
								hide-details
								v-model="checkBox1"
								:label="checkBox1 ? 'Открепить' : 'Закрепить'"
								></v-checkbox>
							</v-flex>
							<v-flex>
								<v-checkbox
								hide-details
								v-model="checkBox2"
								:label="checkBox2 ? 'Разтянуть' : 'Сжать'"
								></v-checkbox>
							</v-flex>
						</v-layout>
						</v-flex>

						<v-flex xs2 sm2 md2 lg3 xl2 class="hidden-md-and-down" align-self-center>
						<v-chip label class="elevation-2">
							<v-icon left light color="warning">info</v-icon>
							<span class="mr-2">ЦБ:</span>
							<span>{{'$: ' + parseFloat(cbr_USD).toFixed(2) }}</span>
							<span class="ml-2">{{'€: ' + parseFloat(cbr_EUR).toFixed(2)  }}</span>
						</v-chip>
						</v-flex>
						<v-flex xs2 sm2 md3 lg3 xl3 class="hidden-md-and-down" align-self-center>
							<v-chip>
								<v-avatar color="success mr-2">$</v-avatar>
								<b>{{ Dollar }}</b>
							</v-chip>
							<v-chip>
								<v-avatar color="warning mr-2">€</v-avatar>
								<b>{{ Euro }}</b>
							</v-chip>
							<appEditRate v-if="$acl.check('Edit')"></appEditRate>
						</v-flex>
						<v-flex xs3 sm3 md3 lg2 xl1 align-self-center v-if="$acl.check('Edit')">
							<v-menu offset-y>
								<template v-slot:activator="{ on }">
									<v-btn
									color="primary"
									dark
									v-on="on"
									>
									<v-icon class="mr-1">save_alt</v-icon>Excel
									</v-btn>
								</template>
								<v-btn>
									<download-excel
									:fields="getJsonFieldsAll"
									:data="ZipList"
									class="btn btn-default xlsx_btn"
									name="zip_prices.xls"
									>Все значения
									</download-excel>
								</v-btn>
								<v-spacer></v-spacer>
								<v-btn>
									<download-excel
									:fields="json_fields"
									:fetch="getExel"
									class="btn btn-default xlsx_btn"
									name="zip_prices.xls"
									>Текущий фильтр
									</download-excel>
								</v-btn>
							</v-menu>
						</v-flex>
						<v-spacer></v-spacer>
						<v-flex xs3 sm3 md3 lg2 xl1 align-self-center class="text-end">
						<v-menu
							v-model="menu"
							:close-on-content-click="false"
							offset-y
						>
						<template v-slot:activator="{ on }">
							<v-btn v-on="on">
								<v-icon dark class="mr-2">menu</v-icon>
								Настройки
							</v-btn>
						</template>
						<v-card class="pa-2">
							<v-menu
								bottom
								transition="scale-transition"
								:close-on-content-click="false"
								>
								<template v-slot:activator="{on}">
									<v-btn v-on="on" text>
									Колонки
								</v-btn>
								</template>

								<v-list class="pa-3">
									<v-btn
										@click="showAllColumn"
										>
										<v-icon color="warning" class="mr-1">
											mdi-eye
										</v-icon>
										Включить всё
									</v-btn>
									<v-btn
										@click="saveColumnFB"
										><v-icon color="success" class="mr-1">
											save
										</v-icon>
										Сохранить
									</v-btn>
									<v-list-item
										v-for="(header, i) in headers"
										:key="i"
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
							<v-divider></v-divider>
							<v-btn text  @click="getEditPrices(toggle)" :disabled="$acl.not.check('Edit')">{{ filterTitle }}</v-btn>
						</v-card>
						</v-menu>
					</v-flex>
					<v-spacer></v-spacer>
					<v-flex xs3 sm3 md3 lg2 xl1 align-self-center>
						<v-menu
							v-model="menu_filter"
							:close-on-content-click="false"
							offset-y
						>
						<template v-slot:activator="{on}">
							<v-btn
							v-on="on"
						>
							<v-icon dark class="mr-2">menu</v-icon>
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
							<v-list>
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
										<v-btn text @click="showFilterName = true" :disabled="$acl.not.check('Edit')">Создать фильтр</v-btn>
									</v-list-item>
									<v-list-item>
										<v-btn text @click="resetFilter">Сбросить фильтр</v-btn>
									</v-list-item>
								</v-list>
						</v-card>
						</v-menu>
					</v-flex>
					<v-spacer></v-spacer>
					<v-dialog v-model="dialog" fullscreen persistent scrollable :disabled="$acl.not.check('Edit')" @keydown.esc="dialog = false">
						<template v-slot:activator="{on}">
							<v-btn v-on="$acl.not.check('Edit') ? '' : on" color="info" dark class="mt-1" :disabled="$acl.not.check('Edit')">
							<v-icon class="mr-2">add</v-icon>Добавить
						</v-btn>
						</template>
						<v-card>
						<v-card-title v-if="editedIndex !== -1">
						<span class="headline subheading font-weight-medium">
							{{ formTitle }} c id <span class="error--text">{{this.editedItem.marketid}} </span>для
							<span class="info--text">{{ this.marketTitle }}</span>
						</span>
						</v-card-title>
						<v-card-text>
						<v-container grid-list-md text-center>
							<v-layout row wrap>
								<v-flex xs12>
								<v-combobox
									ref="element"
									v-if="editedIndex === -1"
									v-model="editedItem.elementTYPE"
									:rules="ReqRules"
									:items="['ЗИП', 'МОДЕЛЬ']"
									label="Тип элемента"
									regular
								></v-combobox>
							</v-flex>
							<v-flex xs8>
								<v-text-field
									ref="price"
									v-model="editedItem.marketPRICE"
										:value="editedItem.marketPRICE ? editedItem.marketPRICE : editedItem.marketPRICE = '0'"
										:readonly="$acl.not.check('Admin')"
										:label="$acl.not.check('Admin') ? 'Цена стоковая (права администратора)' : 'Цена стоковая'"
										:disabled="$acl.not.check('Admin')"
									:rules="priceRules"
									required
									validation
									regular
								></v-text-field>
							</v-flex>
							<v-flex xs4>
								<v-combobox
									v-model="editedItem.CUR"
									:value="editedItem.CUR ? editedItem.CUR : editedItem.CUR = '₽'"
									:items="currency"
									ref="cur"
									:readonly="$acl.not.check('Admin')"
									:disabled="$acl.not.check('Admin')"
									label="Валюта"
									small-chips
									required
									validation
									:rules="ReqRules"
									regular
								></v-combobox>
							</v-flex>
							<v-flex xs6>
								<v-text-field
									ref="ratio"
									v-model="editedItem.RATIO_1"
									:value="editedItem.RATIO_1 ? editedItem.RATIO_1 : editedItem.RATIO_1 = 1"
									:readonly="$acl.not.check('Admin')"
									:disabled="$acl.not.check('Admin')"
									:label="$acl.not.check('Admin') ? 'Коэф. себестоимость (права администратора)' : 'Коэф. себестоимость'"
									:rules="ratioRules"
									required
									validation
									regular
								></v-text-field>
							</v-flex>
							<v-flex xs6>
								<v-text-field
									ref="ratio"
									:value="editedItem.RATIO_2 ? editedItem.RATIO_2 : editedItem.RATIO_2 = 1"
									v-model="editedItem.RATIO_2"
									:readonly="$acl.not.check('Admin')"
									:disabled="$acl.not.check('Admin')"
									:label="$acl.not.check('Admin') ? 'Коэф. продажа (права администратора)' : 'Коэф. продажа'"
									:rules="ratioRules"
									required
									validation
									regular
								></v-text-field>
							</v-flex>
							<v-flex xs6>
								<v-text-field v-model="stock" label="Себестоимость, руб." readonly disabled></v-text-field>
							</v-flex>
							<v-flex xs6>
								<v-text-field v-model="site" label="Продажа, руб." readonly disabled></v-text-field>
							</v-flex>
							<v-flex xs6>
								<v-text-field v-model="partner" label="Партнер, руб." readonly disabled></v-text-field>
							</v-flex>
							<v-flex xs6>
								<v-text-field v-model="opt" label="Опт, руб." readonly disabled></v-text-field>
							</v-flex>
							<v-flex xs6>
								<v-text-field v-model="editedItem.marketPN" label="Партномер"></v-text-field>
							</v-flex>
							<v-flex xs6>
								<v-autocomplete
									v-model="editedItem.marketSUPPLIER"
									:items="suppliers"
									label="* Производитель"
									required
										validation
										ref="supp"
									:rules="ReqRules"
									regular
								></v-autocomplete>
							</v-flex>
							<v-flex xs12>
								<v-text-field v-model="editedItem.marketDESC" label="Описание ТХ"></v-text-field>
							</v-flex>
							<v-flex xs6>
								<v-text-field
									v-model="editedItem.marketART"
									label="1C Арт"
									ref="article"
									:rules="artRules"
									regular
								>
								</v-text-field>
							</v-flex>
								<v-flex xs6>
								<v-autocomplete
									v-model="editedItem.marketCOND"
									:items="conditions"
									label="* Состояние"
									required
										validation
										ref="cond"
									:rules="ReqRules"
									regular
								></v-autocomplete>
								</v-flex>
								<v-flex xs12 v-if="editedItem.elementTYPE === 'ЗИП' || editedItem.elementTYPE === 1 ">
								<v-combobox
									v-model="editedItem.ZIP"
									:items="Zip"
									:item-text="namePlusArt"
									item-value="ID"
									label="* ЗИП"
									:rules="ObjRules"
									ref="objZIP"
										required
										validation
									return-object
									regular
								></v-combobox>
								</v-flex>
								<v-flex xs12 v-if="editedItem.elementTYPE === 'МОДЕЛЬ' || editedItem.elementTYPE === 2">
								<v-autocomplete
									v-model="editedItem.MODELS"
									:items="Models"
									:item-text="namePlusModel"
									label="* МОДЕЛЬ"
									:rules="ObjRules"
									ref="objMODELS"
										required
										validation
									return-object
									regular
								></v-autocomplete>
								</v-flex>
								<v-flex xs12>
									<v-combobox
										v-if="editedIndex === -1"
										v-model="Parts"
										:items="editedItem.MODELS && editedItem.MODELS.ID ? ModelMarketList : ZipList"
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
								<v-flex xs6>
								<v-text-field
									v-model="editedItem.marketPack"
									label="Кол-во в упаковке"
									:rules="packRules"
									ref="pack"
									clearable
									validation
									regular
								></v-text-field>
							</v-flex>
								<v-flex xs5 ml-5>
									<v-switch
									v-model="editedItem.marketSITE"
									:value="editedItem.marketSITE ? editedItem.marketSITE : editedItem.marketSITE = 0"
									:readonly="$acl.not.check('Admin')"
									:label="$acl.not.check('Admin') ? 'На сайт (права администратора)' : 'На сайт'"
									:disabled="$acl.not.check('Admin')"
									color="info"
									>
									</v-switch>
							</v-flex>
							</v-layout>
						</v-container>
						</v-card-text>
						<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn class="mr-3"
							color="info"
							text
							@click.native="dialog = false"
							:disabled="localLoading"
						><v-icon class="mr-2">cancel</v-icon>Отмена</v-btn>
						<v-btn
							color="info"
							text
							@click.native="save"
							:disabled="localLoading"
							:loading="localLoading"
						><v-icon class="mr-2">save</v-icon>Сохранить</v-btn>
						</v-card-actions>
					</v-card>
					</v-dialog>
				</v-layout>
			</v-flex>
		</v-layout>
	</v-container>
	</v-app-bar>
        <v-spacer></v-spacer>
		<h4 v-if="activeFilterName" class="text-lg-center mb-2">Применён фильтр - <span class="info--text">{{ activeFilterName }} </span> </h4>
      <div class="data_table_wrapper">
        <v-data-table
        	:headers="computedHeaders"
          	:items="ZipList"
			fixed-header
			:dense="checkBox2"
			calculate-widths
			:items-per-page=50
			item-key="marketid"
			:mobile-breakpoint="550"
			sort-by='marketid'
			sort-desc
          	class="elevation-2"
			ref="marketTable"
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
		<template v-slot:body.prepend v-if="mobileView">
        <tr>
			<td v-if="headers[0].selected">
				<v-switch
					v-model="filters.searchMarketPhoto"
				>
				</v-switch>
          </td>
          <td v-if="headers[1].selected">
            <v-text-field clearable v-model="filters.searchMarketID" type="number"></v-text-field>
          </td>
		  <td v-if="headers[2].selected">
            <v-text-field clearable v-model="filters.searchMarketZipID" type="number"></v-text-field>
          </td>
		  <td v-if="headers[3].selected" class="pb-5">
            <v-autocomplete
				:items="AllTypes"
				item-text = 'name'
				autocomplete
				clearable
				hide-details
				v-model="filters.searchMarketType"
					>
			</v-autocomplete>
          </td>
		  <td v-if="headers[4].selected">
            <v-text-field clearable v-model="filters.searchMarketName" type="text"></v-text-field>
          </td>
		  <td v-if="headers[5].selected" colspan="1"></td>
		  <td v-if="headers[6].selected">
			  <v-switch v-model="filters.searchMarketTH"></v-switch>
		  </td>
		  <td v-if="headers[7].selected" class="pb-5">
            <v-autocomplete
				:items="Models"
				multiple
				item-text = 'MODEL'
				clearable
				chips
				deletable-chips
				hide-details
				v-model="filters.searchMarketModel"
				>
			</v-autocomplete>
          </td>
		  <td v-if="headers[8].selected">
            <v-text-field clearable v-model="filters.searchMarketPN" type="text"></v-text-field>
          </td>
		  <td v-if="headers[9].selected">
			<v-autocomplete
				v-model="filters.searchMarketSupp"
				multiple
				:items="marketSupp"
				deletable-chips
				clearable
				chips
			>
			</v-autocomplete>
          </td>
		  <td v-if="headers[10].selected">
			<v-autocomplete
				v-model="filters.searchMarketCond"
				multiple
				:items="marketCond"
				deletable-chips
				clearable
				chips
			>
			</v-autocomplete>
          </td>
		  <td v-if="headers[11].selected">
            <v-text-field clearable v-model="filters.searchMarketART" type="text"></v-text-field>
          </td>
		  <td v-if="headers[12].selected" colspan="1"></td>
		  <td v-if="headers[13].selected" colspan="1"></td>
		  <td v-if="headers[14].selected" colspan="1"></td>
		  <td v-if="headers[15].selected" colspan="1"></td>
		  <td v-if="headers[16].selected">
            <v-text-field clearable v-model="filters.searchMarketPrice" type="text"></v-text-field>
          </td>
		  <td v-if="headers[17].selected" colspan="1"></td>
		  <td v-if="headers[18].selected" colspan="1"></td>
		  <td v-if="headers[19].selected" colspan="1"></td>
		  <td v-if="headers[20].selected" colspan="1"></td>
		  <td v-if="headers[21].selected" colspan="1"></td>
		  <td v-if="headers[22].selected" colspan="1"></td>
		  <td v-if="headers[23].selected">
            <v-text-field clearable v-model="filters.searchMarketEmail" type="text"></v-text-field>
          </td>
			<td v-if="headers[24].selected">
					<v-menu
						v-model="menuMarketDate"
						:close-on-content-click="false"
						transition="scale-transition"
						ref="menuMarketDate"
					>
						<template v-slot:activator="{ on }">
								<v-icon v-on="on" :color="filters.searchMarketDate !== null && filters.searchMarketDate.length > 0 ? `green darken-2` : ``">event</v-icon>
						</template>
						<v-date-picker v-model="filters.searchMarketDate" multiple no-title>
							<div class="flex-grow-1"></div>
							<v-btn text color="primary" @click="menuMarketDate = false">Отмена</v-btn>
							<v-btn text color="primary" @click="$refs.menuMarketDate.save(filters.searchMarketDate)">OK</v-btn>
						</v-date-picker>
					</v-menu>
					<v-icon v-if="filters.searchMarketDate !== null && filters.searchMarketDate.length > 0" @click="filters.searchMarketDate = []">clear</v-icon>
			</td>
		  <td v-if="headers[25].selected">
           <v-switch
		   		:value="filters.searchMarketSite"
				v-model="filters.searchMarketSite"
				>
				</v-switch>
          </td>
          <td colspan="1"></td>
        </tr>
      </template>
		<template v-slot:item.marketPHOTO="{ item }">
			  <img
			  	v-if="loadPhoto(item.marketid)"
			  	:data-src="loadPhoto(item.marketid)"
				v-lazyload
				:style="`max-width:100px`"
			  	@click="zoom($event, loadPhoto(item.marketid))"
			  	class="xlsx_btn" />
		</template>
		<template v-slot:item.marketid="{ item }">
			  <v-badge overlap :color="ratingColor(item.marketRating)" class="pb-1" height="100%">
				   <template v-slot:badge>
					   <span v-if="item.weight">
							<v-tooltip top>
								<template v-slot:activator="{on}">
									<span v-on="on">{{ item.weight }}</span>
								</template>
								<span>Кол-во повторений в активных ремонтах</span>
							</v-tooltip>
						</span>
						<span v-else>
							<v-tooltip top>
								<template v-slot:activator="{ on }">
									<span v-on="on">-</span>
								</template>
								<span>Примените фильтр "Правка цен" в настройках, <br> чтобы увидеть кол-во повторений в ремонтах</span>
							</v-tooltip>
						</span>
				   </template>
					<td class="pt-4">{{ item.marketid }}</td>
				</v-badge>
		</template>
		<template v-slot:item.marketID="{ item }">
				<v-tooltip top>
					<template v-slot:activator="{ on, click }">
						<v-icon v-on="on" v-if="item.elementTYPE === 1 && item.marketPARTS === 0"
						@click="filterElementType(0, item.elementTYPE, switchFilter = !switchFilter)">
						memory
						</v-icon>
					</template>
					<span>{{ filterText }}</span>
				</v-tooltip>
				<v-tooltip top>
					<template v-slot:activator="{ on }">
						<v-icon v-on="on" v-if="item.elementTYPE === 1 && item.marketPARTS === 1"
						@click="filterElementType(1, item.elementTYPE, switchFilter = !switchFilter)">
						mdi-cogs
						</v-icon>
					</template>
					<span>{{ filterText }}</span>
				</v-tooltip>
				<v-tooltip top>
					<template v-slot:activator="{ on }">
						<v-icon v-on="on" v-if="item.elementTYPE === 2 && item.marketPARTS === 0"
						@click="filterElementType(0, item.elementTYPE, switchFilter = !switchFilter)">
						phone_android
						</v-icon>
					</template>
					<span>{{ filterText }}</span>
				</v-tooltip>
				<v-tooltip top>
					<template v-slot:activator="{ on }">
						<v-icon v-on="on" v-if="item.elementTYPE === 2  && item.marketPARTS === 1"
						 @click="filterElementType(1, item.elementTYPE, switchFilter = !switchFilter)">
						phonelink_setup
						</v-icon>
					</template>
					<span>{{ filterText }}</span>
				</v-tooltip>
				<span v-if="item.elementTYPE === 1 && item.marketINPARTS === 1" class="font-weight-black xlsx_btn" @click="gotoMainZip(item.marketID)"> ( {{ item.marketID }} )</span>
				<span v-else-if="item.elementTYPE === 1 && item.marketINPARTS === 0" class="xlsx_btn" @click="gotoMainZip(item.marketID)">{{ item.marketID }}</span>
				<span v-if="item.elementTYPE === 2" class="xlsx_btn" @click="gotoMainModels(item.marketID)">{{ item.marketID }}</span>
				<template>
					<v-badge v-if="item.marketPARTS === 1">
						<template v-slot:badge>{{ countParts(item.marketid) }}</template>
					</v-badge>
				</template>
		</template>
		<template v-slot:item.marketpriceSTOCK="{ item }">
			  {{ item.priceSTOCK }}
			  <v-icon color="blue" small v-if="item.priceSTOCK">mdi-currency-rub</v-icon>
		</template>
		<template v-slot:item.marketpriceSITE="{ item }">
			{{ item.priceSITE }}
			<v-icon color="blue" small v-if="item.priceSITE">mdi-currency-rub</v-icon>
		</template>
		<template v-slot:item.marketpricePART="{ item }">
			{{ item.pricePART }}
			<v-icon color="blue" small v-if="item.pricePART">mdi-currency-rub</v-icon>
		</template>
		<template v-slot:item.marketpriceOPT="{ item }">
			{{ item.priceOPT }}
			<v-icon color="blue" small v-if="item.priceOPT">mdi-currency-rub</v-icon>
		</template>
		<template v-slot:item.marketPRICE="{ item }">
			{{ item.marketPRICE }}
			<v-icon color="warning" small v-if="item.CUR === '€'">mdi-currency-eur</v-icon>
			<v-icon color="success" small v-if="item.CUR === '$'">mdi-currency-usd</v-icon>
			<v-icon color="blue" small v-if="item.CUR === '₽'">mdi-currency-rub</v-icon>
		</template>
		<template v-slot:item.marketDATE="{ item }">
			{{ new Date(item.marketDATE).toLocaleDateString('ru') }}
		</template>
		<template v-slot:item.action="{ item }">
			<v-icon small class="mr-2" @click="editItem(item)" :disabled="$acl.not.check('Edit')">edit</v-icon>
				<v-icon small @click="deleteItem(item)" :disabled="$acl.not.check('Edit')">delete</v-icon>
				<v-btn text fab small left :to="'/zip_prices/' + item.marketid">
              		<v-icon>more_horiz</v-icon>
            	</v-btn>
    	</template>
		<template v-slot:item.marketSITE="{ item }">
			  <v-icon v-if="item.marketSITE === 1">mdi-hand-okay</v-icon>
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
import { formatDate } from '../../services/helpers'
import { eventBus } from '../../main.js'
import EditRate from './EditRate'
import moment from 'moment'
import _ from 'lodash'
import GetConfig from '@/services/GetConfig'
import { AclRule } from 'vue-acl'

export default {
	data () {
		return {
			menuMarketDate: false,
			filters: {
				searchMarketID: null,
				searchMarketZipID: null,
				searchMarketType: '',
				searchMarketName: '',
				searchMarketModel: [],
				searchMarketPN: '',
				searchMarketCond: [],
				searchMarketSupp: [],
				searchMarketART: '',
				searchMarketPrice: '',
				searchMarketEmail: '',
				searchMarketDate: [],
				searchMarketSite: false,
				searchMarketParts: '',
				searchMarketElement: null,
				searchMarketTH: null
			},
			multiSelects: {
				marketSupp: [],
				marketCond: []
			},
			infoText: '',
			screenSize: 80,
			maxWidth: '100px',
			filterText: 'Нажмите для активации фильтра',
			ZipList: [],
			ModelMarketList: [],
			Zip: [],
			MarketImg: [],
			Models: [],
			ProductsType: [],
			AllTypes: [],
			Parts: [],
			Filters: [],
			search: '',
			selectedImage: null,
			imageWidth: '',
			filtered: '',
			show: true,
			showForFilter: false,
			activeFilterName: '',
			active: 'tab-1',
			toggle: false,
			checkBox1: false,
			checkBox2: false,
			dialog: false,
			dialogImg: false,
			filterName: '',
			showFilterName: false,
			switchFilter: false,
			menu: false,
			menu_filter: false,
			filterTitle: 'Правка цен',
			localLoading: false,
			conditions: [],
			suppliers: [],
			currency: [],
			Dollar: '',
			Euro: '',
			cbr_USD: '',
			cbr_EUR: '',
			ART_1C: '',
			headers: [
				{ text: 'Фото',
					value: 'marketPHOTO',
					selected: localStorage.marketPHOTO,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchMarketPhoto) return true
						return value === this.filters.searchMarketPhoto
					}
				},
				{ text: 'Маркет ID',
					value: 'marketid',
					selected: localStorage.marketid,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchMarketID) return true
						return value === +this.filters.searchMarketID
					}
				},
				{ text: 'ID Элемента',
					value: 'marketID',
					selected: localStorage.marketID,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchMarketZipID) return true
						return value === +this.filters.searchMarketZipID
					}
				},
				{ text: 'Тип',
					value: 'marketTYPE',
					selected: localStorage.marketTYPE,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchMarketType) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.searchMarketType.toLowerCase())
					}
				},
				{ text: 'Имя',
					value: 'marketNAME',
					selected: localStorage.marketNAME,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchMarketName) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.searchMarketName.toLowerCase())
					}
				},
				{ text: 'Описание',
					value: 'marketDESC',
					selected: localStorage.marketDESC,
					visible: true,
					divider: true
				},
				{ text: 'ТХ',
					value: 'marketTH',
					selected: localStorage.marketTH,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchMarketTH) return true
						if (this.filters.searchMarketTH) {
							return value === 'Есть'
						}
					}
				},
				{ text: 'Модели',
					value: 'marketMODELS',
					selected: localStorage.marketMODELS,
					visible: true,
					divider: true,
					width: 190,
					filter: value => {
						if (this.filters.searchMarketModel.length <= 0) return true
						if (!value) return false
						return value.split(', ').includes(this.filters.searchMarketModel.find(item => value.includes(item)))
					}
				},
				{ text: 'PN',
					value: 'marketPN',
					selected: localStorage.marketPN,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchMarketPN) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.searchMarketPN.toLowerCase())
					}
				},
				{ text: 'Пост',
					value: 'marketSUPPLIER',
					selected: localStorage.marketSUPPLIER,
					visible: true,
					divider: true,
					filter: value => {
						if (this.filters.searchMarketSupp.length === 0) return true
						if (!value) return false
						return value.includes(this.filters.searchMarketSupp.find(item => item === value))
					}
				},
				{ text: 'Сост',
					value: 'marketCOND',
					selected: localStorage.marketCOND,
					visible: true,
					divider: true,
					filter: value => {
						if (this.filters.searchMarketCond.length === 0) return true
						if (!value) return false
						return value.includes(this.filters.searchMarketCond.find(item => item === value))
					}
				},
				{ text: 'Арт ТСД',
					value: 'marketART',
					selected: localStorage.marketART,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchMarketART) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.searchMarketART.toLowerCase())
					}
				},
				{ text: 'Кол-во',
					value: 'marketPack',
					selected: localStorage.marketPack,
					visible: true,
					divider: true
				},
				{ text: 'Склад ABS',
					value: 'marketABS',
					selected: localStorage.marketART_ABS,
					visible: true,
					divider: true },
				{ text: 'Склад АП',
					value: 'marketAP',
					selected: localStorage.marketART_AP,
					visible: true,
					divider: true },
				{ text: 'Склад Пекин',
					value: 'marketBEIJING',
					selected: localStorage.marketART_AP,
					visible: true,
					divider: true },
				{ text: 'Стоковая',
					value: 'marketPRICE',
					selected: localStorage.marketPRICE,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchMarketPrice) return true
						if (!value) return false
						return value.toString().includes(this.filters.searchMarketPrice.toString())
					}
				},
				{ text: 'Себес(р.)',
					value: 'priceSTOCK',
					selected: localStorage.marketpriceSTOCK,
					visible: true,
					divider: true },
				{ text: 'Прод(р.)',
					value: 'priceSITE',
					selected: localStorage.marketpriceSITE,
					visible: true,
					divider: true },
				{ text: 'Парт(р.)',
					value: 'pricePART',
					selected: localStorage.marketpricePART,
					visible: true,
					divider: true },
				{ text: 'Опт(р.)',
					value: 'priceOPT',
					selected: localStorage.marketpriceOPT,
					visible: true,
					divider: true },
				{ text: 'Склад',
					value: 'marketSKLAD',
					selected: localStorage.marketSKLAD,
					visible: true,
					divider: true },
				{ text: 'Заказ',
					value: 'marketZAKAZ',
					selected: localStorage.marketZAKAZ,
					visible: true,
					divider: true },
				{ text: 'Авт',
					value: 'marketEMAIL',
					selected: localStorage.marketEMAIL,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchMarketEmail) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.searchMarketEmail.toLowerCase())
					}
				},
				{ text: 'Изменен',
					value: 'marketDATE',
					selected: localStorage.marketDATE,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.searchMarketDate || this.filters.searchMarketDate.length === 0) return true
						if (!value || isNaN(Date.parse(value))) return false
						let Arr = this.filters.searchMarketDate.map(item => moment(item).unix())
						let first = Math.min(...Arr)
						let last = Math.max(...Arr)
						return (moment(value).unix() >= first && moment(value).unix() <= last)
					}
				},
				{ text: 'Сайт',
					value: 'marketSITE',
					selected: localStorage.marketSITE,
					visible: true,
					divider: true,
					filter: value => {
						value === 1 ? value = true : value = false
						if (this.filters.searchMarketSite === 'false' || this.filters.searchMarketSite === 'null') {
							this.filters.searchMarketSite = false
						}
						if (this.filters.searchMarketSite === 'true') {
							this.filters.searchMarketSite = true
						}
						if (!this.filters.searchMarketSite) return true
						return value === this.filters.searchMarketSite
					}
				},
				{ text: 'Ред.',
					value: 'action',
					sortable: false,
					align: 'center',
					selected: localStorage.marketEDIT,
					visible: true,
					divider: true
				}
			],
			editedIndex: -1,
			marketTitle: '',
			editedItem: {
				marketNAME: '',
				marketART: '',
				STOCK_ABS: '',
				STOCK_AP: '',
				STOCK_Beijing: '',
				marketPRICE: '0',
				RATIO_1: '',
				RATIO_2: '',
				marketCOND: '',
				marketSUPPLIER: '',
				ZIP: {},
				MODELS: {},
				PARTS: {},
				ZipAfterSave: {},
				priceSTOCK: '',
				priceSITE: '',
				pricePART: '',
				priceOPT: '',
				CUR: '',
				marketSITE: false,
				marketEMAIL: '',
				marketDATE: null,
				elementTYPE: '',
				marketPARTS: null
			},
			defaultItem: {
				marketPRICE: '0',
				RATIO_1: '1',
				RATIO_2: '1',
				marketART: ''
			},
			priceRules: [
				v => !!v || 'Стоковая цена - обязательный параметр!',
				v => /^[0-9.]+$/.test(v) || 'Допускаются только цифры!'
			],
			ratioRules: [
				v => !!v || 'Коэффициент - обязательный параметр!',
				v =>
					/^[0-9.]+$/.test(v) ||
					'Допускаются только цифры и точка для дробной части!)'
			],
			allArtRules: [
				v => !!v || 'Артикул - обязательный параметр!',
				v =>
					/^[а-яА-ЯёЁa-zA-Z0-9]+$/.test(v) ||
					'Допускаются только цифры и буквы (латиница и кириллица)!'
			],
			artRules: [
				v => !!v || 'Артикул - обязательный параметр!',
				function (v) {
					if (v === undefined || v === '' || v === null) {
						return true
					} else {
						return /^[ТП0-9.]{8,8}$/.test(v) || 'Правильно: Буква ` Т ` кириллицей и 7 цифр!'
					}
				},
				v => this.checkART(v) || 'Такой артикул уже присутствует в БД!'
			],
			ReqRules: [
				v => !!v || 'Обязательный параметр!'
			],
			ObjRules: [
				v => !!v || 'Обязательный параметр!',
				function (v) {
					if (typeof v === 'object') return true
					else return 'Не верный формат ввода!'
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
			json_fields: {},
			json_fields_all: {},
			json_meta: [
				[
					{
						key: 'charset',
						value: 'utf-8'
					}
				]
			]
		}
	},

	computed: {
		TechPropertiesFit () {
			return this.$store.getters.techPropertiesFit
		},
		TechProperties () {
			return this.$store.getters.techPropertiesValues
		},
		mobileView () {
			switch (this.$vuetify.breakpoint.name) {
			case 'xs': return false
			case 'sm': return false
			default: return true
			}
		},
		getJsonFieldsAll () {
			let obj = {}
			this.headers.forEach(item => {
				obj[item.text] = item.value
			})
			return obj
		},
		computedHeaders () {
			return this.headers.filter(header => header.selected)
		},
		loadings () {
			return this.$store.getters.loadings
		},
		formTitle () {
			return this.editedIndex === -1 ? 'Новые цены' : 'Редакция Маркета'
		},
		stock () {
			if (this.editedItem.CUR === '₽') {
				return Math.round(this.editedItem.RATIO_1 * this.editedItem.marketPRICE)
			}
			if (this.editedItem.CUR === '€') {
				return Math.round(
					this.editedItem.RATIO_1 * this.editedItem.marketPRICE * this.Euro
				)
			}
			if (this.editedItem.CUR === '$') {
				return Math.round(
					this.editedItem.RATIO_1 * this.editedItem.marketPRICE * this.Dollar
				)
			}
		},
		site () {
			if (this.editedItem.CUR === '₽') {
				return Math.round(this.editedItem.RATIO_2 * this.editedItem.marketPRICE)
			}
			if (this.editedItem.CUR === '€') {
				return Math.round(
					this.editedItem.RATIO_2 * this.editedItem.marketPRICE * this.Euro
				)
			}
			if (this.editedItem.CUR === '$') {
				return Math.round(
					this.editedItem.RATIO_2 * this.editedItem.marketPRICE * this.Dollar
				)
			}
		},
		partner () {
			if (this.editedItem.CUR === '₽') {
				return Math.round(
					this.editedItem.RATIO_2 * this.editedItem.marketPRICE -
						this.editedItem.RATIO_2 * this.editedItem.marketPRICE * 0.1
				)
			}
			if (this.editedItem.CUR === '€') {
				return Math.round(
					(this.editedItem.RATIO_2 * this.editedItem.marketPRICE -
						this.editedItem.RATIO_2 * this.editedItem.marketPRICE * 0.1) *
						this.Euro
				)
			}
			if (this.editedItem.CUR === '$') {
				return Math.round(
					(this.editedItem.RATIO_2 * this.editedItem.marketPRICE -
						this.editedItem.RATIO_2 * this.editedItem.marketPRICE * 0.1) *
						this.Dollar
				)
			}
		},
		opt () {
			if (this.editedItem.CUR === '₽') {
				return Math.round(
					this.editedItem.RATIO_2 * this.editedItem.marketPRICE -
						this.editedItem.RATIO_2 * this.editedItem.marketPRICE * 0.2
				)
			}
			if (this.editedItem.CUR === '€') {
				return Math.round(
					(this.editedItem.RATIO_2 * this.editedItem.marketPRICE -
						this.editedItem.RATIO_2 * this.editedItem.marketPRICE * 0.2) *
						this.Euro
				)
			}
			if (this.editedItem.CUR === '$') {
				return Math.round(
					(this.editedItem.RATIO_2 * this.editedItem.marketPRICE -
						this.editedItem.RATIO_2 * this.editedItem.marketPRICE * 0.2) *
						this.Dollar
				)
			}
		},
		Edit () {
			return new AclRule('user').and('engineer').or('admin').generate()
		},
		marketSupp () { return _.uniq(this.multiSelects.marketSupp) },
		marketCond () { return _.uniq(this.multiSelects.marketCond) }
	},
	watch: {
		dialog (val) {
			val || this.close()
		},
		dialogImg (val) {
			val || this.closeImg()
		},
		Parts (val) {
			val.forEach(obj => {
				if (typeof obj !== 'object') {
					this.$nextTick(() => val.pop())
				}
			})
		},
		'editedItem.MODELS': {
			deep: true,
			handler (val) {
				let self = this
				if (val) {
					self.getModelMarketList(parseInt(val.ID))
				}
			}
		},
		'editedItem.elementTYPE': {
			deep: true,
			handler (val) {
				console.log(val)
				if (val === 'ЗИП' || val === 1) {
					this.editedItem.MODELS = {}
				}
			}
		}
	},

	mounted () {
		let obj = {}
		for (let key in this.filters) {
			this.$watch(['filters', key].join('.'), (newVal, oldVal) => {
				if (newVal === null) newVal = ''
				obj[key] = newVal
				localStorage.setItem('filtersMarket', JSON.stringify(obj))
			})
		}
		if (localStorage.filtersMarket) {
			var ls = JSON.parse(localStorage.filtersMarket)
			if (ls) {
				Object.keys(this.filters).forEach(key => {
					Object.entries(ls).forEach((item) => {
						if (JSON.parse(localStorage.getItem('filtersMarket'))[item[0]] && JSON.parse(localStorage.getItem('filtersMarket'))[item[0]] !== 'null' && item[0] === key) {
							this.filters[item[0]] = JSON.parse(localStorage.getItem('filtersMarket'))[item[0]]
						}
					})
				})
			}
		}
	},

	methods: {
		async getModelMarketList (modelID) {
			await Api()
				.post('market/get_parts', [modelID])
				.then(res => {
					res.data.success === false ? this.ModelMarketList = this.ZipList : this.ModelMarketList = res.data
				})
				.catch(error => {
					if (error) throw error
				})
		},
		async getFutureMarketId () {
			await Api()
				.get('zip_prices/get_future_market_id')
				.then(res => {
					const count = String(res.data.lastItemId[0].ID + 1).length
					const countZero = 7 - count
					let Preffix = 'П'
					for (let i = 1; i <= countZero; i++) {
						Preffix += '0'
					}
					this.editedItem.marketART = Preffix + (res.data.lastItemId[0].ID + 1)
					console.log(this.editedItem.marketART)
				})
		},
		changeWidth () {
			this.maxWidth === '' ? this.maxWidth = '100px' : this.maxWidth = ''
			localStorage.setItem('sizeColName', this.maxWidth)
		},
		filterElementType (val, type, toggle) {
			if (!toggle) {
				this.filterText = 'Нажмите для активации фильтра'
				this.ZipList = []
				return this.getData()
			}
			this.showForFilter = true
			this.ZipList = this.ZipList.filter(zip => zip.elementTYPE === type && zip.marketPARTS === val)
			setTimeout(() => {
				this.showForFilter = false
				this.filterText = 'Нажмите для деактивации фильтра'
			}, 1500)
		},
		async getExel () {
			const filtered = this.headers.filter(header => header.selected === true)
			filtered.forEach(item => {
				this.json_fields[item.text] = item.value
				if (item.text === 'Стоковая') {
					this.json_fields['Валюта'] = 'CUR'
				}
			})
			return this.$refs.marketTable.$children[0].filteredItems
		},
		getConditions () {
			this.$store.getters.conditions.forEach(c => {
				this.conditions.push(c.name_ru)
			})
		},
		getSuppliers () {
			this.$store.getters.suppliers.forEach(c => {
				this.suppliers.push(c.name)
			})
		},
		getProductsType () {
			this.ProductsType = this.$store.getters.productstype
		},
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
		getZip () {
			this.Zip = this.$store.getters.zip
		},
		getMarketImg () {
			this.MarketImg = this.$store.getters.getMarketImg
		},
		loadPhoto (id) {
			let obj = this.MarketImg.find(img => parseInt(img.id) === parseInt(id))
			return obj ? obj.url : false
		},
		zoom (e, url) {
			e.preventDefault()
			this.openImg()
			this.selectedImage = url
			this.MarketImg.forEach(photo => {
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
		getModels () {
			this.Models = this.$store.getters.models
		},
		getParts () {
			this.Parts = this.$store.getters.Parts
		},
		getCurrency () {
			this.$store.getters.currency.forEach(c => {
				this.currency.push(c.sign)
				if (c.sign === '$') {
					this.Dollar = c.rate
				}
				if (c.sign === '€') {
					this.Euro = c.rate
				}
			})
		},
		checkART (article) {
			if (this.ART_1C === article) {
				return true
			}
			if (article && article.length === 8) {
				if (this.ZipList.find(z => z.ART === article)) {
					return false
				} else {
					return true
				}
			} else {
				return true
			}
		},
		saveColumnFB () {
			let marketColumn = {}
			let id = 'marketColumn'
			this.headers.forEach(header => {
				header.selected === null || header.selected === undefined ? marketColumn[header.value] = false : marketColumn[header.value] = header.selected
			})
			this.menu = false
			this.$store.dispatch('createLocalStorage', [ marketColumn, id ])
		},
		showAllColumn () {
			this.headers.forEach(header => {
				header.selected = true
			})
		},
		async createFilter (name) {
			this.showFilterName = false
			let marketColumn = {}
			const id = 'Маркет'
			await this.headers.forEach(header => {
				header.selected === null ? marketColumn[header.value] = false : marketColumn[header.value] = header.selected
			})
			await this.$store.dispatch('createFilter', [ name, id, { Data: this.filters, Columns: marketColumn } ])
				.then(() => {
					this.Filters.push({ name: name, payload: { Data: this.filters, Columns: marketColumn } })
					this.$store.dispatch('setData', 'Фильтр успешно создан.')
				})
		},
		loadFilter (name) {
			this.Filters.forEach(filter => {
				if (filter.name.toString() === name) {
					this.filters = Object.assign(this.filters, filter.payload.Data)
					this.headers.forEach(header => {
						for (var key in filter.payload.Columns) {
							if (key === header.value) {
								header.selected = filter.payload.Columns[key]
							}
						}
					})

					this.activeFilterName = '" ' + name + ' "'
				}
				this.menu_filter = false
				this.showForFilter = true
				this.$router.replace({
					...this.$router.currentRoute,
					query: {}
				})
				this.infoText = 'Ждите, идёт загрузка фильтра'
				setTimeout(() => {
					this.showForFilter = false
				}, 2000)
			})
		},
		resetFilter () {
			for (let key in this.filters) {
				this.filters[key] = ''
			}
			this.activeFilterName = ''
			this.menu_filter = false
			this.$router.replace({
				...this.$router.currentRoute,
				query: {}
			})
		},
		gotoMainZip (id) {
			this.$router.replace('/zip/#' + id)
		},
		gotoMainModels (id) {
			this.$router.replace('/models/#' + id)
		},
		getEditPrices (toggle) {
			if (!toggle) {
				this.resetFilter()
				this.menu = false
				let clonedZip = [...this.ZipList]
				this.ZipList = []
				this.$store.commit('setLoading', true)
				let arr = Object.values(this.$store.getters.editprices[0])[0].split(',')
				let newArr = []
				let a = _.countBy(arr)
				let filtered = Object.keys(a)
					.sort((c, b) => {
						return a[b] - a[c]
					})
					.reduce((acc, cur) => {
						let o = {}
						o[cur] = a[cur]
						acc.push(o)
						return acc
					}, [])
				filtered.forEach(id => {
					clonedZip.forEach(z => {
						if (parseInt(z.marketid) === parseInt(Object.keys(id)[0])) {
							z.weight = Object.values(id)[0]
							newArr.push(z)
						}
					})
				})
				setTimeout(() => {
					this.ZipList = Array.from(new Set(newArr))
					this.$store.commit('setLoading', false)
					this.toggle = true
					this.filterTitle = 'Сбросить правку'
				}, 2000)
			} else {
				this.ZipList = []
				this.getData()
				this.menu = false
				this.toggle = false
				this.filterTitle = 'Правка цен'
			}
		},
		valute () {
			if (!this.$store.getters.rate) {
				return false
			}
			this.$store.getters.rate.forEach(r => {
				for (let key in r.USD) {
					if (key === 'Value') {
						this.cbr_USD = r.USD[key]
					}
				}
				for (let key in r.EUR) {
					if (key === 'Value') {
						this.cbr_EUR = r.EUR[key]
					}
				}
			})
		},
		namePlusArt (item) {
			return '(' + item.zipID + ') ' + item.zipNAME + ' — ' + item.zipART
		},
		namePlusModel (item) {
			return '(' + item.ID + ') ' + item.TYPE + ' — ' + item.MODEL + ' (' + item.VENDOR + ')'
		},
		idNameTypeArtPNModels (item) {
			return '(' + item.marketid + ') ' + '[' + item.marketART + ', ' + item.marketCOND + ', ' + item.marketSUPPLIER + '] ' + item.marketNAME + ' (' + item.marketPN + ') - ' + item.marketMODELS
		},
		ratingColor (rating) {
			var color = ''
			switch (rating) {
			case 1: { color = 'red'; break }
			case 2: { color = 'orange'; break }
			case 3: { color = 'yellow'; break }
			case 4: { color = 'lime'; break }
			case 5: { color = 'green'; break }
			default: color = 'grey lighten-1'
			}
			return color
		},
		replaceComma (item) {
			if (item && item.includes(',')) {
				return item.replace(/,/g, '<br />')
			} else return item
		},
		countParts (id) {
			let obj = _.countBy(this.$store.getters.Parts, item => parseInt(item.mid) === id)
			return obj.true
		},
		getData () {
			this.$store.commit('clearError')
			this.$store.commit('setLoading', true)
			Api()
				.get('zip_prices')
				.then(res => {
					this.ZipList = Object.values(res.data)
					const isTH = this.TechPropertiesFit.map(obj => obj.zip)
					this.MarketImg.forEach(img => {
						this.ZipList.find(market => {
							if (+market.marketid === +img.id) {
								market.marketPHOTO = true
							}
						})
					})
					this.ZipList.forEach(z => {
						if (z.CUR === '₽') {
							z['priceSTOCK'] = Math.round(z.marketPRICE * z.RATIO_1)
							z['priceSITE'] = Math.round(z.marketPRICE * z.RATIO_2)
							z['pricePART'] = Math.round(
								z.marketPRICE * z.RATIO_2 - z.marketPRICE * z.RATIO_2 * 0.1
							)
							z['priceOPT'] = Math.round(
								z.marketPRICE * z.RATIO_2 - z.marketPRICE * z.RATIO_2 * 0.2
							)
						}
						if (z.CUR === '€') {
							let price = z.marketPRICE * this.Euro
							z['priceSTOCK'] = Math.round(price * z.RATIO_1)
							z['priceSITE'] = Math.round(price * z.RATIO_2)
							z['pricePART'] = Math.round(
								price * z.RATIO_2 - price * z.RATIO_2 * 0.1
							)
							z['priceOPT'] = Math.round(
								price * z.RATIO_2 - price * z.RATIO_2 * 0.2
							)
						}
						if (z.CUR === '$') {
							let price = z.marketPRICE * this.Dollar
							z['priceSTOCK'] = Math.round(price * z.RATIO_1)
							z['priceSITE'] = Math.round(price * z.RATIO_2)
							z['pricePART'] = Math.round(
								price * z.RATIO_2 - price * z.RATIO_2 * 0.1
							)
							z['priceOPT'] = Math.round(
								price * z.RATIO_2 - price * z.RATIO_2 * 0.2
							)
						}
						typeof z.marketEMAIL === 'object'
							? (z.marketEMAIL = '')
							: (z.marketEMAIL = z['marketEMAIL'].split('@')[0])

						if (z.marketDATE) z.marketDATE = formatDate(z.marketDATE)

						if (isTH.find(item => item === z.marketid)) z.marketTH = 'Есть'
						if (z.marketSUPPLIER) this.multiSelects.marketSupp.push(z.marketSUPPLIER)
						if (z.marketCOND) this.multiSelects.marketCond.push(z.marketCOND)
					})
					this.lastItemId = this.ZipList[this.ZipList.length - 1].id
					this.$store.commit('setLoading', false)
				})
				.catch(err => {
					this.$store.commit('setError', err.message)
				})
		},
		editItem (item) {
			this.editedIndex = this.ZipList.indexOf(item)
			if (typeof item.marketPRICE === 'number') item.marketPRICE = JSON.stringify(item.marketPRICE)
			this.editedItem = Object.assign({}, item)
			console.log(this.editedItem)
			this.marketTitle = this.editedItem.marketNAME
			this.ART_1C = item.marketART
			if (this.editedItem.ZipAfterSave === undefined || _.isEmpty(this.editedItem.ZipAfterSave)) {
				this.editedItem.ZIP = this.Zip.find(z => z.zipID === item.marketID)
			} else {
				this.editedItem.ZIP = Object.assign({}, this.editedItem.ZipAfterSave)
			}
			let itemModels = this.Models.find(model => (model.ID === item.marketID) && (item.elementTYPE === 2 || item.elementTYPE === 'МОДЕЛЬ'))
			this.editedItem.MODELS = itemModels
			this.dialog = true
		},

		deleteItem (item) {
			const index = this.ZipList.indexOf(item)
			let userId = this.$store.getters.currentUser.email
			Api()
				.post('zip_prices/del/check', [item.marketid])
				.then(response => {
					const check = response.data[0].zID
					const qty = response.data[0].Qty
					let ans = ''
					check !== null
						? ans = confirm('Данная позиция выбрана в незакрытых ремонтах. Открыть отдельное окно Jira для их редактирования? Количество запросов - ' + qty + ' шт.')
						: ans = confirm('Вы уверены, что хотите удалить эту позицию в Маркете?')
					if (check === null) {
						if (ans) {
							this.$store.commit('clearError')
							this.show = true
							Api()
								.post('zip_prices/del', [item.marketid, userId])
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
					} else {
						if (ans) {
							window.open('http://support.tsd-group.ru/issues/?jql=id in (' + check + ')')
						} else {
							this.$store.commit('setLoading', false)
							this.$store.commit('setInfo', 'Переход по ссылке отменён')
						}
					}
				})
				.catch(error => {
					this.$store.commit('setLoading', false)
					this.$store.commit('setError', error.message)
				})
		},

		close () {
			this.dialog = false
			this.editedItem = Object.assign({}, this.defaultItem)
			this.editedItem.ZipAfterSave = {}
			this.Parts = []
			this.editedIndex = -1
		},

		save () {
			if (this.editedIndex > -1) {
				const objValid = () => {
					if (this.editedItem.elementTYPE === 1) return this.$refs.objZIP.validate()
					if (this.editedItem.elementTYPE === 2) return this.$refs.objMODELS.validate()
				}
				console.log(objValid())
				if (this.$refs.price.validate() && this.$refs.ratio.validate() && this.$refs.cur.validate() && objValid()) {
					this.localLoading = true
					let editedItemId = []
					let elementTYPE = null
					let elementID = null
					let userId = this.$store.getters.currentUser.email
					let objCond = this.$store.getters.conditions.find(
						c => c.name_ru === this.editedItem.marketCOND)
					let objSupp = this.$store.getters.suppliers.find(
						c => c.name === this.editedItem.marketSUPPLIER)
					let objCur = this.$store.getters.currency.find(
						c => c.sign === this.editedItem.CUR
					)
					if (this.editedItem.elementTYPE === 1 && !(_.isEmpty(this.editedItem.ZIP))) {
						elementTYPE = 1
						elementID = this.editedItem.ZIP.zipID
					}
					if (this.editedItem.elementTYPE === 2 && !(_.isEmpty(this.editedItem.MODELS))) {
						elementTYPE = 2
						elementID = this.editedItem.MODELS.ID
					}
					editedItemId.push(
						userId,
						parseFloat(this.editedItem.marketPRICE),
						parseInt(objCur.id),
						parseFloat(this.editedItem.RATIO_1),
						parseFloat(this.editedItem.RATIO_2),
						this.editedItem.marketPN,
						parseInt(objCond.id),
						parseInt(objSupp.id),
						elementID,
						!!this.editedItem.marketSITE,
						this.editedItem.marketART,
						parseInt(this.editedItem.marketPack),
						this.editedItem.marketDESC,
						elementTYPE,
						this.editedItem.marketid
					)
					console.log(editedItemId)
					Api()
						.post('zip_prices/edit', editedItemId)
						.then(response => {
							this.editedItem.marketDATE = formatDate(this.editedItem.marketDATE)
							if (this.editedItem.marketSITE === false) {
								this.editedItem.marketSITE = null
							}
							this.editedItem.marketEMAIL = userId.split('@')[0]
							if (elementTYPE === 1) {
								this.editedItem.marketNAME = this.editedItem.ZIP.zipNAME
								this.editedItem.marketTYPE = this.editedItem.ZIP.zipTYPE
								this.editedItem.marketMODELS = this.editedItem.ZIP.zipMODELS
								this.editedItem.marketID = this.editedItem.ZIP.zipID
								this.editedItem.ZipAfterSave = this.editedItem.ZIP
							}
							if (elementTYPE === 2) {
								this.editedItem.marketTYPE = this.editedItem.MODELS.TYPE
								this.editedItem.marketID = this.editedItem.MODELS.ID
								this.editedItem.marketMODELS = this.editedItem.MODELS.MODEL
								this.editedItem.marketNAME = this.editedItem.MODELS.MODEL
								this.editedItem.ZipAfterSave = this.editedItem.MODELS
							}
							Object.assign(this.ZipList[this.editedIndex], this.editedItem)
							if (this.editedItem.CUR === '₽') {
								this.ZipList[this.editedIndex].priceSTOCK = Math.round(
									this.editedItem.marketPRICE * this.editedItem.RATIO_1
								)
								this.ZipList[this.editedIndex].priceSITE = Math.round(
									this.editedItem.marketPRICE * this.editedItem.RATIO_2
								)
								this.ZipList[this.editedIndex].pricePART = Math.round(
									this.editedItem.marketPRICE * this.editedItem.RATIO_2 -
										this.editedItem.marketPRICE * this.editedItem.RATIO_2 * 0.1
								)
								this.ZipList[this.editedIndex].priceOPT = Math.round(
									this.editedItem.marketPRICE * this.editedItem.RATIO_2 -
										this.editedItem.marketPRICE * this.editedItem.RATIO_2 * 0.2
								)
							}
							if (this.editedItem.CUR === '€') {
								let price = this.editedItem.marketPRICE * this.Euro
								this.ZipList[this.editedIndex].priceSTOCK = Math.round(
									price * this.editedItem.RATIO_1
								)
								this.ZipList[this.editedIndex].priceSITE = Math.round(
									price * this.editedItem.RATIO_2
								)
								this.ZipList[this.editedIndex].pricePART = Math.round(
									price * this.editedItem.RATIO_2 -
										price * this.editedItem.RATIO_2 * 0.1
								)
								this.ZipList[this.editedIndex].priceOPT = Math.round(
									price * this.editedItem.RATIO_2 -
										price * this.editedItem.RATIO_2 * 0.2
								)
							}
							if (this.editedItem.CUR === '$') {
								let price = this.editedItem.marketPRICE * this.Dollar
								this.ZipList[this.editedIndex].priceSTOCK = Math.round(
									price * this.editedItem.RATIO_1
								)
								this.ZipList[this.editedIndex].priceSITE = Math.round(
									price * this.editedItem.RATIO_2
								)
								this.ZipList[this.editedIndex].pricePART = Math.round(
									price * this.editedItem.RATIO_2 -
										price * this.editedItem.RATIO_2 * 0.1
								)
								this.ZipList[this.editedIndex].priceOPT = Math.round(
									price * this.editedItem.RATIO_2 -
										price * this.editedItem.RATIO_2 * 0.2
								)
							}
							this.$store.dispatch('fetchParts')
								.then(res => {
									this.$store.dispatch('setData', response.data)
										.then(res => {
											this.localLoading = false
											this.close()
										})
								})
						})
						.catch(error => {
							this.$store.commit('setError', error.message)
						})
				}
			} else {
				if (this.$refs.price.validate() && this.$refs.ratio.validate() && this.$refs.cur.validate() && this.$refs.element.validate() &&
				this.$refs.supp.validate() && this.$refs.cond.validate()) {
					this.localLoading = true
					let editedItemId = []
					let PartsId = []
					let RESULT = {}
					let elementTYPE = null
					let elementID = null
					let userId = this.$store.getters.currentUser.email
					let objCond = this.$store.getters.conditions.find(
						c => c.name_ru === this.editedItem.marketCOND)
					let objSupp = this.$store.getters.suppliers.find(
						c => c.name === this.editedItem.marketSUPPLIER)
					let objCur = this.$store.getters.currency.find(
						c => c.sign === this.editedItem.CUR
					)
					if (this.editedItem.elementTYPE === 'ЗИП' && !(_.isEmpty(this.editedItem.ZIP))) {
						elementTYPE = 1
						elementID = this.editedItem.ZIP.zipID
					} else if (_.isEmpty(this.editedItem.ZIP) && this.editedItem.elementTYPE === 'ЗИП') {
						this.localLoading = false
						return this.$store.dispatch('setError', 'Поле ЗИП обязательно к заполнению!')
					}
					if (this.editedItem.elementTYPE === 'МОДЕЛЬ' && !(_.isEmpty(this.editedItem.MODELS))) {
						elementTYPE = 2
						elementID = this.editedItem.MODELS.ID
					} else if (_.isEmpty(this.editedItem.MODELS) && this.editedItem.elementTYPE === 'МОДЕЛЬ') {
						this.localLoading = false
						return this.$store.dispatch('setError', 'Поле МОДЕЛЬ обязательно к заполнению!')
					}
					editedItemId.push(
						userId,
						parseFloat(this.editedItem.marketPRICE),
						parseInt(objCur.id),
						parseFloat(this.editedItem.RATIO_1),
						parseFloat(this.editedItem.RATIO_2),
						this.editedItem.marketPN,
						parseInt(objCond.id),
						parseInt(objSupp.id),
						elementID,
						!!this.editedItem.marketSITE,
						this.editedItem.marketART,
						this.editedItem.marketPack ? parseInt(this.editedItem.marketPack) : null,
						elementTYPE,
						this.editedItem.marketDESC ? this.editedItem.marketDESC : null
					)
					if (this.Parts.length > 0) {
						this.Parts.forEach(part => {
							PartsId.push(part.marketid)
						})
						RESULT = { ELEMENT: editedItemId, PartsId: PartsId }
						console.log(RESULT)
					}
					Api()
						.post('zip_prices/add', RESULT !== undefined && !(_.isEmpty(RESULT)) ? RESULT : editedItemId)
						.then(response => {
							this.editedItem.marketDATE = formatDate(this.editedItem.marketDATE)
							if (this.editedItem.marketSITE === false) {
								this.editedItem.marketSITE = null
							}
							this.editedItem.marketEMAIL = userId.split('@')[0]
							if (elementTYPE === 1) {
								this.editedItem.marketNAME = this.editedItem.ZIP.zipNAME
								this.editedItem.marketTYPE = this.editedItem.ZIP.zipTYPE
								this.editedItem.marketMODELS = this.editedItem.ZIP.zipMODELS
								this.editedItem.marketID = this.editedItem.ZIP.zipID
								this.editedItem.ZipAfterSave = this.editedItem.ZIP
								this.editedItem.elementTYPE = 1
								if (RESULT !== undefined && !(_.isEmpty(RESULT))) {
									this.editedItem.marketPARTS = 1
								} else {
									this.editedItem.marketPARTS = 0
								}
							}
							if (elementTYPE === 2) {
								this.editedItem.marketTYPE = this.editedItem.MODELS.TYPE
								this.editedItem.marketID = this.editedItem.MODELS.ID
								this.editedItem.marketMODELS = this.editedItem.MODELS.MODEL
								this.editedItem.marketNAME = this.editedItem.MODELS.MODEL
								this.editedItem.ZipAfterSave = this.editedItem.MODELS
								this.editedItem.elementTYPE = 2
								if (RESULT !== undefined && !(_.isEmpty(RESULT))) {
									this.editedItem.marketPARTS = 1
								} else {
									this.editedItem.marketPARTS = 0
								}
							}
							this.ZipList.push(this.editedItem)
							this.$store.dispatch('setData', response.data.success)
							this.$store.dispatch('fetchParts')
							this.lastItemId = this.editedItem.marketid = response.data.lastItemId
							var lastObj = this.ZipList.find(z => z.marketid === response.data.lastItemId)
							if (this.editedItem.CUR === '₽') {
								lastObj.priceSTOCK = Math.round(
									this.editedItem.marketPRICE * this.editedItem.RATIO_1
								)
								lastObj.priceSITE = Math.round(
									this.editedItem.marketPRICE * this.editedItem.RATIO_2
								)
								lastObj.pricePART = Math.round(
									this.editedItem.marketPRICE * this.editedItem.RATIO_2 -
										this.editedItem.marketPRICE * this.editedItem.RATIO_2 * 0.1
								)
								lastObj.priceOPT = Math.round(
									this.editedItem.marketPRICE * this.editedItem.RATIO_2 -
										this.editedItem.marketPRICE * this.editedItem.RATIO_2 * 0.2
								)
							}
							if (this.editedItem.CUR === '€') {
								let price = this.editedItem.marketPRICE * this.Euro
								lastObj.priceSTOCK = Math.round(
									price * this.editedItem.RATIO_1
								)
								lastObj.priceSITE = Math.round(
									price * this.editedItem.RATIO_2
								)
								lastObj.pricePART = Math.round(
									price * this.editedItem.RATIO_2 -
										price * this.editedItem.RATIO_2 * 0.1
								)
								lastObj.priceOPT = Math.round(
									price * this.editedItem.RATIO_2 -
										price * this.editedItem.RATIO_2 * 0.2
								)
							}
							if (this.editedItem.CUR === '$') {
								let price = this.editedItem.marketPRICE * this.Dollar
								lastObj.priceSTOCK = Math.round(
									price * this.editedItem.RATIO_1
								)
								lastObj.priceSITE = Math.round(
									price * this.editedItem.RATIO_2
								)
								lastObj.pricePART = Math.round(
									price * this.editedItem.RATIO_2 -
										price * this.editedItem.RATIO_2 * 0.1
								)
								lastObj.priceOPT = Math.round(
									price * this.editedItem.RATIO_2 -
										price * this.editedItem.RATIO_2 * 0.2
								)
							}
							this.localLoading = false
							this.close()
						})
						.catch(error => {
							this.$store.commit('setError', error.message)
						})
				} else {
					this.$store.dispatch('setError', 'Заполните соответствующие поля!')
					this.localLoading = false
				}
			}
		},
		deleteProps (obj, prop) {
			for (let p of prop) {
				p in obj && delete obj[p]
			}
		},
		init () {
			if (window.location.hash) {
				const id = window.location.hash.replace(/[^0-9]/gim, '')
				this.filters.searchMarketZipID = id
			}
			this.maxWidth = localStorage.getItem('sizeColName')
		}
	},
	async created () {
		this.$store.dispatch('fetchZip')
		this.$store.dispatch('fetchCurrency')
		this.$store.dispatch('fetchEditPrices')
		this.$store.dispatch('getRate')
		this.$store.dispatch('fetchSuppliers')
		this.$store.dispatch('fetchConditions')
		this.$store.dispatch('fetchProductsType')
		this.$store.dispatch('fetchModelsType')
		this.$store.dispatch('fetchModels')
		this.$store.dispatch('fetchParts')
		this.$store.dispatch('getMarketImg')
		this.$store.dispatch('fetchTechPropertiesFit')
		this.$store.dispatch('fetchTechPropertiesValues')
		/* чтение конфига */
		await GetConfig.getColumn('marketColumn')
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
				console.log('Данные о сохранеённых колонках успешно загружены: ', data)
			})
			.catch(error => {
				this.showForFilter = true
				this.infoText = error.message
			})
		await GetConfig.getMyFilters(this.$route.query.userID, this.$route.query.filterName, this.$route.query.payload)
			.then((filters) => {
				if (filters === undefined) return false
				if (filters['Маркет'] !== undefined) {
					Object.entries(filters['Маркет']).forEach(filter => {
						this.Filters.push({ name: filter[0], payload: filter[1] })
						if (this.$route.query.market === filter[0]) {
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
			.finally(() => {
				this.getData()
				this.getZip()
				this.getModels()
				this.getCurrency()
				this.getConditions()
				this.getSuppliers()
				this.getProductsType()
				this.getAllTypes()
					.then(data => {
						this.AllTypes = data
					})
				this.valute()
				this.getMarketImg()
				this.init()
			})
		await eventBus.$on('Rate', data => {
			data.forEach(d => {
				if (d.name === 'Dollar') {
					this.Dollar = d.value
				}
				if (d.name === 'Euro') {
					this.Euro = d.value
				}
			})
		})
	},
	components: {
		appEditRate: EditRate
	}
}
</script>

<style scoped>
.models {
	word-break: break-all;
}
.xlsx_btn {
	cursor: pointer;
	touch-action: none;
}
.maxWidth {
	max-width: 100px !important;
}
.minWidth {
	min-width: 200px !important;
}
.noWrap {
    white-space: nowrap;
}
</style>
