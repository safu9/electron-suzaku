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

    <p v-for="(track, i) in tracks" :key="track._id" class="listitem">
      <span class="item-index">{{ track.track.no || i+1 }}</span>
      <span class="item-name">{{ track.title || track.filename }}</span>
    </p>
  </div>
</template>

<script>
export default {
  name: 'album-page',
  components: {
  },
  data () {
    return {
      album: {},
      tracks: []
    }
  },
  computed: {
  },
  mounted () {
    this.$electron.ipcRenderer.on('album_loaded', (_event, arg) => {
      this.onDataLoaded(arg)
    })
    this.$electron.ipcRenderer.send('load_album', this.$route.params.id)
  },
  methods: {
    onDataLoaded (data) {
      if (!data) {
        return
      }

      this.album = data.album
      this.tracks = data.tracks
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
