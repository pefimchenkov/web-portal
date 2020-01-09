<template>
    <v-container v-if="!loadings && Deals.length !== 0" fluid>
		<ProgressDialog :show="show" :infoText="infoText"></ProgressDialog>
		<v-app-bar :fixed="checkBox1" text color="white" class="elevation-2 mb-1">
			<v-container container--fluid>
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
					<v-flex xs4 sm2>
						<p class="headline">Сделки со счетами</p>
					</v-flex>
				<v-spacer></v-spacer>
			<v-flex xs3 sm3 md3 lg2 xl1 v-show="$acl.check('Financier')">
				<v-btn width='95'>
					<download-excel
					:fields="json_fields"
					:fetch="getExel"
					class="btn btn-default xlsx_btn"
					name="deals_list.xls"
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
							@click="saveColumnFB"
							><v-icon color="success" class="mr-1">save</v-icon>
							Сохранить
						</v-btn>
						<v-btn
							@click="showAllColumn"
							><v-icon color="warning" class="mr-1">mdi-eye</v-icon>
							Включить всё
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
				<template v-slot:activator="{ on }">
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
							<!-- <v-list-item>
								<v-btn class="text-center" text @click="showFilterName = true" :disabled="$acl.not.check('Edit')">Создать фильтр</v-btn>
							</v-list-item> -->
							<v-list-item>
								<v-btn  text @click="resetFilter">Сбросить фильтр</v-btn>
							</v-list-item>
						</v-list>
				</v-card>
				</v-menu>
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
          	:items="Deals"
			fixed-header
			calculate-widths
			:items-per-page=50
			item-key="UniqueId"
			:mobile-breakpoint="550"
			sort-by='id'
			ref="dealsListTable"
			:dense="checkBox2"
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
		<!-- Темплейты для фильтров -->
		<template v-slot:body.prepend v-if="mobileView">
		<tr>
			<td v-if="computedHeaders.find(header => header.value === 'id')"><span>ИТОГО:</span></td>
			<td v-if="computedHeaders.find(header => header.value === 'client_1c')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'client_db')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'client_1c_db')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_1c')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_date')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_base')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_base_date')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_parent')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_parent_date')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_reporter')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'firm')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'project_1c')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'rnh')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'ready')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_sum')">
				<v-text-field v-if="$refs.dealsListTable" v-model="dealsSum" type="text" readonly append-icon="mdi-currency-rub"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_pay')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_ship')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'Delay')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'ShipsQty')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'LastShip')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'LastShipDate')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'LastShipSum')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'jira_id')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'jira_date')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'SUMMARY')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'jira_client')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'STATUS')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'jira_bill')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'MANAGER')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'jira_sm')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'LEAD_ENG')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'Dep')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'Litso')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'Resolve')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'Cmmnt')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'Zakupka')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'StatusOpl')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'action')" colspan="1"></td>
		</tr>
        <tr>
			<td v-if="computedHeaders.find(header => header.value === 'id')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'client_1c')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'client_db')">
				<v-text-field v-model="filters.clientDb" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'client_1c_db')">
				<v-text-field v-model="filters.client1cDb" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_1c')">
				<v-text-field clearable v-model="filters.bill1C" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_date')">
				<v-menu
					v-model="menuBillDate"
					:close-on-content-click="false"
					transition="scale-transition"
					ref="menuBillDate"
				>
					<template v-slot:activator="{ on }">
						<v-icon v-on="on" :color="filters.billDate !== null && filters.billDate.length > 0 ? `green darken-2` : ``">event</v-icon>
					</template>
					<v-date-picker v-model="filters.billDate" multiple no-title>
						<div class="flex-grow-1"></div>
						<v-btn text color="primary" @click="menuBillDate = false">Отмена</v-btn>
						<v-btn text color="primary" @click="$refs.menuBillDate.save(filters.billDate)">OK</v-btn>
					</v-date-picker>
				</v-menu>
				<v-icon v-if="filters.billDate !== null && filters.billDate.length > 0" @click="filters.billDate = []">clear</v-icon>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_base')">
				<v-text-field clearable v-model="filters.billBase" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_base_date')">
				<v-menu
					v-model="menuBillBaseDate"
					:close-on-content-click="false"
					transition="scale-transition"
					ref="menuBillBaseDate"
				>
					<template v-slot:activator="{ on }">
							<v-icon v-on="on" :color="filters.billBaseDate !== null && filters.billBaseDate.length > 0 ? `green darken-2` : ``">event</v-icon>
					</template>
					<v-date-picker v-model="filters.billBaseDate" multiple no-title scrollable>
						<div class="flex-grow-1"></div>
						<v-btn text color="primary" @click="menuBillBaseDate = false">Отмена</v-btn>
						<v-btn text color="primary" @click="$refs.menuBillBaseDate.save(filters.billBaseDate)">OK</v-btn>
					</v-date-picker>
				</v-menu>
				<v-icon v-if="filters.billBaseDate !== null && filters.billBaseDate.length > 0" @click="filters.billBaseDate = []">clear</v-icon>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_parent')">
				<v-text-field clearable v-model="filters.billParent" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_parent_date')">
				<v-menu
					v-model="menuBillParentDate"
					:close-on-content-click="false"
					transition="scale-transition"
					ref="menuBillParentDate"
				>
					<template v-slot:activator="{ on }">
							<v-icon v-on="on" :color="filters.billParentDate !== null && filters.billParentDate.length > 0 ? `green darken-2` : ``">event</v-icon>
					</template>
					<v-date-picker v-model="filters.billParentDate" multiple no-title scrollable>
						<div class="flex-grow-1"></div>
						<v-btn text color="primary" @click="menuBillParentDate = false">Отмена</v-btn>
						<v-btn text color="primary" @click="$refs.menuBillParentDate.save(filters.billParentDate)">OK</v-btn>
					</v-date-picker>
				</v-menu>
				<v-icon v-if="filters.billParentDate !== null && filters.billParentDate.length > 0" @click="filters.billParentDate = []">clear</v-icon>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_reporter')">
				<v-autocomplete
					v-model="filters.billReporter"
					multiple
					:items="billReporter"
					deletable-chips
					clearable
					chips
					>
				</v-autocomplete>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'firm')">
				<v-autocomplete
					v-model="filters.firm"
					multiple
					:items="firm"
					deletable-chips
					clearable
					chips
					>
				</v-autocomplete>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'project_1c')">
				<v-autocomplete
					v-model="filters.project1C"
					multiple
					:items="project1C"
					deletable-chips
					clearable
					chips
					>
				</v-autocomplete>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'rnh')">
				<v-text-field clearable v-model="filters.rnh" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'ready')">
				<v-checkbox v-model="filters.ready"></v-checkbox>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_sum')">
				<!-- <v-text-field clearable v-model="filters.billSum" type="text"></v-text-field> -->
				<v-select
					v-model="filters.billSum"
					clearable
					:items="['до 10 т.р.', 'от 50 т.р.', 'от 100 т.р.', 'от 250 т.р.', 'от 500 т.р.', 'от 1 млн.р.', 'от 2,5 млн.р.', 'от 5 млн.р.', 'от 10 млн.р.', 'от 10 млн.р.']"
				></v-select>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_pay')">
				<v-select
					v-model="filters.billPay"
					clearable
					:items="['не оплачено', 'частично оплачено', 'полностью оплачено']"
				></v-select>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'bill_ship')">
				<v-select
					v-model="filters.billShip"
					clearable
					:items="['не отгружено', 'частично отгружено', 'полностью отгружено']"
				></v-select>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'Delay')">
				<v-text-field clearable v-model="filters.Delay" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'ShipsQty')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'LastShip')">
				<v-text-field clearable v-model="filters.lastShip" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'LastShipDate')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'LastShipSum')" colspan="1"></td>
			<td v-if="computedHeaders.find(header => header.value === 'jira_id')">
				<v-text-field clearable v-model="filters.jiraID" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'jira_date')">
				<v-menu
					v-model="menuJiraDate"
					:close-on-content-click="false"
					transition="scale-transition"
					ref="menuJiraDate"
				>
					<template v-slot:activator="{ on }">
							<v-icon v-on="on" :color="filters.jiraDate !== null && filters.jiraDate.length > 0 ? `green darken-2` : ``">event</v-icon>
					</template>
					<v-date-picker v-model="filters.jiraDate" multiple no-title scrollable>
						<div class="flex-grow-1"></div>
						<v-btn text color="primary" @click="menuJiraDate = false">Отмена</v-btn>
						<v-btn text color="primary" @click="$refs.menuJiraDate.save(filters.jiraDate)">OK</v-btn>
					</v-date-picker>
				</v-menu>
				<v-icon v-if="filters.jiraDate !== null && filters.jiraDate.length > 0" @click="filters.jiraDate = []">clear</v-icon>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'SUMMARY')">
				<v-text-field clearable v-model="filters.SUMMARY" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'jira_client')">
				<v-text-field clearable v-model="filters.jiraClient" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'STATUS')">
				<v-autocomplete
					v-model="filters.STATUS"
					multiple
					:items="STATUS"
					deletable-chips
					clearable
					chips
					>
				</v-autocomplete>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'jira_bill')">
				<v-text-field clearable v-model="filters.jiraBill" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'MANAGER')">
				<v-autocomplete
					v-model="filters.MANAGER"
					multiple
					:items="MANAGER"
					deletable-chips
					clearable
					chips
					>
				</v-autocomplete>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'jira_sm')">
				<v-autocomplete
					v-model="filters.jiraSM"
					multiple
					:items="jiraSM"
					deletable-chips
					clearable
					chips
					>
				</v-autocomplete>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'LEAD_ENG')">
				<v-autocomplete
					v-model="filters.leadEng"
					multiple
					:items="leadEng"
					deletable-chips
					clearable
					chips
					>
				</v-autocomplete>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'Dep')">
				<v-text-field clearable v-model="filters.Department" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'Litso')">
				<v-text-field clearable v-model="filters.Litso" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'Resolve')">
				<v-select
					v-model="filters.Resolve"
					clearable
					:items="['пусто', 'не отвечен', 'отвечен', 'решён']"
				></v-select>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'Cmmnt')">
				<v-text-field clearable v-model="filters.Cmmnt" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'Zakupka')">
				<v-text-field clearable v-model="filters.Zakupka" type="text"></v-text-field>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'StatusOpl')">
				<v-select
					v-model="filters.StatusOpl"
					clearable
					:items="['нет оплаты', 'частично', 'полностью']"
				></v-select>
			</td>
			<td v-if="computedHeaders.find(header => header.value === 'action')" colspan='1'></td>
        </tr>
      </template>
	<!-- Темплейты для столбцов таблицы -->
	  <template v-slot:item.bill_date="{item}">
		  {{ new Date(item.bill_date).toLocaleDateString('ru') }}
	  </template>
	  <template v-slot:item.bill_1c="{ item }">
		  <span :style="item.qty ? 'font-weight: bold' : ''">{{ item.bill_1c }}</span>
	  </template>
	  <template v-slot:item.bill_base_date="{item}">
		  {{ new Date(item.bill_base_date).toLocaleDateString('ru') }}
	  </template>
	  <template v-slot:item.bill_parent_date="{item}">
		  {{ new Date(item.bill_parent_date).toLocaleDateString('ru') }}
	  </template>
	  <template v-slot:item.jira_date="{item}">
		  {{ new Date(item.jira_date).toLocaleDateString('ru') }}
	  </template>
	  	<template v-slot:header.ready="{ header }">
      		<v-icon>done</v-icon>
    	</template>
		<template v-slot:item.Zakupka="{item}">
			<span style="color: #bbb;">{{ item.Zakupka }}</span>
		</template>
		<template v-slot:item.StatusOpl="{item}">
			<v-icon v-if="item.StatusOpl" :style="`color:${item.StatusOpl}`">{{ formatColor(item.StatusOpl) }}</v-icon>
		</template>
		<template v-slot:item.bill_pay="{ item }">
			<v-chip small :color="getColor(item.bill_pay)" dark>{{ item.bill_pay }} <v-icon x-small>mdi-percent</v-icon></v-chip>
    	</template>
		<template v-slot:item.bill_ship="{ item }">
			<v-chip small :color="getColor(item.bill_ship)" dark>{{ item.bill_ship }} <v-icon x-small>mdi-percent</v-icon></v-chip>
    	</template>
		<template v-slot:item.jira_id="{ item }">
      		<a :href="`http://support.tsd-group.ru/browse/${ item.jira_id }`" target="_blank">{{ item.jira_id }}</a>
    	</template>
		<template v-slot:item.Delay="{ item }">
			<span :style="statusDealy(item.Spec, item.Cont)">
				{{ item.Delay }}
			</span>
		</template>
		<template v-slot:item.LEAD_ENG="{ item }">
			<span :style="statusDealy(item.Spec)">
				{{ item.LEAD_ENG }}
			</span>
		</template>
		<template v-slot:item.LastShipDate="{item}">
		  {{ new Date(item.LastShipDate).toLocaleDateString('ru') }}
	  </template>
		<template v-slot:item.action="{ item }">
      		<v-btn  text fab small left :to="'/deals/' + item.id + '/' + item.bill_1c">
              		<v-icon>more_horiz</v-icon>
            	</v-btn>
    	</template>
        </v-data-table>
      </div>
    </v-container>

    <v-container v-else-if="!loadings && Deals.length === 0" fill-height fluid>
	  <v-layout row fill-height align-center>
        	<v-flex xs12 text-center>
          		<v-progress-circular :size="100" color="primary" indeterminate></v-progress-circular>
        	</v-flex>
    </v-layout>
  </v-container>

</template>

<script>
import moment from 'moment'
// import { duplicates } from '../../services/helpers'
import GetConfig from '@/services/GetConfig'
import _ from 'lodash'
import ProgressDialog from '../shared/ProgressDialog'

export default {
	data () {
		return {
			filters: {
				billDate: [],
				billBase: '',
				clientDb: '',
				client1cDb: '',
				bill1C: '',
				billBaseDate: [],
				billParent: '',
				billParentDate: [],
				billReporter: [],
				firm: [],
				project1C: [],
				rnh: '',
				ready: false,
				billSum: '',
				billPay: '',
				billShip: null,
				lastShip: '',
				jiraID: '',
				jiraDate: [],
				SUMMARY: '',
				jiraClient: '',
				STATUS: [],
				jiraBill: '',
				MANAGER: [],
				jiraSM: [],
				leadEng: [],
				Department: '',
				Litso: '',
				Resolve: '',
				Zakupka: '',
				StatusOpl: '',
				Cmmnt: '',
				Delay: ''
			},
			multiSelects: {
				firm: [],
				leadEng: [],
				MANAGER: [],
				STATUS: [],
				billReporter: [],
				jiraSM: [],
				project1C: []
			},
			show: false,
			menu: false,
			menuBillDate: false,
			menuBillBaseDate: false,
			menuBillParentDate: false,
			menuJiraDate: false,
			localloading: false,
			checkBox1: false,
			checkBox2: false,
			Filters: [],
			Deals: [],
			Bill1C: [],
			showForFilter: false,
			filterName: '',
			showFilterName: false,
			activeFilterName: '',
			menu_filter: false,
			selectedImage: null,
			search: '',
			infoText: '',
			dialog: false,
			headers: [
				{ text: 'id',
					value: 'id',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['id'] : false,
					visible: true,
					divider: true
				},
				{ text: 'Контрагент',
					value: 'client_1c',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['client_1c'] : false,
					visible: true,
					divider: true
				},
				{ text: 'ЮрЛицо',
					value: 'client_db',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['client_db'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.clientDb) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.clientDb.toLowerCase())
					}
				},
				{ text: 'ЮрЛицо 1C',
					value: 'client_1c_db',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['client_1c_db'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.client1cDb) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.client1cDb.toLowerCase())
					}
				},
				{ text: 'Счёт',
					value: 'bill_1c',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['bill_1c'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.bill1C) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.bill1C.toLowerCase())
					}
				},
				{ text: 'Дата',
					value: 'bill_date',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['bill_date'] : false,
					visible: true,
					divider: true,
					width: 120,
					filter: value => {
						if (!this.filters.billDate || this.filters.billDate.length === 0) return true
						if (!value || isNaN(Date.parse(value))) return false
						let Arr = this.filters.billDate.map(item => moment(item).unix())
						let first = Math.min(...Arr)
						let last = Math.max(...Arr)
						return (moment(value).unix() >= first && moment(value).unix() <= last)
					}
				},
				{ text: 'СО',
					value: 'bill_base',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['bill_base'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.billBase) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.billBase.toLowerCase())
					}
				},
				{ text: 'Дата СО',
					value: 'bill_base_date',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['bill_base_date'] : false,
					visible: true,
					divider: true,
					width: 120,
					filter: value => {
						if (!this.filters.billBaseDate || this.filters.billBaseDate.length === 0) return true
						if (!value || isNaN(Date.parse(value))) return false
						let Arr = this.filters.billBaseDate.map(item => moment(item).unix())
						let first = Math.min(...Arr)
						let last = Math.max(...Arr)
						return (moment(value).unix() >= first && moment(value).unix() <= last)
					}
				},
				{ text: 'НС',
					value: 'bill_parent',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['bill_parent'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.billParent) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.billParent.toLowerCase())
					}
				},
				{ text: 'Дата НС',
					value: 'bill_parent_date',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['bill_parent_date'] : false,
					visible: true,
					divider: true,
					width: 120,
					filter: value => {
						if (!this.filters.billParentDate || this.filters.billParentDate.length === 0) return true
						if (!value || isNaN(Date.parse(value))) return false
						let Arr = this.filters.billParentDate.map(item => moment(item).unix())
						let first = Math.min(...Arr)
						let last = Math.max(...Arr)
						return (moment(value).unix() >= first && moment(value).unix() <= last)
					}
				},
				{ text: 'Автор',
					value: 'bill_reporter',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['bill_reporter'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (this.filters.billReporter.length === 0) return true
						if (!value) return false
						return value.includes(this.filters.billReporter.find(item => item === value))
					}
				},
				{ text: 'Фирма',
					value: 'firm',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['firm'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (this.filters.firm.length === 0) return true
						if (!value) return false
						return value.includes(this.filters.firm.find(item => item === value))
					}
				},
				{ text: 'Проект',
					value: 'project_1c',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['project_1c'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (this.filters.project1C.length === 0) return true
						if (!value) return false
						return value.includes(this.filters.project1C.find(item => item === value))
					}
				},
				{ text: 'РНХ',
					value: 'rnh',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['rnh'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.rnh) return true
						if (!value) return false
						return value.toString().includes(this.filters.rnh.toString())
					}
				},
				{ text: 'Готовность',
					value: 'ready',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['ready'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.ready) return true
						if (!value) return false
						return (value = this.filters.ready)
					}
				},
				{ text: 'Сумма',
					value: 'bill_sum',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['bill_sum'] : false,
					visible: true,
					divider: true,
					width: '150',
					filter: value => {
						if (!this.filters.billSum) return true
						if (!value) return false
						if (this.filters.billSum === 'до 10 т.р.') return (value <= 10000)
						if (this.filters.billSum === 'от 50 т.р.') return (value >= 50000)
						if (this.filters.billSum === 'от 100 т.р.') return (value >= 100000)
						if (this.filters.billSum === 'от 250 т.р.') return (value >= 250000)
						if (this.filters.billSum === 'от 500 т.р.') return (value >= 500000)
						if (this.filters.billSum === 'от 1 млн.р.') return (value >= 1000000)
						if (this.filters.billSum === 'от 2,5 млн.р.') return (value >= 2500000)
						if (this.filters.billSum === 'от 5 млн.р.') return (value >= 5000000)
						if (this.filters.billSum === 'от 10 млн.р.') return (value >= 10000000)
						if (this.filters.billSum === 'от 10 млн.р.') return (value > 10000000)
					}
				},
				{ text: 'Оплачено',
					value: 'bill_pay',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['bill_pay'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.billPay) return true
						// if (!value) return false
						if (this.filters.billPay === 'не оплачено') return (value === 0 || value <= 5)
						if (this.filters.billPay === 'полностью оплачено') return ((parseInt(value) + 5) >= 100)
						if (this.filters.billPay === 'частично оплачено') return (parseInt(value) <= 94 && parseInt(value) >= 6)
					}
				},
				{ text: 'Отгружено',
					value: 'bill_ship',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['bill_ship'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.billShip) return true
						// if (!value) return false
						if (this.filters.billShip === 'не отгружено') return (value === 0 || value <= 5)
						if (this.filters.billShip === 'полностью отгружено') return ((parseInt(value) + 5) >= 100)
						if (this.filters.billShip === 'частично отгружено') return (parseInt(value) <= 94 && parseInt(value) >= 6)
					}
				},
				{ text: 'Долг (дни)',
					value: 'Delay',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['Delay'] : false,
					visible: true,
					divider: true,
					width: 150,
					filter: value => {
						if (!this.filters.Delay) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.Delay.toLowerCase())
					}
				},
				{ text: 'Отгрузки',
					value: 'ShipsQty',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['ShipsQty'] : false,
					visible: true,
					divider: true
				},
				{ text: 'Последняя отгрузка',
					value: 'LastShip',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['LastShip'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.lastShip) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.lastShip.toLowerCase())
					}
				},
				{ text: 'Дата ПО',
					value: 'LastShipDate',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['LastShipDate'] : false,
					visible: true,
					divider: true
				},
				{ text: 'Сумма ПО',
					value: 'LastShipSum',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['LastShipSum'] : false,
					visible: true,
					divider: true
				},
				{ text: 'Ключ',
					value: 'jira_id',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['jira_id'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.jiraID) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.jiraID.toLowerCase())
					}
				},
				{ text: 'Создан',
					value: 'jira_date',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['jira_date'] : false,
					visible: true,
					divider: true,
					width: 120,
					filter: value => {
						if (!this.filters.jiraDate || this.filters.jiraDate.length === 0) return true
						if (!value || isNaN(Date.parse(value))) return false
						let Arr = this.filters.jiraDate.map(item => moment(item).unix())
						let first = Math.min(...Arr)
						let last = Math.max(...Arr)
						return (moment(value).unix() >= first && moment(value).unix() <= last)
					}
				},
				{ text: 'Тема',
					value: 'SUMMARY',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['SUMMARY'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.SUMMARY) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.SUMMARY.toLowerCase())
					}
				},
				{ text: 'Организация',
					value: 'jira_client',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['jira_client'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.jiraClient) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.jiraClient.toLowerCase())
					}
				},
				{ text: 'Статус',
					value: 'STATUS',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['STATUS'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (this.filters.STATUS.length === 0) return true
						if (!value) return false
						return value.includes(this.filters.STATUS.find(item => item === value))
					}
				},
				{ text: 'Счёт Jira',
					value: 'jira_bill',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['jira_bill'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.jiraBill) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.jiraBill.toLowerCase())
					}
				},
				{ text: 'Менеджер',
					value: 'MANAGER',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['MANAGER'] : false,
					visible: true,
					divider: true,
					width: 150,
					filter: value => {
						if (this.filters.MANAGER.length === 0) return true
						if (!value) return false
						return value.includes(this.filters.MANAGER.find(item => item === value))
					}
				},
				{ text: 'Сервис-менеджер',
					value: 'jira_sm',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['jira_sm'] : false,
					visible: true,
					divider: true,
					width: 150,
					filter: value => {
						if (this.filters.MANAGER.length === 0) return true
						if (!value) return false
						return value.includes(this.filters.MANAGER.find(item => item === value))
					}
				},
				{ text: 'Ведущий инженер',
					value: 'LEAD_ENG',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['LEAD_ENG'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (this.filters.leadEng.length === 0) return true
						if (!value) return false
						return value.includes(this.filters.leadEng.find(item => item === value))
					}
				},
				{ text: 'Департамент',
					value: 'Dep',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['Dep'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.Department) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.Department.toLowerCase())
					}
				},
				{ text: 'Ответственный',
					value: 'Litso',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['Litso'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.Litso) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.Litso.toLowerCase())
					}
				},
				{ text: 'Резолюция',
					value: 'Resolve',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['Resolve'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.Resolve) return true
						if (this.filters.Resolve === 'пусто') return (!value)
						if (this.filters.Resolve === 'не отвечен') return (value === 'Не отвечен')
						if (this.filters.Resolve === 'отвечен') return (value === 'Отвечен')
						if (this.filters.Resolve === 'решён') return (value === 'Решён')
					}
				},
				{ text: 'Последний ответ',
					value: 'Cmmnt',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['Cmmnt'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.Cmmnt) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.Cmmnt.toLowerCase())
					}
				},
				{ text: 'Закупка',
					value: 'Zakupka',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['Zakupka'] : false,
					visible: true,
					divider: true,
					width: 150,
					filter: value => {
						if (!this.filters.Zakupka) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.Zakupka.toLowerCase())
					}
				},
				{ text: 'Статус оплаты',
					value: 'StatusOpl',
					selected: localStorage.dealsColumn ? localStorage.dealsColumn['StatusOpl'] : false,
					visible: true,
					divider: true,
					filter: value => {
						if (!this.filters.StatusOpl) return true
						if (!value) return false
						if (this.filters.StatusOpl === 'нет оплаты') return (value === 'Red')
						if (this.filters.StatusOpl === 'частично') return (value === 'Orange')
						if (this.filters.StatusOpl === 'полностью') return (value === 'Green')
					}
				},
				{ text: 'Действие',
					value: 'action',
					selected: true,
					visible: true,
					divider: true
				}
			],
			editedIndex: -1,
			lastItemId: null,
			editedItem: {

			},
			defaultItem: {

			},
			textRules: [v => !!v || 'Обязательный параметр!'],
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

	filters: {
		moneyToPercent: (item, id) => {
			if (item) {
				if (id === 0 || id === null) return 0
				return parseFloat((id / item.bill_sum) * 100).toFixed() + ' %'
			} else {
				return null
			}
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
		firm () { return _.uniq(this.multiSelects.firm) },
		leadEng () { return _.uniq(this.multiSelects.leadEng) },
		STATUS () { return _.uniq(this.multiSelects.STATUS) },
		MANAGER () { return _.uniq(this.multiSelects.MANAGER) },
		jiraSM () { return _.uniq(this.multiSelects.jiraSM) },
		project1C () { return _.uniq(this.multiSelects.project1C) },
		billReporter () { return _.uniq(this.multiSelects.billReporter) },
		dealsSum () {
			const filteredSum = this.$refs.dealsListTable.$children[0].filteredItems.map(arr => arr.bill_sum)
			return Math.round(_.sum(filteredSum)).toLocaleString('ru')
		}
	},

	watch: {
		dialog (val) {
			val || this.close()
		}
	},

	methods: {
		async getExel () {
			const filtered = this.headers.filter(header => header.selected === true)
			filtered.forEach(item => {
				this.json_fields[item.text] = item.value
			})
			return this.$refs.dealsListTable.$children[0].filteredItems
		},
		getColor (sum) {
			if (sum >= 96) return 'green'
			else if (sum > 5 && sum < 95) return 'orange'
			else return 'red'
		},
		formatColor (color) {
			if (color === 'Red') return 'mdi-close-circle'
			if (color === 'Orange') return 'mdi-contrast-circle'
			if (color === 'Green') return 'mdi-check-circle'
		},
		statusDealy (spec, cont) {
			let status = ``
			if (spec === 'Red') status += `color: red;`
			if (cont === 'Bold') status += `font-weight: bold;`
			if (cont === 'Italic') status += `font-style: italic;`
			return status
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
		saveColumnFB () {
			let dealsColumn = {}
			let id = 'dealsColumn'
			this.headers.forEach(header => {
				header.selected === null || header.selected === undefined ? dealsColumn[header.value] = false : dealsColumn[header.value] = header.selected
			})
			this.menu = false
			this.$store.dispatch('createLocalStorage', [dealsColumn, id])
		},
		showAllColumn () {
			this.headers.forEach(header => {
				header.selected = true
			})
		},
		editItem (item) {

		},
		deleteItem (item) {

		},
		close () {
			this.dialog = false
			this.editedItem = Object.assign({})
			this.editedIndex = -1
		}
	},
	async created () {
		await this.$store.dispatch('FETCH_DEALS')
		await GetConfig.getColumn('dealsColumn')
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
			.finally(async () => {
				this.Deals = await this.$store.getters.Deals
				this.Deals.forEach(async (item, index) => {
					if (item.bill_pay === 0 || item.bill_sum === null || item.bill_sum === 0) {
						item.bill_pay = 0
					} else {
						item.bill_pay = ((parseFloat(item.bill_pay) / parseFloat(item.bill_sum)) * 100).toFixed()
					}
					if (item.bill_ship === 0 || item.bill_sum === null || item.bill_sum === 0) {
						item.bill_ship = 0
					} else {
						item.bill_ship = ((parseFloat(item.bill_ship) / parseFloat(item.bill_sum)) * 100).toFixed()
					}
					if (item.bill_1c) await this.Bill1C.push(item.bill_1c)
					if (item.firm) this.multiSelects.firm.push(item.firm)
					if (item.project_1c) this.multiSelects.project1C.push(item.project_1c)
					if (item.jira_sm) this.multiSelects.jiraSM.push(item.jira_sm)
					if (item.MANAGER) this.multiSelects.MANAGER.push(item.MANAGER)
					if (item.STATUS) this.multiSelects.STATUS.push(item.STATUS)
					if (item.bill_reporter) this.multiSelects.billReporter.push(item.bill_reporter)
					if (item.LEAD_ENG) {
						const split = item.LEAD_ENG.split(',')
						split.forEach(item => {
							this.multiSelects.leadEng.push(item)
						})
					}
				})
				await this.$emit('deals', this.Deals)
			})
	},

	async mounted () {
		let obj = {}
		for (let key in this.filters) {
			this.$watch(['filters', key].join('.'), (newVal, oldVal) => {
				if (newVal === null) newVal = ''
				obj[key] = newVal
				localStorage.setItem('filtersDeals', JSON.stringify(obj))
			})
		}
		if (localStorage.filtersDeals) {
			var ls = JSON.parse(localStorage.filtersDeals)
			if (ls) {
				Object.keys(this.filters).forEach(key => {
					Object.entries(ls).forEach((item) => {
						if (JSON.parse(localStorage.getItem('filtersDeals'))[item[0]] && JSON.parse(localStorage.getItem('filtersDeals'))[item[0]] !== 'null' && item[0] === key) {
							this.filters[item[0]] = JSON.parse(localStorage.getItem('filtersDeals'))[item[0]]
						}
					})
				})
			}
		}
	},

	components: {
		ProgressDialog
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
