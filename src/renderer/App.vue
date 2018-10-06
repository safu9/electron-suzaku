<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'suzaku'
}
</script>

<style lang="scss">
@import '~@/assets/normalize.css';
@import '~@/assets/style.scss';

#app {
  width: 100vw;
  height: 100vh;
}
</style>
