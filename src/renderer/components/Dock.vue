<template>
  <div id="dock">
    <div id="dock-left">
      <Artwork :picture="currentTrack.picture"/>
      <div id="track-info">
        <div id="track-title">
          <router-link :to="{ name: 'player' }">
            {{ currentTrack.title || currentTrack.filename || 'Suzaku' }}
          </router-link>
        </div>
        <div id="track-artist">
          <router-link v-if="currentTrack.albumid"
            :to="{ name: 'album', params: { id: currentTrack.albumid } }">
            {{ currentTrack.album }}
          </router-link>
          <span v-show="currentTrack.album && currentTrack.artist">/</span>
          <router-link v-if="currentTrack.artistid"
            :to="{ name: 'artist', params: { id: currentTrack.artistid } }">
            {{ currentTrack.artist }}
          </router-link>
        </div>
      </div>
    </div>
    <div id="dock-center">
      <div id="seekbar-wrap">
        <div id="current-index">{{ tracks.length ? index+1 : 0 }} / {{ tracks.length }}</div>
        <Seekbar id="seekbar" color="#ffa500"
          :max="currentTrack ? Math.round(currentTrack.duration) : 0"
          :value="time"
          @change="seekSong" />
        <div id="current-time">{{ timeString }} / {{ durationString }}</div>
      </div>
      <div id="controls">
        <button id="repeat-button" @click="toggleRepeat" :class="{'on': isRepeating}"><SvgIcon :icon="(isRepeating === 'one') ? 'repeat-one' : 'repeat'"></SvgIcon></button>
        <button id="prev-button" @click="prevSong"><SvgIcon icon="skip-backward"></SvgIcon></button>
        <button id="play-button" @click="togglePlay"><SvgIcon :icon="isPlaying ? 'pause' : 'play'"></SvgIcon></button>
        <button id="next-button" @click="nextSong"><SvgIcon icon="skip-forward"></SvgIcon></button>
        <button id="shuffle-button" @click="toggleShuffle" :class="{'on': isShuffling}"><SvgIcon icon="shuffle"></SvgIcon></button>
      </div>
    </div>
    <div id="dock-right">
      <router-link :to="{ name: 'lyrics' }" id="lyrics-button">
        <SvgIcon id="lyrics-icon" icon="lyrics" />
      </router-link>

      <SvgIcon id="volume-icon"
        :icon="'volume-' + (volume ? 'low' : 'mute')" />
      <Seekbar id="volume-bar" color="#ffa500"
        :max="100"
        :value="volume"
        @change="changeVolume" />
      <CircleProgress
        :style="{visibility: isLoading ? 'visible' : 'hidden'}"
        :percent="loadingProgress"
        :title="$t('loading')" />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Artwork from '@/components/Artwork'
import CircleProgress from '@/components/CircleProgress'
import Seekbar from '@/components/Seekbar'
import SvgIcon from '@/components/SvgIcon'

export default {
  props: [],
  components: {
    Artwork,
    CircleProgress,
    Seekbar,
    SvgIcon
  },
  data () {
    return {
      isLoading: false,
      loadingProgress: 0
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
      'audio',
      'volume'
    ]),
    ...mapGetters('playlist', [
      'currentIndex',
      'currentTrack',
      'timeString',
      'durationString'
    ])
  },
  mounted () {
    this.$electron.ipcRenderer.on('scan_progress', this.onScanProgress)
    this.$electron.ipcRenderer.on('data_loaded', this.onScanComplete)
  },
  methods: {
    ...mapActions('playlist', [
      'togglePlay',
      'toggleRepeat',
      'toggleShuffle',
      'nextSong',
      'prevSong',
      'changeVolume'
    ]),

    seekSong (val) {
      if (this.audio) {
        this.audio.currentTime = val
      }
    },
    onScanProgress (_event, progress) {
      this.loadingProgress = progress
      this.isLoading = true
    },
    onScanComplete (_event) {
      this.isLoading = false
    }
  }
}
</script>

<style lang="scss">
#dock {
  display: flex;
  width: 100%;
  background: #000;
  align-items: center;
  overflow: hidden;

  #dock-left {
    flex: 1 0 0;
    display: flex;
    align-items: center;

    .artwork {
      width: 50px;
      height: 50px;
      margin: 0 6px 0 12px;
      padding: 0;
    }

    #track-info {
      flex: 1 0 0;
      font-size: .8em;
      line-height: 2;
      color: #fff;
      word-break: break-all;

      div {
        max-height: 1.6em;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #track-artist {
        color: #ddd;

        a:hover {
          color: #eee;
        }
      }
    }
  }

  #dock-center {
    #seekbar-wrap {
      display: flex;
      align-items: center;

      #current-time,
      #current-index {
        font-size: .6em;
        color: #777;
        padding: 0 6px;
        white-space: nowrap;
        min-width: 60px;
      }
      #current-time {
        text-align: left;
      }
      #current-index {
        text-align: right;
      }

      #seekbar {
        min-width: 300px;
      }
    }

    #controls {
      font-size: .8em;
      text-align: center;
      margin-bottom: 12px;

      button {
        display: inline-block;
        padding: 0.5em;
        margin: 0 0.5em;

        .icon {
          width: 1.5em;
          height: 1.5em;
          fill: #ddd;
        }
        &:hover .icon {
          fill: #fff;
        }
        &.on .icon {
          fill: #E58F39;
        }
        &.on:hover .icon {
          fill: #ffa500;
        }
      }

      #play-button {
        border: 1px solid #ddd;
        border-radius: 2em;
      }
    }
  }

  #dock-right {
    flex: 1 0 0;
    display: flex;
    align-items: center;
    justify-content: center;

    #lyrics-button {
      font-size: 0;
      margin: 4px;

      #lyrics-icon {
        fill: #ddd;
        width: 0.9rem;
        height: 0.9rem;
      }
    }

    #volume-icon {
      fill: #ddd;
      width: 1.2rem;
      height: 1.2rem;
    }
    #volume-bar {
      max-width: 100px;
    }
  }
}
</style>
