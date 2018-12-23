<template>
  <div id="artist-page">
    <router-link :to="{ name: 'top' }">top</router-link>

    <div>
      <p id="song-title">{{ artist.artist }}</p>
    </div>

    <hr>

    <router-link v-for="(album, i) in albums" :key="album._id"
       :to="{ name: 'album', params: { id: album._id }}" class="listitem">
      <span class="item-name">{{ album.album }}</span>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'artist-page',
  components: {
  },
  data () {
    return {
      artist: {},
      albums: []
    }
  },
  computed: {
  },
  mounted () {
    this.$electron.ipcRenderer.on('artist_loaded', (_event, arg) => {
      this.onDataLoaded(arg)
    })
    this.$electron.ipcRenderer.send('load_artist', this.$route.params.id)
  },
  methods: {
    onDataLoaded (data) {
      if (!data) {
        return
      }

      this.artist = data.artist
      this.albums = data.albums
    }
  }
}
</script>

<style lang="scss">
#artist-page {
  #song-title {
    font-size: 1.2em;
    font-weight: bold;
  }

  .listitem {
    display: block;
    color: inherit;
    text-decoration: none;

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
