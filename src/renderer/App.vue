<template>
  <div id="app">
    <div id="main">
      <div id="library">
        <router-view></router-view>
      </div>

      <Dock />
    </div>
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
}
</style>
