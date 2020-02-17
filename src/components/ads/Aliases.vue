<template>
  <v-container container--fluid>
    <div v-if="!loadings && specprices.length !== 0">
      <v-app-bar text color="white" class="text-lg-right elevation-2 mb-1">
        <v-toolbar-title>Псевдонимы</v-toolbar-title>
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
      </v-app-bar>
      <v-data-table
            :headers="headers"
            :items="specprices"
            class="elevation-2"
            :search="search"
           	fixed-header
			calculate-widths
			:items-per-page="50"
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
              <td class="text-left">{{ item.ID }}</td>
              <td class="text-left">{{ item.SPEC }}</td>

              <td
                class="text-left"
                v-if="typeof(item.product) === 'number'"
              >{{ getName(item.product) }}
              <td class="text-left" v-else>{{ item.product }}</td>
              <td class="text-left">{{ item.alias }}</td>
			  <td class="text-left">{{ getClientName(item.client) }}</td>
              <td class="text-left">{{ item.ART }}</td>
			  <td class="text-right">{{ item.price_agent ? item.price_agent.toLocaleString('ru') : '' }}
				<v-icon v-if="item.currency_agent === 1 && item.price_agent" color="blue" small>mdi-currency-rub</v-icon>
				<v-icon v-else-if="item.currency_agent === 2 && item.price_agent" color="yellow darken-2" small>mdi-currency-eur</v-icon>
				<v-icon v-else-if="item.currency_agent === 3  && item.price_agent" color="green" small>mdi-currency-usd</v-icon>
			  </td>
              <td class="text-right">{{ item.price ? item.price.toLocaleString('ru') : '' }}
                <v-icon v-if="item.currency === 1 && item.price" color="blue" small>mdi-currency-rub</v-icon>
				<v-icon v-else-if="item.currency === 2 && item.price" color="yellow darken-2" small>mdi-currency-eur</v-icon>
				<v-icon v-else-if="item.currency === 3  && item.price" color="green" small>mdi-currency-usd</v-icon>
              </td>
			  <td class="text-right">{{ item.pricends ? item.pricends.toLocaleString('ru') : '' }}
                <v-icon v-if="item.currency === 1  && item.pricends" color="blue" small>mdi-currency-rub</v-icon>
				<v-icon v-else-if="item.currency === 2 && item.pricends" color="yellow darken-2" small>mdi-currency-eur</v-icon>
				<v-icon v-else-if="item.currency === 3 && item.pricends" color="green" small>mdi-currency-usd</v-icon>
              </td>
              <td class="text-left">{{ item.EMAIL.split('@')[0] }}</td>
              <td class="text-left">{{ new Date(item.DATE).toLocaleDateString('ru') }}</td>
			  </tr>
            </template>
			<template v-slot:body.prepend>
     			<td :colspan="headers.length" class="text-right">
        			<a href="/static/Цены_по_договору.xls">Пример XLS файла для импорта</a>
      			</td>
    		</template>
      </v-data-table>
    </div>
    <div v-else-if="!loadings && specprices.length === 0">
      <v-layout row>
        <v-flex xs12 class="text-center pt-5">
          <v-progress-circular color="primary" indeterminate :size="100"></v-progress-circular>
        </v-flex>
      </v-layout>
    </div>
  </v-container>
</template>

<script>

/* import moment from 'moment' */
import UploadFile from './UploadFile'
import { AclRule } from 'vue-acl'
import { mapGetters } from 'vuex'

export default {
	data () {
		return {
			ID: 'ALIASES',
			search: '',
			pagination: {'sortBy': 'ID', 'descending': true},
			dialog: false,
			headers: [
				{ text: 'id', value: 'ID', divider: true },
				{ text: 'Спецификация', value: 'SPEC', divider: true },
				{ text: 'ЗИП', value: 'ZIPNAME', divider: true },
				{ text: 'Псевдоним', value: 'ALIAS', divider: true },
				{ text: 'Клиент', value: 'client', divider: true },
				{ text: 'Артикул 1С', value: 'ART', divider: true },
				{ text: 'Цена посредник', value: 'price_agent', align: 'rigth', divider: true },
				{ text: 'Спеццена', value: 'price', align: 'rigth', divider: true },
				{ text: 'Спеццена(с НДС)', value: 'pricends', align: 'rigth', divider: true },
				{ text: 'Автор', value: 'EMAIL', divider: true },
				{ text: 'Дата изменения', value: 'DATE', divider: true }
			]
		}
	},

	computed: {
		...mapGetters(['specprices']),
		loadings () {
			return this.$store.getters.loadings
		},
		Edit () {
			return new AclRule('user').and('engineer').or('admin').generate()
		}
	},
	methods: {
		getName (id) {
			var obj = {}

			obj = this.$store.getters.zip.find(x => x.zipID === id)

			for (var key in obj) {
				if (key === 'zipNAME') {
					return obj[key] + ' {' + obj.zipID + '}'
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
		}
	},
	components: {
		appUploadFile: UploadFile
	},
	async created () {
		await this.$store.dispatch('fetchZip')
		await this.$store.dispatch('fetchClients')
		await this.$store.dispatch('fetchSpecprices')
	}
}
</script>
