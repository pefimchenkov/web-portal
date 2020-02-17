<template>
	<div>
		<v-dialog v-model="dialog" max-width="750">
			<bonusDialog></bonusDialog>
		</v-dialog>
		<v-row>
			<v-col v-for="item in items" :key="item.name" class="mx-4">
				<v-card max-width="480" outlined>
					<v-list-item three-line>
						<v-list-item-content>
							<div class="overline mb-4">{{ item.name }}</div>
							<v-list-item-title class="headline my-3">{{ item.title }} - {{ item.value }}</v-list-item-title>
							<v-list-item-subtitle>Нажмите "Подробнее" чтобы увидеть детализацию</v-list-item-subtitle>
						</v-list-item-content>

						<v-icon x-large>mdi-sale</v-icon>
					</v-list-item>

					<v-card-actions>
						<v-row>
							<v-col class="text-end">
								<v-btn @click="dialog = true" text>Подробнее</v-btn>
							</v-col>
						</v-row>
					</v-card-actions>
				</v-card>
			</v-col>
		</v-row>
	</div>
</template>

<script>
import bonusDialog from './bonusDialog'
export default {
	components: {
		bonusDialog
	},
	data () {
		return {
			dialog: false,
			items: [
				{ name: 'Продажи', title: 'Бонусы с продаж', value: 108 },
				{ name: 'Доходность', title: 'Бонусы с доходности', value: 777 },
				{ name: 'Прочие', title: 'Прочие бонусы', value: 20456 }
			]
		}
	}
}
</script>

<style lang="scss" scoped></style>
