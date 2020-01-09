<template>
	<v-dialog
      	:value="dialog"
	  	@click="close"
		  width="800"
    	>
      <v-card
        color="warning"
        dark
		class="pa-4"
      >
        <v-card-text
			class="white--text"
		>
			{{ infoText }}
          <v-progress-linear
            indeterminate
            color="white"
            class="ma-3"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
</template>

<script>
export default {
	props: ['show', 'infoText'],
	data () {
		return {
		}
	},
	watch: {
		show: (val) => {
			console.log(val)
			this.showLocal = val
		}
	},
	computed: {
		dialog () {
			return this.show
		}
	},
	methods: {
		close () {
			this.dialog = false
		}
	},
	mounted () {
	}
}
</script>
