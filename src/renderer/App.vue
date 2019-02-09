<template>
  <div id="app">
    <div id="main">
      <div id="sidemenu">
        <router-link :to="{ name: 'top' }">Top</router-link>
        <router-link :to="{ name: 'artist-list' }">Artists</router-link>
        <router-link :to="{ name: 'album-list' }">Albums</router-link>
        <router-link :to="{ name: 'player' }">Player</router-link>
        <router-link :to="{ name: 'settings' }">Settings</router-link>
      </div>

      <div id="library">
        <router-view></router-view>
      </div>
    </div>
    <Dock />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import Dock from '@/components/Dock'

export default {
  name: 'suzaku',
  components: {
    Dock
  },
  beforeMount () {
    this.loadPlaylistSettings()
  },
  mounted () {
    this.$electron.ipcRenderer.on('menu_clicked', this.menuClicked)

    window.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        e.preventDefault()
        this.$store.dispatch('playlist/togglePlay')
      }
    })
  },
  beforeDestroy () {
    this.$electron.ipcRenderer.off('menu_clicked', this.menuClicked)
  },
  methods: {
    ...mapActions('playlist', { loadPlaylistSettings: 'loadSettings' }),

    menuClicked (_event, id) {
      switch (id) {
        case 'settings':
          this.$router.push({ name: 'settings' })
          break
        case 'play':
          this.$store.dispatch('playlist/togglePlay')
          break
        case 'next':
          this.$store.dispatch('playlist/nextSong')
          break
        case 'previous':
          this.$store.dispatch('playlist/prevSong')
          break
        case 'turnUp':
          this.$store.dispatch('playlist/turnUp')
          break
        case 'turnDown':
          this.$store.dispatch('playlist/turnDown')
          break
      }
    }
  }
}
</script>

<style lang="scss">
@import '~@/assets/normalize.css';
@import '~@/assets/style.scss';

#app {
  width: 100vw;
  height: 100vh;

  display: flex;
  flex-direction: column;
  overflow: hidden;
}

#main {
  background:
    radial-gradient(
      ellipse at top left,
      rgba(255, 255, 255, 1) 40%,
      rgba(229, 229, 229, .9) 100%
    );
  flex: 1;
  width: 100%;
  display: flex;
}

#sidemenu {
  width: 150px;
  padding: 32px 16px;
  overflow-y: auto;

  a {
    display: block;
    padding: .5rem;
    transition: background-color .2s ease;
    &:hover {
      background-color: rgba(0, 0, 0, .03);
    }
  }
}

#library {
  flex: 1;
  width: 100%;
  padding: 20px 40px;
  overflow-x: hidden;
  overflow-y: scroll;
}
</style>
