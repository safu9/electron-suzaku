import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== 'production',
  plugins: [
    createPersistedState({
      paths: [
        'playlist.targetID',
        'playlist.tracks',
        'playlist.index',
        'playlist.time',
        // 'playlist.isPlaying',
        'playlist.isRepeating',
        'playlist.isShuffling',
        'playlist.shuffleList',
        'playlist.volume'
      ]
    })
  ]
})
