<template>
	<v-container fluid class="grey lighten-2">
	<Confirm ref="confirm"></Confirm>
	<v-tabs
		icons-and-text
		v-model="active"
		@change="saveActiveTabToLS(active)"
		grow
		background-color="white lighten-3"
	>
    	<v-tabs-slider></v-tabs-slider>

    	<v-tab href="#tab-workdesk">Рабочий стол
			<v-icon color="blue darken-2">mdi-store</v-icon>
    	</v-tab>
    	<v-tab href="#tab-archive">Архив
			<v-icon color="blue darken-2">mdi-archive</v-icon>
      	</v-tab>

		<v-tab-item :value="`tab-workdesk`">
			<v-data-table
				:headers="headers_good"
				:items="newData"
				fixed-header
				calculate-widths
				:items-per-page="50"
				item-key="id"
				:mobile-breakpoint="550"
				sort-by="Count"
				sort-desc
				class="elevation-2 ma-3"
				dense
			>
				<template v-slot:body.prepend>
					<tr>
						<td :colspan="headers_good.length">
							<p class="text-center green" :style="`color: #fff`">Новые ЗИП</p>
						</td>
					</tr>
				</template>
				<template v-slot:item.isskey="{ item }">
					<a icon :href="settings.jira_url + item.isskey" target="_blank">
  						{{ item.isskey }}
					</a>
				</template>
				<template v-slot:item.eng="{item}">
					{{ showName(item.eng) }}
				</template>
				<template v-slot:item.action="{ item }">
					<v-tooltip top>
						<template v-slot:activator="{ on }">
							<v-btn :disabled="user !== getEmail(item.eng)" class="mx-2" x-small icon @click.prevent="delItem(item)" v-on="on">
								<v-icon>mdi-delete</v-icon>
							</v-btn>
						</template>
						<span>Вернуть в нераспределённый</span>
					</v-tooltip>
					<v-tooltip v-if="!item.request" top>
						<template v-slot:activator="{ on }">
							<v-btn :disabled="$acl.not.check('LeadEngineer')" class="mx-2" x-small icon @click.prevent="sendRequest(item)" v-on="on">
								<v-icon>mdi-send</v-icon>
							</v-btn>
						</template>
						<span>Поставить в резерв</span>
					</v-tooltip>
					<v-tooltip v-if="item.request === 1" top>
						<template v-slot:activator="{ on }">
							<v-btn :disabled="$acl.not.check('LeadEngineer')" class="mx-2" x-small icon v-on="on" @click.prevent="sendApprove(item)">
								<v-icon>done</v-icon>
							</v-btn>
						</template>
						<span>Подтвердить</span>
					</v-tooltip>
				</template>
				<template v-slot:item.status="{ item }">
					<v-tooltip v-if="item.request === 1" top>
						<template v-slot:activator="{ on }">
							<div v-on="on">
								<v-icon small>mdi-check-circle-outline</v-icon>
								<v-icon small>mdi-clock-outline</v-icon>
							</div>
						</template>
						<span>В резерве</span>
					</v-tooltip>
				</template>
				<template v-slot:item.date="{item}">
					{{ item.date ? new Date(item.date).toLocaleDateString('ru', { hour: 'numeric', minute: 'numeric' }) : '' }}
				</template>
				</v-data-table>
				<v-data-table
					:headers="headers_good"
					:items="refData"
					fixed-header
					calculate-widths
					:items-per-page="50"
					item-key="id"
					:mobile-breakpoint="550"
					sort-by="Count"
					sort-desc
					class="elevation-2 ma-3"
					dense
				>
				<template v-slot:body.prepend>
					<tr>
						<td :colspan="headers_good.length">
							<p class="text-center orange" :style="`color: #fff`">Можно восстановить</p>
						</td>
					</tr>
				</template>
				<template v-slot:item.eng="{item}">
					{{ showName(item.eng) }}
				</template>
				<template v-slot:item.action="{ item }">
					<v-tooltip top>
						<template v-slot:activator="{ on }">
							<v-btn :disabled="user !== getEmail(item.eng)" class="mx-2" x-small icon @click.prevent="delItem(item)" v-on="on">
								<v-icon>mdi-delete</v-icon>
							</v-btn>
						</template>
						<span>Вернуть в нераспределённый</span>
					</v-tooltip>
					<v-tooltip v-if="!item.request" top>
						<template v-slot:activator="{ on }">
							<v-btn :disabled="$acl.not.check('LeadEngineer')" class="mx-2" x-small icon @click.prevent="sendRequest(item)" v-on="on">
								<v-icon>mdi-send</v-icon>
							</v-btn>
						</template>
						<span>Поставить в резерв</span>
					</v-tooltip>
					<v-tooltip v-if="item.request === 2" top>
						<template v-slot:activator="{ on }">
							<v-btn :disabled="$acl.not.check('LeadEngineer')" class="mx-2" x-small icon v-on="on" @click.prevent="sendApprove(item)">
								<v-icon>done</v-icon>
							</v-btn>
						</template>
						<span>Подтвердить</span>
					</v-tooltip>
					<v-tooltip v-if="item.request === 1 && item.type === 1" top>
						<template v-slot:activator="{ on }">
							<v-btn :disabled="$acl.not.check('LeadEngineer')" class="mx-2" x-small icon v-on="on" @click.prevent="sendCheck(item)">
								<v-icon>mdi-screwdriver</v-icon>
							</v-btn>
						</template>
						<span>Взять на проверку</span>
					</v-tooltip>
					<v-tooltip v-if="item.request === 2" top>
						<template v-slot:activator="{ on }">
							<v-btn :disabled="$acl.not.check('LeadEngineer')" class="mx-2" x-small icon @click.prevent="sendDecline(item)" v-on="on">
								<v-icon>mdi-close</v-icon>
							</v-btn>
						</template>
						<span>Отклонить</span>
					</v-tooltip>

				</template>
				<template v-slot:item.isskey="{ item }">
					<a icon :href="settings.jira_url + item.isskey" target="_blank">
  						{{ item.isskey }}
					</a>
				</template>
				<template v-slot:item.status="{ item }">
					<v-tooltip v-if="item.request === 1" top>
						<template v-slot:activator="{ on }">
							<div v-on="on">
								<v-icon small>mdi-check-circle-outline</v-icon>
								<v-icon small>mdi-clock-outline</v-icon>
							</div>
						</template>
						<span>В резерве</span>
					</v-tooltip>
					<v-tooltip v-if="item.request === 2" top>
						<template v-slot:activator="{ on }">
							<div v-on="on">
								<v-icon small>mdi-screwdriver</v-icon>
								<v-icon small>mdi-clock-outline</v-icon>
							</div>
						</template>
						<span>На проверке</span>
					</v-tooltip>
				</template>
				<template v-slot:item.date="{item}">
					{{ item.date ? new Date(item.date).toLocaleDateString('ru', { hour: 'numeric', minute: 'numeric' }) : '' }}
				</template>
				</v-data-table>
				<v-data-table
					:headers="computedHeaders"
					:items="EngineersStock"
					fixed-header
					calculate-widths
					:items-per-page="50"
					item-key="id"
					:mobile-breakpoint="550"
					sort-by="Count"
					sort-desc
					dense
					class="elevation-2 ma-3"
					:footer-props="{
						itemsPerPageAllText: 'Все',
						itemsPerPageOptions: [50,150,500,-1],
						showFirstLastPage: true,
						firstIcon: 'mdi-arrow-collapse-left',
						lastIcon: 'mdi-arrow-collapse-right',
						prevIcon: 'mdi-minus',
						nextIcon: 'mdi-plus'
					}"
				>
				<template v-slot:body.prepend>
					<tr>
						<td :colspan="computedHeaders.length">
							<p class="text-center grey" :style="`color: #fff`">Нераспределённые</p>
						</td>
					</tr>
					<td colspan="1"></td>
					<td colspan="1"></td>
					<td v-if="computedHeaders.find(header => header.value === 'Zip')">
						<v-text-field clearable v-model="filters.Zip" type="text"></v-text-field>
					</td>
					<td colspan="1"></td>
					<td v-if="computedHeaders.find(header => header.value === 'Content')">
						<v-text-field clearable v-model="filters.Content" type="text"></v-text-field>
					</td>
					<td colspan="1"></td>
					<td v-if="computedHeaders.find(header => header.value === 'Eng')">
						<v-autocomplete
							v-model="filters.Eng"
							:items="engineers"
							item-text="display_name"
							clearable
							return-object
						>
						</v-autocomplete>
					</td>
					<td colspan="1"></td>
				</template>
				<template v-slot:item.isskey="{ item }">
					<a icon :href="settings.jira_url + item.isskey" target="_blank">
  						{{ item.isskey }}
					</a>
				</template>
				<template v-slot:item.Eng="{ item }">
					{{ showName(item.Eng) }}
				</template>
				<template v-slot:item.action="{ item }">
					<v-btn text fab small left :to="{ name: 'engineers_stock_details', params: { zipID: item.JIRA_ID, Eng: item.Eng, activeTab: active } }">
						<v-icon>more_horiz</v-icon>
					</v-btn>
				</template>
			</v-data-table>
		</v-tab-item>
		<v-tab-item :value="`tab-archive`">
			<v-data-table
				:headers="headers_good"
				:items="missingData"
				fixed-header
				calculate-widths
				:items-per-page="50"
				item-key="id"
				:mobile-breakpoint="550"
				sort-by="Count"
				sort-desc
				class="elevation-2 ma-3"
				dense
			>
			<template v-slot:item.isskey="{ item }">
					<a icon :href="settings.jira_url + item.isskey" target="_blank">
  						{{ item.isskey }}
					</a>
			</template>
			<template v-slot:item.eng="{item}">
				{{ showName(item.eng) }}
			</template>
			<template v-slot:item.date="{item}">
				{{ item.date ? new Date(item.date).toLocaleDateString('ru', { hour: 'numeric', minute: 'numeric' }) : '' }}
			</template>
			<template v-slot:body.prepend>
					<tr>
						<td :colspan="headers_good.length">
							<p class="text-center" :style="`background-color: #f74d6c; color: #fff`">Отстутствующие ЗИП</p>
						</td>
					</tr>
			</template>
			</v-data-table>
			<v-data-table
				:headers="headers_good"
				:items="archiveOperations"
				fixed-header
				calculate-widths
				:items-per-page="50"
				item-key="id"
				:mobile-breakpoint="550"
				sort-by="Count"
				sort-desc
				class="elevation-2 ma-3"
				dense
			>
			<template v-slot:body.prepend>
					<tr>
						<td :colspan="headers_good.length">
							<p class="text-center primary" :style="`color: #fff`">Архив операций</p>
						</td>
					</tr>
			</template>
			<template v-slot:item.eng="{item}">
				{{ showName(item.eng) }}
			</template>
			<template v-slot:item.status="{item}">
				<v-icon v-if="item.request === 0" color="error" small>mdi-close</v-icon>
				<v-icon v-else color="success" small>done</v-icon>
			</template>
			<template v-slot:item.date="{item}">
				{{ item.date ? new Date(item.date).toLocaleDateString('ru', { hour: 'numeric', minute: 'numeric' }) : '' }}
			</template>
			<template v-slot:item.isskey="{ item }">
					<a icon :href="settings.jira_url + item.isskey" target="_blank">
  						{{ item.isskey }}
					</a>
			</template>
			</v-data-table>
			<v-data-table
					:headers="computedHeadersArchive"
					:items="EngineersStockArchive"
					fixed-header
					calculate-widths
					:items-per-page="50"
					item-key="id"
					:mobile-breakpoint="550"
					sort-by="Count"
					sort-desc
					dense
					class="elevation-2 ma-3"
					:footer-props="{
						itemsPerPageAllText: 'Все',
						itemsPerPageOptions: [50,150,500,-1],
						showFirstLastPage: true,
						firstIcon: 'mdi-arrow-collapse-left',
						lastIcon: 'mdi-arrow-collapse-right',
						prevIcon: 'mdi-minus',
						nextIcon: 'mdi-plus'
					}"
				>
				<template v-slot:body.prepend>
					<tr>
						<td :colspan="computedHeadersArchive.length">
							<p class="text-center grey" :style="`color: #fff`">Нераспределённые Архив</p>
						</td>
					</tr>
					<td colspan="1"></td>
					<td colspan="1"></td>
					<td v-if="computedHeadersArchive.find(header => header.value === 'Zip')">
						<v-text-field clearable v-model="filters.ArchiveZip" type="text"></v-text-field>
					</td>
					<td colspan="1"></td>
					<td v-if="computedHeadersArchive.find(header => header.value === 'Content')">
						<v-text-field clearable v-model="filters.ArchiveContent" type="text"></v-text-field>
					</td>
					<td colspan="1"></td>
					<td v-if="computedHeadersArchive.find(header => header.value === 'Eng')">
						<v-autocomplete
							v-model="filters.ArchiveEng"
							:items="engineers"
							item-text="display_name"
							clearable
							return-object
						>
						</v-autocomplete>
					</td>
					<td colspan="1"></td>
				</template>
				<template v-slot:item.isskey="{ item }">
					<a icon :href="settings.jira_url + item.isskey" target="_blank">
  						{{ item.isskey }}
					</a>
				</template>
				<template v-slot:item.Eng="{ item }">
					{{ showName(item.Eng) }}
				</template>
				<template v-slot:item.action="{ item }">
					<v-btn text fab small left :to="{ name: 'engineers_stock_details', params: { zipID: item.JIRA_ID, Eng: item.Eng, activeTab: active } }">
						<v-icon>more_horiz</v-icon>
					</v-btn>
				</template>
			</v-data-table>
		</v-tab-item>
	</v-tabs>

	</v-container>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'
import Confirm from '@/components/shared/Confirm'
import settings from '@/settings.js'
export default {
	props: ['EngineersStock', 'EngineersStockArchive', 'EngineersStockGood'],
	components: {
		Confirm
	},
	data () {
		return {
			prop: '',
			settings,
			active: 'tab-workdesk',
			filters: {
				Content: '',
				Zip: '',
				Eng: [],
				ArchiveContent: '',
				ArchiveZip: '',
				ArchiveEng: []
			},
			editedItem: {},
			editedIndex: null,
			headers: [
				{ text: 'Маркет id',
					value: 'element',
					selected: true,
					divider: true
				},
				{ text: 'ЗИП id',
					value: 'JIRA_ID',
					selected: true,
					divider: true
				},
				{ text: 'ЗИП',
					value: 'Zip',
					selected: true,
					divider: true,
					filter: value => {
						if (!this.filters.Zip) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.Zip.toLowerCase())
					}
				},
				{ text: 'Кол-во',
					value: 'Count',
					selected: true,
					divider: true
				},
				{ text: 'Контент',
					value: 'Content',
					selected: true,
					divider: true,
					filter: value => {
						if (!this.filters.Content) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.Content.toLowerCase())
					}
				},
				{ text: 'Состав',
					value: 'ContentNum',
					selected: true,
					divider: true
				},
				{ text: 'Инженер',
					value: 'Eng',
					selected: true,
					divider: true,
					filter: value => {
						if (!this.filters.Eng || this.filters.Eng.length === 0) return true
						return (value ? value.includes(this.filters.Eng.user_name) : false)
					}
				},
				{ text: 'Ред.',
					value: 'action',
					selected: true,
					divider: true
				}
			],
			headers_archive: [
				{ text: 'Маркет id',
					value: 'element',
					selected: true,
					divider: true
				},
				{ text: 'ЗИП id',
					value: 'JIRA_ID',
					selected: true,
					divider: true
				},
				{ text: 'ЗИП',
					value: 'Zip',
					selected: true,
					divider: true,
					filter: value => {
						if (!this.filters.ArchiveZip) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.ArchiveZip.toLowerCase())
					}
				},
				{ text: 'Кол-во',
					value: 'Count',
					selected: true,
					divider: true
				},
				{ text: 'Контент',
					value: 'Content',
					selected: true,
					divider: true,
					filter: value => {
						if (!this.filters.ArchiveContent) return true
						if (!value) return false
						return value.toLowerCase().includes(this.filters.ArchiveContent.toLowerCase())
					}
				},
				{ text: 'Состав',
					value: 'ContentNum',
					selected: true,
					divider: true
				},
				{ text: 'Инженер',
					value: 'Eng',
					selected: true,
					divider: true,
					filter: value => {
						if (!this.filters.ArchiveEng || this.filters.ArchiveEng.length === 0) return true
						return (value ? value.includes(this.filters.ArchiveEng.user_name) : false)
					}
				},
				{ text: 'Ред.',
					value: 'action',
					selected: true,
					divider: true
				}
			],
			headers_good: [
				{ text: 'id ЗИП',
					value: 'zip_id',
					selected: true,
					divider: true
				},
				{ text: 'ЗИП',
					value: 'zip',
					selected: true,
					divider: true
				},
				{ text: '1С Артикулы',
					value: 'arts',
					selected: true,
					divider: true
				},
				{ text: 'Инженер',
					value: 'eng',
					selected: true,
					divider: true
				},
				{ text: 'Номер задачи',
					value: 'isskey',
					selected: true,
					divider: true
				},
				{ text: 'Статус',
					value: 'status',
					selected: true,
					align: 'center',
					divider: true
				},
				{ text: 'Дата',
					value: 'date',
					selected: true,
					align: 'center',
					divider: true
				},
				{ text: 'Отправитель',
					value: 'executor',
					selected: true,
					align: 'center',
					divider: true
				},
				{ text: 'Действия',
					value: 'action',
					align: 'left',
					selected: true
				}
			]
		}
	},
	async created () {
		await window.scrollTo(0, 0)
		this.loadActiveTabsFromLS()
	},
	computed: {
		computedHeaders () {
			return this.headers.filter(header => header.selected)
		},
		computedHeadersArchive () {
			return this.headers_archive.filter(header => header.selected)
		},
		engineers () {
			const filtered = _.filter(_.uniqBy(this.EngineersStock, 'Eng'), obj => obj.Eng !== null)
			return this.jiraUsers.filter(user => filtered.find(item => item.Eng === user.user_name))
		},
		user () {
			if (this.$store.getters.currentUser) return this.$store.getters.currentUser.email
		},
		jiraUsers () {
			return this.$store.getters.jira_users
		},
		newData () {
			return this.EngineersStockGood.filter(item => item.type === 2)
		},
		refData () {
			return this.EngineersStockGood.filter(item => item.type === 1)
		},
		missingData () {
			return this.EngineersStockGood.filter(item => item.type === 0)
		},
		archiveOperations () {
			return this.EngineersStockGood.filter(item => item.type === 3)
		},
		access () {
			const role = this.$store.getters.userRole
			const Arr = role.split('&')
			if (Arr.find(item => item === 'admin') || Arr.find(item => item === 'engineer')) {
				return true
			} else return false
		}
	},
	methods: {
		prevQuorter () {
			const d = new Date()
			d.setDate(d.getDate() - 90)
			return d
		},
		showName (username) {
			if (username && this.jiraUsers.length > 0) {
				return this.jiraUsers.find(user => user.user_name === username).display_name
			} else {
				return 'нет инженера'
			}
		},
		getEmail (username) {
			if (username && this.jiraUsers.length > 0) {
				return this.jiraUsers.find(user => user.user_name === username).email
			}
		},
		saveActiveTabToLS (active) {
			localStorage.setItem('activeTabs', JSON.stringify({ EngineersStock: active }))
		},
		loadActiveTabsFromLS () {
			if (localStorage.activeTabs) {
				const activeTabs = JSON.parse(localStorage.activeTabs)
				this.active = activeTabs.EngineersStock
			}
		},
		async delItem (item) {
			if (await this.$refs.confirm.open('Удаление', 'Вы уверены?', { color: 'red' })) {
				this.$store.dispatch('deleteEngineersStock', item)
					.then(() => {
						this.$store.commit('setData', 'Данные успешно удалены.')
					})
			} else {
				this.$store.commit('setInfo', 'Удаление отменено.')
			}
		},
		async sendRequest (item) {
			if (await this.$refs.confirm.open('Отправка запроса', 'Вы уверены?', { color: 'orange' })) {
				let { request } = item
				const now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
				if (!request) request = 1
				this.$store.dispatch('sendRequest', { status: request, id: item.id, user: this.user, date: now })
					.then(() => {
						this.$store.commit('setData', 'Запрос отправлен!')
					})
			} else {
				this.$store.commit('setInfo', 'Запрос отменён.')
			}
		},
		async sendApprove (item) {
			if (await this.$refs.confirm.open('Подтверждение', 'Вы уверены?', { color: 'green' })) {
				const now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
				this.$store.dispatch('sendApprove', { id: item.id, user: this.user, date: now })
					.then(() => {
						this.$store.commit('setData', 'Подтверждаю')
					})
			} else {
				this.$store.commit('setInfo', 'Подтверждение отменёно')
			}
		},
		async sendDecline (item) {
			if (await this.$refs.confirm.open('Отклонение', 'Вы уверены?', { color: 'orange' })) {
				const now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
				this.$store.dispatch('sendDecline', { id: item.id, user: this.user, date: now })
					.then(() => {
						this.$store.commit('setData', 'Отклонено')
					})
			} else {
				this.$store.commit('setInfo', 'Отклонение отменёно')
			}
		},
		async sendCheck (item) {
			if (await this.$refs.confirm.open('Взять на проверку', 'Вы уверены?', { color: 'green' })) {
				const now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
				this.$store.dispatch('sendCheck', { id: item.id, user: this.user, date: now })
					.then(() => {
						this.$store.commit('setData', 'Передано на проверку')
					})
			} else {
				this.$store.commit('setInfo', 'Проверка отменёна')
			}
		}
	}
}
</script>

<style lang="scss" scoped>
</style>
