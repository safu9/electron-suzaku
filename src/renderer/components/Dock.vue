<template>
  <div id="dock">
    <div id="dock-left">
      <figure class="artwork-wrap">
        <img class="artwork" :src="currentTrack.picture ? ('file://' + currentTrack.picture) : 'static/blank.png'" />
      </figure>
      <div id="track-info">
        <div id="song-title">{{ currentTrack.title || currentTrack.filename || 'Suzaku' }}</div>
        <div>
          <span v-show="currentTrack.album">{{ currentTrack.album }}</span>
          <span v-show="currentTrack.album && currentTrack.artist">/</span>
          <span v-show="currentTrack.artist">{{ currentTrack.artist }}</span>
        </div>
      </div>
    </div>
    <div id="dock-center">
      <div id="seekbar-wrap">
        <div id="current-index">{{ tracks.length ? index+1 : 0 }} / {{ tracks.length }}</div>
        <Seekbar id="seekbar" color="#4fc08d"
          :max="currentTrack ? Math.round(currentTrack.duration) : 0"
          :value="time"
          @change="seekSong" />
        <div id="current-time">{{ timeString }} / {{ durationString }}</div>
      </div>
      <div id="controls">
        <button id="repeat-button" @click="toggleRepeat" :class="{'off': !isRepeating}"><SvgIcon :icon="(isRepeating === 'one') ? 'repeat-one' : 'repeat'"></SvgIcon></button>
        <button id="prev-button" @click="prevSong"><SvgIcon icon="skip-backward"></SvgIcon></button>
        <button id="play-button" @click="togglePlay"><SvgIcon :icon="isPlaying ? 'pause' : 'play'"></SvgIcon></button>
        <button id="next-button" @click="nextSong"><SvgIcon icon="skip-forward"></SvgIcon></button>
        <button id="shuffle-button" @click="toggleShuffle" :class="{'off': !isShuffling}"><SvgIcon icon="shuffle"></SvgIcon></button>
      </div>
    </div>
    <div id="dock-right">
      <SvgIcon id="volume-icon"
        :icon="'volume-' + (volume ? 'low' : 'mute')" />
      <Seekbar id="volume-bar" color="#4fc08d"
        :max="100"
        :value="volume"
        @change="changeVolume" />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Seekbar from '@/components/Seekbar'
import SvgIcon from '@/components/SvgIcon'

export default {
  props: [],
  components: {
    Seekbar,
    SvgIcon
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

    .artwork-wrap {
      width: 50px;
      height: 50px;
      margin: 0 6px 0 12px;
    }
    .artwork {
      width: 100%;
      height: 100%;
      object-fit: contain;
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

  #dock-right {
    flex: 1 0 0;
    display: flex;
    align-items: center;
    justify-content: center;

    #volume-icon {
      fill: #fff;
      width: 1.2rem;
      height: 1.2rem;
    }
    #volume-bar {
      max-width: 100px;
    }
  }
}
</style>
