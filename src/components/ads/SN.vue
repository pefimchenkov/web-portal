<template>
  <v-container container--fluid>
    <div v-if="!loadings && SN.length !== 0">
      <v-toolbar text color="white" class="text-lg-right elevation-2 mb-1">
        <v-toolbar-title>Серийные номера</v-toolbar-title>
        <v-divider class="mx-3" inset vertical></v-divider>
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
		<app-upload-file :ID='ID' v-if="$acl.check('Edit')"></app-upload-file>
      </v-toolbar>
      <v-data-table
            :headers="headers"
            :items="SN"
            :search="search"
           	fixed-header
			calculate-widths
			:items-per-page=50
			item-key="ID"
			:mobile-breakpoint="550"
			sort-by='ID'
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
          >
            <template v-slot:item="{item}">
			<tr>
              <td class="text-center">{{ item.ID }}</td>
              <td class="text-center">{{ getClientName(item.Client) }}</td>
			  <td class="text-center">{{ item.Model }}</td>
              <td class="text-center">{{ item.SN }}</td>
			  <td class="text-center">{{ item.TSDN }}</td>
			  <td class="text-center">{{ item.Contract }}</td>
			  <td class="text-center">{{ item.SPEC }}</td>
			  <td class="text-center">{{ getEndDate(item.ENDDATE) }}</td>
              <td class="text-center">{{ item.EMAIL !== null ? item.EMAIL.split('@')[0] : item.EMAIL }}</td>
              <td class="text-center">{{ getDate(item.DATE) }}</td>
			  </tr>
            </template>
			<template v-slot:body.prepend="{item}">
     			<td :colspan="headers.length" class="text-right">
        			<a href="/static/example_sn.xls">Пример XLS файла для импорта</a>
      			</td>
    		</template>
      </v-data-table>
    </div>
    <div v-else-if="!loadings && SN.length === 0">
      <v-layout row>
        <v-flex xs12 class="text-center pt-5">
          <v-progress-circular color="primary" indeterminate :size="80"></v-progress-circular>
        </v-flex>
      </v-layout>
    </div>
  </v-container>
</template>

<script>
// import Api from '@/services/Api'
import moment from 'moment'
import UploadFile from './UploadFile'
import { AclRule } from 'vue-acl'
// import { eventBus } from '../../main.js'

export default {
	data () {
		return {
			SN: [],
			ID: 'SN',
			search: '',
			pagination: {'sortBy': 'ID', 'descending': true},
			dialog: false,
			headers: [
				{ text: 'ID', value: 'ID', align: 'center', divider: true },
				{ text: 'Клиент', value: 'Client', align: 'center', divider: true },
				{ text: 'Модель', value: 'Model', align: 'center', divider: true },
				{ text: 'SN', value: 'SN', align: 'center', divider: true },
				{ text: 'Доп.инфо', value: 'TSDN', align: 'center', divider: true },
				{ text: '№ договора', value: 'Dogovor', align: 'center', divider: true },
				{ text: 'Спецификация', value: 'SPEC', align: 'center', divider: true },
				{ text: 'Срок действия', value: 'ENDDATE', align: 'center', divider: true },
				{ text: 'Автор', value: 'EMAIL', align: 'center', divider: true },
				{ text: 'Дата изменения', value: 'DATE', align: 'center', divider: true }
			]
		}
	},

	computed: {
		loadings () {
			return this.$store.getters.loadings
		},
		Edit () {
			return new AclRule('user').and('engineer').or('admin').generate()
		}
	},
	methods: {
		getSerialNumbers () {
			try {
				this.$store.commit('setLoading', true)
				this.$store.commit('clearError')

				this.SN = this.$store.getters.sn
				this.$store.commit('setLoading', false)
			} catch (error) {
				this.$store.commit('setLoading', false)
				this.$store.commit('setError', error.message)
			}
		},
		getDate (date) {
			if (date) {
				var dt = this.SN.find(a => a.DATE === date).DATE
				return moment(new Date(dt)).format('YYYY.MM.DD HH:mm')
			} else {
				return null
			}
		},
		getEndDate (date) {
			if (date) {
				var dt = this.SN.find(a => a.ENDDATE === date).ENDDATE
				return moment(new Date(dt)).format('YYYY.MM.DD')
			} else {
				return null
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
		}
	},
	components: {
		appUploadFile: UploadFile
	},
	async created () {
		await this.$store.dispatch('fetchClients')
		await this.$store.dispatch('fetchSerialNumbers')
		await this.getSerialNumbers()
	}
}
</script>
