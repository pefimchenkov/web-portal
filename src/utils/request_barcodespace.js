import axios from 'axios'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
	baseURL: 'https://barcodespace.ru', // url = base url + request url
	withCredentials: false, // send cookies when cross-domain requests
	timeout: 10000 // request timeout
})

// request interceptor
service.interceptors.request.use(
	config => {
		// do something before request is sent
		// console.log(store.getters.token)
		if (store.getters.token) {
			// let each request carry token
			// ['X-Token'] is a custom headers key
			// please modify it according to the actual situation
			config.headers['X-Token'] = getToken()
		}
		return config
	},
	error => {
		// do something with request error
		console.log(error) // for debug
		return Promise.reject(error)
	}
)

// response interceptor

export default service
