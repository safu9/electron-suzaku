<template>
  <div id="artist-list-page">
    <div class="clearfix">
      <p id="title">Artists</p>
    </div>

    <hr>

    <router-link v-for="(artist, i) in artists" :key="artist._id"
       :to="{ name: 'artist', params: { id: artist._id }}" class="listitem">
      <span class="item-name">{{ artist.artist }}</span>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'artist-list-page',
  components: {
  },
  data () {
    return {
      artists: []
    }
  },
  computed: {
  },
  mounted () {
    this.$electron.ipcRenderer.once('artist_list_loaded', this.onDataLoaded)
    this.$electron.ipcRenderer.send('load_artist_list')
  },
  methods: {
    onDataLoaded (_event, data) {
      if (!data) {
        return
      }

      this.artists = data.artists
    }
  }
}
</script>

<style lang="scss">
#artist-list-page {
  #title {
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
