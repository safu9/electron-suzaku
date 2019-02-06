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
      path: '/artist',
      name: 'artist-list',
      component: require('@/views/ArtistListPage').default
    },
    {
      path: '/album',
      name: 'album-list',
      component: require('@/views/AlbumListPage').default
    },
    {
      path: '/artist/:id',
      name: 'artist',
      component: require('@/views/ArtistPage').default
    },
    {
      path: '/album/:id',
      name: 'album',
      component: require('@/views/AlbumPage').default
    },
    {
      path: '/player',
      name: 'player',
      component: require('@/views/PlayerPage').default
    },
    {
      path: '/settings',
      name: 'settings',
      component: require('@/views/SettingsPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
