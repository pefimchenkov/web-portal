<template>
	<v-container fluid class="grey lighten-2">
	<manualAddZip ref="addZip" :engineers="engineers"></manualAddZip>
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
				:items-per-page="10"
				item-key="id"
				:mobile-breakpoint="550"
				sort-by="id"
				sort-desc
				class="elevation-2 ma-3"
				dense
				:footer-props="{
						itemsPerPageAllText: 'Все',
						itemsPerPageOptions: [10,50,250,-1],
						showFirstLastPage: true,
						firstIcon: 'mdi-arrow-collapse-left',
						lastIcon: 'mdi-arrow-collapse-right',
						prevIcon: 'mdi-minus',
						nextIcon: 'mdi-plus'
					}"
			>
				<template v-slot:body.prepend>
					<tr>
						<td :colspan="headers_good.length">
							<v-row dense class="green text-center" :style="`color: #fff`">
								<v-col>Новые ЗИП</v-col>
								<v-col cols="1">
									<v-btn fab x-small color="primary lighten-2" @click="addZip(2)">
										<v-icon>add</v-icon>
									</v-btn>
								</v-col>
							</v-row>
						</td>
					</tr>
				</template>
				<template v-slot:item.isskey="{ item }">
					<a icon :href="settings.jira_url + item.isskey" target="_blank">
  						{{ item.isskey }}
					</a>
				</template>
				<template v-slot:item.eng="{ item }">
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
					<v-tooltip v-if="item.sklad === 2">
						<template v-slot:activator="{ on }">
							<span v-on="on" top >
								<v-icon small>pan_tool</v-icon>
							</span>
						</template>
						<span>Добавлен в ручную</span>
					</v-tooltip>
					<v-tooltip v-if="item.request === 1" top>
						<template v-slot:activator="{ on }">
							<span v-on="on">
								<v-icon small>mdi-check-circle-outline</v-icon>
								<v-icon small>mdi-clock-outline</v-icon>
							</span>
						</template>
						<span>В резерве</span>
					</v-tooltip>
				</template>
				<template v-slot:item.date="{item}">
					{{ item.date ? new Date(item.date).toLocaleDateString('ru', { hour: 'numeric', minute: 'numeric' }) : '' }}
				</template>
				<template v-slot:item.executor="{ item }">
					{{ item.executor.split('@')[0]}}
				</template>
				<template v-slot:item.comment="{ item }">
					<v-edit-dialog
						:return-value.sync="item.comment"
						large
						persistent
						ref="custom"
						@save="saveComment(item.id, item.comment)"
						cancel-text="Отмена"
						save-text="Сохранить"
					>
					<v-icon x-small class="mr-3">mdi-pencil</v-icon>{{ item.comment }}
						<template v-slot:input>
							<v-text-field
								v-model="item.comment"
								label="Редактирование"
								single-line
								counter
								autofocus
							></v-text-field>
						</template>
					</v-edit-dialog>
				</template>
				</v-data-table>
				<v-data-table
					:headers="headers_good"
					:items="refData"
					fixed-header
					calculate-widths
					:items-per-page="10"
					item-key="id"
					:mobile-breakpoint="550"
					sort-by="id"
					sort-desc
					class="elevation-2 ma-3"
					dense
					:footer-props="{
						itemsPerPageAllText: 'Все',
						itemsPerPageOptions: [10,50,250,-1],
						showFirstLastPage: true,
						firstIcon: 'mdi-arrow-collapse-left',
						lastIcon: 'mdi-arrow-collapse-right',
						prevIcon: 'mdi-minus',
						nextIcon: 'mdi-plus'
					}"
				>
				<template v-slot:body.prepend>
					<tr>
						<td :colspan="headers_good.length">
							<v-row dense class="orange text-center" :style="`color: #fff`">
								<v-col>Можно восстановить</v-col>
								<v-col cols="1">
									<v-btn fab x-small color="primary lighten-2" @click="addZip(1)">
										<v-icon>add</v-icon>
									</v-btn>
								</v-col>
							</v-row>
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
				<template v-slot:item.executor="{ item }">
					{{ item.executor.split('@')[0]}}
				</template>
				<template v-slot:item.status="{ item }">
					<v-tooltip v-if="item.sklad === 2" top>
						<template v-slot:activator="{ on }">
							<div v-on="on">
								<v-icon small>pan_tool</v-icon>
							</div>
						</template>
						<span>Добавлен в ручную</span>
					</v-tooltip>
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
				<template v-slot:item.comment="{ item }">
					<v-edit-dialog
						:return-value.sync="item.comment"
						large
						persistent
						ref="custom"
						@save="saveComment(item.id, item.comment)"
						cancel-text="Отмена"
						save-text="Сохранить"
					>
					<v-icon x-small class="mr-3">mdi-pencil</v-icon>{{ item.comment }}
						<template v-slot:input>
							<v-text-field
								v-model="item.comment"
								label="Редактирование"
								single-line
								counter
								autofocus
							></v-text-field>
						</template>
					</v-edit-dialog>
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
					<v-btn text fab small left :to="{ name: 'engineers_stock_details', params: { zipID: item.JIRA_ID, Eng: item.Eng ? item.Eng : 'null', activeTab: active } }">
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
				:items-per-page="10"
				item-key="id"
				:mobile-breakpoint="550"
				sort-by="Count"
				sort-desc
				class="elevation-2 ma-3"
				dense
				:footer-props="{
						itemsPerPageAllText: 'Все',
						itemsPerPageOptions: [10,50,250,-1],
						showFirstLastPage: true,
						firstIcon: 'mdi-arrow-collapse-left',
						lastIcon: 'mdi-arrow-collapse-right',
						prevIcon: 'mdi-minus',
						nextIcon: 'mdi-plus'
					}"
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
			<template v-slot:item.executor="{ item }">
				{{ item.executor.split('@')[0] }}
			</template>
			</v-data-table>
			<v-data-table
				:headers="computedHeadersGood"
				:items="archiveOperations"
				:items-per-page="50"
				item-key="id"
				:mobile-breakpoint="550"
				sort-by="date"
				sort-desc
				class="elevation-2 ma-3"
				dense
				ref="archiveOperations"
				:footer-props="{
						itemsPerPageAllText: 'Все',
						itemsPerPageOptions: [10,50,250,-1],
						showFirstLastPage: true,
						firstIcon: 'mdi-arrow-collapse-left',
						lastIcon: 'mdi-arrow-collapse-right',
						prevIcon: 'mdi-minus',
						nextIcon: 'mdi-plus'
					}"
			>
			<template v-slot:body.prepend>
				<tr>
					<td v-if="computedHeadersGood.find(header => header.value === 'zip_id')" ><span>ИТОГО:</span></td>
					<td v-if="computedHeadersGood.find(header => header.value === 'zip')" colspan="1"></td>
					<td v-if="computedHeadersGood.find(header => header.value === 'arts')" colspan="1"></td>
					<td v-if="computedHeadersGood.find(header => header.value === 'eng')" colspan="1"></td>
					<td v-if="computedHeadersGood.find(header => header.value === 'isskey')" colspan="1"></td>
					<td v-if="computedHeadersGood.find(header => header.value === 'comment')" colspan="1"></td>
					<td v-if="computedHeadersGood.find(header => header.value === 'Cost')" colspan="1"></td>
					<td v-if="computedHeadersGood.find(header => header.value === 'Bonus')" colspan="1">
						<v-text-field v-if="$refs.archiveOperations" v-model="bonusSum" type="text" readonly></v-text-field>
					</td>
					<td v-if="computedHeadersGood.find(header => header.value === 'status')" colspan="1"></td>
					<td v-if="computedHeadersGood.find(header => header.value === 'date')" colspan="1"></td>
					<td v-if="computedHeadersGood.find(header => header.value === 'executor')" colspan="1"></td>
					<td v-if="computedHeadersGood.find(header => header.value === 'action')" colspan="1"></td>
				</tr>
				<tr>
					<td :colspan="headers_good.length">
						<p class="text-center primary" :style="`color: #fff`">Архив операций</p>
					</td>
				</tr>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td v-if="computedHeadersGood.find(header => header.value === 'eng')">
					<v-autocomplete
						v-model="filters.GoodEng"
						:items="engineers"
						item-text="display_name"
						clearable
						return-object
					>
					</v-autocomplete>
				</td>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td colspan="1"></td>
				<td v-if="computedHeadersGood.find(header => header.value === 'date')">
					<v-menu
						v-model="menuGoodDate"
						:close-on-content-click="false"
						transition="scale-transition"
						ref="menuGoodDate"
					>
						<template v-slot:activator="{ on }">
								<v-icon v-on="on" :color="filters.GoodDate !== null && filters.GoodDate.length > 0 ? `green darken-2` : ``">event</v-icon>
						</template>
						<v-date-picker v-model="filters.GoodDate" multiple no-title>
							<div class="flex-grow-1"></div>
							<v-btn text color="primary" @click="menuGoodDate = false">Отмена</v-btn>
							<v-btn text color="primary" @click="$refs.menuGoodDate.save(filters.GoodDate)">OK</v-btn>
						</v-date-picker>
					</v-menu>
					<v-icon v-if="filters.GoodDate !== null && filters.GoodDate.length > 0" @click="filters.GoodDate = []">clear</v-icon>
				</td>
				<td colspan="1"></td>
				<td colspan="1"></td>
			</template>
			<template v-slot:item.eng="{item}">
				{{ showName(item.eng) }}
			</template>
			<template v-slot:item.status="{item}">
				<v-icon v-if="item.request === 0" color="error" small>mdi-close</v-icon>
				<v-icon v-else color="success" small>done</v-icon>
				<v-icon v-if="item.sklad === 2" small>pan_tool</v-icon>
			</template>
			<template v-slot:item.date="{item}">
				{{ item.date ? new Date(item.date).toLocaleDateString('ru', { hour: 'numeric', minute: 'numeric' }) : '' }}
			</template>
			<template v-slot:item.isskey="{ item }">
				<a icon :href="settings.jira_url + item.isskey" target="_blank">
					{{ item.isskey }}
				</a>
			</template>
			<template v-slot:item.executor="{ item }">
				{{ item.executor.split('@')[0]}}
			</template>
			</v-data-table>
			<v-data-table
					:headers="computedHeadersArchive"
					:items="EngineersStockArchive"
					:items-per-page="50"
					item-key="id"
					calculate-widths
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
					<v-btn text fab small left :to="{ name: 'engineers_stock_details', params: { zipID: item.JIRA_ID, Eng: item.Eng ? item.Eng : 'null', activeTab: active } }">
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
import manualAddZip from './manualAddZip'
import settings from '@/settings.js'
import { formatDate } from '@/services/helpers'
/* import { mapState } from 'vuex' */
export default {
	props: ['EngineersStock', 'EngineersStockArchive', 'EngineersStockGood'],
	components: {
		Confirm,
		manualAddZip
	},
	data () {
		return {
			prop: '',
			settings,
			active: 'tab-workdesk',
			menuGoodDate: false,
			filters: {
				Content: '',
				Zip: '',
				Eng: [],
				GoodEng: [],
				GoodDate: [],
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
				{ text: '1С Артикул',
					value: 'arts',
					selected: true,
					divider: true
				},
				{ text: 'Инженер',
					value: 'eng',
					selected: true,
					width: 230,
					divider: true,
					filter: value => {
						if (!this.filters.GoodEng || this.filters.GoodEng.length === 0) return true
						return (value ? value.includes(this.filters.GoodEng.user_name) : false)
					}
				},
				{ text: 'Номер задачи',
					value: 'isskey',
					selected: true,
					divider: true
				},
				{ text: 'Комментарий',
					value: 'comment',
					selected: true,
					divider: true
				},
				{ text: 'Себестоимость',
					value: 'Cost',
					selected: true,
					align: 'center',
					divider: true
				},
				{ text: 'Баллы',
					value: 'Bonus',
					selected: true,
					align: 'center',
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
					width: 150,
					align: 'center',
					divider: true,
					filter: value => {
						if (!this.filters.GoodDate || this.filters.GoodDate.length === 0) return true
						if (!value || isNaN(Date.parse(value))) return false
						const Arr = this.filters.GoodDate.map(item => moment(item).unix())
						const first = Math.min(...Arr)
						const last = Math.max(...Arr)
						return (moment(formatDate(value)).unix() >= first && moment(formatDate(value)).unix() <= last)
					}
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
		await this.$store.dispatch('fetchMarket')
		this.loadActiveTabsFromLS()
	},
	computed: {
		computedHeaders () {
			return this.headers.filter(header => header.selected)
		},
		computedHeadersArchive () {
			return this.headers_archive.filter(header => header.selected)
		},
		computedHeadersGood () {
			return this.headers_good.filter(header => header.selected)
		},
		bonusSum () {
			const filteredSum = this.$refs.archiveOperations.$children[0].filteredItems.map(arr => arr.Bonus)
			return Math.round(_.sum(filteredSum)).toLocaleString('ru')
		},
		engineers () {
			const filtered = _.filter(_.uniqBy(this.EngineersStock, 'Eng'), obj => obj.Eng !== null)
			return this.jiraUsers.filter(user => (filtered.find(item => item.Eng === user.user_name)) || user.user_name === 'vav' || user.user_name === 'zsa' || user.user_name === 'i.volnov' || user.user_name === 'a.subbotin')
		},
		user () {
			if (this.$store.getters.currentUser) return this.$store.getters.currentUser.email
		},
		jiraUsers () {
			return this.$store.getters.jira_users
		},
		newData () {
			return this.EngineersStockGood.filter(item => item.type === 2 && item.request !== 3)
		},
		refData () {
			return this.EngineersStockGood.filter(item => item.type === 1 && (item.request !== 3 && item.request !== 0))
		},
		missingData () {
			return this.EngineersStockGood.filter(item => item.type === 0)
		},
		archiveOperations () {
			return this.EngineersStockGood.filter(item => item.request === 3 || item.request === 0)
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
				if (this.jiraUsers.find(user => user.user_name === username)) return this.jiraUsers.find(user => user.user_name === username).display_name
				else return false
			} else {
				return '---'
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
		},
		addZip (type) {
			this.$refs.addZip.open(type)
		},
		saveComment (id, comment) {
			if (comment) {
				this.$store.dispatch('saveComment', { id: id, comment: comment })
					.then(() => {
						this.$store.commit('setData', 'Комментарий успешно изменён (добавлен)')
					})
			} else {
				this.$store.commit('setError', 'Поле не заполнено!')
			}
		}
	}
}
</script>

<style lang="scss" scoped>
	.test {
		display: flex;
	}
</style>
