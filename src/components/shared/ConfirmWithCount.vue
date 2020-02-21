<template>
  <v-dialog v-model="dialog" :max-width="options.width" :style="{ zIndex: options.zIndex }" @keydown.esc="cancel">
    <v-card>
      <v-toolbar dark :color="options.color" dense flat>
        <v-toolbar-title class="white--text">{{ title }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text v-show="!!message" class="pa-4">{{ message }}
		  <v-text-field placeholder="Выберите кол-во:" type="number" v-model="Count"></v-text-field>
	  </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <v-btn color="primary darken-1" text @click.native="agree">Да</v-btn>
        <v-btn color="grey" text @click.native="cancel">Отмена</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
/**
 * Vuetify Confirm Dialog component
 *
 * Insert component where you want to use it:
 * <confirm ref="confirm"></confirm>
 *
 * Call it:
 * this.$refs.confirm.open('Delete', 'Are you sure?', { color: 'red' }).then((confirm) => {})
 * Or use await:
 * if (await this.$refs.confirm.open('Delete', 'Are you sure?', { color: 'red' })) {
 *   // yes
 * }
 * else {
 *   // cancel
 * }
 *
 * Alternatively you can place it in main App component and access it globally via this.$root.$confirm
 * <template>
 *   <v-app>
 *     ...
 *     <confirm ref="confirm"></confirm>
 *   </v-app>
 * </template>
 *
 * mounted() {
 *   this.$root.$confirm = this.$refs.confirm.open
 * }
 */
export default {
	data: () => ({
		dialog: false,
		resolve: null,
		reject: null,
		message: null,
		title: null,
		Count: null,
		item: null,
		options: {
			color: 'primary',
			width: 390,
			zIndex: 200
		}
	}),
	methods: {
		open (title, message, item, options) {
			this.dialog = true
			this.title = title
			this.message = message
			this.item = item
			this.options = Object.assign(this.options, options)
			return new Promise((resolve, reject) => {
				this.resolve = resolve
				this.reject = reject
			})
		},
		agree () {
			if (this.Count) {
				this.resolve(true)
				this.$emit('Count', {
					Count: this.Count,
					marketid: this.item
				})
				this.Count = null
				this.dialog = false
			} else {
				this.$store.commit('setError', 'Не выбрано кол-во!')
			}
		},
		cancel () {
			this.resolve(false)
			this.dialog = false
		}
	}
}
</script>
