<template>
  <div id="player-page">
    <div class="clearfix">
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
      <span v-if="track._id === currentTrack._id" class="item-index item-index-playing">
        <SvgIcon :icon="isPlaying ? 'play' : 'pause'" />
      </span>
      <span v-else class="item-index">{{ track.track.no || i+1 }}</span>
      <span class="item-name">{{ track.title || track.filename }}</span>
    </p>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import SvgIcon from '@/components/SvgIcon'

export default {
  name: 'player-page',
  components: {
    SvgIcon
  },
  data () {
    return {}
  },
  computed: {
    ...mapState('playlist', [
      'tracks',
      'isPlaying'
    ]),
    ...mapGetters('playlist', [
      'currentTrack'
    ])
  },
  mounted () {
  },
  methods: {
    ...mapActions('playlist', [
      'setCurrentIndex'
    ])
  }
}
</script>

<style lang="scss">
#player-page {
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
    display: block;
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
</style>
