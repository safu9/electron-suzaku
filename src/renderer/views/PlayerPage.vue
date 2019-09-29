<template>
  <div id="player-page">
    <div class="clearfix">
      <Artwork :picture="currentTrack.picture"/>
      <p id="song-title">{{ currentTrack.title || currentTrack.filename || 'Suzaku' }}</p>
      <p>
        <router-link v-if="currentTrack.albumid"
          :to="{ name: 'album', params: { id: currentTrack.albumid } }">
          {{ currentTrack.album }}
        </router-link>
        <span v-show="currentTrack.album && currentTrack.artist">/</span>
        <router-link v-if="currentTrack.artistid"
          :to="{ name: 'artist', params: { id: currentTrack.artistid } }">
          {{ currentTrack.artist }}
        </router-link>
      </p>
    </div>

    <hr/>

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
import Artwork from '@/components/Artwork'
import SvgIcon from '@/components/SvgIcon'

export default {
  name: 'player-page',
  components: {
    Artwork,
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
  .artwork {
    width: 100px;
    height: 100px;
    margin-right: 20px;
    padding: 0;
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
