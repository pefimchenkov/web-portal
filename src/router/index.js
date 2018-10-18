import Vue from 'vue'
import Router from 'vue-router'
import AuthGuard from './auth-guard'
import Home from '@/components/Home'
import Ad from '@/components/ads/Ad'
import AdList from '@/components/ads/AdList'
import NewAd from '@/components/ads/NewAd'
import Login from '@/components/auth/Login'
// import Registration from '@/components/auth/Registration'
import Orders from '@/components/user/Orders'
import Register from '@/components/auth/Register'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/ad/:id',
      props: true,
      name: 'ad',
      component: Ad,
      beforeEnter: AuthGuard
    },
    {
      path: '/list',
      name: 'list',
      component: AdList,
      beforeEnter: AuthGuard
    },
    {
      path: '/new',
      name: 'newAd',
      component: NewAd,
      beforeEnter: AuthGuard
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    /* {
      path: '/registration',
      name: 'reg',
      component: Registration
    }, */
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/orders',
      name: 'orders',
      component: Orders,
      beforeEnter: AuthGuard
    }
  ],
  mode: 'history'
})
