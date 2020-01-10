<template>
  <v-app>
    <v-navigation-drawer app temporary v-model="drawer" v-if="isUserLoggedIn">
      <v-list>
		<v-list-group no-action>
		<template v-slot:activator>
			<v-list-item>
				<v-list-item-action>
					<v-icon>memory</v-icon>
				</v-list-item-action>
				<v-list-item-content>
					<v-list-item-title>
						ЗИП
					</v-list-item-title>
				</v-list-item-content>
			</v-list-item>
		</template>
			<v-list-item :to="item.url" v-for="item of items_zip" :key="item.title">
			<v-list-item-content>
				<v-list-item-title v-text="item.title"></v-list-item-title>
			</v-list-item-content>
			<v-list-item-action>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-action>
			</v-list-item>
		</v-list-group>
      </v-list>

		<v-list>
		<v-list-group>
			<template v-slot:activator>
			<v-list-item>
				<v-list-item-action>
						<v-icon>phone_android</v-icon>
				</v-list-item-action>
				<v-list-item-content>
					<v-list-item-title>
						Модели
					</v-list-item-title>
				</v-list-item-content>
			</v-list-item>
		</template>
		<v-list-item :to="item.url" v-for="item of items_models" :key="item.title">
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
		</v-list-group>
		</v-list>

		<v-list v-if="deals">
			<v-list-group>
			<template v-slot:activator>
				<v-list-item>
					<v-list-item-action>
							<v-icon>{{ deals.icon }}</v-icon>
					</v-list-item-action>
					<v-list-item-content>
						<v-list-item-title>
							{{ deals.title }}
						</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</template>
			<v-list-item :to="item.url" v-for="item of items_deals" :key="item.title">
			<v-list-item-content>
				<v-list-item-title v-text="item.title"></v-list-item-title>
			</v-list-item-content>
			</v-list-item>
			</v-list-group>
		</v-list>

		<v-list v-if="budget">
			<v-list-group>
			<template v-slot:activator>
				<v-list-item>
					<v-list-item-action>
							<v-icon>{{ budget.icon }}</v-icon>
					</v-list-item-action>
					<v-list-item-content>
						<v-list-item-title>
							{{ budget.title }}
						</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</template>
			<v-list-item :to="item.url" v-for="item of items_budget" :key="item.title">
			<v-list-item-content>
				<v-list-item-title v-text="item.title"></v-list-item-title>
			</v-list-item-content>
			</v-list-item>
			</v-list-group>
		</v-list>

		<v-list>
			<v-list-group>
			<template v-slot:activator>
				<v-list-item>
					<v-list-item-action>
							<v-icon>list</v-icon>
					</v-list-item-action>
					<v-list-item-content>
						<v-list-item-title>
							Справочники
						</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</template>
			<v-list-item :to="item.url" v-for="item of items_dictionary" :key="item.title">
			<v-list-item-content>
				<v-list-item-title v-text="item.title"></v-list-item-title>
			</v-list-item-content>
			</v-list-item>
			</v-list-group>
		</v-list>

		<v-list>
        <v-list-item :to="link.url" v-for="link of links" :key="link.title">
          <v-list-item-action>
            <v-icon>{{ link.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="link.title"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="onLogout" v-if="isUserLoggedIn">
          <v-list-item-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <template>
      <v-app-bar fixed dark color="primary" app>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>
			 <v-tooltip bottom v-if="isUserLoggedIn">
				<template v-slot:activator="{on}">
					<router-link to="/user" tag="span" class="pointer">
						<v-avatar v-on="on" v-if="userAvatar && userAvatar !== 'account_circle'" class="mr-3">
							<img :src="userAvatar" />
						</v-avatar>
						<v-icon v-on="on" x-large v-else-if="userAvatar && userAvatar === 'account_circle'">
							{{ userAvatar }}
						</v-icon>
						<v-progress-circular
							v-else
							:size="50"
							color="amber"
							indeterminate
						>
						</v-progress-circular>
					</router-link>
				  </template>
				  <span>профиль пользователя</span>
			</v-tooltip>
          <router-link to="/" tag="span" class="pointer">WEB PORTAL {{ '- ' + userEmail }}</router-link>

        </v-toolbar-title>

        <v-spacer></v-spacer>
        <v-toolbar-items class="hidden-sm-and-down">
          <v-menu offset-y open-on-hover v-if="isUserLoggedIn">
			<template v-slot:activator=" { on } ">
				<v-btn v-on="on" color="primary" dark>
              	<v-icon left>memory</v-icon>ЗИП
            	</v-btn>
			</template>
            <v-list>
              <v-list-item v-for="(item, index) in items_zip" :key="index" :to="item.url">
                <v-list-item-action>{{item.title}}</v-list-item-action>
              </v-list-item>
            </v-list>
          </v-menu>
		  <v-menu offset-y open-on-hover v-if="isUserLoggedIn">
			<template v-slot:activator=" { on } ">
            <v-btn v-on="on" color="primary" dark>
              <v-icon left>phone_android</v-icon>Модели
            </v-btn>
			</template>
            <v-list>
              <v-list-item v-for="(item, index) in items_models" :key="index" :to="item.url">
                <v-list-item-action>{{item.title}}</v-list-item-action>
              </v-list-item>
            </v-list>
          </v-menu>

		  <v-btn text v-for="link in links" :key="link.title" :to="link.url">
            <v-icon left>{{ link.icon }}</v-icon>
            {{ link.title }}
          </v-btn>

		  <template v-if="deals">
			  <v-menu offset-y open-on-hover>
			<template v-slot:activator=" { on } ">
            <v-btn v-on="on" color="primary" dark>
              <v-icon left>{{ deals.icon }}</v-icon>{{ deals.title }}
            </v-btn>
			</template>
            <v-list>
              <v-list-item v-for="(item, index) in items_deals" :key="index" :to="item.url">
                <v-list-item-action>{{ item.title }}</v-list-item-action>
              </v-list-item>
            </v-list>
          </v-menu>
		  </template>

		  <template v-if="budget">
			  <v-menu offset-y open-on-hover>
			<template v-slot:activator=" { on } ">
            <v-btn v-on="on" color="primary" dark>
              <v-icon left>{{ budget.icon }}</v-icon>{{ budget.title }}
            </v-btn>
			</template>
            <v-list>
              <v-list-item v-for="(item, index) in items_budget" :key="index" :to="item.url">
                <v-list-item-action>{{ item.title }}</v-list-item-action>
              </v-list-item>
            </v-list>
          </v-menu>
		  </template>

		  <v-menu offset-y open-on-hover v-if="isUserLoggedIn">
			<template v-slot:activator=" { on } ">
            <v-btn v-on="on" color="primary" dark>
              <v-icon left>list</v-icon>Справочники
            </v-btn>
			</template>
            <v-list>
              <v-list-item v-for="(item, index) in items_dictionary" :key="index" :to="item.url">
                <v-list-item-action>{{item.title}}</v-list-item-action>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn text @click="onLogout" v-if="isUserLoggedIn">
            <v-icon left>exit_to_app</v-icon>Выход
          </v-btn>
        </v-toolbar-items>
      </v-app-bar>
    </template>
  <v-content>
      <router-view></router-view>
  </v-content>
  <template v-if="error">
  <v-snackbar :timeout="5000" @input="closeError()" color="error" :value="true">
    {{ error }}
    <v-btn dark text @click.native="closeError()">Close</v-btn>
  </v-snackbar>
</template>
  <template v-if="success">
  <v-snackbar :timeout="5000" @input="successDone()" color="success" :value="true">
    {{ success }}
    <v-btn dark text @click.native="successDone()">Закрыть</v-btn>
  </v-snackbar>
</template>
<template v-if="info">
  <v-snackbar :timeout="3000" @input="closeInfo()" :value="true">
    {{ info }}
    <v-btn dark text @click.native="closeInfo()">Закрыть</v-btn>
  </v-snackbar>
</template>
<v-btn
	v-scroll="onScroll"
	v-show="fab"
	:style="`margin:0 -15px 37px 0`"
	fab
	dark
	fixed
	bottom
	small
	right
	color="primary"
	@click="toTop"
	>
	<v-icon>keyboard_arrow_up</v-icon>
</v-btn>
</v-app>
</template>

<script>

// import { AclRule } from 'vue-acl'

export default {
	data () {
		return {
			drawer: false,
			items_zip: [
				{ title: 'Список ЗИП', url: '/zip' },
				{ title: 'Псевдонимы', url: '/aliases' },
				{ title: 'Серийные номера', url: '/sn' },
				{ title: 'Справочники ЗИП', url: '/catalog_zip' }
			],
			items_deals: [
				{ title: 'Со счетами', url: '/deals/list' },
				{ title: 'Нет счетов', url: '/deals/list_no_bills' }
			],
			items_budget: [
				{ title: 'Реестр текущий', url: '/budget/list' },
				{ title: 'Реестр прошлый', url: '/budget/list_prev' },
				{ title: 'Контроль расходов', url: '/budget/list_pays' },
				{ title: 'Планы', url: '/budget/plans' }
			],
			items_models: [
				{ title: 'Список Моделей', url: '/models' },
				{ title: 'Справочники оборудования', url: '/catalog_models' }
			],
			items_dictionary: [
				{ title: 'Технические характеристики', url: '/tech_properties' },
				{ title: 'Справочники ЗИП', url: '/catalog_zip' },
				{ title: 'Справочники Моделей', url: '/catalog_models' },
				{ title: 'Справочники CRM', url: '/crm/dictionaries' },
				{ title: 'Склад 1С', url: '/stock_1c' },
				{ title: 'Склад инженеров', url: '/engineers_stock' }
			],
			fab: false
		}
	},
	methods: {
		closeError () {
			this.$store.dispatch('clearError')
		},
		successDone () {
			this.$store.dispatch('setData')
		},
		closeInfo () {
			this.$store.dispatch('setInfo')
		},
		onLogout () {
			this.$store.dispatch('LogoutUser')
			this.$router.push('/')
		},
		onScroll (e) {
			if (typeof window === 'undefined') return
			const top = window.pageYOffset || e.target.scrollTop || 0
			this.fab = top > 20
		},
		toTop () {
			this.$vuetify.goTo(0)
		}
	},
	computed: {
		error () {
			return this.$store.getters.error
		},
		success () {
			return this.$store.getters.data
		},
		info () {
			return this.$store.getters.info
		},
		userEmail () {
			if (this.$store.getters.currentUser) {
				return this.$store.getters.currentUser.email
			} else {
				return 'ВНИМАНИЕ, вход не выполнен'
			}
		},
		userAvatar () {
			if (this.$store.getters.currentUser) {
				if (!this.$store.getters.currentUser.photoURL) return 'account_circle'
				return this.$store.getters.currentUser.photoURL
			} else {
				return false
			}
		},
		isUserLoggedIn () {
			return this.$store.getters.isUserLoggedIn
		},
		userRole () {
			return this.$store.getters.userRole
		},
		links () {
			if (this.isUserLoggedIn) {
				return [
					/* { title: 'Orders', icon: 'bookmark_border', url: '/orders' },
					{ title: 'New Ad', icon: 'note_add', url: '/new' },
					{ title: 'My Ads', icon: 'list', url: '/list' }, */
					{ title: 'Маркет', icon: 'shopping_basket', url: '/zip_prices' },
					{ title: 'Клиенты', icon: 'people', url: '/clients' }
				]
			}
			return [
				{ title: 'Вход', icon: 'lock', url: '/login' },
				{ title: 'Регистрация', icon: 'face', url: '/registration' }
			]
		},
		deals () {
			if (this.isUserLoggedIn) {
				const Arr = this.userRole.split('&')
				if (Arr.find(item => item === 'admin') || Arr.find(item => item === 'financier')) {
					return { title: 'Сделки', icon: 'mdi-cash-multiple' }
				} else return false
			} else return false
		},
		budget () {
			if (this.isUserLoggedIn) {
				const Arr = this.userRole.split('&')
				if (Arr.find(item => item === 'admin') || Arr.find(item => item === 'financier')) {
					return { title: 'Бюджет', icon: 'mdi-cash-multiple' }
				} else return false
			} else return false
		}
	}
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Alegreya+Sans|Cuprum|Fira+Sans+Condensed|Jura:500|PT+Sans+Narrow|Play|Rubik');
.pointer {
	cursor: pointer;
}
.v-application {
	font-family: 'Rubik' !important;
	font-size: 0.9em !important;
}
#app {
	font-family: 'Rubik' !important;
	font-size: 0.9em !important;
}
.v-data-table td {
	font-size: 0.9em !important;
}
.v-tabs-bar, .v-tabs-items {
	background-color: transparent !important;
}
.v-tab {
	font-size: .845rem !important;
}
.v-label {
	font-size: 12px !important;
}
.btn {
	font-size: 12px !important;
}
.v-btn__content {
	font-size: 12px !important;
}
</style>
