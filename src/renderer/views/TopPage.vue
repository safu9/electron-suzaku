<template>
  <div id="main">
    <div id="library">
      <div class="clearfix">
        <p id="song-title">Suzaku</p>
      </div>

      <hr>

      <p v-for="(artist, i) in artists" :key="artist._id" class="listitem">
        <span class="item-name">{{ artist.artist }}</span>
      </p>

      <hr>

      <router-link v-for="(album, i) in albums" :key="album._id"
         :to="{ name: 'album', params: { id: album._id }}" class="listitem">
        <span class="item-name">{{ album.album }}</span>
      </router-link>
    </div>
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

    .item-name {
      vertical-align: middle;
    }
  }
}
</style>
