<template>
	<v-dialog v-model="showFilterName" width="500px">
		<v-card class="pa-3">
        	<v-card-title class="headline">Введите название для фильтра</v-card-title>
        		<v-text-field v-model="filterName"></v-text-field>
       		 <v-card-actions>
          		<v-spacer></v-spacer>
				<v-btn
					color="green darken-1"
					text="text"
					@click="showFilterName = false"
				>
					Отменить
				</v-btn>
				<v-btn
					color="green darken-1"
					text="text"
					@click="createFilter(filterName)"
				>
					Сохранить
				</v-btn>
        	</v-card-actions>
      	</v-card>
	</v-dialog>
</template>

<script>
export default {
	props: ['ad'],
	data () {
		return {
			showFilterName: false,
			filterName: ''
		}
	},
	methods: {
		createFilter (name) {

		}
	}
}
</script>
