import Vue from 'vue'
import Router from 'vue-router'
// import AuthGuard from './auth-guard'

const Home = resolve => require(['@/components/Home'], resolve)
const Login = resolve => require(['@/components/auth/Login'], resolve)
const Registration = resolve => require(['@/components/auth/Registration'], resolve)
const Clients = resolve => require(['@/views/Clients/list'], resolve)
const UserProfile = resolve => require(['@/components/user/UserProfile.vue'], resolve)
const Models = resolve => require(['@/components/ads/Models'], resolve)
const TechProperties = resolve => require(['@/components/ads/TechProperties'], resolve)
const CatalogModels = resolve => require(['@/components/ads/CatalogModels'], resolve)
const Client = resolve => require(['@/views/Clients/client'], resolve)
const ZipList = resolve => require(['@/components/ads/ZipList'], resolve)
const CatalogZip = resolve => require(['@/components/ads/CatalogZip'], resolve)
const Zip = resolve => require(['@/components/ads/Zip'], resolve)
const ZipPrices = resolve => require(['@/views/market/ZipPrices.vue'], resolve)
const Market = resolve => require(['@/components/ads/Market'], resolve)
const Aliases = resolve => require(['@/components/ads/Aliases'], resolve)
const SN = resolve => require(['@/components/ads/SN'], resolve)
const Stock1C = resolve => require(['@/components/ads/Stock1C'], resolve)
const CrmDict = resolve => require(['@/views/CRM/Dictionaries'], resolve)
const EngineersStock = resolve => require(['@/views/engineers-stock/index.vue'], resolve)
const EngineersStockDetails = resolve => require(['@/views/engineers-stock/components/details'], resolve)
const Deals = resolve => require(['@/views/CRM/Deals'], resolve)
const DealsDetail = resolve => require(['@/views/CRM/DealsDetail'], resolve)
const Budget = resolve => require(['@/views/CRM/Budget'], resolve)
const Test = resolve => require(['@/components/ads/test'], resolve)
const NotFound = resolve => require(['../404'], resolve)
const Forbidden = resolve => require(['../Forbidden'], resolve)

Vue.use(Router)

export default new Router({
	routes: [
		{
			path: '/test',
			name: 'test',
			component: Test,
			meta: {
				rule: 'Public'
			}
		},
		{
			path: '/',
			name: 'home',
			component: Home,
			meta: {
				rule: 'Public'
			}
		},
		{
			path: '/user',
			name: 'user',
			component: UserProfile,
			meta: {
				rule: 'User'
			}
		},
		{
			path: '/aliases',
			name: 'aliases',
			component: Aliases,
			meta: {
				rule: 'User'
			}
			// beforeEnter: AuthGuard
		},
		{
			path: '/models',
			name: 'models',
			component: Models,
			meta: {
				rule: 'User'
			}
			// beforeEnter: AuthGuard
		},
		{
			path: '/tech_properties',
			name: 'tech_properties',
			component: TechProperties,
			meta: {
				rule: 'User'
			}
			// beforeEnter: AuthGuard
		},
		{
			path: '/stock_1c',
			name: 'stock_1c',
			component: Stock1C,
			meta: {
				rule: 'User'
			}
		},
		{
			path: '/engineers_stock',
			name: 'engineers_stock',
			component: EngineersStock,
			meta: {
				rule: 'User'
			}
		},
		{
			path: '/engineers_stock/:Eng/:zipID',
			props: true,
			name: 'engineers_stock_details',
			component: EngineersStockDetails,
			meta: {
				rule: 'User'
			}
		},
		{
			path: '/catalog_models',
			name: 'catalog_models',
			component: CatalogModels,
			meta: {
				rule: 'User'
			}
			// beforeEnter: AuthGuard
		},
		{
			path: '/clients',
			name: 'Clients',
			component: Clients,
			meta: {
				rule: 'User'
			}
		},
		{
			path: '/clients/:id',
			props: true,
			name: 'Client',
			component: Client,
			meta: {
				rule: 'User'
			}
		},
		{
			path: '/crm/dictionaries',
			name: 'crm_dict',
			component: CrmDict,
			meta: {
				rule: 'User'
			}
		},
		{
			path: '/deals/list',
			name: 'deals_list',
			component: Deals,
			meta: {
				rule: 'Financier'
			}
		},
		{
			path: '/deals/list_no_bills',
			name: 'deals_list_no_bills',
			component: Deals,
			meta: {
				rule: 'Financier'
			}
		},
		{
			path: '/budget/list',
			name: 'budget_list',
			component: Budget,
			meta: {
				rule: 'Financier'
			}
		},
		{
			path: '/budget/list_pays',
			name: 'pays_list',
			component: Budget,
			meta: {
				rule: 'Financier'
			}
		},
		{
			path: '/budget/list_prev',
			name: 'budget_list_prev',
			component: Budget,
			meta: {
				rule: 'Financier'
			}
		},
		{
			path: '/budget/plans',
			name: 'budget_plans',
			component: Budget,
			meta: {
				rule: 'Financier'
			}
		},
		{
			path: '/deals/:id/:bill_1c',
			name: 'DealsDetail',
			props: true,
			component: DealsDetail,
			meta: {
				rule: 'Financier'
			}
		},
		{
			path: '/zip',
			name: 'ziplist',
			component: ZipList,
			meta: {
				rule: 'User'
			}
			// beforeEnter: AuthGuard
		},
		{
			path: '/catalog_zip',
			name: 'catalog_zip',
			component: CatalogZip,
			meta: {
				rule: 'User'
			}
			// beforeEnter: AuthGuard
		},
		{
			path: '/zip/:id',
			props: true,
			name: 'zip',
			component: Zip,
			meta: {
				rule: 'User'
			}
			// beforeEnter: AuthGuard
		},
		{
			path: '/zip_prices',
			name: 'zip_prices',
			component: ZipPrices,
			meta: {
				rule: 'User'
			}
			// beforeEnter: AuthGuard
		},
		{
			path: '/zip_prices/:id',
			name: 'market',
			props: true,
			component: Market,
			meta: {
				rule: 'User'
			}
			// beforeEnter: AuthGuard
		},
		{
			path: '/sn',
			name: 'sn',
			component: SN,
			meta: {
				rule: 'User'
			}
			// beforeEnter: AuthGuard
		},
		/* {
			path: '/ad/:id',
			props: true,
			name: 'ad',
			component: Ad,
			meta: {
				rule: 'User'
			},
			beforeEnter: AuthGuard
		},
		{
			path: '/list',
			name: 'list',
			component: AdList,
			meta: {
				rule: 'User'
			},
			beforeEnter: AuthGuard
		},
		{
			path: '/new',
			name: 'newAd',
			component: NewAd,
			meta: {
				rule: 'User'
			},
			beforeEnter: AuthGuard
		}, */
		{
			path: '/login',
			name: 'login',
			component: Login,
			meta: {
				rule: 'Public'
			}
		},
		{
			path: '/registration',
			name: 'reg',
			component: Registration,
			meta: {
				rule: 'Public'
			}
		},
		/* {
			path: '/orders',
			name: 'orders',
			component: Orders,
			meta: {
				rule: 'User'
			},
			beforeEnter: AuthGuard
		}, */
		{
			path: '/forbidden',
			name: 'forbidden',
			component: Forbidden,
			meta: {
				rule: '*'
			}
		},
		{
			path: '/*',
			name: '404',
			component: NotFound,
			meta: {
				rule: '*'
			}
		}
	],
	mode: 'history'
})
