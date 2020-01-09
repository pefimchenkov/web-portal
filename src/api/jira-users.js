import request from '@/utils/request'

export function getJiraUsers (params) {
	return request({
		url: '/jirausers',
		method: 'get',
		params
	})
}
