<template>
  <div id="main">
    <div id="library">
      <div class="clearfix">
        <button id="folder-button" @click="selectFolder">Open Folder</button>

        <img id="artwork" :src="currentTrack.picture ? ('file://' + currentTrack.picture) : 'static/blank.png'" />
        <p id="song-title">{{ currentTrack.title || currentTrack.filename || 'Suzaku' }}</p>
        <p>
          <span v-show="currentTrack.album">{{ currentTrack.album }}</span>
          <span v-show="currentTrack.album && currentTrack.artist">/</span>
          <span v-show="currentTrack.artist">{{ currentTrack.artist }}</span>
        </p>
      </div>

      <hr>

      <p v-for="(track, i) in tracks" :key="track.path" class="listitem" @click="setCurrentIndex(i)">
        <span v-if="i == currentIndex" class="item-index item-index-playing"><SvgIcon :icon="isPlaying ? 'play' : 'pause'"></SvgIcon></span>
        <span v-else class="item-index">{{ track.track.no || i+1 }}</span>
        <span class="item-name">{{ track.title || track.filename }}</span>
      </p>
    </div>

    <Dock />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import Dock from '@/components/Dock'
import SvgIcon from '@/components/SvgIcon'

export default {
  name: 'player-page',
  components: {
    Dock,
    SvgIcon
  },
  data () {
    return {}
  },
  computed: {
    ...mapState('playlist', [
      'tracks',
      'isPlaying'
    ]),
    ...mapGetters('playlist', [
      'currentIndex',
      'currentTrack'
    ])
  },
  mounted () {
    this.$electron.ipcRenderer.on('selected_folder', (_event, arg) => {
      this.onFolderSelected(arg)
    })
  },
  methods: {
    ...mapMutations('playlist', [
      'setTracks',
      'setIndex'
    ]),
    ...mapActions('playlist', [
      'initPlayer',
      'setCurrentIndex'
    ]),

    selectFolder () {
      this.$electron.ipcRenderer.send('select_folder')
    },
    onFolderSelected (tracks) {
      if (!tracks) {
        return
      }

      this.setTracks(tracks)
      this.setIndex(0)
      this.initPlayer(true)
    }
  }
}
</script>

<style lang="scss">
button {
  display: inline-block;
  padding: 0.75em;
  border: 1px solid #4fc08d;
  border-radius: 2em;
  outline: none;
  color: #fff;
  cursor: pointer;
  background: none;
  transition: background-color .2s ease;
  &:hover {
    background-color: rgba(79,192,141,.1);
  }
  &.off {
    border-color: #ccc;
    .icon {
      fill: #ccc;
    }
  }

  .icon {
    width: 1.5em;
    height: 1.5em;
    fill: #4fc08d;
  }
}

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

  #folder-button {
    background-color: #4fc08d;
    float: right;
    font-size: .8em;
    &:hover {
      background-color: rgba(79,192,141,.85);
    }
  }

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
