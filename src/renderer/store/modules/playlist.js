const fileUrl = require('file-url')
const settings = require('electron-settings')

const state = {
  targetID: null,
  tracks: [],
  index: 0,
  time: 0,
  isPlaying: false,
  isRepeating: false,
  isShuffling: false,
  shuffleList: [],

  audio: null,
  audioContext: null,
  timeIntervalID: null,
  audioGainNode: null,
  volume: 100
}

const mutations = {
  setTargetID (state, id) {
    state.targetID = id
  },
  setTracks (state, tracks) {
    state.tracks = tracks
  },
  setIndex (state, index) {
    state.index = index
  },
  setTime (state, time) {
    state.time = time
  },
  setIsPlaying (state, isPlaying) {
    state.isPlaying = isPlaying
  },
  setIsRepeating (state, isRepeating) {
    state.isRepeating = isRepeating
  },
  setIsShuffling (state, isShuffling) {
    state.isShuffling = isShuffling
  },

  clearShuffleList (state) {
    state.shuffleList = []
  },
  updateShuffleList (state) {
    state.shuffleList = [...Array(state.tracks.length).keys()]

    for (var i = state.shuffleList.length - 1; i > 0; i--) {
      const r = Math.floor(Math.random() * (i + 1))
      const tmp = state.shuffleList[i]
      state.shuffleList[i] = state.shuffleList[r]
      state.shuffleList[r] = tmp
    }

    // Set new index
    state.shuffleList[state.shuffleList.indexOf(state.index)] = state.shuffleList[0]
    state.shuffleList[0] = state.index

    state.index = 0
  },

  initContext (state) {
    state.audioContext = new AudioContext()
    state.audioGainNode = state.audioContext.createGain()
  },
  setAudio (state, audio) {
    state.audio = audio
  },
  setTimeIntervalID (state, id) {
    state.timeIntervalID = id
  },
  setVolume (state, volume) {
    state.volume = Math.min(Math.max(volume, 0), 100)
    if (state.audioGainNode) {
      state.audioGainNode.gain.value = state.volume / 100
    }
  }
}

const actions = {
  setTarget ({ commit, dispatch, state }, params) {
    commit('setTargetID', params.targetID)
    commit('setTracks', params.tracks)
    commit('setIsPlaying', false)

    if (state.isShuffling) {
      commit('updateShuffleList')
    }

    dispatch('setCurrentIndex', params.index || 0)
  },
  initPlayer ({ commit, dispatch, state, getters }, startPlay) {
    if (!getters.currentTrack) {
      return
    }
    const path = getters.currentTrack.path

    dispatch('pause')

    commit('setAudio', new Audio())
    state.audio.src = fileUrl(path)
    // state.audio.src = url.pathToFileURL(path).href

    state.audio.onended = () => {
      dispatch('onSongEnded')
    }

    if (!state.audioContext) {
      commit('initContext')
      commit('setVolume', state.volume)
    }

    let source = state.audioContext.createMediaElementSource(state.audio)
    source.connect(state.audioGainNode)
    state.audioGainNode.connect(state.audioContext.destination)

    if (startPlay) {
      dispatch('play')
    } else {
      commit('setIsPlaying', false)
    }
  },
  onSongEnded ({ dispatch, state }) {
    if (state.isRepeating === 'one') {
      state.audio.play()
    } else {
      dispatch('nextSong')
    }
  },
  togglePlay ({ dispatch, commit, state }) {
    if (!state.audio) {
      return
    }

    if (state.audio.paused) {
      dispatch('play')
    } else {
      dispatch('pause')
    }
  },
  play ({ dispatch, commit, state }) {
    if (!state.audio || !state.audio.paused) {
      return
    }

    commit('setIsPlaying', true)

    const orgSrc = state.audio.src
    state.audio.play()
      .then(() => {
        const id = window.setInterval(() => {
          dispatch('updateTime')
        }, 200)
        commit('setTimeIntervalID', id)
      })
      .catch(err => {
        console.error(err)

        if (orgSrc === state.audio.src && state.isPlaying) {
          state.audio.pause()
          commit('setIsPlaying', false)
        }
      })
  },
  pause ({ dispatch, commit, state }) {
    if (!state.audio || state.audio.paused) {
      return
    }

    commit('setIsPlaying', false)

    state.audio.pause()

    if (state.timeIntervalID) {
      window.clearInterval(state.timeIntervalID)
      commit('setTimeIntervalID', null)
    }
  },
  updateIndex ({ dispatch, commit, state }, index) {
    if (index < 0 || state.tracks.length <= index) {
      if (state.isRepeating === true) {
        index = (index + state.tracks.length) % state.tracks.length
        if (state.isShuffling) {
          commit('updateShuffleList')
        }
      } else {
        if (state.audio && state.isPlaying) {
          dispatch('pause')
        }
        return
      }
    }
    commit('setIndex', index)
    dispatch('initPlayer', state.isPlaying)
  },
  setCurrentIndex ({ dispatch, state }, index) {
    index = state.isShuffling ? state.shuffleList.indexOf(index) : index
    dispatch('updateIndex', index)
  },
  nextSong ({ dispatch, state }) {
    dispatch('updateIndex', state.index + 1)
  },
  prevSong ({ dispatch, state }) {
    if (state.audio && state.time >= 5) {
      state.audio.currentTime = 0
    } else {
      dispatch('updateIndex', state.index - 1)
    }
  },
  toggleRepeat ({ commit, state }) {
    if (state.isRepeating === true) {
      commit('setIsRepeating', 'one')
    } else if (state.isRepeating === 'one') {
      commit('setIsRepeating', false)
    } else {
      commit('setIsRepeating', true)
    }

    settings.set('playlist.repeat', state.isRepeating)
  },
  toggleShuffle ({ commit, state }) {
    commit('setIsShuffling', !state.isShuffling)

    if (state.isShuffling) {
      commit('updateShuffleList')
    } else {
      commit('setIndex', state.shuffleList[state.index])
      commit('clearShuffleList')
    }

    settings.set('playlist.shuffle', state.isShuffling)
  },
  updateTime ({ commit, state }) {
    if (state.audio) {
      commit('setTime', Math.round(state.audio.currentTime))
    } else {
      commit('setTime', 0)
    }
  },
  changeVolume ({ commit }, volume) {
    commit('setVolume', volume)
    settings.set('playlist.volume', state.volume)
  },
  turnUp ({ dispatch, state }) {
    dispatch('changeVolume', state.volume + 10)
  },
  turnDown ({ dispatch, state }) {
    dispatch('changeVolume', state.volume - 10)
  },

  loadSettings ({ commit }) {
    commit('setIsRepeating', settings.get('playlist.repeat', false))
    commit('setIsShuffling', settings.get('playlist.shuffle', false))
    commit('setVolume', settings.get('playlist.volume', 100))
  }
}

const getters = {
  // Shuffled index and file
  currentIndex: (state) => {
    return state.isShuffling ? state.shuffleList[state.index] : state.index
  },
  currentTrack: (state, getters) => {
    return state.tracks[getters.currentIndex] || {}
  },
  timeString: (state) => {
    const min = Math.floor(state.time / 60)
    const sec = state.time % 60
    return min + ':' + (sec < 10 ? '0' : '') + sec
  },
  durationString: (state, getters) => {
    if (!getters.currentTrack || !getters.currentTrack.duration) {
      return '0:00'
    }
    const min = Math.floor(getters.currentTrack.duration / 60)
    const sec = Math.round(getters.currentTrack.duration) % 60
    return min + ':' + (sec < 10 ? '0' : '') + sec
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
