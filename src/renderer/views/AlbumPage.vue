<template>
  <div id="album-page">
    <router-link :to="{ name: 'top' }">top</router-link>

    <div class="clearfix">
      <img id="artwork" :src="album.picture ? ('file://' + album.picture) : 'static/blank.png'" />
      <p id="song-title">{{ album.album }}</p>
      <p>
        <span v-show="album.artist">{{ album.albumartist || album.artist }}</span>
      </p>
    </div>

    <hr>

    <p v-for="(track, i) in tracks" :key="track._id" class="listitem" @click="playTrack(i)">
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
  name: 'album-page',
  components: {
    SvgIcon
  },
  data () {
    return {
      album: {},
      tracks: []
    }
  },
  computed: {
    ...mapState('playlist', {
      targetID: 'targetID',
      playingTracks: 'tracks',
      isPlaying: 'isPlaying'
    }),
    ...mapGetters('playlist', [
      'currentTrack'
    ])
  },
  mounted () {
    this.$electron.ipcRenderer.on('album_loaded', (_event, arg) => {
      this.onDataLoaded(arg)
    })
    this.$electron.ipcRenderer.send('load_album', this.$route.params.id)
  },
  methods: {
    ...mapActions('playlist', [
      'setTarget',
      'setCurrentIndex',
      'togglePlay'
    ]),

    onDataLoaded (data) {
      if (!data) {
        return
      }

      this.album = data.album
      this.tracks = data.tracks
    },

    playTrack (index) {
      if (this.tracks[index]._id === this.currentTrack._id) {
        this.togglePlay()
      } else if (this.targetID === this.album._id) {
        this.setCurrentIndex(index)
      } else {
        this.setTarget({
          targetID: this.album._id,
          tracks: this.tracks,
          index: index
        })
        this.togglePlay()
      }
    }
  }
}
</script>

<style lang="scss">
#album-page {
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
