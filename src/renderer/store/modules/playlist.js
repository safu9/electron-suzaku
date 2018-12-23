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
  audioContext: new AudioContext(),
  timeIntervalID: null
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

  setAudio (state, audio) {
    state.audio = audio
  },
  setTimeIntervalID (state, id) {
    state.timeIntervalID = id
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

    if (state.audio) {
      state.audio.pause()
    }

    commit('setAudio', new Audio())
    state.audio.src = path
    state.audio.onended = () => {
      dispatch('onSongEnded')
    }

    let source = state.audioContext.createMediaElementSource(state.audio)
    source.connect(state.audioContext.destination)

    if (startPlay) {
      dispatch('togglePlay')
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

    if (!state.audio.paused) {
      state.audio.pause()

      window.clearInterval(state.timeIntervalID)
    } else {
      state.audio.play()
        .catch(err => {
          console.log(err)
          commit('setAudio', null)
          commit('setIsPlaying', false)
        })

      const id = window.setInterval(() => {
        dispatch('updateTime')
      }, 200)
      commit('setTimeIntervalID', id)
    }

    commit('setIsPlaying', !state.audio.paused)
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
          state.audio.pause()
          commit('setIsPlaying', false)
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
    dispatch('updateIndex', state.index - 1)
  },
  toggleRepeat ({ commit, state }) {
    if (state.isRepeating === true) {
      commit('setIsRepeating', 'one')
    } else if (state.isRepeating === 'one') {
      commit('setIsRepeating', false)
    } else {
      commit('setIsRepeating', true)
    }
  },
  toggleShuffle ({ commit, state }) {
    commit('setIsShuffling', !state.isShuffling)

    if (state.isShuffling) {
      commit('updateShuffleList')
    } else {
      commit('setIndex', state.shuffleList[state.index])
      commit('clearShuffleList')
    }
  },
  updateTime ({ commit, state }) {
    if (state.audio) {
      commit('setTime', Math.round(state.audio.currentTime))
    } else {
      commit('setTime', 0)
    }
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
    if (!getters.currentTrack) {
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
