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

      <p>{{filePath}}</p>
    </main>
  </div>
</template>

<script>
  export default {
    name: 'landing-page',
    components: {},
    data () {
      return {
        filePath: '',
        currentSong: null,
        audioContext: null
      }
    },
    mounted () {
      this.audioContext = new AudioContext()
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

        if (this.currentSong) {
          this.currentSong.pause()
        }

        this.currentSong = new Audio()
        this.currentSong.src = this.filePath

        let source = this.audioContext.createMediaElementSource(this.currentSong)
        source.connect(this.audioContext.destination)

        this.currentSong.play()
      }
    }
  }
</script>

<style lang="scss">
  * {
    box-sizing: border-box;
  }

  body {
    font-family: sans-serif;
  }
  p {
    margin-bottom: 1em;
  }
  hr {
    margin: 2em 0;
    border-width: 0;
    border-top: 1px solid #E1E1E1;
  }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
    max-width: 100%;
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
