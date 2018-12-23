<template>
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
      'audio'
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
      'prevSong'
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
