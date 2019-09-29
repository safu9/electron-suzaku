<template>
  <div id="lyrics-page">
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

    <p v-if="lyrics" id="lyrics">{{ lyrics }}</p>
    <p v-else id="no-lyrics">No lyrics</p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Artwork from '@/components/Artwork'

export default {
  components: {
    Artwork
  },
  data () {
    return {}
  },
  computed: {
    ...mapGetters('playlist', [
      'currentTrack'
    ]),

    lyrics () {
      if (!this.currentTrack.lyrics) {
        return null
      }

      let lyrics = this.currentTrack.lyrics[0]
      lyrics = lyrics.replace(/\r\n/g, '\n')
      lyrics = lyrics.replace(/\r/g, '\n')
      return lyrics
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style lang="scss">
#lyrics-page {
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

  #lyrics {
    white-space: pre-wrap;
    line-height: 2;
    font-size: 0.9rem;
  }
  #no-lyrics {
    color: #ccc;
  }
}
</style>
