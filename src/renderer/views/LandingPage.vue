<template>
  <div id="wrapper">
    <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
    <main id="main">
      <div id="title">Suzaku</div>
      <p>
        A simple cross-platform music player &amp; library manager
      </p>
      <hr>
      <p><button @click="openFile">Open file</button></p>

      <button @click="togglePlay"><SvgIcon :icon="isPlaying ? 'pause' : 'play'"></SvgIcon></button>
      <p>{{ metadata.title || filePath }}<span v-show="metadata.artist"> / {{ metadata.artist }}</span></p>
      <p><img :src="metadata.picture" /></p>
    </main>
  </div>
</template>

<script>
  import SvgIcon from '@/components/SvgIcon'

  const mm = require('music-metadata')

  export default {
    name: 'landing-page',
    components: {
      SvgIcon
    },
    data () {
      return {
        filePath: '',
        metadata: {},
        currentSong: null,
        isPlaying: false,
        audioContext: null
      }
    },
    mounted () {
      this.audioContext = new AudioContext()
    },
    beforeDestroy () {
      if (this.audioContext) {
        this.audioContext.close()
      }
    },
    methods: {
      openFile () {
        this.$electron.remote.dialog.showOpenDialog({
          properties: ['openFile', 'createDirectory']
        }, this.onFileSelected)
      },
      onFileSelected (files) {
        if (!files) {
          return
        }

        this.filePath = files[0]

        mm.parseFile(this.filePath, {native: true})
          .then(metadata => {
            if (metadata.common.picture) {
              let pic = metadata.common.picture[0]
              metadata.common.picture = 'data:' + pic.format + ';base64,' + pic.data.toString('base64')
            }

            this.metadata = metadata.common
          })
          .catch(err => {
            console.log(err.message)
            this.metadata = {}
          })

        if (this.currentSong) {
          this.currentSong.pause()
          this.currentSong = null
        }

        this.currentSong = new Audio()
        this.currentSong.src = this.filePath
        this.currentSong.onended = this.onPlayEnded

        let source = this.audioContext.createMediaElementSource(this.currentSong)
        source.connect(this.audioContext.destination)

        this.togglePlay()
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
      onPlayEnded () {
        this.isPlaying = false
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
    font-size: .8em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #4fc08d;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #4fc08d;
  }
</style>
