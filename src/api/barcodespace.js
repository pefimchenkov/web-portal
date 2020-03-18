import request from '@/utils/request_barcodespace'

export function sendOrderToSite (url) {
	return request({
		url: url,
		method: 'get'
	})
}
