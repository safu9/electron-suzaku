<template>
  <div id="app">
    <div id="main">
      <div id="sidemenu">
        <router-link :to="{ name: 'top' }">top</router-link>
        <router-link :to="{ name: 'player' }">player</router-link>
      </div>

      <div id="library">
        <router-view></router-view>
      </div>
    </div>
    <Dock />
  </div>
</template>

<script>
import Dock from '@/components/Dock'

export default {
  name: 'suzaku',
  components: {
    Dock
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
  padding: 32px 20px;
  overflow-y: auto;

  a {
    display: block;
    margin-bottom: .5rem;
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
