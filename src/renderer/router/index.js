import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'top-page',
      component: require('@/views/TopPage').default
    },
    {
      path: '/player',
      name: 'player-page',
      component: require('@/views/PlayerPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
