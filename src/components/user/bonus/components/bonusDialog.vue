<template>
	<span>
		<v-simple-table class="pa-10">
			<template v-slot:default>
				<thead>
					<tr>
					<th class="text-left">Тип</th>
					<th class="text-left">Запрос</th>
					<th class="text-left">Реализация</th>
					<th class="text-left">Сумма</th>
					<th class="text-left">%</th>
					<th class="text-left">Итого</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in items" :key="item.type">
					<td>{{ item.type }}</td>
					<td>{{ item.request }}</td>
					<td>{{ item.ship }}</td>
					<td>{{ item.sum }}</td>
					<td>{{ item.percent }}</td>
					<td>{{ item.itogo }}</td>
					</tr>
				</tbody>
			</template>
		</v-simple-table>
	</span>
</template>

<script>
export default {
	data () {
		return {
			items: [
				{
					type: 'Frozen Yogurt',
					request: 'test1',
					ship: 'dvsvdv',
					sum: 2345,
					percent: '%',
					itogo: 22
				},
				{
					type: 'Ice cream sandwich',
					request: 'test2',
					ship: 'bdfndfn',
					sum: 5677,
					percent: '%',
					itogo: 33
				},
				{
					type: 'Eclair',
					request: 'test3',
					ship: 'mgmvm',
					sum: 9876,
					percent: '%',
					itogo: 44
				},
				{
					type: 'Cupcake',
					request: 'test4',
					ship: 'vbcvbcb',
					sum: 777,
					percent: '%',
					itogo: 55
				},
				{
					type: 'Gingerbread',
					request: 'test5',
					ship: 'k.jjkol',
					sum: 1234,
					percent: '%',
					itogo: 66
				}
			]
		}
	}
}
</script>

<style lang="scss" scoped></style>
