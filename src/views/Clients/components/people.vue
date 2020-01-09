<template>
<div>
	<v-dialog width="500px" v-model="dialog" persistent>
		<v-card class="pa-3 mx-auto" outlined>
			<v-card-title class="subheading">Редактирование {{ label }}</v-card-title>
				<v-autocomplete
					:items="jirausers"
					v-model="name"
					label="* ответственный"
					item-text="display_name"
					return-object
				>
				</v-autocomplete>
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
    <v-card v-if="editable && readonly" class="mx-auto mt-3">
        <v-toolbar class="elevation-2 grey lighten-3">

            <v-toolbar-title><span :style="`color: #1976d2`">Ответственные</span></v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn icon>
                <v-icon>mdi-magnify</v-icon>
            </v-btn>

        </v-toolbar>

        <v-list two-line>
			<template v-for="(item, index) in People">

				<v-divider
				:key="index"
				></v-divider>

				<v-list-item
					:key="item.title"
				>
				<v-list-item-avatar>
					<v-icon
						:class="[item.iconClass]"
						v-text="item.icon"
          			></v-icon>
				</v-list-item-avatar>

				<v-list-item-content>
					<v-list-item-title v-html="item.title"></v-list-item-title>
				</v-list-item-content>

				<v-list-item-content>
					<v-list-item-title v-html="item.value" class="text-center"></v-list-item-title>
				</v-list-item-content>

				<v-list-item-action v-if="item.editable" @click="open(item.title)">
                    <v-btn icon>
                        <v-icon color="grey lighten-1">{{ item.editable ? 'mdi-pencil' : '' }}</v-icon>
                    </v-btn>
                </v-list-item-action>
				<v-list-item-action v-else></v-list-item-action>

				</v-list-item>
			</template>
    	</v-list>
    </v-card>
	<v-progress-circular v-else :size="120" indeterminate></v-progress-circular>
</div>
</template>

<script>
export default {
	props: ['editable', 'readonly', 'jirausers', 'id'],
	computed: {
		People () {
			return [
				{ icon: 'mdi-account', iconClass: 'grey lighten-1 white--text', title: 'Куратор', value: this.editable.HEAD_MANAGER, editable: true },
				{ icon: 'mdi-account', iconClass: 'grey lighten-1 white--text', title: 'Менеджер', value: this.editable.MANAGER, editable: true },
				{ icon: 'mdi-account', iconClass: 'grey lighten-1 white--text', title: 'Сервис-менеджер', value: '...', editable: false },
				{ icon: 'mdi-account', iconClass: 'grey lighten-1 white--text', title: 'Ведущий инженер', value: this.readonly.VIs, editable: false },
				{ icon: 'mdi-account', iconClass: 'grey lighten-1 white--text', title: 'Бухгалтер', value: this.readonly.Buhs, editable: false }
			]
		}
	},
	data () {
		return {
			dialog: false,
			localloading: false,
			name: {},
			url: '',
			label: ''
		}
	},
	created () {
	},
	methods: {
		open (name) {
			this.dialog = true
			this.label = name
			if (name === 'Куратор') this.url = 'updateCurator'
			if (name === 'Менеджер') this.url = 'updateManager'
		},
		save () {
			if (Object.keys(this.name).length !== 0) {
				this.$store.dispatch(this.url, { id: this.id, name: this.name.user_name })
					.then(() => {
						this.$store.commit('setData', 'Данные успешно обновлены.')
						this.close()
					})
			} else {
				this.$store.commit('setError', 'Куратор не выбран, что будем сохранять то?')
			}
		},
		close () {
			this.dialog = false
			this.name = {}
		}
	}
}
</script>

<style lang="scss" scoped>
</style>
