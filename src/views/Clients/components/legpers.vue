<template>
<div>
	<Confirm ref="confirm"></Confirm>
	<v-dialog width="500px" v-model="dialog" persistent>
		<v-card class="pa-3 mx-auto" outlined>
			<v-card-title class="subheading">{{ label }}</v-card-title>
				<v-text-field
					v-model="name"
					label="* Наименование"
					validation
					:rules="reqRules"
					required
					ref="name"
				>
				</v-text-field>
				<v-autocomplete
					v-model="form"
					:items="Forms"
					label="* Правовая форма"
					required
					:rules="reqRules"
					validation
					ref="form"
					return-object
					item-text="name"
				></v-autocomplete>
				<v-text-field
					v-model="code1c"
					label="* Код по 1с"
					validation
					:rules="artRules"
					required
					ref="code1c"
				>
				</v-text-field>
				<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn
					color="green darken-1"
					text="text"
					@click="close"
				>
				Отменить
				</v-btn>
				<v-btn
					color="green darken-1"
					text="text"
					@click.native="save"
					:disabled="localloading"
					:loading="localloading"
				>
				Сохранить
				</v-btn>
				</v-card-actions>
		</v-card>
	</v-dialog>
    <v-card v-if="legpers" class="mx-auto mt-3">
        <v-toolbar class="elevation-2 grey lighten-3">

            <v-toolbar-title><span :style="`color: #1976d2`">Юрлица</span></v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn class="mx-2" fab dark small color="primary" @click="open(null)">
                <v-icon>add</v-icon>
            </v-btn>

        </v-toolbar>

        <v-list v-if="legpers.length > 0" two-line>
			<template v-for="(item, index) in legpers">

				<v-divider
				:key="index"
				></v-divider>

				<v-list-item
					:key="item.id"
				>
				<v-list-item-avatar>
					<v-icon
						class="grey lighten-1 white--text"
						v-text="`mdi-account`"
          			></v-icon>
				</v-list-item-avatar>

				<v-list-item-content>
					<v-list-item-title v-html="item.id"></v-list-item-title>
				</v-list-item-content>

				<v-list-item-content>
					<v-list-item-title v-html="item.form + ' «' + item.just_name + '»'" class="text-center"></v-list-item-title>
				</v-list-item-content>

				<v-list-item-content>
					<v-list-item-title v-html="item.id_1c" class="text-center"></v-list-item-title>
				</v-list-item-content>

				<v-list-item-action @click="open(item)">
                    <v-btn icon>
                        <v-icon color="grey lighten-1">mdi-pencil</v-icon>
                    </v-btn>
                </v-list-item-action>
				<v-list-item-action @click="del(item)">
					<v-btn icon>
                        <v-icon color="grey lighten-1">mdi-delete</v-icon>
                    </v-btn>
				</v-list-item-action>

				</v-list-item>
			</template>
    	</v-list>
		<v-row v-else justify="center" class="mx-auto text-center">
			<v-col>
				Данные отстутствуют
			</v-col>
		</v-row>
    </v-card>
	<v-progress-circular v-else :size="120" indeterminate></v-progress-circular>
</div>
</template>

<script>
import Confirm from '@/components/shared/Confirm'
import { validCode1C } from '@/utils/validate'
export default {
	props: ['legpers', 'id', 'clientName'],
	components: {
		Confirm
	},
	computed: {
	},
	data () {
		return {
			dialog: false,
			localloading: false,
			name: '',
			legpersID: null,
			form: {},
			code1c: '',
			label: '',
			editedIndex: -1,
			artRules: [
				v => !!v || 'Обязательный параметр!',
				v => validCode1C(v) || 'Правильно: Буква ` Т ` кириллицей и 7 цифр!'
			],
			reqRules: [
				v => !!v || 'Обязательный параметр!'
			],
			Forms: [
				{id: 1, name: 'ООО'},
				{id: 2, name: 'ЗАО'},
				{id: 3, name: 'АО'},
				{id: 4, name: 'ИП'},
				{id: 5, name: 'ОАО'},
				{id: 6, name: 'Филиал'},
				{id: 7, name: 'ПАО'},
				{id: 8, name: 'Обособленное подразделение'},
				{id: 9, name: 'ФГУП'},
				{id: 10, name: 'ФЧКОО'},
				{id: 11, name: 'ТОО'},
				{id: 12, name: 'ОСГ'},
				{id: 13, name: 'УК'},
				{id: 14, name: 'НАО'},
				{id: 15, name: 'ФГБУ'},
				{id: 16, name: 'АНОО'},
				{id: 17, name: 'СК'},
				{id: 18, name: 'ТД'}
			]
		}
	},
	created () {
	},
	methods: {
		open (item) {
			if (item) {
				this.editedIndex = this.legpers.indexOf(item)
				this.name = item.just_name
				this.form = this.Forms.find(obj => obj.name === item.form)
				this.code1c = item.id_1c
				this.legpersID = item.id
				this.label = 'Редактирование Юрлица'
			} else {
				this.label = 'Добавление Юрлица'
			}
			this.dialog = true
		},
		save () {
			const fullName = this.form.name + ' «' + this.name + '»'
			if (this.$refs.name.validate() && this.$refs.form.validate() && this.$refs.code1c.validate()) {
				if (this.editedIndex === -1) {
					this.$store.dispatch('addLegPers',
						{
							id: this.id,
							clientName: this.clientName,
							justName: this.name,
							form: this.form,
							fullName: fullName,
							code1c: this.code1c
						}
					)
						.then(() => {
							this.$store.commit('setData', 'Юрлицо успешно добавлено.')
							this.close()
						})
				} else {
					this.$store.dispatch('updateLegPers',
						{
							id: this.legpersID,
							clientID: this.id,
							justName: this.name,
							form: this.form,
							fullName: fullName,
							code1c: this.code1c
						}
					)
						.then(() => {
							this.$store.commit('setData', 'Юрлицо успешно обновлено.')
							this.close()
						})
				}
			} else {
				this.$store.commit('setError', 'Заполните требуемые поля!')
			}
		},
		async del (item) {
			if (await this.$refs.confirm.open('Удаление', 'Вы уверены?', { color: 'red' })) {
				this.$store.dispatch('deleteLegPers', { id: item.id })
					.then(() => {
						this.$store.commit('setData', 'Данные успешно удалены.')
					})
			} else {
				this.$store.commit('setInfo', 'Удаление отменено.')
			}
		},
		close () {
			this.dialog = false
			this.name = null
			this.form = {}
			this.code1c = null
			this.editedIndex = -1
		}
	}
}
</script>

<style lang="scss" scoped>
</style>
