<template>
  <div id="album-list-page">
    <div class="clearfix">
      <p id="title">{{ $t('albums') }}</p>
    </div>

    <hr/>

    <div id="album-list">
      <router-link v-for="album in albums" :key="album._id"
        :to="{ name: 'album', params: { id: album._id }}" class="listitem">
        <Artwork :picture="album.picture"/>
        <div class="item-name">{{ album.album }}</div>
      </router-link>
    </div>
  </div>
</template>

<script>
import Artwork from '@/components/Artwork'

export default {
  components: {
    Artwork
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
      this.$root.$emit('restore_scroll')
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
