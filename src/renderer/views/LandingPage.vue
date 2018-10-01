<template>
  <div id="wrapper">
    <main id="main">
      <div id="title">Suzaku</div>

      <hr>

      <div class="clearfix" v-if="currentData">
        <img id="artwork" :src="currentData.picture || '/static/blank.png'" />
        <p id="song-title">{{ currentData.title || currentData.filename }}</p>
        <p>
          <span v-show="currentData.album">{{ currentData.album }}</span>
          <span v-show="currentData.album && currentData.artist">/</span>
          <span v-show="currentData.artist">{{ currentData.artist }}</span>
        </p>
      </div>

      <p id="controls">
        <button id="prev-button" @click="prevSong"><SvgIcon icon="skip-backward"></SvgIcon></button>
        <button id="play-button" @click="togglePlay"><SvgIcon :icon="isPlaying ? 'pause' : 'play'"></SvgIcon></button>
        <button id="next-button" @click="nextSong"><SvgIcon icon="skip-forward"></SvgIcon></button>

        <button id="folder-button" @click="selectFolder">Open Folder</button>
      </p>

      <hr>

      <div>
        <p v-for="(data, i) in files" :key="data.path" class="listitem" @click="switchSong(i)">
          <span v-if="i == index" class="item-index item-index-playing"><SvgIcon :icon="isPlaying ? 'play' : 'pause'"></SvgIcon></span>
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
        currentSong: null,
        isPlaying: false,
        audioContext: null
      }
    },
    computed: {
      currentData () {
        return this.files[this.index]
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
        if (this.files.length < this.index - 1) {
          return
        }
        const path = this.files[this.index].path

        if (this.currentSong) {
          this.currentSong.pause()
          this.currentSong = null
        }

        this.currentSong = new Audio()
        this.currentSong.src = path
        this.currentSong.onended = this.nextSong

        this.isPlaying = false

        let source = this.audioContext.createMediaElementSource(this.currentSong)
        source.connect(this.audioContext.destination)
      },
      togglePlay () {
        if (!this.currentSong) {
          return
        }

        if (!this.currentSong.paused) {
          this.currentSong.pause()
        } else {
          this.currentSong.play()
            .catch(err => {
              console.log(err)
              this.currentSong = null
              this.isPlaying = false
            })
        }

        this.isPlaying = !this.currentSong.paused
      },
      switchSong (index) {
        if (index < 0 || this.files.length < index - 1) {
          if (this.currentSong && !this.currentSong.paused) {
            this.currentSong.pause()
            this.isPlaying = false
          }
          return
        }
        this.index = index
        this.initPlayer()
        this.togglePlay()
      },
      nextSong () {
        this.switchSong(this.index + 1)
      },
      prevSong () {
        this.switchSong(this.index - 1)
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

  #main button {
    display: inline-block;
    padding: 0.75em 2em;
    border: 1px solid #4fc08d;
    border-radius: 2em;
    outline: none;
    color: #fff;
    background-color: #4fc08d;
    cursor: pointer;
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
      padding: .75em !important;
    }
    .icon {
      width: 1.5em;
      height: 1.5em;
    }

    #play-button .icon {
      fill: #fff;
    }

    #prev-button,
    #next-button {
      background: none;

      .icon {
        fill: #4fc08d;
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

      &-playing {
        padding-right: .2em;
      }
    }
    .item-name {
      vertical-align: middle;
    }
  }
</style>
