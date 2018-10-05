<template>
  <div id="wrapper">
    <main id="main">
      <div id="title">Suzaku</div>

      <hr>

      <div class="clearfix" v-if="currentFile">
        <img id="artwork" :src="currentFile.picture || 'static/blank.png'" />
        <p id="song-title">{{ currentFile.title || currentFile.filename }}</p>
        <p>
          <span v-show="currentFile.album">{{ currentFile.album }}</span>
          <span v-show="currentFile.album && currentFile.artist">/</span>
          <span v-show="currentFile.artist">{{ currentFile.artist }}</span>
        </p>
      </div>

      <p id="controls">
        <button id="prev-button" @click="prevSong"><SvgIcon icon="skip-backward"></SvgIcon></button>
        <button id="play-button" @click="togglePlay"><SvgIcon :icon="isPlaying ? 'pause' : 'play'"></SvgIcon></button>
        <button id="next-button" @click="nextSong"><SvgIcon icon="skip-forward"></SvgIcon></button>
        <button id="repeat-button" @click="toggleRepeat" :class="{'off': !isRepeating}"><SvgIcon :icon="(isRepeating === 'one') ? 'repeat-one' : 'repeat'"></SvgIcon></button>
        <button id="shuffle-button" @click="toggleShuffle" :class="{'off': !isShuffling}"><SvgIcon icon="shuffle"></SvgIcon></button>

        <button id="folder-button" @click="selectFolder">Open Folder</button>
      </p>

      <hr>

      <div>
        <p v-for="(data, i) in files" :key="data.path" class="listitem" @click="setCurrentIndex(i)">
          <span v-if="i == currentIndex" class="item-index item-index-playing"><SvgIcon :icon="isPlaying ? 'play' : 'pause'"></SvgIcon></span>
          <span v-else class="item-index">{{ data.track.no || i+1 }}</span>
          <span class="item-name">{{ data.title || data.filename }}</span>
        </p>
      </div>
    </main>
  </div>
</template>

<script>
  import SvgIcon from '@/components/SvgIcon'

  export default {
    name: 'landing-page',
    components: {
      SvgIcon
    },
    data () {
      return {
        files: [],
        index: 0,
        audio: null,
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
        return this.files[this.currentIndex]
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
        } else {
          this.audio.play()
            .catch(err => {
              console.log(err)
              this.audio = null
              this.isPlaying = false
            })
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
            if (this.audio && !this.audio.paused) {
              this.audio.pause()
              this.isPlaying = false
            }
            return
          }
        }
        this.index = index
        this.initPlayer()
        this.togglePlay()
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
      }
    }
  }
</script>

<style lang="scss">
  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 40px 60px;
    width: 100vw;
    overflow-y: scroll;
  }

  #title {
    color: #2c3e50;
    font-size: 2em;
    font-weight: bold;
    margin-bottom: 6px;
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

  #controls {
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
    }
    .icon {
      width: 1.5em;
      height: 1.5em;
      fill: #4fc08d;
    }

    #play-button,
    #folder-button {
      background-color: #4fc08d;
      &:hover {
        background-color: rgba(79,192,141,.85);
      }

      .icon {
        fill: #fff;
      }
    }

    #folder-button {
      float: right;
    }
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
</style>
