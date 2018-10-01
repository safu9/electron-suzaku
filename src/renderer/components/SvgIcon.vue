<template>
  <svg :class="`icon icon-${icon}`" viewBox="0 0 512 512"><use :xlink:href="`/static/icons/ic-${icon}.svg#icon`"></use></svg>
</template>

<script>
  export default {
    props: ['icon']
  }
</script>

<style>
.icon {
  width: 1.5em;
  height: 1.5em;
  vertical-align: middle;
  fill: #fff;
}
</style>
