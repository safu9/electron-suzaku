import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'top',
      component: require('@/views/TopPage').default
    },
    {
      path: '/album/:id',
      name: 'album',
      component: require('@/views/AlbumPage').default
    },
    {
      path: '/artist/:id',
      name: 'artist',
      component: require('@/views/ArtistPage').default
    },
    {
      path: '/player',
      name: 'player',
      component: require('@/views/PlayerPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
