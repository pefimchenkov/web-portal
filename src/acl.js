import Vue from 'vue'
import { AclInstaller, AclCreate, AclRule } from 'vue-acl'
import router from './router'
import store from './store'

const Cryptr = require('cryptr')
const cryptr = new Cryptr('myTotalySecretKey')

Vue.use(AclInstaller)

export default new AclCreate({
	initial: 'public',
	notfound: '/forbidden',
	router,
	acceptLocalRules: true,
	globalRules: {
		Admin: new AclRule('admin').generate(),
		Financier: new AclRule('financier').or('admin').generate(),
		Crm: new AclRule('crm').or('admin').generate(),
		LeadEngineer: new AclRule('leadEngineer').or('admin').generate(),
		Engineer: new AclRule('engineer').or('admin').generate(),
		User: new AclRule('user').or('financier').or('engineer').or('admin').generate(),
		Public: new AclRule('public').or('user').or('financier').or('engineer').or('admin').generate()
	},
	middleware: acl => {
		const userRole = store.getters.userRole
		if (!userRole && sessionStorage.getItem('UserRole')) {
			const decryptedString = cryptr.decrypt(sessionStorage.getItem('UserRole'))
			acl.change(decryptedString)
		} else if (userRole) {
			acl.change(userRole)
		}
	}
})
