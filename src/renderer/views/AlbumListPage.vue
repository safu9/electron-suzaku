<template>
  <div id="album-list-page">
    <div class="clearfix">
      <p id="title">Albums</p>
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
  name: 'album-list-page',
  components: {
  },
  data () {
    return {
      albums: []
    }
  },
  computed: {
  },
  mounted () {
    this.$electron.ipcRenderer.on('album_list_loaded', (_event, arg) => {
      this.onDataLoaded(arg)
    })
    this.$electron.ipcRenderer.send('load_album_list')
  },
  methods: {
    onDataLoaded (data) {
      if (!data) {
        return
      }

      this.albums = data.albums
    }
  }
}
</script>

<style lang="scss">
#album-list-page {
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
