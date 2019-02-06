<template>
  <div id="album-list-page">
    <div class="clearfix">
      <p id="title">Albums</p>
    </div>

    <hr>

    <div id="album-list">
      <router-link v-for="album in albums" :key="album._id"
         :to="{ name: 'album', params: { id: album._id }}" class="listitem">
        <figure class="item-artwork-wrap">
          <img class="item-artwork" :src="album.picture ? ('file://' + album.picture) : 'static/blank.png'" />
        </figure>
        <div class="item-name">{{ album.album }}</div>
      </router-link>
    </div>
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
    this.$electron.ipcRenderer.once('album_list_loaded', this.onDataLoaded)
    this.$electron.ipcRenderer.send('load_album_list')
  },
  methods: {
    onDataLoaded (_event, data) {
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

  #album-list {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10px;
  }

  .listitem {
    display: block;
    width: 25%;
    padding: 10px;
    cursor: pointer;
    transition: background-color .2s ease;

    &:hover {
      background-color: rgba(0, 0, 0, .03);
    }
    @media(min-width: 1080px) {
      width: 20%;
    }

    .item-artwork-wrap {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 100%;
    }
    .item-artwork {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .item-name {
      padding: .2rem;
      vertical-align: middle;
      word-break: break-all;
      font-size: 16px;
      line-height: 22px;
      max-height: 44px;
      overflow: hidden;
    }
  }
}
</style>
