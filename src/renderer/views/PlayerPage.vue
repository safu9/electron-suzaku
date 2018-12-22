<template>
  <div id="main">
    <div id="library">
      <div class="clearfix">
        <button id="folder-button" @click="selectFolder">Open Folder</button>

        <img id="artwork" :src="currentTrack.picture ? ('file://' + currentTrack.picture) : 'static/blank.png'" />
        <p id="song-title">{{ currentTrack.title || currentTrack.filename || 'Suzaku' }}</p>
        <p>
          <span v-show="currentTrack.album">{{ currentTrack.album }}</span>
          <span v-show="currentTrack.album && currentTrack.artist">/</span>
          <span v-show="currentTrack.artist">{{ currentTrack.artist }}</span>
        </p>
      </div>

      <hr>

      <p v-for="(track, i) in tracks" :key="track.path" class="listitem" @click="setCurrentIndex(i)">
        <span v-if="i == currentIndex" class="item-index item-index-playing"><SvgIcon :icon="isPlaying ? 'play' : 'pause'"></SvgIcon></span>
        <span v-else class="item-index">{{ track.track.no || i+1 }}</span>
        <span class="item-name">{{ track.title || track.filename }}</span>
      </p>
    </div>

    <div id="dock" class="clearfix">
      <Seekbar color="#4fc08d"
        :max="currentTrack ? Math.round(currentTrack.duration) : 0"
        :value="time"
        @change="seekSong" />
      <div id="current-time">{{ timeString }} / {{ durationString }}</div>
      <div id="current-index">{{ tracks.length ? index+1 : 0 }} / {{ tracks.length }}</div>

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
import { mapState, mapGetters, mapMutations } from 'vuex'
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
      audio: null,
      timeIntervalID: null,
      audioContext: null
    }
  },
  computed: {
    ...mapState('playlist', [
      'tracks',
      'index',
      'time',
      'isPlaying',
      'isRepeating',
      'isShuffling',
      'shuffleList'
    ]),
    ...mapGetters('playlist', [
      'currentIndex',
      'currentTrack',
      'timeString',
      'durationString'
    ])
  },
  mounted () {
    this.audioContext = new AudioContext()

    this.$electron.ipcRenderer.on('selected_folder', (_event, arg) => {
      this.onFolderSelected(arg)
    })
  },
  methods: {
    ...mapMutations('playlist', [
      'setTracks',
      'setIndex',
      'setTime',
      'setIsPlaying',
      'setIsRepeating',
      'setIsShuffling',
      'clearShuffleList',
      'updateShuffleList'
    ]),

    selectFolder () {
      this.$electron.ipcRenderer.send('select_folder')
    },
    onFolderSelected (tracks) {
      if (!tracks) {
        return
      }

      this.setTracks(tracks)
      this.setIndex(0)
      this.initPlayer(true)
    },
    initPlayer (startPlay) {
      if (!this.currentTrack) {
        return
      }
      const path = this.currentTrack.path

      if (this.audio) {
        this.audio.pause()
        this.audio = null
      }

      this.audio = new Audio()
      this.audio.src = path
      this.audio.onended = this.onSongEnded

      let source = this.audioContext.createMediaElementSource(this.audio)
      source.connect(this.audioContext.destination)

      if (startPlay) {
        this.togglePlay()
      } else {
        this.setIsPlaying(false)
      }
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
            this.setIsPlaying(false)
          })

        this.timeIntervalID = window.setInterval(this.updateSeekbar, 200)
      }

      this.setIsPlaying(!this.audio.paused)
    },
    updateIndex (index) {
      if (index < 0 || this.tracks.length <= index) {
        if (this.isRepeating === true) {
          index = (index + this.tracks.length) % this.tracks.length
          if (this.isShuffling) {
            this.updateShuffleList()
          }
        } else {
          if (this.audio && this.isPlaying) {
            this.audio.pause()
            this.setIsPlaying(false)
          }
          return
        }
      }
      this.setIndex(index)
      this.initPlayer(this.isPlaying)
    },
    setCurrentIndex (index) {
      index = this.isShuffling ? this.shuffleList.indexOf(index) : index
      this.updateIndex(index)
    },
    nextSong () {
      this.updateIndex(this.index + 1)
    },
    prevSong () {
      this.updateIndex(this.index - 1)
    },
    toggleRepeat () {
      if (this.isRepeating === true) {
        this.setIsRepeating('one')
      } else if (this.isRepeating === 'one') {
        this.setIsRepeating(false)
      } else {
        this.setIsRepeating(true)
      }
    },
    toggleShuffle () {
      this.setIsShuffling(!this.isShuffling)

      if (this.isShuffling) {
        this.updateShuffleList()
      } else {
        this.setIndex(this.shuffleList[this.index])
        this.clearShuffleList()
      }
    },
    updateSeekbar () {
      if (this.audio) {
        this.setTime(Math.round(this.audio.currentTime))
      } else {
        this.setTime(0)
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
