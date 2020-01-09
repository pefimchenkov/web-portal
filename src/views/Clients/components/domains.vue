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
					@click.native="save()"
					:disabled="localloading"
					:loading="localloading"
				>
				Сохранить
				</v-btn>
				</v-card-actions>
		</v-card>
	</v-dialog>
    <v-card v-if="domains" class="mx-auto mt-3">
        <v-toolbar class="elevation-2 grey lighten-3">

            <v-toolbar-title><span :style="`color: #1976d2`">Домены</span></v-toolbar-title>

            <v-spacer></v-spacer>

             <v-btn class="mx-2" fab dark small color="primary" @click="open(null)">
                <v-icon>add</v-icon>
            </v-btn>

        </v-toolbar>

        <v-list v-if="domains.length > 0" two-line>
			<template v-for="(item, index) in domains">

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
					<v-list-item-title v-html="item.NAME" class="text-center"></v-list-item-title>
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
export default {
	props: ['domains', 'id'],
	components: {
		Confirm
	},
	computed: {
	},
	data () {
		return {
			dialog: false,
			localloading: false,
			name: null,
			domainID: null,
			label: '',
			reqRules: [
				v => !!v || 'Обязательный параметр!'
			],
			editedIndex: -1
		}
	},
	created () {
	},
	methods: {
		open (item) {
			if (item) {
				this.editedIndex = this.domains.indexOf(item)
				this.name = item.NAME.replace('@', '')
				this.domainID = item.id
			}
			this.dialog = true
			this.label = 'Добавление домена'
		},
		save () {
			if (this.$refs.name.validate()) {
				const fullName = '@' + this.name
				if (this.editedIndex === -1) {
					this.$store.dispatch('addDomains', { id: this.id, name: fullName })
						.then(() => {
							this.$store.commit('setData', 'Юрлицо успешно добавлено.')
							this.close()
						})
				} else {
					this.$store.dispatch('updateDomains', { id: this.domainID, clientID: this.id, name: fullName })
						.then(() => {
							this.$store.commit('setData', 'Юрлицо успешно добавлено.')
							this.close()
						})
				}
			} else {
				this.$store.commit('setError', 'Заполните требуемые поля!')
			}
		},
		async del (item) {
			if (await this.$refs.confirm.open('Удаление', 'Вы уверены?', { color: 'red' })) {
				this.$store.dispatch('deleteDomains', { id: item.id })
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
			this.domainID = null
			this.editedIndex = -1
		}
	}
}
</script>

<style lang="scss" scoped>
</style>
