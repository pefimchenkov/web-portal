import request from '@/utils/request'

export function getBonusSale (params) {
	return request({
		url: '/user/bonus_sale',
		method: 'get',
		params
	})
}
export function getBonusSaleSum (data) {
	return request({
		url: '/user/bonus_sale_sum',
		method: 'post',
		data
	})
}
export function getBonusProfit (params) {
	return request({
		url: '/user/bonus_profit',
		method: 'get',
		params
	})
}
export function getBonusProfitSum (data) {
	return request({
		url: '/user/bonus_profit_sum',
		method: 'post',
		data
	})
}
