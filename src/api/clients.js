import request from '@/utils/request'

export function getEditableCRM (id) {
	return request({
		url: '/client/crm/editable',
		method: 'get',
		params: { id }
	})
}
export function getReadonlyCRM (id) {
	return request({
		url: '/client/crm/readonly',
		method: 'get',
		params: { id }
	})
}
export function getLegPers (id) {
	return request({
		url: '/client/crm/legpers',
		method: 'get',
		params: { id }
	})
}
export function getClientsDomains (id) {
	return request({
		url: '/client/crm/clientsdomains',
		method: 'get',
		params: { id }
	})
}
export function getPercentCRM (params) {
	return request({
		url: '/client/crm/get_percent',
		method: 'get',
		params
	})
}
export function updateCurator (payload) {
	return request({
		url: '/client/crm/curator',
		method: 'put',
		data: payload
	})
}
export function updateManager (payload) {
	return request({
		url: '/client/crm/manager',
		method: 'put',
		data: payload
	})
}
// eslint-disable-next-line camelcase
export function updateAIDC_SALE (payload) {
	return request({
		url: '/client/crm/AIDC_SALE',
		method: 'put',
		data: payload
	})
}
// eslint-disable-next-line camelcase
export function updateAIDC_SALE_ZIP (payload) {
	return request({
		url: '/client/crm/AIDC_SALE_ZIP',
		method: 'put',
		data: payload
	})
}
// eslint-disable-next-line camelcase
export function updateAIDC_SERV (payload) {
	return request({
		url: '/client/crm/AIDC_SERV ',
		method: 'put',
		data: payload
	})
}
export function updateIT (payload) {
	return request({
		url: '/client/crm/IT',
		method: 'put',
		data: payload
	})
}
export function activateCRM (id) {
	return request({
		url: '/client/crm/activate',
		method: 'put',
		data: [id]
	})
}
export function deactivateCRM (id) {
	return request({
		url: '/client/crm/deactivate',
		method: 'put',
		data: [id]
	})
}
export function addLegPers (payload) {
	return request({
		url: '/client/crm/add_legpers',
		method: 'post',
		data: payload
	})
}
export function updateLegPers (payload) {
	return request({
		url: '/client/crm/update_legpers',
		method: 'put',
		data: payload
	})
}
export function deleteLegPers (payload) {
	return request({
		url: '/client/crm/delete_legpers',
		method: 'delete',
		data: payload
	})
}
export function addDomains (payload) {
	return request({
		url: '/client/crm/add_domains',
		method: 'post',
		data: payload
	})
}
export function updateDomains (payload) {
	return request({
		url: '/client/crm/update_domains',
		method: 'put',
		data: payload
	})
}
export function deleteDomains (payload) {
	return request({
		url: '/client/crm/delete_domains',
		method: 'delete',
		data: payload
	})
}
export function setPercent (payload) {
	return request({
		url: '/client/crm/set_percent',
		method: 'put',
		data: payload
	})
}
export function setCustomPercent (payload) {
	return request({
		url: '/client/crm/set_custom_percent',
		method: 'put',
		data: payload
	})
}
export function deleteCustomPercent (payload) {
	return request({
		url: '/client/crm/delete_custom_percent',
		method: 'put',
		data: payload
	})
}
