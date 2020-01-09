import request from '@/utils/request'

export function getEngineersStockGood (params) {
	return request({
		url: '/engineers_stock_good',
		method: 'get',
		params
	})
}
export function getEngineersStock (params) {
	return request({
		url: '/engineers_stock',
		method: 'get',
		params
	})
}
export function getEngineersStockArchive (params) {
	return request({
		url: '/engineers_stock_archive',
		method: 'get',
		params
	})
}
export function getEngineersStockDetails (data) {
	return request({
		url: '/engineers_stock_details',
		method: 'post',
		data: data
	})
}
export function setConditionStock (data) {
	return request({
		url: '/engineers_stock/set_condition',
		method: 'post',
		data: data
	})
}
export function deleteEngineersStock (id) {
	return request({
		url: '/engineers_stock/delete',
		method: 'post',
		data: { id }
	})
}
export function sendRequest (data) {
	return request({
		url: '/engineers_stock/send_request',
		method: 'post',
		data: data
	})
}
export function sendApprove (data) {
	return request({
		url: '/engineers_stock/send_approve',
		method: 'post',
		data: data
	})
}
export function sendDecline (data) {
	return request({
		url: '/engineers_stock/send_decline',
		method: 'post',
		data: data
	})
}
export function sendCheck (data) {
	return request({
		url: '/engineers_stock/send_check',
		method: 'post',
		data: data
	})
}
export function sendRequestForZip (data) {
	return request({
		url: '/engineers_stock/send_request_for_zip',
		method: 'post',
		data: data
	})
}
