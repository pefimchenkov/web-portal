import request from '@/utils/request'

export function getNoFactLegpers (params) {
	return request({
		url: '/crm/dictionaries/nofact_legpers',
		method: 'get',
		params
	})
}
export function getNoFactProjects (params) {
	return request({
		url: '/crm/dictionaries/nofact_projects',
		method: 'get',
		params
	})
}
