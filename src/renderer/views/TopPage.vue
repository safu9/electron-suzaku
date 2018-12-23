<template>
  <div id="top-page">
    <router-link :to="{ name: 'player' }">player</router-link>

    <div class="clearfix">
      <p id="song-title">Suzaku</p>
    </div>

    <hr>

    <router-link v-for="(artist, i) in artists" :key="artist._id"
       :to="{ name: 'artist', params: { id: artist._id }}" class="listitem">
      <span class="item-name">{{ artist.artist }}</span>
    </router-link>

    <hr>

    <router-link v-for="(album, i) in albums" :key="album._id"
       :to="{ name: 'album', params: { id: album._id }}" class="listitem">
      <span class="item-name">{{ album.album }}</span>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'top-page',
  components: {
  },
  data () {
    return {
      artists: [],
      albums: []
    }
  },
  computed: {
  },
  mounted () {
    this.$electron.ipcRenderer.on('data_loaded', (_event, arg) => {
      this.onDataLoaded(arg)
    })
    this.$electron.ipcRenderer.send('load_data')
  },
  methods: {
    onDataLoaded (data) {
      if (!data) {
        return
      }

      this.artists = data.artists
      this.albums = data.albums
    }
  }
}
</script>

<style lang="scss">
#top-page {
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

    .item-name {
      vertical-align: middle;
    }
  }
}
</style>
