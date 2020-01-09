import Vue from 'vue'
import Vuex from 'vuex'
import ads from './ads'
import user from './user'
import shared from './shared'
import orders from './orders'
import zip from './zip'
import aliases from './aliases'
import clients from './clients'
import suppliers from './suppliers'
import brands from './brands'
import conditions from './conditions'
import currency from './currency'
import contracts from './contracts'
import specprices from './specprices'
import tech_properties from './tech_properties'
import models from './models'
import market from './market'
import parts from './parts'
import products_class from './products_class'
import products_type from './products_type'
import serial_numbers from './serial_numbers'
import stock_1c from './stock_1c'
import engineers_stock from './engineers-stock'
import deals from './CRM/deals'
import jira_users from './CRM/jira-users'
import editprices from './editprices'
import marketImg from './marketImg'
import zipImg from './zipImg'
import config from './config'

Vue.use(Vuex)

export default new Vuex.Store({
	modules: {
		ads,
		user,
		shared,
		orders,
		zip,
		clients,
		aliases,
		suppliers,
		brands,
		conditions,
		currency,
		contracts,
		specprices,
		tech_properties,
		models,
		market,
		parts,
		products_class,
		products_type,
		serial_numbers,
		stock_1c,
		engineers_stock,
		deals,
		editprices,
		marketImg,
		zipImg,
		jira_users,
		config
	}
});
