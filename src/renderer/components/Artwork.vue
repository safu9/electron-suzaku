<template>
  <figure class="artwork">
    <img
      :class="['artwork-img', {'artwork-img_loaded': isLoaded}]"
      :src="src"
      @load="isLoaded = true" />
  </figure>
</template>

<script>
export default {
  props: ['picture'],
  data () {
    return {
      isLoaded: false
    }
  },
  computed: {
    src () {
      return this.picture ? ('file://' + this.picture) : 'static/blank.png'
    }
  }
}
</script>

<style lang="scss">
.artwork {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
}
.artwork-img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  visibility: hidden;
  opacity: 0;
  transition: opacity .1s ease;

  &_loaded {
    visibility: visible;
    opacity: 1;
  }
}
</style>
