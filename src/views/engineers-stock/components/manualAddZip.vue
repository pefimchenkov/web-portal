<template>
	<div>
		<v-dialog width="800px" v-model="dialog" persistent>
			<v-card class="pa-3 mx-auto" outlined>
				<v-card-title class="subheading"
					>Ручное добавление ЗИП</v-card-title
				>

				<v-autocomplete
					v-model="zip"
					:items="Market"
					:item-text="formattedMarket"
					label="* Маркет"
					validation
					required
					clearable
					return-object
					ref="market"
				></v-autocomplete>
				<v-autocomplete
					v-model="engineer"
					:items="engineers"
					item-text="display_name"
					label="* Инженер"
					ref="engineer"
					required
					clearable
					return-object
				></v-autocomplete>
				<v-textarea
					v-model="comment"
					label="Комментарий:"
					auto-grow
					outlined
					rows="3"
					row-height="25"
				></v-textarea>

				<v-card-actions>
					<v-spacer></v-spacer>

					<v-btn color="green darken-1" text="text" @click="close"
						>Отменить</v-btn
					>

					<v-btn
						color="green darken-1"
						text="text"
						@click.native="save()"
						:disabled="localloading"
						:loading="localloading"
						>Сохранить</v-btn
					>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
	props: ['engineers'],
	computed: {
		...mapGetters(['Market']),
		user () {
			return this.$store.getters.currentUser.email
		}
	},
	data () {
		return {
			zip: {},
			engineer: {},
			comment: '',
			type: null,
			localloading: false,
			dialog: false,
			resolve: null,
			reject: null
		}
	},
	methods: {
		open (type) {
			this.dialog = true
			this.type = type
		},
		close () {
			this.dialog = false
			this.localloading = false
			this.engineer = {}
			this.zip = {}
			this.type = null
		},
		save () {
			if (Object.keys(this.zip).length > 0 && Object.keys(this.engineer).length > 0) {
				this.localloading = true
				this.$store
					.dispatch('manualAddZip', {
						zip: this.zip,
						type: this.type,
						engineer: this.engineer,
						user: this.user,
						comment: this.comment
					})
					.then(insertId => {
						console.log(insertId)
						this.$store.commit(
							'setData',
							'Новый ЗИП (id ' + insertId + ') успешно добавлен.'
						)
						this.close()
					})
			} else {
				this.$store.commit('setError', 'Не все поля заполнены!')
			}
		},
		formattedMarket (item) {
			return (
				item.marketNAME +
				' - (' +
				item.marketPN +
				') - ' +
				'[' +
				item.marketART +
				']'
			)
		}
	}
}
</script>

<style lang="scss" scoped></style>
