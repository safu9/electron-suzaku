const state = {
  files: [],
  index: 0,
  time: 0,
  isPlaying: false,
  isRepeating: false,
  isShuffling: false,
  shuffleList: []
}

const mutations = {
  setFiles (state, files) {
    state.files = files
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
    state.shuffleList = [...Array(state.files.length).keys()]

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
  }
}

const actions = {
}

const getters = {
  // Shuffled index and file
  currentIndex: (state) => {
    return state.isShuffling ? state.shuffleList[state.index] : state.index
  },
  currentFile: (state, getters) => {
    return state.files[getters.currentIndex] || {}
  },
  timeString: (state) => {
    const min = Math.floor(state.time / 60)
    const sec = state.time % 60
    return min + ':' + (sec < 10 ? '0' : '') + sec
  },
  durationString: (state, getters) => {
    if (!getters.currentFile) {
      return '0:00'
    }
    const min = Math.floor(getters.currentFile.duration / 60)
    const sec = Math.round(getters.currentFile.duration) % 60
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
