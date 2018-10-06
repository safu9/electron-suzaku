<template>
  <div id="main">
    <div id="library">
      <div class="clearfix">
        <button id="folder-button" @click="selectFolder">Open Folder</button>

        <img id="artwork" :src="currentFile.picture || 'static/blank.png'" />
        <p id="song-title">{{ currentFile.title || currentFile.filename || 'Suzaku' }}</p>
        <p>
          <span v-show="currentFile.album">{{ currentFile.album }}</span>
          <span v-show="currentFile.album && currentFile.artist">/</span>
          <span v-show="currentFile.artist">{{ currentFile.artist }}</span>
        </p>
      </div>

      <hr>

      <p v-for="(data, i) in files" :key="data.path" class="listitem" @click="setCurrentIndex(i)">
        <span v-if="i == currentIndex" class="item-index item-index-playing"><SvgIcon :icon="isPlaying ? 'play' : 'pause'"></SvgIcon></span>
        <span v-else class="item-index">{{ data.track.no || i+1 }}</span>
        <span class="item-name">{{ data.title || data.filename }}</span>
      </p>
    </div>

    <div id="dock" class="clearfix">
      <Seekbar color="#4fc08d"
        :max="currentFile ? Math.round(currentFile.duration) : 0"
        :value="time"
        @change="seekSong" />
      <div id="current-time">{{ timeString }} / {{ durationString }}</div>
      <div id="current-index">{{ files.length ? index+1 : 0 }} / {{ files.length }}</div>

      <p id="controls">
        <button id="repeat-button" @click="toggleRepeat" :class="{'off': !isRepeating}"><SvgIcon :icon="(isRepeating === 'one') ? 'repeat-one' : 'repeat'"></SvgIcon></button>
        <button id="prev-button" @click="prevSong"><SvgIcon icon="skip-backward"></SvgIcon></button>
        <button id="play-button" @click="togglePlay"><SvgIcon :icon="isPlaying ? 'pause' : 'play'"></SvgIcon></button>
        <button id="next-button" @click="nextSong"><SvgIcon icon="skip-forward"></SvgIcon></button>
        <button id="shuffle-button" @click="toggleShuffle" :class="{'off': !isShuffling}"><SvgIcon icon="shuffle"></SvgIcon></button>
      </p>
    </div>
  </div>
</template>

<script>
import Seekbar from '@/components/Seekbar'
import SvgIcon from '@/components/SvgIcon'

export default {
  name: 'player-page',
  components: {
    Seekbar,
    SvgIcon
  },
  data () {
    return {
      files: [],
      index: 0,
      audio: null,
      time: 0,
      timeIntervalID: null,
      isPlaying: false,
      isRepeating: false,
      isShuffling: false,
      shuffleList: [],
      audioContext: null
    }
  },
  computed: {
    // Shuffled index and file
    currentIndex () {
      return this.isShuffling ? this.shuffleList[this.index] : this.index
    },
    currentFile () {
      return this.files[this.currentIndex] || {}
    },
    timeString () {
      const min = Math.floor(this.time / 60)
      const sec = this.time % 60
      return min + ':' + (sec < 10 ? '0' : '') + sec
    },
    durationString () {
      if (!this.currentFile) {
        return '0:00'
      }
      const min = Math.floor(this.currentFile.duration / 60)
      const sec = Math.round(this.currentFile.duration) % 60
      return min + ':' + (sec < 10 ? '0' : '') + sec
    }
  },
  mounted () {
    this.audioContext = new AudioContext()

    this.$electron.ipcRenderer.on('selected_folder', (_event, arg) => {
      this.onFolderSelected(arg)
    })
  },
  methods: {
    selectFolder () {
      this.$electron.ipcRenderer.send('select_folder')
    },
    onFolderSelected (files) {
      if (!files) {
        return
      }

      this.files = files
      this.index = 0

      this.initPlayer()
      this.togglePlay()
    },
    initPlayer () {
      if (!this.currentFile) {
        return
      }
      const path = this.currentFile.path

      if (this.audio) {
        this.audio.pause()
        this.audio = null
      }

      this.audio = new Audio()
      this.audio.src = path
      this.audio.onended = this.onSongEnded

      this.isPlaying = false

      let source = this.audioContext.createMediaElementSource(this.audio)
      source.connect(this.audioContext.destination)
    },
    onSongEnded () {
      if (this.isRepeating === 'one') {
        this.audio.play()
      } else {
        this.nextSong()
      }
    },
    togglePlay () {
      if (!this.audio) {
        return
      }

      if (!this.audio.paused) {
        this.audio.pause()

        window.clearInterval(this.timeIntervalID)
      } else {
        this.audio.play()
          .catch(err => {
            console.log(err)
            this.audio = null
            this.isPlaying = false
          })

        this.timeIntervalID = window.setInterval(this.updateSeekbar, 200)
      }

      this.isPlaying = !this.audio.paused
    },
    setIndex (index) {
      if (index < 0 || this.files.length <= index) {
        if (this.isRepeating === true) {
          index = (index + this.files.length) % this.files.length
          if (this.isShuffling) {
            this.updateShuffleList()
          }
        } else {
          if (this.audio && this.isPlaying) {
            this.audio.pause()
            this.isPlaying = false
          }
          return
        }
      }
      this.index = index

      const wasPlaying = this.isPlaying
      this.initPlayer()
      if (wasPlaying) {
        this.togglePlay()
      }
    },
    setCurrentIndex (index) {
      index = this.isShuffling ? this.shuffleList.indexOf(index) : index
      this.setIndex(index)
    },
    nextSong () {
      this.setIndex(this.index + 1)
    },
    prevSong () {
      this.setIndex(this.index - 1)
    },
    toggleRepeat () {
      if (this.isRepeating === true) {
        this.isRepeating = 'one'
      } else if (this.isRepeating === 'one') {
        this.isRepeating = false
      } else {
        this.isRepeating = true
      }
    },
    toggleShuffle () {
      this.isShuffling = !this.isShuffling

      if (this.isShuffling) {
        this.updateShuffleList()
      } else {
        this.index = this.shuffleList[this.index]
        this.shuffleList = []
      }
    },
    updateShuffleList () {
      this.shuffleList = [...Array(this.files.length).keys()]

      for (var i = this.shuffleList.length - 1; i > 0; i--) {
        const r = Math.floor(Math.random() * (i + 1))
        const tmp = this.shuffleList[i]
        this.shuffleList[i] = this.shuffleList[r]
        this.shuffleList[r] = tmp
      }

      // Set new index
      this.shuffleList[this.shuffleList.indexOf(this.index)] = this.shuffleList[0]
      this.shuffleList[0] = this.index

      this.index = 0
    },
    updateSeekbar () {
      if (this.audio) {
        this.time = Math.round(this.audio.currentTime)
      } else {
        this.time = 0
      }
    },
    seekSong (val) {
      if (this.audio) {
        this.audio.currentTime = val
      }
    }
  }
}
</script>

<style lang="scss">
button {
  display: inline-block;
  padding: 0.75em;
  border: 1px solid #4fc08d;
  border-radius: 2em;
  outline: none;
  color: #fff;
  cursor: pointer;
  background: none;
  transition: background-color .2s ease;
  &:hover {
    background-color: rgba(79,192,141,.1);
  }
  &.off {
    border-color: #ccc;
    .icon {
      fill: #ccc;
    }
  }

  .icon {
    width: 1.5em;
    height: 1.5em;
    fill: #4fc08d;
  }
}

#main {
  background:
    radial-gradient(
      ellipse at top left,
      rgba(255, 255, 255, 1) 40%,
      rgba(229, 229, 229, .9) 100%
    );
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

#library {
  flex: 1;
  width: 100%;
  padding: 20px 40px;
  overflow-x: hidden;
  overflow-y: scroll;

  #folder-button {
    background-color: #4fc08d;
    float: right;
    font-size: .8em;
    &:hover {
      background-color: rgba(79,192,141,.85);
    }
  }

  #artwork {
    width: 100px;
    height: 100px;
    margin-right: 20px;
    object-fit: contain;
    float: left;
  }
  #song-title {
    font-size: 1.2em;
    font-weight: bold;
  }

  .listitem {
    margin: 0 -10px;
    padding: 10px;
    cursor: pointer;
    transition: background-color .2s ease;
    font-size: 16px;
    line-height: 22px;
    &:hover {
      background-color: rgba(0, 0, 0, .03);
    }

    .item-index {
      display: inline-block;
      width: 2em;
      padding-right: .5em;
      text-align: right;
      vertical-align: middle;

      &-playing {
        padding-right: .2em;
      }
    }
    .item-name {
      vertical-align: middle;
    }
  }
}

#dock {
  width: 100%;
  height: 90px;
  background: #000;
  text-align: center;
  overflow: hidden;

  #current-time,
  #current-index {
    font-size: .6em;
    color: #777;
    padding: 0 6px;
  }
  #current-time {
    float: right;
  }
  #current-index {
    float: left;
  }

  #controls {
    button {
      padding: 0.5em;
      border-radius: 2em;

      .icon {
        width: 1.5em;
        height: 1.5em;
      }
    }

    #play-button {
      background-color: #4fc08d;
      &:hover {
        background-color: rgba(79,192,141,.85);
      }

      .icon {
        fill: #fff;
      }
    }
  }
}
</style>
